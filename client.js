/** 设置侧边栏里的一节：工作目录和闲置天数。数据走宿主端自己的路由，不走平台配置表。 */

import { createElement as h, useEffect, useState } from 'react'

export const inject = ['slots']

const SECTION = 'delegate'
const PATH = 'delegate/config'

/** @param {import('@deepseek-ai/cordis').Context} ctx */
export function apply(ctx) {
  ctx.effect(() => ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: SECTION,
    order: 40,
    label: () => '派活',
  }, () => h(DelegateSection))), 'delegate: settings section')
}

function DelegateSection() {
  const [state, setState] = useState({ status: 'loading' })

  useEffect(() => {
    let gone = false
    fetch(PATH, { headers: { accept: 'application/json' } })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json()
      })
      .then((value) => { if (!gone) setState({ status: 'ready', value }) })
      .catch((error) => { if (!gone) setState({ status: 'error', message: error instanceof Error ? error.message : '读取失败。' }) })
    return () => { gone = true }
  }, [])

  if (state.status === 'loading') return h('p', null, '配置加载中。')
  if (state.status === 'error') return h('p', null, `读不到派活的配置：${state.message}`)
  return h(Editor, { value: state.value })
}

/** @param {{ value: { directories?: unknown, idleDays?: unknown } }} props */
function Editor({ value }) {
  const saved = Array.isArray(value.directories) ? value.directories.filter(item => typeof item === 'string') : []
  const savedDays = typeof value.idleDays === 'number' ? value.idleDays : 14
  const [text, setText] = useState(saved.join('\n'))
  const [days, setDays] = useState(String(savedDays))
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  async function save() {
    const directories = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    const idleDays = Number(days)
    if (!Number.isInteger(idleDays) || idleDays < 1) {
      setNote('闲置天数要是大于等于 1 的整数。')
      return
    }
    setBusy(true)
    try {
      const response = await fetch(PATH, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ directories, idleDays }),
      })
      const body = await response.json().catch(() => ({}))
      setNote(response.ok ? '已保存。' : (typeof body.error === 'string' ? body.error : '没保存成，刷新后再试。'))
    } catch {
      setNote('没保存成，刷新后再试。')
    } finally {
      setBusy(false)
    }
  }

  return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 560 } },
    h('label', null, '工作目录，一行一个。空着表示全关。'),
    h('textarea', {
      value: text,
      rows: 6,
      disabled: busy,
      onChange: event => setText(event.target.value),
      style: { fontFamily: 'inherit' },
    }),
    h('label', null, '闲置天数'),
    h('input', {
      value: days,
      disabled: busy,
      onChange: event => setDays(event.target.value),
    }),
    h('button', { type: 'button', disabled: busy, onClick: () => { void save() } }, '保存'),
    note === '' ? null : h('p', null, note),
  )
}
