/** 命中判断与名字规则。不依赖主机，便于单独验证。 */

/** 主会话保留的工具。前三个派活，后四个只有主会话能用。 */
export const KEPT_TOOLS = [
  'list_agents',
  'send_message',
  'subagent',
  'schedule_create',
  'schedule_edit',
  'schedule_list',
  'schedule_view',
]

const NAME_RE = /^[a-z][a-z0-9-]{0,31}$/

/**
 * 工作目录是否命中。相等或在其下面才算，避免 `/data` 命中 `/data-backup`。
 * @param {string | undefined} cwd 会话创建时的绝对工作目录。
 * @param {readonly string[]} directories 配置里的目录，空列表表示全关。
 * @returns {是否命中}
 */
export function directoryMatches(cwd, directories) {
  if (typeof cwd !== 'string' || cwd.length === 0) return false
  for (const raw of directories) {
    if (typeof raw !== 'string') continue
    const root = raw.endsWith('/') && raw.length > 1 ? raw.slice(0, -1) : raw
    if (root.length === 0) continue
    if (cwd === root || cwd.startsWith(root + '/')) return true
  }
  return false
}

/**
 * 新建子会话的名字是否合格。必须显式给出，且不能是默认的 agent-加数字。
 * @param {unknown} name 工具参数里的 name。
 * @returns {拒绝理由；合格时为 undefined}
 */
export function rejectName(name) {
  if (typeof name !== 'string' || name.length === 0) {
    return '新建子会话必须带 name，用能看出职责的名字，不要省略。'
  }
  if (!NAME_RE.test(name) || name === 'lead') {
    return '名字只能是 1 到 32 位小写字母、数字和连字符，并且以字母开头，不能叫 lead。'
  }
  if (/^agent-\d+$/.test(name)) {
    return '不要用 agent-1 这种默认名。改成能看出职责的名字再建。'
  }
  return undefined
}

/**
 * 过期的子会话名字。没有记录的不算过期，避免把还没用过的新会话隐掉。
 * @param {Readonly<Record<string, number>>} activity 名字到最后发消息的毫秒时间戳。
 * @param {number} now 当前毫秒时间戳。
 * @param {number} idleDays 闲置天数。
 * @returns {该隐藏的名字}
 */
export function expiredNames(activity, now, idleDays) {
  const limit = idleDays * 24 * 60 * 60 * 1000
  return Object.entries(activity)
    .filter(([, at]) => typeof at === 'number' && now - at > limit)
    .map(([name]) => name)
}
