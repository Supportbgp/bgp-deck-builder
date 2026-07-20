import { useEffect, useRef, useState } from 'react'
import { useDeck } from '../../context/DeckContext'
import { renderShareCard } from '../../utils/canvasUtils'
import { encodeDeck } from '../../utils/deckUtils'
import { FORMATS } from '../../utils/constants'
import logo from '/BGP_Logo_White.png'

export default function ShareModal({ onClose }) {
  const { main, side, format, deckName } = useDeck()
  const canvasRef   = useRef()
  const [tab, setTab]     = useState('card')
  const [copied, setCopied] = useState(false)
  const logoRef = useRef(null)

  useEffect(() => {
    const img = new Image(); img.onload = () => { logoRef.current = img; drawCard() }; img.src = logo
  }, [])

  useEffect(() => { if (tab === 'card' && logoRef.current) drawCard() }, [tab, main])

  const drawCard = () => {
    if (!canvasRef.current || !logoRef.current) return
    renderShareCard(canvasRef.current, logoRef.current, main, deckName || 'Untitled Deck', format, FORMATS)
  }

  const shareUrl = `${window.location.href.split('#')[0]}#${encodeDeck(main, side, deckName, format)}`

  const download = () => {
    const a = document.createElement('a')
    a.download = (deckName || 'deck').replace(/[^a-z0-9]/gi, '_').toLowerCase() + '_bgp.png'
    a.href = canvasRef.current.toDataURL('image/png')
    a.click()
  }

  const copyUrl = () => {
    navigator.clipboard.writeText(shareUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth:580 }}>
        <div className="modal-hdr">
          <h2>Share <span>deck</span></h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {/* Tabs */}
          <div style={{ display:'flex', borderBottom:'1px solid var(--border)', margin:'-20px -18px 16px', padding:'0 18px' }}>
            {[['card','Deck card'],['link','Share link']].map(([k,l]) => (
              <button key={k} onClick={() => setTab(k)} style={{ fontSize:12, padding:'10px 14px', border:'none', background:'transparent', color: tab===k ? 'var(--bgp-teal)' : 'var(--bgp-text-2)', cursor:'pointer', borderBottom: tab===k ? '2px solid var(--bgp-teal)' : '2px solid transparent', fontWeight: tab===k ? 500 : 400 }}>{l}</button>
            ))}
          </div>
          {tab === 'card' && (
            <>
              <div style={{ display:'flex', justifyContent:'center', marginBottom:16, borderRadius:6, overflow:'hidden', background:'var(--bgp-bg-dk)' }}>
                <canvas ref={canvasRef} style={{ maxWidth:'100%', display:'block' }} />
              </div>
              <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
                <button className="btn primary" onClick={download}>Download PNG</button>
                <button className="btn ghost" onClick={onClose}>Close</button>
              </div>
            </>
          )}
          {tab === 'link' && (
            <>
              <p style={{ fontSize:12, color:'var(--bgp-text-2)', marginBottom:10, lineHeight:1.5 }}>Anyone with this link can open the deck in the BGP Deck Builder.</p>
              <div style={{ display:'flex', gap:6, marginBottom:10 }}>
                <input readOnly value={shareUrl} style={{ flex:1, fontSize:12, padding:'6px 10px', borderRadius:5, border:'1px solid var(--border-strong)', background:'var(--bgp-white)', color:'var(--bgp-text-2)', fontFamily:'monospace', outline:'none' }} />
                <button onClick={copyUrl} style={{ fontSize:11, padding:'6px 12px', borderRadius:5, border:'1px solid var(--bgp-teal)', background:'var(--bgp-teal)', color:'#f4f8f8', cursor:'pointer', whiteSpace:'nowrap' }}>{copied ? 'Copied!' : 'Copy link'}</button>
              </div>
              <p style={{ fontSize:11, color:'var(--bgp-text-3)', lineHeight:1.5 }}>The full decklist is encoded in the URL. Works offline — just open the file and it loads automatically.</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
