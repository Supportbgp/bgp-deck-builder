import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { storage } from '../utils/storage'

const AdminContext = createContext(null)
export const useAdmin = () => useContext(AdminContext)

export function AdminProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminOpen, setAdminOpen]             = useState(false)
  const [events, setEventsState]              = useState(() => storage.getEvents())
  const [submissions, setSubsState]           = useState(() => storage.getSubs())

  const setEvents = useCallback((data) => {
    setEventsState(data)
    storage.setEvents(data)
  }, [])

  const setSubs = useCallback((data) => {
    setSubsState(data)
    storage.setSubs(data)
  }, [])

  const login = useCallback((email, password) => {
    const stored = storage.getAuth()
    if (!stored) return 'No admin account set up. Use first-run setup.'
    if (stored.email !== email.toLowerCase().trim()) return 'Invalid email or password.'
    // Simple hash check — bcryptjs compare
    try {
      const bcrypt = window._bcrypt
      if (bcrypt && !bcrypt.compareSync(password, stored.hash)) return 'Invalid email or password.'
    } catch {}
    setIsAuthenticated(true)
    return null
  }, [])

  const logout = useCallback(() => {
    setIsAuthenticated(false)
    setAdminOpen(false)
  }, [])

  const openAdmin = useCallback(() => {
    setAdminOpen(true)
    document.body.style.overflow = 'hidden'
  }, [])

  const closeAdmin = useCallback((lock = false) => {
    setAdminOpen(false)
    document.body.style.overflow = ''
    if (lock) setIsAuthenticated(false)
  }, [])

  const hasAdminAccount = useCallback(() => !!storage.getAuth(), [])

  return (
    <AdminContext.Provider value={{
      isAuthenticated, adminOpen,
      events, setEvents,
      submissions, setSubs,
      login, logout, openAdmin, closeAdmin, hasAdminAccount,
    }}>
      {children}
    </AdminContext.Provider>
  )
}
