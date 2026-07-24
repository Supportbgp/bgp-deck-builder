import { LS_KEYS } from './constants'

export const storage = {
  getWebhook: () => localStorage.getItem(LS_KEYS.WEBHOOK) || '',
  setWebhook: (v) => localStorage.setItem(LS_KEYS.WEBHOOK, v),
}
