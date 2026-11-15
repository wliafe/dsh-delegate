/**
 * 派活插件。命中工作目录的主会话只保留派活和定时任务工具，
 * 新建子会话必须起有含义的名字，14 天没被发过消息就从列表里拿掉。
 */

import z from '@deepseek-ai/schemastery'
import { z as zod } from 'zod'
import { directoryMatches, expiredNames, KEPT_TOOLS, rejectName } from './policy.js'

export const name = 'delegate'
export const inject = ['agents', 'tools', 'systemPrompt', 'storageDomain', 'webServer', 'configEditor']

export const Config = z.object({
  directories: z.array(String).default([]).description('命中的工作目录。空着表示全关。会话目录等于其中一项或在它下面才生效。'),
  idleDays: z.number().min(1).default(14).description('子会话超过这么多天没被主会话发过消息，就从列表里拿掉。'),
})

/** 活动记录：名字到最后一次被主会话发消息的毫秒时间。 */
const ACTIVITY = {
  name: 'delegate',
  version: 1,
  tables: {
    activity: { valueSchema: zod.object({ at: zod.number() }) },
  },
}

const RULE = [
  '这个会话只能派活，不能自己动手。',
  '已有对口的子会话就用 send_message 把任务发给它；没有就用 subagent 新建，name 必须是能看出职责的名字，不能省略，也不能用 agent-1。',
  'list_agents 里看不到的子会话不要再找。定时任务只能在这个会话里创建，目标用 this_session，投进来之后再派给子会话。',
  '派完就停，等结果回来再转述。不要说明派给了谁。',
].join('')

// 内置 section 的最大 order 是 DEPLOYMENT_PERSONA_SUFFIX = 10200（见
// @deepseek-ai/dsh-system-prompt 的 SECTION_ORDERS），取 10200 + 100 = 10300，
// 让派活规则排在所有内置说明之后，且不与任何内置 section 冲突。
const SECTION_ORDER = 10300

/**
 * @param {import('@deepseek-ai/cordis').Context} ctx 插件上下文。
 * @param {{ directories: string[], idleDays: number }} config 当前配置。
 */
export async function apply(ctx, config) {
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/delegate/config',
    handler: (req, res) => handleConfig(ctx, req, res),
  }), 'delegate: config route')

  const domain = await ctx.storageDomain.open(ACTIVITY)
  ctx.effect(() => () => { void domain.close() }, 'delegate: activity domain')
  const table = domain.table('activity')
  const disposers = new Map()

  const attach = agent => {
    if (disposers.has(agent.id)) return
    if (!appliesTo(agent, config.directories)) return
    const agentCtx = agent.ctx
    try {
      const dispose = agentCtx.effect(() => {
        // 先做可能失败的事（注册 section、guard），最后才 maskExcept 动工具；
        // 中途任一步抛错，就把已经注册的 section/guard/lifts 全部撤销，
        // 避免工具被 restrict 后无法恢复，把 agent 永久锁死。
        const stopSection = agentCtx.systemPrompt.section({ name: 'delegate', text: RULE, order: SECTION_ORDER })
        let stopGuard
        let lifts = []
        try {
          stopGuard = agentCtx.tools.guard(exec => guardSpawn(exec))
          lifts = maskExcept(agentCtx, agent)
        } catch (error) {
          for (const lift of lifts) lift()
          stopGuard?.()
          stopSection()
          throw error
        }
        return () => {
          for (const lift of lifts) lift()
          stopGuard?.()
          stopSection()
        }
      }, 'delegate: attach')
      disposers.set(agent.id, dispose)
    } catch (error) {
      // 接管失败就当没接管：不留下半套状态，也不影响其它会话。
      disposers.delete(agent.id)
      ctx.logger.warn(`delegate: 接管会话 ${agent.id} 失败：${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // 插件加载时已经在跑的会话也一并接管，不必等它们重开。
  for (const agent of ctx.agents.list()) attach(agent)

  ctx.on('agent/created', ({ agent }) => attach(agent))

  ctx.on('agent/disposed', ({ agent }) => {
    disposers.get(agent.id)?.()
    disposers.delete(agent.id)
  })

  ctx.on('tools/result', (exec, result) => {
    if (exec.name !== 'send_message' || result.isError) return
    const caller = exec.agent
    if (caller === undefined || !appliesTo(caller, config.directories)) return
    const target = argumentOf(exec.arguments, 'agent')
    if (target === undefined) return
    void table.put(target, { at: Date.now() })
  })

  ctx.on('tools/post-execute', (exec, result, next) => {
    if (exec.name !== 'list_agents' || result.isError) return next()
    const caller = exec.agent
    if (caller === undefined || !appliesTo(caller, config.directories)) return next()
    const hidden = new Set(hiddenNames(table, config.idleDays))
    if (hidden.size === 0) return next()
    return next().then(decision => {
      if (decision.kind !== 'accept' || !Array.isArray(result.value)) return decision
      const value = result.value.filter(row => {
        if (row === null || typeof row !== 'object' || !('name' in row)) return true
        return typeof row.name !== 'string' || !hidden.has(row.name)
      })
      return { kind: 'accept', value }
    })
  })

  ctx.effect(() => () => {
    for (const dispose of disposers.values()) dispose()
    disposers.clear()
  })
}

const ROUTE = '/delegate/config'

/**
 * 设置页读写配置的入口。GET 返回生效值，POST 写回平台配置并让插件重读。
 * @param {import('@deepseek-ai/cordis').Context} ctx 插件上下文。
 * @param {import('node:http').IncomingMessage} req 请求。
 * @param {import('node:http').ServerResponse} res 响应。
 */
async function handleConfig(ctx, req, res) {
  const url = new URL(req.url ?? '/', 'http://127.0.0.1')
  if (url.pathname !== ROUTE) {
    res.writeHead(404, { 'cache-control': 'no-store' }).end()
    return
  }
  if (req.method === 'GET') {
    const value = ctx.fiber.effectiveConfig
    sendJson(res, 200, value && typeof value === 'object' ? value : { directories: [], idleDays: 14 })
    return
  }
  if (req.method !== 'POST') {
    res.writeHead(405, { allow: 'GET, POST', 'cache-control': 'no-store' }).end()
    return
  }
  const entry = ctx.fiber.entry
  if (entry === undefined) {
    sendJson(res, 409, { error: '这个插件没有可写的配置条目。' })
    return
  }
  let body
  try {
    body = JSON.parse(await readBody(req))
  } catch {
    sendJson(res, 400, { error: '请求正文不是 JSON。' })
    return
  }
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    sendJson(res, 400, { error: '配置要是一个对象。' })
    return
  }
  let next
  try {
    next = Config(body)
  } catch (error) {
    sendJson(res, 400, { error: error instanceof Error ? error.message.split('\n')[0] : '配置不合法。' })
    return
  }
  try {
    await ctx.configEditor.edit(entry, () => ({ directories: next.directories, idleDays: next.idleDays }))
  } catch (error) {
    sendJson(res, 409, { error: error instanceof Error ? error.message : '没保存成。' })
    return
  }
  sendJson(res, 200, next)
}

/**
 * @param {import('node:http').IncomingMessage} req 请求。
 * @returns {Promise<string>}
 */
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > 64 * 1024) {
        reject(new Error('请求正文超过 64KB。'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

/**
 * @param {import('node:http').ServerResponse} res 响应。
 * @param {number} status 状态码。
 * @param {unknown} value 要返回的值。
 */
function sendJson(res, status, value) {
  const body = JSON.stringify(value)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
  })
  res.end(body)
}

/**
 * 逐个挡掉不在保留名单里的可见工具。按名字单独挡，某个名字不是全局工具
 * 就跳过那一个，不会因为预设不同而整体失败。
 * @param {any} agentCtx 会话作用域上下文。
 * @param {any} agent 会话对象。
 * @returns {撤销函数}
 */
function maskExcept(agentCtx, agent) {
  const lifts = []
  for (const definition of agentCtx.tools.definitions(agent)) {
    if (KEPT_TOOLS.includes(definition.name)) continue
    try {
      lifts.push(agentCtx.tools.restrict({ deny: [definition.name] }))
    } catch {
      // 作用域自带或不是全局工具，挡不了也不用挡。
    }
  }
  return lifts
}

/**
 * 只有根会话、且工作目录命中配置时才管。
 * @param {any} agent 创建的会话。
 * @param {readonly string[]} directories 配置里的目录。
 */
function appliesTo(agent, directories) {
  const depth = Math.max(
    agent?.session?.header?.delegationDepth ?? 0,
    agent?.options?.subagentDepth ?? 0,
  )
  if (depth > 0) return false
  return directoryMatches(agent?.session?.header?.cwd, directories)
}

/** @param {{ name: string, arguments: unknown }} exec */
function guardSpawn(exec) {
  if (exec.name !== 'subagent') return undefined
  return rejectName(argumentOf(exec.arguments, 'name'))
}

/**
 * @param {unknown} value 工具参数。
 * @param {string} key 要取的字段。
 * @returns {字符串值；没有则为 undefined}
 */
function argumentOf(value, key) {
  if (value === null || typeof value !== 'object' || !(key in value)) return undefined
  const found = value[key]
  return typeof found === 'string' && found.length > 0 ? found : undefined
}

/**
 * @param {{ entries: () => Iterable<[string, { at: number }]> }} table 活动表。
 * @param {number} idleDays 闲置天数。
 */
function hiddenNames(table, idleDays) {
  const activity = {}
  for (const [key, value] of table.entries()) activity[key] = value.at
  return expiredNames(activity, Date.now(), idleDays)
}
