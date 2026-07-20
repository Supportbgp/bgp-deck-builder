import { useState } from 'react'
import { useAdmin } from '../../context/AdminContext'
import { storage } from '../../utils/storage'

export default function SettingsTab() {
  const { setEvents, setSubs } = useAdmin()
  const [webhook, setWebhook]     = useState(storage.getWebhook)
  const [webhookMsg, setWebhookMsg] = useState('')
  const [curPw, setCurPw]   = useState('')
  const [newPw, setNewPw]   = useState('')
  const [confPw, setConfPw] = useState('')
  const [pwErr, setPwErr]   = useState('')
  const [curEmail, setCurEmail] = useState('')
  const [newEmail, setNewEmail] = useState('')

  const saveWebhook = () => { storage.setWebhook(webhook.trim()); setWebhookMsg(webhook.trim() ? 'Webhook saved.' : 'Cleared.'); setTimeout(() => setWebhookMsg(''), 3000) }

  const savePw = () => {
    setPwErr('')
    const stored = storage.getAuth()
    if (!stored) { setPwErr('No admin account found.'); return }
    if (btoa(curPw + ':bgp_salt_v1') !== stored.hash) { setPwErr('Current password is incorrect.'); return }
    if (newPw.length < 6) { setPwErr('New password must be at least 6 characters.'); return }
    if (newPw !== confPw) { setPwErr('Passwords do not match.'); return }
    const email = newEmail.trim() || stored.email
    if (newEmail.trim() && !newEmail.includes('@')) { setPwErr('Enter a valid email address.'); return }
    storage.setAuth({ email, hash: btoa(newPw + ':bgp_salt_v1') })
    setCurPw(''); setNewPw(''); setConfPw(''); setNewEmail('')
    alert('Credentials updated.')
  }

  return (
    <div style={{ height:'100%', overflowY:'auto', padding:24 }}>
      <div style={{ maxWidth:440 }}>
        {/* Webhook */}
        <div style={{ fontSize:11, fontWeight:600, color:'var(--bgp-teal)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:14 }}>Make.com Webhook</div>
        <div className="field">
          <label>Webhook URL</label>
          <input type="url" value={webhook} onChange={e => setWebhook(e.target.value)} placeholder="https://hook.eu1.make.com/…" />
          <div className="field-hint">Submissions will POST to this URL. Leave blank for test mode (console only).</div>
        </div>
        <button className="btn primary" onClick={saveWebhook}>Save webhook</button>
        {webhookMsg && <div style={{ fontSize:12, color:'var(--text-success)', marginTop:6 }}>{webhookMsg}</div>}

        <hr style={{ border:'none', borderTop:'1px solid var(--border)', margin:'24px 0' }} />

        {/* Change credentials */}
        <div style={{ fontSize:11, fontWeight:600, color:'var(--bgp-teal)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:14 }}>Update credentials</div>
        <div className="field"><label>Current password</label><input type="password" value={curPw} onChange={e => setCurPw(e.target.value)} placeholder="••••••••" /></div>
        <div className="field"><label>New email (optional)</label><input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Leave blank to keep current" /></div>
        <div className="field"><label>New password</label><input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min. 6 characters" /></div>
        <div className="field"><label>Confirm new password</label><input type="password" value={confPw} onChange={e => setConfPw(e.target.value)} placeholder="Repeat password" /></div>
        {pwErr && <div style={{ fontSize:12, color:'var(--text-danger)', marginBottom:8 }}>{pwErr}</div>}
        <button className="btn primary" onClick={savePw}>Update credentials</button>

        <hr style={{ border:'none', borderTop:'1px solid var(--border)', margin:'24px 0' }} />

        {/* Data management */}
        <div style={{ fontSize:11, fontWeight:600, color:'var(--bgp-teal)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:14 }}>Data management</div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn danger" onClick={() => { if(confirm('Clear all submissions?')) setSubs([]) }}>Clear submissions</button>
          <button className="btn danger" onClick={() => { if(confirm('Clear all events?')) setEvents([]) }}>Clear events</button>
        </div>
        <div className="field-hint" style={{ marginTop:8 }}>Clears local storage only. Does not affect Google Sheets.</div>
      </div>
    </div>
  )
}
