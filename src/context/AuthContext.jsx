import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

async function checkIsAdmin(userId) {
  if (!userId) return false
  const { data } = await supabase.from('admins').select('user_id').eq('user_id', userId).maybeSingle()
  return !!data
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (cancelled) return
      setUser(session?.user ?? null)
      setIsAdmin(await checkIsAdmin(session?.user?.id))
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (cancelled) return
      setUser(session?.user ?? null)
      setIsAdmin(await checkIsAdmin(session?.user?.id))
      setLoading(false)
    })

    return () => { cancelled = true; subscription.unsubscribe() }
  }, [])

  const signInWithDiscord = useCallback(() => {
    return supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: { redirectTo: window.location.href.split('#')[0].split('?')[0] },
    })
  }, [])

  const signOut = useCallback(() => supabase.auth.signOut(), [])

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signInWithDiscord, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
