import { useState } from 'react'
import { useDeck } from '../../context/DeckContext'
import { useAdmin } from '../../context/AdminContext'
import { useUI } from '../../context/UIContext'
import { FORMATS } from '../../utils/constants'
import { detectArchetype } from '../../utils/deckUtils'
import { genId } from '../../utils/dateUtils'
import { storage } from '../../utils/storage'
import { isUpcoming, fmtDate } from '../../utils/dateUtils'

export default function SubmitModal({ onClose }) {
  const { main, side, format, deckName } = useDeck()
  const { events, addSubmission } = useAdmin()
  const { openModal } = useUI()
  const [playerName, setPlayerName] = useState('')
  const [discord, setDiscord]       = useState('')
  const [eventId, setEventId]       = useState('')
  const [notif, setNotif]           = useState('none')
  const [errors, setErrors]         = useState({})
  const [loading, setLoading]       = useState(false)
  const fmt = FORMATS[format]
  const total = main.reduce((s, e) => s + e.qty, 0)
  const underMin = total < fmt.min

  const upcomingEvents = events.filter(ev => isUpcoming(ev) && (ev.format === format || ev.format === 'open')).sort((a, b) => a.date.localeCompare(b.date))
  const otherEvents    = events.filter(ev => isUpcoming(ev) && ev.format !== format && ev.format !== 'open').sort((a, b) => a.date.localeCompare(b.date))

  const submit = async () => {
    const e = {}
    if (!playerName.trim()) e.name = 'Name is required.'
    if (!eventId)           e.event = 'Please select an event.'
    if (Object.keys(e).length) { setErrors(e); return }
    setLoading(true)
    const ev = events.find(e => e.id === eventId)
    const payload = {
      id: genId(), timestamp: new Date().toISOString(),
      player_name: playerName.trim(), discord: discord.trim(),
      notif_pref: notif, event_id: eventId,
      event_name: ev?.name || '', event_date: ev?.date || '',
      deck_name: deckName || 'Untitled deck', format,
      archetype: detectArchetype(main),
      main_count: total, side_count: side.reduce((s, e) => s + e.qty, 0),
      card_list: main.map(e => `${e.qty}x ${e.card.name}`).join(', '),
      status: 'registered',
    }
    const error = await addSubmission(payload)
    if (error) {
      setErrors({ event: 'Could not submit — please try again.' })
      setLoading(false)
      return
    }
    const webhook = storage.getWebhook()
    if (webhook) {
      try { await fetch(webhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }) }
      catch (err) { console.warn('Webhook failed:', err) }
    } else { console.log('Submission (test mode):', payload) }
    setLoading(false)
    onClose()
    setTimeout(() => openModal('success'), 50)
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth:500 }}>
        <div className="modal-hdr">
          <h2>Register deck for <span>tournament</span></h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div style={{ padding:'10px 14px', borderRadius:8, background:'var(--bgp-navy)', marginBottom:16 }}>
            <div style={{ fontSize:14, fontWeight:500, color:'#e8f4f8' }}>{deckName || 'Untitled deck'}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,.45)', marginTop:2 }}>{fmt.lbl} · {total} cards</div>
            {underMin && <div style={{ fontSize:11, color:'var(--bgp-gold)', marginTop:4 }}>⚠ Deck is under the minimum card count for this format.</div>}
          </div>
          <div className="field-row">
            <div className="field">
              <label>Your name *</label>
              <input type="text" value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder="Full name" maxLength={60} />
              {errors.name && <div className="field-error">{errors.name}</div>}
            </div>
            <div className="field">
              <label>Discord handle</label>
              <input type="text" value={discord} onChange={e => setDiscord(e.target.value)} placeholder="@username" maxLength={60} />
            </div>
          </div>
          <div className="field">
            <label>Event *</label>
            <select value={eventId} onChange={e => setEventId(e.target.value)}>
              <option value="">— Select an event —</option>
              {upcomingEvents.length > 0 && (
                <optgroup label="Matching format">
                  {upcomingEvents.map(ev => <option key={ev.id} value={ev.id}>{ev.name} — {fmtDate(ev.date)}</option>)}
                </optgroup>
              )}
              {otherEvents.length > 0 && (
                <optgroup label="Other events">
                  {otherEvents.map(ev => <option key={ev.id} value={ev.id}>{ev.name} — {fmtDate(ev.date)}</option>)}
                </optgroup>
              )}
              {!events.length && <option disabled>No events — ask staff to create one.</option>}
            </select>
            {errors.event && <div className="field-error">{errors.event}</div>}
          </div>
          <div className="field">
            <label>Card alerts (optional)</label>
            <div style={{ display:'flex', gap:12 }}>
              {[['dm','Discord DM'],['email','Email'],['none','No thanks']].map(([v, l]) => (
                <label key={v} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'var(--bgp-text-2)', cursor:'pointer' }}>
                  <input type="radio" name="notif" value={v} checked={notif===v} onChange={() => setNotif(v)} style={{ accentColor:'var(--bgp-teal)' }} />
                  {l}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={submit} disabled={loading}>{loading ? 'Submitting…' : 'Register deck →'}</button>
        </div>
      </div>
    </div>
  )
}
