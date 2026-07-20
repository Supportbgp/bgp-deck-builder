import { createContext, useContext, useState, useCallback } from 'react'

const UIContext = createContext(null)
export const useUI = () => useContext(UIContext)

export function UIProvider({ children }) {
  const [selectedCard, setSelectedCard]   = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching]     = useState(false)
  const [modal, setModal]                 = useState(null) // 'import'|'export'|'share'|'topping'|'submit'|'success'

  const openModal  = useCallback((name) => { setModal(name); document.body.style.overflow = 'hidden' }, [])
  const closeModal = useCallback(() => { setModal(null); document.body.style.overflow = '' }, [])

  const openCard  = useCallback((card) => setSelectedCard(card), [])
  const closeCard = useCallback(() => setSelectedCard(null), [])

  return (
    <UIContext.Provider value={{
      selectedCard, openCard, closeCard,
      searchResults, setSearchResults,
      isSearching, setIsSearching,
      modal, openModal, closeModal,
    }}>
      {children}
    </UIContext.Provider>
  )
}
