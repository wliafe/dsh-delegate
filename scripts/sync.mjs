#!/usr/bin/env node
/**
 * 把本地源码同步进当前 profile 已安装的副本，方便调试。
 *
 * 为什么需要它：pnpm 把 file: 依赖装成 node_modules 里的"注入副本"，
 * 构建产物 lib/client.js 重新生成后是新 inode，安装副本里的旧文件不会跟着变。
 * 这个脚本在构建之后把运行时要用的文件统一覆盖过去；已经同 inode（硬链接）
 * 的文件直接跳过，不会自己拷自己。
 *
 * 目标目录按以下顺序取：
 *   1. --dest <path> / 环境变量 DSH_DELEGATE_INSTALL
 *   2. ~/.dsh/profiles/<DSH_PROFILE | desktop>/node_modules/dsh-delegate
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const source = resolve(here, '..')

const argv = process.argv.slice(2)
const destFlag = argv.indexOf('--dest')
const dest = destFlag >= 0
  ? argv[destFlag + 1]
  : (process.env.DSH_DELEGATE_INSTALL
    || join(homedir(), '.dsh', 'profiles', process.env.DSH_PROFILE || 'desktop', 'node_modules', 'dsh-delegate'))

if (!dest) {
  console.error('没有指定目标目录。用 --dest <path> 或设置 DSH_DELEGATE_INSTALL。')
  process.exit(1)
}
if (!existsSync(dest) || !statSync(dest).isDirectory()) {
  console.error(`目标目录不存在：${dest}\n先通过插件管理装一次 dsh-delegate（file: 本地路径），再运行本脚本。`)
  process.exit(1)
}

const FILES = ['index.js', 'client.js', 'policy.js', 'package.json', 'cordis.patch.yml']
const DIRS = ['lib', 'locale']

let copied = 0
let skipped = 0

/** 同一个 inode 说明两边已经是同一份文件（硬链接），跳过。 */
function sameFile(a, b) {
  try {
    const sa = statSync(a)
    const sb = statSync(b)
    return sa.dev === sb.dev && sa.ino === sb.ino
  } catch {
    return false
  }
}

function syncFile(from, to) {
  if (!existsSync(from)) return
  if (sameFile(from, to)) { skipped += 1; return }
  mkdirSync(dirname(to), { recursive: true })
  copyFileSync(from, to)
  copied += 1
}

for (const name of FILES) {
  syncFile(join(source, name), join(dest, name))
}

for (const name of DIRS) {
  const from = join(source, name)
  if (!existsSync(from)) continue
  for (const entry of readdirSync(from, { withFileTypes: true })) {
    if (!entry.isFile()) continue
    syncFile(join(from, entry.name), join(dest, name, entry.name))
  }
}

console.log(`同步完成：覆盖 ${copied} 个文件，跳过 ${skipped} 个已一致的文件 → ${dest}`)
console.log('提醒：宿主逻辑（index.js）改动需要把插件关一下再开；页面部分（lib/client.js）改动需要刷新浏览器页面。')
