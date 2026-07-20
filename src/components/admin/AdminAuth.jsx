import { useState, useEffect } from 'react'
import { useAdmin } from '../../context/AdminContext'
import { storage } from '../../utils/storage'

export default function AdminAuth() {
  const { isAuthenticated, adminOpen, login, closeAdmin } = useAdmin()
  const [mode, setMode]         = useState(null)
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  useEffect(() => {
    if (adminOpen && !isAuthenticated) {
      setMode(storage.getAuth() ? 'login' : 'setup')
      setError(''); setEmail(''); setPassword(''); setConfirm('')
    }
    if (adminOpen && isAuthenticated) setMode(null)
  }, [adminOpen, isAuthenticated])

  if (!adminOpen || isAuthenticated || !mode) return null

  const cancel = () => closeAdmin(true)

  const doSetup = () => {
    setError('')
    if (!email.includes('@')) { setError('Enter a valid email.'); return }
    if (password.length < 6)  { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm)  { setError('Passwords do not match.'); return }
    setLoading(true)
    storage.setAuth({ email: email.toLowerCase().trim(), hash: btoa(password + ':bgp_salt_v1') })
    setLoading(false)
    setMode(null)
  }

  const doLogin = () => {
    setError('')
    const stored = storage.getAuth()
    if (!stored) { setError('No admin account found.'); return }
    if (stored.email !== email.toLowerCase().trim()) { setError('Invalid email or password.'); return }
    if (stored.hash !== btoa(password + ':bgp_salt_v1')) { setError('Invalid email or password.'); return }
    login(email, password)
  }

  const onKey = (e) => { if (e.key === 'Enter') mode === 'setup' ? doSetup() : doLogin() }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,15,25,0.88)', zIndex:3000, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'var(--bgp-bg-lt)', borderRadius:12, boxShadow:'0 16px 60px rgba(0,0,0,.5)', width:340, overflow:'hidden' }}>
        <div style={{ background:'var(--bgp-navy)', padding:'16px 20px', borderBottom:'2px solid var(--bgp-teal)' }}>
          <h2 style={{ fontSize:15, fontWeight:500, color:'#e8f4f8', margin:0 }}>
            {mode === 'setup' ? <>First-run <span style={{ color:'var(--bgp-gold)' }}>setup</span></> : <>Staff <span style={{ color:'var(--bgp-gold)' }}>admin</span></>}
          </h2>
          {mode === 'setup' && <p style={{ fontSize:11, color:'rgba(255,255,255,.4)', marginTop:4 }}>Create your admin account. This runs once.</p>}
        </div>
        <div style={{ padding:20 }}>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={onKey} placeholder="admin@boardgameparadise.store" autoFocus />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={onKey} placeholder={mode === 'setup' ? 'Min. 6 characters' : '••••••••'} />
          </div>
          {mode === 'setup' && (
            <div className="field">
              <label>Confirm password</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} onKeyDown={onKey} placeholder="Repeat password" />
            </div>
          )}
          {error && <div style={{ fontSize:12, color:'var(--text-danger)', marginBottom:10 }}>{error}</div>}
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn ghost" style={{ flex:1 }} onClick={cancel}>Cancel</button>
            <button className="btn primary" style={{ flex:1 }} onClick={mode === 'setup' ? doSetup : doLogin} disabled={loading}>
              {loading ? '…' : mode === 'setup' ? 'Create account' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
