import { TYPE_ORDER, ARCHETYPES, FORMATS } from './constants'
import { fetchCardByName } from './scryfall'

export function cardType(card) {
  const t = (card.type_line || '').toLowerCase()
  if (t.includes('creature'))     return 'Creature'
  if (t.includes('planeswalker')) return 'Planeswalker'
  if (t.includes('instant'))      return 'Instant'
  if (t.includes('sorcery'))      return 'Sorcery'
  if (t.includes('enchantment'))  return 'Enchantment'
  if (t.includes('artifact'))     return 'Artifact'
  if (t.includes('battle'))       return 'Battle'
  if (t.includes('land'))         return 'Land'
  return 'Other'
}

export function isBasicLand(card) {
  return /basic land/i.test(card.type_line || '')
}

export function maxCopies(card, format) {
  if (isBasicLand(card)) return 999
  return format === 'commander' ? 1 : 4
}

export function groupByType(entries) {
  const g = Object.fromEntries(TYPE_ORDER.map(t => [t, []]))
  entries.forEach(e => {
    const t = cardType(e.card)
    g[t].push(e)
  })
  TYPE_ORDER.forEach(t => {
    g[t].sort((a, b) => (a.card.cmc || 0) - (b.card.cmc || 0) || (a.card.name > b.card.name ? 1 : -1))
  })
  return g
}

export function detectArchetype(entries) {
  const names = entries.map(e => e.card.name.toLowerCase()).join(' ')
  for (const [arch, keys] of ARCHETYPES) {
    if (keys.some(k => names.includes(k))) return arch
  }
  return 'Unknown'
}

export function buildExportText(main, side, format) {
  const g = groupByType(main)
  let txt = ''
  TYPE_ORDER.forEach(t => {
    if (!g[t].length) return
    txt += `// ${t}\n`
    g[t].forEach(({ card, qty }) => { txt += `${qty} ${card.name}\n` })
    txt += '\n'
  })
  if (side.length && (FORMATS[format]?.sb || 0) > 0) {
    txt += '\nSideboard:\n'
    side.forEach(({ card, qty }) => { txt += `${qty} ${card.name}\n` })
  }
  return txt.trim()
}

export function encodeDeck(main, side, deckName, format) {
  const parts = main.map(e => `${e.card.id}:${e.qty}`)
  const sbParts = side.map(e => `${e.card.id}:${e.qty}s`)
  const meta = encodeURIComponent(`${deckName}|${format}`)
  return `deck=${meta}&cards=${encodeURIComponent([...parts, ...sbParts].join(','))}`
}

export function parseCardListString(str) {
  return (str || '').split(',').map(s => s.trim()).filter(Boolean).map(part => {
    const m = part.match(/^(\d+)x?\s+(.+)$/i)
    return m ? { qty: parseInt(m[1]), name: m[2].trim() } : null
  }).filter(Boolean)
}

export async function fetchEntriesForSubmission(submission) {
  const parsed = parseCardListString(submission.card_list)
  const results = await Promise.all(parsed.map(async p => {
    const card = await fetchCardByName(p.name).catch(() => null)
    return card ? { card, qty: p.qty } : null
  }))
  return results.filter(Boolean)
}

export async function decodeDeck(hash) {
  if (!hash.startsWith('deck=')) return null
  const params = new URLSearchParams(hash)
  const meta = decodeURIComponent(params.get('deck') || '')
  const cardsStr = decodeURIComponent(params.get('cards') || '')
  if (!cardsStr) return null
  const [deckName, format] = meta.split('|')
  const entries = cardsStr.split(',').filter(Boolean)
  const main = [], side = []
  const fetches = entries.map(entry => {
    const isSide = entry.endsWith('s')
    const clean = isSide ? entry.slice(0, -1) : entry
    const [id, qtyStr] = clean.split(':')
    const qty = parseInt(qtyStr) || 1
    return fetch(`https://api.scryfall.com/cards/${id}`)
      .then(r => r.json())
      .then(card => {
        if (card.object === 'card') {
          ;(isSide ? side : main).push({ card, qty })
        }
      })
      .catch(() => {})
  })
  await Promise.all(fetches)
  return { deckName, format, main, side }
}
