import { useState, useRef } from 'react'
import { useDeck } from '../../context/DeckContext'
import { fetchCardByName } from '../../utils/scryfall'
import { maxCopies } from '../../utils/deckUtils'

export default function ImportModal({ onClose }) {
  const [text, setText]     = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const { setMain, setSide, format } = useDeck()
  const fileRef = useRef()

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setText(ev.target.result)
    reader.readAsText(file)
    e.target.value = ''
  }

  const doImport = async () => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
    if (!lines.length) { setStatus('Paste a deck list first.'); return }
    setLoading(true); setStatus('Fetching cards from Scryfall…')
    let inSide = false
    const newMain = [], newSide = []
    const fetches = []
    lines.forEach(line => {
      if (/^(sideboard|SB:)/i.test(line) || line.toLowerCase() === 'sideboard:') { inSide = true; return }
      if (line.startsWith('//') || line.startsWith('#')) return
      const m = line.match(/^(\d+)\s+(.+?)(?:\s+\(\w+\)\s+\d+)?$/)
      if (!m) return
      const qty = parseInt(m[1]), name = m[2].trim(), side = inSide
      fetches.push(
        fetchCardByName(name).then(card => {
          if (!card) return
          const target = side ? newSide : newMain
          const ex = target.find(e => e.card.id === card.id)
          if (ex) ex.qty = Math.min(ex.qty + qty, maxCopies(card, format))
          else target.push({ card, qty })
        }).catch(() => {})
      )
    })
    await Promise.all(fetches)
    setMain(prev => {
      const merged = [...prev]
      newMain.forEach(e => { const ex = merged.find(m => m.card.id === e.card.id); if (ex) ex.qty = Math.min(ex.qty + e.qty, maxCopies(e.card, format)); else merged.push(e) })
      return merged
    })
    setSide(prev => {
      const merged = [...prev]
      newSide.forEach(e => { const ex = merged.find(m => m.card.id === e.card.id); if (ex) ex.qty += e.qty; else merged.push(e) })
      return merged
    })
    const total = newMain.reduce((s, e) => s + e.qty, 0) + newSide.reduce((s, e) => s + e.qty, 0)
    setStatus(`✓ Imported ${total} cards successfully.`)
    setLoading(false)
    setTimeout(onClose, 1200)
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth:520 }}>
        <div className="modal-hdr">
          <h2>Import <span>deck list</span></h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize:12, color:'var(--bgp-text-2)', marginBottom:10, lineHeight:1.6 }}>
            Paste a deck list below, or upload a <code>.txt</code> file. Supports standard format, MTGA exports, Moxfield, and Archidekt.
          </p>
          <div style={{ display:'flex', gap:8, marginBottom:8, alignItems:'center' }}>
            <button className="btn sm" onClick={() => fileRef.current.click()}>Upload .txt</button>
            <input ref={fileRef} type="file" accept=".txt,.dec,.dek" style={{ display:'none' }} onChange={handleFile} />
            <span style={{ fontSize:11, color:'var(--bgp-text-3)' }}>or paste below</span>
          </div>
          <textarea
            value={text} onChange={e => setText(e.target.value)}
            placeholder={'4 Lightning Bolt\n4 Goblin Guide\n\nSideboard:\n2 Roiling Vortex'}
            style={{ width:'100%', height:200, fontFamily:'monospace', fontSize:12, padding:10, borderRadius:5, border:'1px solid var(--border-strong)', background:'var(--bgp-white)', color:'var(--bgp-text)', resize:'vertical', outline:'none', lineHeight:1.6 }}
          />
          {status && <div style={{ fontSize:12, marginTop:6, color: status.startsWith('✓') ? 'var(--text-success)' : 'var(--text-danger)' }}>{status}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={doImport} disabled={loading}>{loading ? 'Importing…' : 'Import deck'}</button>
        </div>
      </div>
    </div>
  )
}
