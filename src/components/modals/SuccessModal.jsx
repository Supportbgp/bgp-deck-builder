import { useUI } from '../../context/UIContext'

export default function SuccessModal({ onClose }) {
  const { openModal } = useUI()
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth:360 }}>
        <div className="modal-hdr"><h2>Deck <span>registered!</span></h2></div>
        <div className="modal-body" style={{ textAlign:'center', padding:'24px 20px' }}>
          <div style={{ fontSize:44, marginBottom:12 }}>🎉</div>
          <div style={{ fontSize:16, fontWeight:500, color:'var(--bgp-text)', marginBottom:6 }}>You're registered!</div>
          <div style={{ fontSize:12, color:'var(--bgp-text-2)', lineHeight:1.5 }}>Your deck has been submitted. Good luck!</div>
          <div style={{ display:'flex', gap:8, justifyContent:'center', marginTop:16 }}>
            <button className="btn primary" onClick={() => { onClose(); openModal('share') }}>Share my deck</button>
            <button className="btn ghost" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    </div>
  )
}
