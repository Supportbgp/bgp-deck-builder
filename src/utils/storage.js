import { LS_KEYS, SEED_EVENTS } from './constants'

export const storage = {
  getEvents:   () => { try { return JSON.parse(localStorage.getItem(LS_KEYS.EVENTS)) || SEED_EVENTS } catch { return SEED_EVENTS } },
  setEvents:   (v) => localStorage.setItem(LS_KEYS.EVENTS, JSON.stringify(v)),
  getSubs:     () => { try { return JSON.parse(localStorage.getItem(LS_KEYS.SUBS)) || [] } catch { return [] } },
  setSubs:     (v) => localStorage.setItem(LS_KEYS.SUBS, JSON.stringify(v)),
  getWebhook:  () => localStorage.getItem(LS_KEYS.WEBHOOK) || '',
  setWebhook:  (v) => localStorage.setItem(LS_KEYS.WEBHOOK, v),
  getAuth:     () => { try { return JSON.parse(localStorage.getItem(LS_KEYS.AUTH)) } catch { return null } },
  setAuth:     (v) => localStorage.setItem(LS_KEYS.AUTH, JSON.stringify(v)),
  clearAuth:   () => localStorage.removeItem(LS_KEYS.AUTH),
}
