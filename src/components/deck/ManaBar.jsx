import { cardType } from '../../utils/deckUtils'

export default function ManaBar({ main }) {
  const counts = {}
  main.forEach(({ card, qty }) => {
    if (cardType(card) === 'Land') return
    const c = Math.min(card.cmc || 0, 7)
    counts[c] = (counts[c] || 0) + qty
  })
  const mx = Math.max(1, ...Object.values(counts))

  return (
    <div style={{ padding:'8px 10px 0', flexShrink:0, background:'var(--bgp-bg)' }}>
      <div style={{ fontSize:10, color:'var(--bgp-text-3)', marginBottom:3, textTransform:'uppercase', letterSpacing:'.04em' }}>Mana curve</div>
      <div style={{ display:'flex', alignItems:'flex-end', gap:2, height:32 }}>
        {[0,1,2,3,4,5,6,7].map(i => {
          const v = counts[i] || 0
          const h = Math.round((v / mx) * 28) + 2
          return (
            <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:1 }}>
              <div title={`${v} at ${i === 7 ? '7+' : i} mana`} style={{ width:20, height:h, background: v ? 'var(--bgp-teal)' : 'rgba(0,80,104,0.2)', borderRadius:'2px 2px 0 0', transition:'height .2s' }} />
              <div style={{ fontSize:9, color:'var(--bgp-text-3)' }}>{i === 7 ? '7+' : i}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
