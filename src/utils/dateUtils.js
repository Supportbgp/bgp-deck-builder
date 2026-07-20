export function fmtDate(d) {
  if (!d) return ''
  const dt = new Date(d + 'T00:00:00')
  return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

export function fmtTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  return `${(h % 12) || 12}${m ? ':' + String(m).padStart(2, '0') : ''} ${h >= 12 ? 'PM' : 'AM'}`
}

export function isUpcoming(ev) {
  return ev.date >= new Date().toISOString().slice(0, 10)
}

export function genId() {
  return 'id' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5)
}
