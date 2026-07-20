export function parsePips(cost) {
  if (!cost) return []
  return [...cost.matchAll(/\{([^}]+)\}/g)].map(m => m[1])
}

export function getPipClass(sym) {
  const map = { W: 'pip-W', U: 'pip-U', B: 'pip-B', R: 'pip-R', G: 'pip-G', C: 'pip-C', X: 'pip-X', S: 'pip-S', T: 'pip-T', Q: 'pip-Q' }
  return map[sym] || (isNaN(sym) ? 'pip-C' : 'pip-num')
}

export function getPipLabel(sym) {
  if (sym === 'T') return '⟳'
  if (sym === 'Q') return '⟲'
  return sym
}

export function getColorIdentity(entries) {
  const pips = new Set()
  const rx = /\{([WUBRG])\}/g
  entries.forEach(({ card }) => {
    const cost = card.mana_cost || card.card_faces?.[0]?.mana_cost || ''
    let m
    while ((m = rx.exec(cost)) !== null) pips.add(m[1])
  })
  return pips.size ? [...pips] : ['C']
}
