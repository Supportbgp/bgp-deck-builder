import { useMemo, useRef } from 'react'
import { useDeck } from '../../context/DeckContext'
import { groupByType } from '../../utils/deckUtils'
import { TYPE_ORDER, FORMATS } from '../../utils/constants'

export default function ExportModal({ onClose }) {
  const { main, side, format, deckName } = useDeck()
  const copyRef = useRef()

  const text = useMemo(() => {
    const g = groupByType(main)
    let txt = ''
    TYPE_ORDER.forEach(t => {
      if (!g[t].length) return
      txt += `// ${t}\n`
      g[t].forEach(({ card, qty }) => { txt += `${qty} ${card.name}\n` })
      txt += '\n'
    })
    if (side.length && (FORMATS[format]?.sb || 0) > 0) {
      txt += '\nSideboard:\n'
      side.forEach(({ card, qty }) => { txt += `${qty} ${card.name}\n` })
    }
    return txt.trim()
  }, [main, side, format])

  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      if (copyRef.current) { copyRef.current.textContent = 'Copied!'; setTimeout(() => { if (copyRef.current) copyRef.current.textContent = 'Copy to clipboard' }, 2000) }
    }).catch(() => {
      const ta = document.getElementById('exportTa')
      ta?.select(); document.execCommand('copy')
    })
  }

  const download = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
    a.download = (deckName || 'deck').replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.txt'
    a.click()
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth:520 }}>
        <div className="modal-hdr">
          <h2>Export <span>deck list</span></h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize:12, color:'var(--bgp-text-2)', marginBottom:10, lineHeight:1.5 }}>
            Standard deck list format — compatible with MTGA, Moxfield, Archidekt, and most deck sites.
          </p>
          <textarea
            id="exportTa" readOnly value={text}
            style={{ width:'100%', height:260, fontFamily:'monospace', fontSize:12, padding:10, borderRadius:5, border:'1px solid var(--border-strong)', background:'var(--bgp-white)', color:'var(--bgp-text)', resize:'vertical', outline:'none', lineHeight:1.6 }}
          />
        </div>
        <div className="modal-footer">
          <button className="btn ghost" onClick={onClose}>Close</button>
          <button className="btn" ref={copyRef} onClick={copy}>Copy to clipboard</button>
          <button className="btn primary" onClick={download}>Download .txt</button>
        </div>
      </div>
    </div>
  )
}
