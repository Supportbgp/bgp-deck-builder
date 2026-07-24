import { useState } from 'react'
import { useAdmin } from '../../context/AdminContext'
import { useAuth } from '../../context/AuthContext'
import { storage } from '../../utils/storage'

export default function SettingsTab() {
  const { clearEvents, clearSubmissions } = useAdmin()
  const { user } = useAuth()
  const [webhook, setWebhook]       = useState(storage.getWebhook)
  const [webhookMsg, setWebhookMsg] = useState('')

  const saveWebhook = () => { storage.setWebhook(webhook.trim()); setWebhookMsg(webhook.trim() ? 'Webhook saved.' : 'Cleared.'); setTimeout(() => setWebhookMsg(''), 3000) }

  return (
    <div style={{ height:'100%', overflowY:'auto', padding:24 }}>
      <div style={{ maxWidth:440 }}>
        {/* Account */}
        <div style={{ fontSize:11, fontWeight:600, color:'var(--bgp-teal)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:14 }}>Signed in as</div>
        <p style={{ fontSize:13, color:'var(--bgp-text)', marginBottom:6 }}>{user?.user_metadata?.full_name || user?.email || '—'}</p>
        <div className="field-hint">Admin access is managed by the store owner in the Supabase dashboard (Table Editor → admins) — there's no self-service invite here.</div>

        <hr style={{ border:'none', borderTop:'1px solid var(--border)', margin:'24px 0' }} />

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

        {/* Data management */}
        <div style={{ fontSize:11, fontWeight:600, color:'var(--bgp-teal)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:14 }}>Data management</div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn danger" onClick={() => { if(confirm('Clear all submissions? This deletes them for every admin, not just you.')) clearSubmissions() }}>Clear submissions</button>
          <button className="btn danger" onClick={() => { if(confirm('Clear all events? This deletes them for every admin, not just you.')) clearEvents() }}>Clear events</button>
        </div>
        <div className="field-hint" style={{ marginTop:8 }}>These clear the shared database — every staff member and player sees the result immediately.</div>
      </div>
    </div>
  )
}
