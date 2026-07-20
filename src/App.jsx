import { useEffect, useRef, useState } from 'react'
import { DeckProvider } from './context/DeckContext'
import { AdminProvider } from './context/AdminContext'
import { UIProvider } from './context/UIContext'
import Topbar from './components/layout/Topbar'
import SearchPanel from './components/search/SearchPanel'
import DeckPanel from './components/deck/DeckPanel'
import CardDetailModal from './components/detail/CardDetailModal'
import ImportModal from './components/modals/ImportModal'
import ExportModal from './components/modals/ExportModal'
import ShareModal from './components/sharing/ShareModal'
import AdminAuth from './components/admin/AdminAuth'
import AdminPanel from './components/admin/AdminPanel'
import SubmitModal from './components/modals/SubmitModal'
import SuccessModal from './components/modals/SuccessModal'
import { useUI } from './context/UIContext'
import { useAdmin } from './context/AdminContext'
import { decodeDeck } from './utils/deckUtils'
import { useDeck } from './context/DeckContext'

function AppInner() {
  const { modal, closeModal } = useUI()
  const { adminOpen } = useAdmin()
  const { setMain, setSide, setDeckName, setFormat } = useDeck()
  const [colSearchPct, setColSearchPct] = useState(50)
  const dragging = useRef(false)
  const startX   = useRef(0)
  const startPct = useRef(50)

  // Load deck from URL hash
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash.startsWith('deck=')) {
      decodeDeck(hash).then(result => {
        if (!result) return
        const { deckName, format, main, side } = result
        if (deckName) setDeckName(deckName)
        if (format)   setFormat(format)
        setMain(main); setSide(side)
      })
    }
  }, [])

  // Resizer
  const onMouseDown = (e) => {
    dragging.current = true
    startX.current   = e.clientX
    startPct.current = colSearchPct
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    e.preventDefault()
  }

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return
      const totalW = window.innerWidth
      const dx     = e.clientX - startX.current
      const dpct   = (dx / totalW) * 100
      const newPct = Math.max(25, Math.min(75, startPct.current + dpct))
      setColSearchPct(newPct)
    }
    const onUp = () => {
      dragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Topbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ width: `${colSearchPct}%`, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(0,40,56,0.15)', background: 'var(--bgp-bg-lt)' }}>
          <SearchPanel />
        </div>
        <div
          onMouseDown={onMouseDown}
          style={{ width: 5, cursor: 'col-resize', background: 'rgba(0,40,56,0.15)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bgp-teal)'}
          onMouseLeave={e => !dragging.current && (e.currentTarget.style.background = 'rgba(0,40,56,0.15)')}
        />
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bgp-bg)' }}>
          <DeckPanel />
        </div>
      </div>

      {/* Modals */}
      <CardDetailModal />
      {modal === 'import'  && <ImportModal  onClose={closeModal} />}
      {modal === 'export'  && <ExportModal  onClose={closeModal} />}
      {modal === 'share'   && <ShareModal   onClose={closeModal} />}
      {modal === 'submit'  && <SubmitModal  onClose={closeModal} />}
      {modal === 'success' && <SuccessModal onClose={closeModal} />}

      {/* Admin */}
      <AdminAuth />
      {adminOpen && <AdminPanel />}
    </div>
  )
}

export default function App() {
  return (
    <DeckProvider>
      <AdminProvider>
        <UIProvider>
          <AppInner />
        </UIProvider>
      </AdminProvider>
    </DeckProvider>
  )
}
