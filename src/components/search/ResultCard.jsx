import ManaPips from '../deck/ManaPips'

export default function ResultCard({ card, selected, onAdd, onClick }) {
  const img  = card.image_uris?.small || card.card_faces?.[0]?.image_uris?.small || ''
  const cost = card.mana_cost || card.card_faces?.[0]?.mana_cost || ''
  const type = getType(card)
  const pt   = card.power ? ` · ${card.power}/${card.toughness}` : ''

  return (
    <div
      onClick={onClick}
      style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 8px', borderRadius:5, border:`1px solid ${selected ? 'var(--bgp-teal)' : 'var(--border)'}`, background: selected ? 'rgba(0,80,104,0.08)' : 'var(--bgp-white)', marginBottom:5, cursor:'pointer', transition:'border-color .12s' }}
    >
      {img
        ? <img src={img} alt={card.name} style={{ width:32, height:44, borderRadius:3, objectFit:'cover', flexShrink:0 }} loading="lazy" />
        : <div style={{ width:32, height:44, borderRadius:3, background:'var(--bgp-bg)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🃏</div>
      }
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:12, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{card.name}</div>
        <div style={{ fontSize:11, color:'var(--bgp-text-2)', marginTop:1 }}>{type}{pt}</div>
        <div style={{ marginTop:2, display:'flex', gap:1, flexWrap:'wrap' }}><ManaPips cost={cost} /></div>
      </div>
      <button
        onClick={e => { e.stopPropagation(); onAdd() }}
        style={{ fontSize:11, padding:'3px 9px', borderRadius:5, border:'1px solid var(--bgp-teal)', background:'transparent', color:'var(--bgp-teal)', cursor:'pointer', flexShrink:0, fontWeight:500 }}
      >
        + Add
      </button>
    </div>
  )
}

function getType(c) {
  const t = (c.type_line || '').toLowerCase()
  if (t.includes('creature'))     return 'Creature'
  if (t.includes('planeswalker')) return 'Planeswalker'
  if (t.includes('instant'))      return 'Instant'
  if (t.includes('sorcery'))      return 'Sorcery'
  if (t.includes('enchantment'))  return 'Enchantment'
  if (t.includes('artifact'))     return 'Artifact'
  if (t.includes('land'))         return 'Land'
  return 'Other'
}
