import { useEffect, useRef, useState } from 'react'
import { renderResultsCard } from '../../utils/canvasUtils'
import { fetchEntriesForSubmission } from '../../utils/deckUtils'
import { FORMATS, SUBMISSION_STATUS } from '../../utils/constants'
import logo from '/BGP_Logo_White.png'

export default function ResultsCardModal({ submission, onClose }) {
  const canvasRef            = useRef()
  const logoRef               = useRef(null)
  const [logoReady, setLogoReady] = useState(false)
  const [entries, setEntries] = useState(null) // null = still fetching

  useEffect(() => {
    const img = new Image()
    img.onload = () => { logoRef.current = img; setLogoReady(true) }
    img.src = logo
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchEntriesForSubmission(submission)
      .then(es => { if (!cancelled) setEntries(es) })
      .catch(() => { if (!cancelled) setEntries([]) })
    return () => { cancelled = true }
  }, [submission])

  useEffect(() => {
    if (!logoReady || entries === null || !canvasRef.current) return
    const meta = SUBMISSION_STATUS[submission.status] || { label: 'Result' }
    renderResultsCard(canvasRef.current, logoRef.current, submission, entries, meta.label, FORMATS)
  }, [logoReady, entries])

  const download = () => {
    const safe = `${submission.player_name || 'player'}_${submission.status || 'result'}`.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    const a = document.createElement('a')
    a.download = `${safe}_bgp_results.png`
    a.href = canvasRef.current.toDataURL('image/png')
    a.click()
  }

  const loading = entries === null

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth:580 }}>
        <div className="modal-hdr">
          <h2>Publish <span>results card</span></h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {loading
            ? <div style={{ fontSize:12, color:'var(--bgp-text-3)', textAlign:'center', padding:30 }}>Fetching card art…</div>
            : (
              <>
                <div style={{ display:'flex', justifyContent:'center', marginBottom:16, borderRadius:6, overflow:'hidden', background:'var(--bgp-bg-dk)' }}>
                  <canvas ref={canvasRef} style={{ maxWidth:'100%', display:'block' }} />
                </div>
                {!entries.length && (
                  <p style={{ fontSize:11, color:'var(--bgp-gold)', textAlign:'center', marginTop:-8, marginBottom:10 }}>
                    Couldn't load card art for this decklist — showing a text list instead.
                  </p>
                )}
              </>
            )
          }
        </div>
        <div className="modal-footer">
          <button className="btn ghost" onClick={onClose}>Close</button>
          <button className="btn primary" onClick={download} disabled={loading}>Download PNG</button>
        </div>
      </div>
    </div>
  )
}
