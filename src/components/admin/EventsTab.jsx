import { useState } from 'react'
import { useAdmin } from '../../context/AdminContext'
import { fmtDate, fmtTime, isUpcoming, genId } from '../../utils/dateUtils'
import { FORMATS } from '../../utils/constants'

const EMPTY_FORM = { name:'', date:'', time:'18:00', format:'standard', location:'', notes:'' }

export default function EventsTab() {
  const { events, addEvent, updateEvent, deleteEvent, submissions } = useAdmin()
  const [form, setForm]       = useState(EMPTY_FORM)
  const [editId, setEditId]   = useState(null)
  const [errors, setErrors]   = useState({})
  const [saving, setSaving]   = useState(false)
  const sorted = [...events].sort((a,b) => a.date.localeCompare(b.date))
  const subCounts = {}; submissions.forEach(s => { subCounts[s.event_id] = (subCounts[s.event_id]||0)+1 })

  const load = (ev) => { setForm({ name:ev.name, date:ev.date, time:ev.time||'18:00', format:ev.format, location:ev.location||'', notes:ev.notes||'' }); setEditId(ev.id); setErrors({}) }
  const clear = () => { setForm(EMPTY_FORM); setEditId(null); setErrors({}) }

  const save = async () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required.'
    if (!form.date)        e.date = 'Date is required.'
    if (Object.keys(e).length) { setErrors(e); return }
    const ev = { ...form, id: editId || genId(), location: form.location || 'BGP — Main store' }
    setSaving(true)
    const error = editId ? await updateEvent(ev) : await addEvent(ev)
    setSaving(false)
    if (error) { setErrors({ name: 'Could not save event. Try again.' }); return }
    clear()
  }

  const del = async (id, name) => {
    if (confirm(`Delete "${name}"? Submissions will remain.`)) await deleteEvent(id)
  }

  return (
    <div style={{ display:'flex', height:'100%', overflow:'hidden' }}>
      {/* List */}
      <div style={{ width:420, flexShrink:0, borderRight:'1px solid var(--border)', overflowY:'auto', padding:20 }}>
        {!sorted.length && <div className="empty-state">No events yet. Fill in the form to create one.</div>}
        {sorted.map(ev => (
          <div key={ev.id} onClick={() => load(ev)} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:8, border:`1px solid ${editId===ev.id ? 'var(--bgp-teal)' : 'var(--border)'}`, background: editId===ev.id ? 'rgba(0,80,104,.06)' : 'var(--bgp-white)', marginBottom:8, cursor:'pointer', transition:'border-color .12s' }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background: isUpcoming(ev) ? '#22c55e' : 'var(--bgp-text-3)', flexShrink:0 }} />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:500, color:'var(--bgp-text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{ev.name}</div>
              <div style={{ fontSize:11, color:'var(--bgp-text-3)', marginTop:1 }}>{fmtDate(ev.date)}{ev.time ? ` · ${fmtTime(ev.time)}` : ''} · {ev.location||'BGP'}</div>
            </div>
            <div style={{ display:'flex', gap:4, flexShrink:0 }}>
              <span style={{ fontSize:10, padding:'2px 7px', borderRadius:3, fontWeight:500, background:'rgba(0,80,104,.12)', color:'var(--bgp-teal)', border:'1px solid rgba(0,80,104,.15)' }}>{ev.format}</span>
              {subCounts[ev.id] && <span style={{ fontSize:10, padding:'2px 7px', borderRadius:3, fontWeight:500, background:'var(--bgp-bg-dk)', color:'var(--bgp-text-2)', border:'1px solid var(--border)' }}>{subCounts[ev.id]} reg</span>}
            </div>
            <button onClick={e => { e.stopPropagation(); del(ev.id, ev.name) }} style={{ width:22, height:22, border:'none', background:'transparent', color:'var(--bgp-text-3)', cursor:'pointer', borderRadius:4, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
          </div>
        ))}
      </div>

      {/* Form */}
      <div style={{ flex:1, overflowY:'auto', padding:24, background:'var(--bgp-bg-lt)' }}>
        <div style={{ fontSize:11, fontWeight:600, color:'var(--bgp-teal)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:14 }}>{editId ? 'Edit event' : 'Create new event'}</div>
        <div className="field"><label>Event name *</label><input type="text" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Friday Night Magic — Modern" maxLength={80} />{errors.name && <div className="field-error">{errors.name}</div>}</div>
        <div className="field-row">
          <div className="field"><label>Date *</label><input type="date" value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))} />{errors.date && <div className="field-error">{errors.date}</div>}</div>
          <div className="field"><label>Time</label><input type="time" value={form.time} onChange={e => setForm(f=>({...f,time:e.target.value}))} /></div>
        </div>
        <div className="field-row">
          <div className="field"><label>Format</label>
            <select value={form.format} onChange={e => setForm(f=>({...f,format:e.target.value}))}>
              {Object.keys(FORMATS).map(k => <option key={k} value={k}>{FORMATS[k].lbl}</option>)}
              <option value="draft">Draft</option><option value="sealed">Sealed</option><option value="open">Open / Casual</option>
            </select>
          </div>
          <div className="field"><label>Location</label><input type="text" value={form.location} onChange={e => setForm(f=>({...f,location:e.target.value}))} placeholder="BGP — Main store" /></div>
        </div>
        <div className="field"><label>Notes</label><textarea value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} placeholder="Entry fee, prize structure, special rules…" rows={2} /></div>
        <div style={{ display:'flex', gap:8, marginTop:4 }}>
          {editId && <button className="btn ghost" onClick={clear}>Cancel edit</button>}
          <button className="btn primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : editId ? 'Update event' : 'Save event'}</button>
        </div>
      </div>
    </div>
  )
}
