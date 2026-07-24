import { useAdmin } from '../../context/AdminContext'
import { useAuth } from '../../context/AuthContext'
import { useDeck } from '../../context/DeckContext'
import { FORMATS } from '../../utils/constants'
import logo from '/BGP_Logo_White.png'

export default function Topbar() {
  const { format, setFormat } = useDeck()
  const { openAdmin } = useAdmin()
  const { isAdmin } = useAuth()

  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'0 16px', height:52, background:'var(--bgp-navy)', borderBottom:'2px solid var(--bgp-teal)', flexShrink:0 }}>
      <img src={logo} alt="Board Game Paradise" style={{ height:34, width:'auto' }} />
      <div style={{ width:1, height:24, background:'rgba(255,255,255,0.15)', flexShrink:0 }} />
      <span style={{ fontSize:13, fontWeight:500, color:'rgba(255,255,255,0.55)' }}>Deck Builder — MTG</span>
      <div style={{ flex:1 }} />
      <button
        onClick={() => openAdmin()}
        style={{ fontSize:11, padding:'4px 10px', borderRadius:5, border:'1px solid rgba(255,255,255,0.2)', background: isAdmin ? 'var(--bgp-gold)' : 'transparent', color: isAdmin ? 'var(--bgp-navy)' : 'rgba(255,255,255,0.5)', cursor:'pointer', fontWeight: isAdmin ? 600 : 400 }}
      >
        ⚙ Admin
      </button>
      <select
        value={format}
        onChange={e => setFormat(e.target.value)}
        style={{ fontSize:12, padding:'3px 7px', borderRadius:5, border:'1px solid rgba(255,255,255,0.2)', background:'rgba(255,255,255,0.08)', color:'#e8f4f8', cursor:'pointer', outline:'none' }}
      >
        {Object.entries(FORMATS).map(([k, v]) => <option key={k} value={k} style={{ background:'var(--bgp-navy)' }}>{v.lbl}</option>)}
      </select>
    </div>
  )
}
