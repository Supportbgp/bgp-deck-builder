import { useState, useMemo } from 'react'
import { useAdmin } from '../../context/AdminContext'
import { SUBMISSION_STATUS } from '../../utils/constants'
import ResultsCardModal from './ResultsCardModal'

export default function SubmissionsTab() {
  const { submissions, updateSubmissionStatus, events } = useAdmin()
  const [evFilter, setEvFilter]   = useState('')
  const [stFilter, setStFilter]   = useState('')
  const [search, setSearch]       = useState('')
  const [pubSub, setPubSub]       = useState(null)

  const filtered = useMemo(() => submissions.filter(s => {
    if (evFilter && s.event_id !== evFilter) return false
    if (stFilter && s.status  !== stFilter)  return false
    if (search) {
      const q = search.toLowerCase()
      if (!s.player_name?.toLowerCase().includes(q) && !s.deck_name?.toLowerCase().includes(q)) return false
    }
    return true
  }).sort((a,b) => (b.timestamp||'').localeCompare(a.timestamp||'')), [submissions, evFilter, stFilter, search])

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0,10)
    return {
      total:   submissions.length,
      today:   submissions.filter(s => s.timestamp?.slice(0,10) === today).length,
      registered: submissions.filter(s => s.status === 'registered').length,
      tops: submissions.filter(s => ['top4','finalist','winner'].includes(s.status)).length,
    }
  }, [submissions])

  const updateStatus = (id, status) => updateSubmissionStatus(id, status)

  const exportCSV = () => {
    const cols = ['timestamp','player_name','discord','event_name','event_date','deck_name','format','archetype','main_count','status','card_list']
    const csv = [cols.join(','), ...submissions.map(s => cols.map(c => `"${String(s[c]||'').replace(/"/g,'""')}"`).join(','))].join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download = 'bgp_submissions.csv'; a.click()
  }

  return (
    <div style={{ height:'100%', overflowY:'auto', padding:24 }}>
      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:20 }}>
        {[['Total',stats.total],['Today',stats.today],['Registered',stats.registered],['Top finishes',stats.tops]].map(([l,v]) => (
          <div key={l} style={{ background:'var(--bgp-white)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px' }}>
            <div style={{ fontSize:22, fontWeight:600, color:'var(--bgp-text)' }}>{v}</div>
            <div style={{ fontSize:11, color:'var(--bgp-text-3)', marginTop:2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
        <select value={evFilter} onChange={e => setEvFilter(e.target.value)} style={{ fontSize:12, padding:'5px 9px', borderRadius:5, border:'1px solid var(--border-strong)', background:'var(--bgp-white)', color:'var(--bgp-text)', outline:'none' }}>
          <option value="">All events</option>
          {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
        </select>
        <select value={stFilter} onChange={e => setStFilter(e.target.value)} style={{ fontSize:12, padding:'5px 9px', borderRadius:5, border:'1px solid var(--border-strong)', background:'var(--bgp-white)', color:'var(--bgp-text)', outline:'none' }}>
          <option value="">All statuses</option>
          {Object.entries(SUBMISSION_STATUS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search player or deck…" style={{ fontSize:12, padding:'5px 9px', borderRadius:5, border:'1px solid var(--border-strong)', background:'var(--bgp-white)', color:'var(--bgp-text)', outline:'none', minWidth:180 }} />
        <button className="btn sm ghost" onClick={exportCSV}>Export CSV</button>
      </div>

      {!filtered.length
        ? <div className="empty-state">No submissions match the current filter.</div>
        : (
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr>{['Player','Deck','Format','Event','Status','Time',''].map(h => (
                <th key={h} style={{ textAlign:'left', fontSize:10, fontWeight:600, color:'var(--bgp-teal)', textTransform:'uppercase', letterSpacing:'.06em', padding:'8px 10px', borderBottom:'2px solid var(--bgp-teal)', whiteSpace:'nowrap' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const meta = SUBMISSION_STATUS[s.status||'registered'] || SUBMISSION_STATUS.registered
                const evName = (events.find(e => e.id === s.event_id)||{}).name || s.event_name || '—'
                const ts = s.timestamp ? new Date(s.timestamp).toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) : '—'
                return (
                  <tr key={s.id} style={{ borderBottom:'1px solid var(--border)' }}>
                    <td style={{ padding:'8px 10px' }}>
                      <div style={{ fontWeight:500, color:'var(--bgp-text)' }}>{s.player_name||'—'}</div>
                      <div style={{ fontSize:11, color:'var(--bgp-text-3)' }}>{s.discord||''}</div>
                    </td>
                    <td style={{ padding:'8px 10px' }}>
                      <div style={{ color:'var(--bgp-text-2)' }}>{s.deck_name||'—'}</div>
                      <div style={{ fontSize:11, color:'var(--bgp-text-3)' }}>{s.archetype||''}</div>
                    </td>
                    <td style={{ padding:'8px 10px', color:'var(--bgp-text-2)' }}>{s.format||'—'}</td>
                    <td style={{ padding:'8px 10px', color:'var(--bgp-text-2)', maxWidth:160, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }} title={evName}>{evName}</td>
                    <td style={{ padding:'8px 10px' }}>
                      <select value={s.status||'registered'} onChange={e => updateStatus(s.id, e.target.value)} style={{ fontSize:11, padding:'3px 6px', borderRadius:4, border:'1px solid var(--border-strong)', background:meta.bg, color:meta.fg, cursor:'pointer', fontWeight:600 }}>
                        {Object.entries(SUBMISSION_STATUS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </td>
                    <td style={{ padding:'8px 10px', fontSize:11, color:'var(--bgp-text-3)', whiteSpace:'nowrap' }}>{ts}</td>
                    <td style={{ padding:'8px 10px', whiteSpace:'nowrap' }}>
                      {meta.topping && <button className="btn sm ghost" onClick={() => setPubSub(s)}>Publish results</button>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )
      }
      {pubSub && <ResultsCardModal submission={pubSub} onClose={() => setPubSub(null)} />}
    </div>
  )
}
