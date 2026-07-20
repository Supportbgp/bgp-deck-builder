import { useState } from 'react'
import { useDeck } from '../../context/DeckContext'
import { useUI } from '../../context/UIContext'
import { FORMATS } from '../../utils/constants'
import ManaBar from './ManaBar'
import DeckGrid from './DeckGrid'

export default function DeckPanel() {
  const { main, side, format, totalMain, totalSide, deckName, setDeckName, fmt } = useDeck()
  const { openModal } = useUI()
  const [zone, setZone] = useState('main')
  const isCommander = format === 'commander'

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      {/* Header */}
      <div style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)', flexShrink:0, background:'var(--bgp-navy)' }}>
        <input
          value={deckName} onChange={e => setDeckName(e.target.value)}
          placeholder="Untitled deck"
          style={{ fontSize:13, fontWeight:500, width:'100%', border:'none', background:'transparent', color:'#e8f4f8', outline:'none', fontFamily:'var(--bgp-font)' }}
        />
        <div style={{ display:'flex', gap:10, marginTop:4, flexWrap:'wrap' }}>
          <span style={{ fontSize:11, color:'rgba(255,255,255,0.45)' }}><b style={{ color:'rgba(255,255,255,0.85)' }}>{totalMain}</b> main</span>
          <span style={{ fontSize:11, color:'rgba(255,255,255,0.45)' }}><b style={{ color:'rgba(255,255,255,0.85)' }}>{totalSide}</b> side</span>
          <span style={{ fontSize:11, color:'rgba(255,255,255,0.45)' }}><b style={{ color:'rgba(255,255,255,0.85)' }}>{fmt?.lbl}</b> (min {fmt?.min})</span>
        </div>
      </div>

      <ManaBar main={main} />

      {/* Zone tabs */}
      <div style={{ display:'flex', borderBottom:'1px solid var(--border)', flexShrink:0, background:'var(--bgp-teal-dim)' }}>
        {['main', ...(isCommander ? [] : ['side'])].map(z => (
          <button
            key={z} onClick={() => setZone(z)}
            style={{ flex:1, fontSize:11, padding:'7px 4px', textAlign:'center', border:'none', background:'transparent', color: zone===z ? '#fff' : 'rgba(255,255,255,0.5)', cursor:'pointer', borderBottom: zone===z ? '2px solid var(--bgp-gold)' : '2px solid transparent', fontWeight: zone===z ? 500 : 400, fontFamily:'var(--bgp-font)' }}
          >
            {z === 'main' ? `Mainboard (${totalMain})` : `Sideboard (${totalSide})`}
          </button>
        ))}
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'4px 0' }}>
        <DeckGrid zone={zone} />
      </div>

      {/* Footer */}
      <div style={{ padding:'8px 12px', borderTop:'1px solid var(--border)', flexShrink:0, display:'flex', gap:6, background:'var(--bgp-navy)' }}>
        {[
          { label:'Import', action:() => openModal('import') },
          { label:'Export', action:() => openModal('export') },
          { label:'Share deck', action:() => openModal('share'), style:{ background:'transparent', borderColor:'rgba(255,255,255,0.25)', color:'rgba(255,255,255,0.7)' } },
          { label:'Save deck', action:() => openModal('submit'), primary: true },
        ].map(btn => (
          <button
            key={btn.label} onClick={btn.action}
            style={{ flex:1, fontSize:11, padding:7, borderRadius:5, border: btn.primary ? 'none' : '1px solid rgba(255,255,255,0.2)', background: btn.primary ? 'var(--bgp-teal)' : 'rgba(255,255,255,0.07)', color: btn.primary ? 'var(--bgp-white)' : 'rgba(255,255,255,0.75)', cursor:'pointer', fontFamily:'var(--bgp-font)', fontWeight: btn.primary ? 500 : 400, ...btn.style }}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  )
}
