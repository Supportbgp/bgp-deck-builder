import { useState, useRef, useCallback } from 'react'
import { useUI } from '../../context/UIContext'
import { useAdmin } from '../../context/AdminContext'
import { useDeck } from '../../context/DeckContext'
import { searchCards } from '../../utils/scryfall'
import ResultCard from './ResultCard'

export default function SearchPanel() {
  const [query, setQuery]   = useState('')
  const [error, setError]   = useState('')
  const { searchResults, setSearchResults, isSearching, setIsSearching, selectedCard, openCard } = useUI()
  const { addCard } = useDeck()
  const timer = useRef(null)

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) return
    setIsSearching(true); setError('')
    try {
      const cards = await searchCards(q)
      if (!cards.length) setError(`No cards found for "${q}".`)
      setSearchResults(cards)
    } catch {
      setError('Search failed. Check your connection.')
    } finally {
      setIsSearching(false)
    }
  }, [setIsSearching, setSearchResults])

  const onInput = (e) => {
    const v = e.target.value
    setQuery(v)
    clearTimeout(timer.current)
    if (v.length > 2) timer.current = setTimeout(() => doSearch(v), 550)
  }

  const onKey = (e) => { if (e.key === 'Enter') { clearTimeout(timer.current); doSearch(query) } }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      <div style={{ display:'flex', gap:6, padding:'10px 12px', borderBottom:'1px solid var(--border)', background:'var(--bgp-bg)', flexShrink:0 }}>
        <input
          value={query} onChange={onInput} onKeyDown={onKey}
          placeholder="Search by card name…"
          style={{ flex:1, fontSize:13, padding:'7px 10px', borderRadius:5, border:'1px solid var(--border-strong)', background:'var(--bgp-white)', color:'var(--bgp-text)', outline:'none', fontFamily:'var(--bgp-font)' }}
        />
        <button
          onClick={() => doSearch(query)}
          style={{ fontSize:12, padding:'7px 14px', borderRadius:5, border:'none', background:'var(--bgp-teal)', color:'var(--bgp-white)', cursor:'pointer', fontWeight:500 }}
        >
          Search
        </button>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:8 }}>
        {isSearching && <div style={{ fontSize:12, color:'var(--bgp-text-3)', textAlign:'center', padding:20 }}>Searching…</div>}
        {error && !isSearching && <div style={{ fontSize:12, color:'var(--bgp-text-3)', textAlign:'center', padding:20 }}>{error}</div>}
        {!isSearching && !error && !searchResults.length && (
          <div style={{ fontSize:12, color:'var(--bgp-text-3)', textAlign:'center', padding:20 }}>Search for a card to get started.</div>
        )}
        {searchResults.map(card => (
          <ResultCard
            key={card.id} card={card}
            selected={selectedCard?.id === card.id}
            onAdd={() => addCard(card)}
            onClick={() => openCard(card)}
          />
        ))}
      </div>
    </div>
  )
}
