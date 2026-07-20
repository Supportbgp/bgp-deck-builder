const searchCache = {}

export async function searchCards(query) {
  const key = query.toLowerCase().trim()
  if (searchCache[key]) return searchCache[key]

  const [acRes, broadRes] = await Promise.all([
    fetch(`https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(query)}`).then(r => r.json()).catch(() => ({ data: [] })),
    fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}&order=name&unique=cards`).then(r => r.json()).catch(() => ({ object: 'error' })),
  ])

  const nameSuggestions = (acRes.data || []).slice(0, 10)
  const namedCards = await Promise.all(
    nameSuggestions.map(name =>
      fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}`).then(r => r.json()).catch(() => null)
    )
  )

  const nameCards = namedCards.filter(c => c?.object === 'card' && !c.digital)
  const broadCards = broadRes.object === 'error' ? [] : (broadRes.data || []).filter(c => !c.digital)
  const seen = new Set(nameCards.map(c => c.id))
  const combined = [...nameCards, ...broadCards.filter(c => !seen.has(c.id))].slice(0, 28)

  searchCache[key] = combined
  return combined
}

export async function fetchCardByName(name) {
  const r = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(name)}`)
  const d = await r.json()
  return d.object === 'card' ? d : null
}

export async function fetchCardById(id) {
  const r = await fetch(`https://api.scryfall.com/cards/${id}`)
  const d = await r.json()
  return d.object === 'card' ? d : null
}

export async function toBlobSrc(url) {
  if (!url) return ''
  try {
    const resp = await fetch(url)
    const blob = await resp.blob()
    return URL.createObjectURL(blob)
  } catch {
    return url
  }
}
