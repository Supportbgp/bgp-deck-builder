import { useState } from 'react'
import { useAdmin } from '../../context/AdminContext'
import EventsTab from './EventsTab'
import SubmissionsTab from './SubmissionsTab'
import SettingsTab from './SettingsTab'

export default function AdminPanel() {
  const { closeAdmin } = useAdmin()
  const [tab, setTab] = useState('events')
  const tabs = [{ key:'events', label:'Events' }, { key:'submissions', label:'Submissions' }, { key:'settings', label:'Settings' }]

  return (
    <div style={{ position:'fixed', inset:0, background:'var(--bgp-bg)', zIndex:2500, display:'flex', flexDirection:'column' }}>
      {/* Topbar */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'0 20px', height:56, background:'var(--bgp-navy)', borderBottom:'2px solid var(--bgp-teal)', flexShrink:0 }}>
        <div style={{ fontSize:15, fontWeight:500, color:'#e8f4f8' }}>⚙ <span style={{ color:'var(--bgp-gold)' }}>BGP Admin</span></div>
        <div style={{ flex:1 }} />
        <button onClick={() => closeAdmin(true)} style={{ fontSize:11, padding:'5px 12px', borderRadius:5, border:'1px solid rgba(255,255,255,.2)', background:'transparent', color:'rgba(255,255,255,.6)', cursor:'pointer' }}>🔒 Lock</button>
        <button onClick={() => closeAdmin(false)} style={{ width:32, height:32, border:'1px solid rgba(255,255,255,.2)', background:'transparent', color:'rgba(255,255,255,.5)', cursor:'pointer', borderRadius:6, fontSize:18, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
      </div>

      {/* Tab bar */}
      <div style={{ display:'flex', background:'var(--bgp-teal-dim)', borderBottom:'1px solid var(--border)', flexShrink:0, padding:'0 20px', gap:4 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ fontSize:12, fontWeight:500, padding:'10px 16px', border:'none', background:'transparent', color: tab===t.key ? '#fff' : 'rgba(255,255,255,.5)', cursor:'pointer', borderBottom: tab===t.key ? '2px solid var(--bgp-gold)' : '2px solid transparent' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ flex:1, overflow:'hidden' }}>
        {tab === 'events'      && <EventsTab />}
        {tab === 'submissions' && <SubmissionsTab />}
        {tab === 'settings'    && <SettingsTab />}
      </div>
    </div>
  )
}
