import { createContext, useContext, useState, useCallback } from 'react'
import { FORMATS } from '../utils/constants'
import { isBasicLand, maxCopies } from '../utils/deckUtils'

const DeckContext = createContext(null)
export const useDeck = () => useContext(DeckContext)

export function DeckProvider({ children }) {
  const [format, setFormat]   = useState('standard')
  const [main, setMain]       = useState([])
  const [side, setSide]       = useState([])
  const [zone, setZone]       = useState('main') // 'main' | 'side'
  const [deckName, setDeckName] = useState('')

  const getZoneData = useCallback(() => zone === 'main' ? main : side, [zone, main, side])
  const setZoneData = useCallback((data) => zone === 'main' ? setMain(data) : setSide(data), [zone])

  const addCard = useCallback((card) => {
    const max = maxCopies(card, format)
    setZoneData(prev => {
      const existing = prev.find(e => e.card.id === card.id)
      if (existing) {
        if (existing.qty >= max) return prev
        return prev.map(e => e.card.id === card.id ? { ...e, qty: e.qty + 1 } : e)
      }
      return [...prev, { card, qty: 1 }]
    })
  }, [format, setZoneData])

  const changeQty = useCallback((cardId, delta) => {
    setZoneData(prev => {
      const entry = prev.find(e => e.card.id === cardId)
      if (!entry) return prev
      const max = maxCopies(entry.card, format)
      const newQty = entry.qty + delta
      if (newQty <= 0) return prev.filter(e => e.card.id !== cardId)
      if (newQty > max) return prev
      return prev.map(e => e.card.id === cardId ? { ...e, qty: newQty } : e)
    })
  }, [format, setZoneData])

  const removeCard = useCallback((cardId) => {
    setZoneData(prev => prev.filter(e => e.card.id !== cardId))
  }, [setZoneData])

  const clearDeck = useCallback(() => { setMain([]); setSide([]) }, [])

  const totalMain = main.reduce((s, e) => s + e.qty, 0)
  const totalSide = side.reduce((s, e) => s + e.qty, 0)
  const fmt = FORMATS[format]

  return (
    <DeckContext.Provider value={{
      format, setFormat, main, setMain, side, setSide,
      zone, setZone, deckName, setDeckName,
      addCard, changeQty, removeCard, clearDeck,
      totalMain, totalSide, fmt,
    }}>
      {children}
    </DeckContext.Provider>
  )
}
