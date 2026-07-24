import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'

const AdminContext = createContext(null)
export const useAdmin = () => useContext(AdminContext)

function upsertById(list, row) {
  const idx = list.findIndex(e => e.id === row.id)
  if (idx === -1) return [...list, row]
  return list.map(e => e.id === row.id ? row : e)
}

export function AdminProvider({ children }) {
  const [adminOpen, setAdminOpen] = useState(false)
  const [events, setEvents]       = useState([])
  const [submissions, setSubs]    = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    let cancelled = false

    Promise.all([
      supabase.from('events').select('*'),
      supabase.from('submissions').select('*'),
    ]).then(([ev, subs]) => {
      if (cancelled) return
      setEvents(ev.data || [])
      setSubs(subs.data || [])
      setLoading(false)
    })

    const channel = supabase.channel('bgp-admin-data')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, payload => {
        if (payload.eventType === 'DELETE') setEvents(prev => prev.filter(e => e.id !== payload.old.id))
        else setEvents(prev => upsertById(prev, payload.new))
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, payload => {
        if (payload.eventType === 'DELETE') setSubs(prev => prev.filter(s => s.id !== payload.old.id))
        else setSubs(prev => upsertById(prev, payload.new))
      })
      .subscribe()

    return () => { cancelled = true; supabase.removeChannel(channel) }
  }, [])

  const addEvent = useCallback(async (event) => {
    const { data, error } = await supabase.from('events').insert(event).select().single()
    if (!error) setEvents(prev => upsertById(prev, data))
    return error
  }, [])

  const updateEvent = useCallback(async (event) => {
    const { data, error } = await supabase.from('events').update(event).eq('id', event.id).select().single()
    if (!error) setEvents(prev => upsertById(prev, data))
    return error
  }, [])

  const deleteEvent = useCallback(async (id) => {
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (!error) setEvents(prev => prev.filter(e => e.id !== id))
    return error
  }, [])

  const clearEvents = useCallback(async () => {
    const { error } = await supabase.from('events').delete().neq('id', '')
    if (!error) setEvents([])
    return error
  }, [])

  const updateSubmissionStatus = useCallback(async (id, status) => {
    const { data, error } = await supabase.from('submissions').update({ status }).eq('id', id).select().single()
    if (!error) setSubs(prev => upsertById(prev, data))
    return error
  }, [])

  const addSubmission = useCallback(async (submission) => {
    const { data, error } = await supabase.from('submissions').insert(submission).select().single()
    if (!error) setSubs(prev => upsertById(prev, data))
    return error
  }, [])

  const clearSubmissions = useCallback(async () => {
    const { error } = await supabase.from('submissions').delete().neq('id', '')
    if (!error) setSubs([])
    return error
  }, [])

  const openAdmin = useCallback(() => {
    setAdminOpen(true)
    document.body.style.overflow = 'hidden'
  }, [])

  const closeAdmin = useCallback(() => {
    setAdminOpen(false)
    document.body.style.overflow = ''
  }, [])

  return (
    <AdminContext.Provider value={{
      adminOpen, openAdmin, closeAdmin,
      events, addEvent, updateEvent, deleteEvent, clearEvents,
      submissions, updateSubmissionStatus, addSubmission, clearSubmissions,
      loading,
    }}>
      {children}
    </AdminContext.Provider>
  )
}
