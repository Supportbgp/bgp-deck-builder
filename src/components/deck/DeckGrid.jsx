import { useDeck } from '../../context/DeckContext'
import { groupByType } from '../../utils/deckUtils'
import { TYPE_ORDER } from '../../utils/constants'
import DeckCard from './DeckCard'

export default function DeckGrid({ zone }) {
  const { main, side } = useDeck()
  const entries = zone === 'main' ? main : side
  const grouped = groupByType(entries)
  const hasCards = entries.length > 0

  if (!hasCards) {
    return (
      <div style={{ textAlign:'center', padding:'32px 12px', color:'var(--bgp-text-3)', fontSize:12 }}>
        No cards yet.<br />{zone === 'main' ? 'Search and add cards above.' : 'No sideboard cards.'}
      </div>
    )
  }

  return (
    <div>
      {TYPE_ORDER.map(type => {
        const cards = grouped[type]
        if (!cards.length) return null
        const tot = cards.reduce((s, e) => s + e.qty, 0)
        return (
          <div key={type}>
            <div style={{ fontSize:10, fontWeight:600, color:'var(--bgp-teal)', padding:'8px 8px 4px', textTransform:'uppercase', letterSpacing:'.06em', display:'flex', justifyContent:'space-between' }}>
              <span>{type}</span><span>{tot}</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(72px,1fr))', gap:6, padding:'0 8px 6px' }}>
              {cards.map(entry => <DeckCard key={entry.card.id} entry={entry} />)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
