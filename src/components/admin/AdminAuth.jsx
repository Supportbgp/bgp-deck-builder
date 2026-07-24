import { useAdmin } from '../../context/AdminContext'
import { useAuth } from '../../context/AuthContext'

export default function AdminAuth() {
  const { adminOpen, closeAdmin } = useAdmin()
  const { user, isAdmin, loading, signInWithDiscord, signOut } = useAuth()

  if (!adminOpen || (user && isAdmin)) return null

  const cancel = () => closeAdmin()

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,15,25,0.88)', zIndex:3000, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'var(--bgp-bg-lt)', borderRadius:12, boxShadow:'0 16px 60px rgba(0,0,0,.5)', width:340, overflow:'hidden' }}>
        <div style={{ background:'var(--bgp-navy)', padding:'16px 20px', borderBottom:'2px solid var(--bgp-teal)' }}>
          <h2 style={{ fontSize:15, fontWeight:500, color:'#e8f4f8', margin:0 }}>
            Staff <span style={{ color:'var(--bgp-gold)' }}>admin</span>
          </h2>
          <p style={{ fontSize:11, color:'rgba(255,255,255,.4)', marginTop:4 }}>Sign in with your Discord account.</p>
        </div>
        <div style={{ padding:20 }}>
          {loading ? (
            <p style={{ fontSize:12, color:'var(--bgp-text-2)', textAlign:'center', padding:'10px 0' }}>Checking session…</p>
          ) : user && !isAdmin ? (
            <>
              <p style={{ fontSize:12, color:'var(--bgp-text-2)', lineHeight:1.5, marginBottom:14 }}>
                Signed in as <b>{user.user_metadata?.full_name || user.email}</b>, but this account isn't on the admin list yet. Ask the store owner to add you.
              </p>
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn ghost" style={{ flex:1 }} onClick={cancel}>Cancel</button>
                <button className="btn" style={{ flex:1 }} onClick={signOut}>Sign out</button>
              </div>
            </>
          ) : (
            <>
              <button className="btn primary" style={{ width:'100%', marginBottom:10 }} onClick={signInWithDiscord}>
                Sign in with Discord
              </button>
              <button className="btn ghost" style={{ width:'100%' }} onClick={cancel}>Cancel</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
