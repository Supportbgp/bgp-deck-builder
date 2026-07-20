import { useDeck } from '../../context/DeckContext'
import { useUI } from '../../context/UIContext'
import { maxCopies } from '../../utils/deckUtils'

export default function DeckCard({ entry }) {
  const { card, qty } = entry
  const { changeQty, removeCard, format } = useDeck()
  const { selectedCard, openCard } = useUI()
  const img = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || ''
  const mx  = maxCopies(card, format)
  const selected = selectedCard?.id === card.id

  return (
    <div
      onClick={() => openCard(card)}
      title={card.name}
      style={{ position:'relative', borderRadius:5, overflow:'hidden', cursor:'pointer', aspectRatio:'5/7', background:'var(--bgp-bg-dk)', boxShadow:'0 1px 4px rgba(0,0,0,0.18)', outline: selected ? '2px solid var(--bgp-gold)' : 'none', outlineOffset:1, transition:'transform .12s, box-shadow .12s' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = ''}
    >
      {img
        ? <img src={img} alt={card.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} loading="lazy" />
        : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🃏</div>
      }

      {/* Delete button */}
      <button
        onClick={e => { e.stopPropagation(); removeCard(card.id) }}
        className="deck-card-del"
        style={{ position:'absolute', top:3, right:3, width:16, height:16, borderRadius:3, border:'none', background:'rgba(0,0,0,0.45)', color:'rgba(255,255,255,0.6)', fontSize:11, cursor:'pointer', display:'none', alignItems:'center', justifyContent:'center', lineHeight:1 }}
        onMouseEnter={e => { e.currentTarget.style.display='flex'; e.currentTarget.style.background='rgba(180,20,20,0.85)'; e.currentTarget.style.color='#fff' }}
      >
        ×
      </button>

      {/* Footer overlay */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'linear-gradient(transparent,rgba(0,20,30,0.92))', padding:'14px 4px 4px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:12, fontWeight:700, color:'#fff', lineHeight:1, textShadow:'0 1px 2px rgba(0,0,0,0.8)' }}>{qty}×</span>
        <div style={{ display:'flex', gap:2 }}>
          <button
            onClick={e => { e.stopPropagation(); changeQty(card.id, -1) }}
            style={{ width:16, height:16, borderRadius:3, border:'none', background:'rgba(255,255,255,0.18)', color:'#fff', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1 }}
          >−</button>
          <button
            onClick={e => { e.stopPropagation(); changeQty(card.id, 1) }}
            disabled={qty >= mx}
            style={{ width:16, height:16, borderRadius:3, border:'none', background:'rgba(255,255,255,0.18)', color:'#fff', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1, opacity: qty >= mx ? 0.3 : 1 }}
          >+</button>
        </div>
      </div>
    </div>
  )
}
