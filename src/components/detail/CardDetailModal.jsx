import { useState, useEffect, useRef } from 'react'
import { useUI } from '../../context/UIContext'
import { useDeck } from '../../context/DeckContext'
import { maxCopies } from '../../utils/deckUtils'
import ManaPips from '../deck/ManaPips'

export default function CardDetailModal() {
  const { selectedCard, closeCard } = useUI()
  const { addCard, main, side, zone, format } = useDeck()
  const [faceIdx, setFaceIdx] = useState(0)
  const canvasRef = useRef(null)

  useEffect(() => { setFaceIdx(0) }, [selectedCard])

  useEffect(() => {
    if (!selectedCard || !canvasRef.current) return
    const card = selectedCard
    const face = card.card_faces ? card.card_faces[faceIdx] : card
    const rawImg = face.image_uris?.large || face.image_uris?.normal || card.image_uris?.large || card.image_uris?.normal || ''
    if (!rawImg) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const draw = (img) => {
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight
      ctx.drawImage(img, 0, 0)
    }
    const img1 = new Image(); img1.crossOrigin = 'anonymous'
    img1.onload = () => draw(img1)
    img1.onerror = () => {
      const img2 = new Image()
      img2.onload = () => draw(img2)
      img2.onerror = () => {} // show placeholder
      img2.src = rawImg
    }
    img1.src = rawImg
  }, [selectedCard, faceIdx])

  if (!selectedCard) return null

  const card   = selectedCard
  const faces  = card.card_faces
  const face   = faces ? faces[faceIdx] : card
  const hasFlip = faces?.length > 1
  const cost   = face.mana_cost || card.mana_cost || ''
  const oracle = face.oracle_text || ''
  const flavor = face.flavor_text || ''
  const pt     = face.power ? `${face.power} / ${face.toughness}` : (face.loyalty ? `Loyalty: ${face.loyalty}` : '')
  const typeStr = face.type_line || card.type_line || ''
  const legalities = card.legalities || {}
  const allCards = [...main, ...side]
  const inDeck = allCards.find(e => e.card.id === card.id)
  const mx = maxCopies(card, format)
  const fmtOrder = ['standard','pioneer','modern','legacy','vintage','commander','pauper','explorer','alchemy']
  const rawImg = face.image_uris?.large || face.image_uris?.normal || card.image_uris?.large || card.image_uris?.normal || ''

  const typeParts = typeStr.split('—')
  const statsItems = [
    card.set_name && ['Set', card.set_name],
    card.rarity   && ['Rarity', card.rarity],
    card.cmc != null && ['CMC', card.cmc],
    pt            && ['P / T', pt],
    card.collector_number && ['No.', card.collector_number],
  ].filter(Boolean)

  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(0,15,25,0.82)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(3px)' }}
      onClick={e => e.target === e.currentTarget && closeCard()}
    >
      <div style={{ background:'var(--bgp-bg-lt)', borderRadius:10, boxShadow:'0 16px 60px rgba(0,0,0,.5)', width:'100%', maxWidth:820, maxHeight:'92vh', display:'flex', flexDirection:'column', overflow:'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 18px', height:52, background:'var(--bgp-navy)', flexShrink:0, borderBottom:'2px solid var(--bgp-teal)' }}>
          <span style={{ fontSize:13, fontWeight:500, color:'rgba(255,255,255,0.55)' }}>Card details</span>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <button
              onClick={() => addCard(card)}
              disabled={inDeck?.qty >= mx}
              style={{ fontSize:11, padding:'5px 13px', borderRadius:5, border:'none', background: inDeck?.qty >= mx ? 'rgba(255,255,255,0.2)' : 'var(--bgp-teal)', color: inDeck?.qty >= mx ? 'rgba(255,255,255,0.4)' : '#f4f8f8', cursor: inDeck?.qty >= mx ? 'not-allowed' : 'pointer', fontWeight:500 }}
            >
              {inDeck ? (inDeck.qty >= mx ? 'Max copies' : `+ Add (${inDeck.qty}/${mx})`) : '+ Add to deck'}
            </button>
            <button onClick={closeCard} style={{ width:28, height:28, border:'1px solid rgba(255,255,255,.2)', background:'transparent', color:'rgba(255,255,255,.5)', cursor:'pointer', borderRadius:5, fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
          </div>
        </div>

        {/* Body */}
        <div style={{ display:'flex', overflow:'hidden', flex:1, minHeight:0 }}>
          {/* Left: image */}
          <div style={{ width:280, flexShrink:0, background:'var(--bgp-navy)', display:'flex', flexDirection:'column', alignItems:'center', padding:'20px 16px', gap:12, overflowY:'auto' }}>
            <div style={{ width:'100%', maxWidth:240 }}>
              {rawImg
                ? <canvas ref={canvasRef} style={{ width:'100%', borderRadius:10, display:'block', boxShadow:'0 4px 20px rgba(0,0,0,.5)' }} />
                : <div style={{ width:'100%', aspectRatio:'5/7', borderRadius:10, background:'rgba(255,255,255,.05)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:40, color:'rgba(255,255,255,.3)' }}>🃏</div>
              }
            </div>
            {hasFlip && (
              <button
                onClick={() => setFaceIdx(f => (f + 1) % faces.length)}
                style={{ width:'100%', maxWidth:240, fontSize:12, padding:7, borderRadius:5, border:'1px solid rgba(255,255,255,.2)', background:'rgba(255,255,255,.06)', color:'rgba(255,255,255,.7)', cursor:'pointer', textAlign:'center' }}
              >
                Flip card ↺
              </button>
            )}
          </div>

          {/* Right: info */}
          <div style={{ flex:1, overflowY:'auto', padding:'20px 22px', display:'flex', flexDirection:'column', gap:14, minWidth:0 }}>
            <div>
              <div style={{ fontSize:22, fontWeight:600, color:'var(--bgp-text)', lineHeight:1.2 }}>{face.name}</div>
              {cost && <div style={{ display:'flex', gap:3, flexWrap:'wrap', marginTop:6 }}><ManaPips cost={cost} /></div>}
            </div>

            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {typeParts.map((p, i) => (
                <span key={i} style={{ fontSize:11, padding:'3px 10px', borderRadius:4, fontWeight:500, background: i===0 ? 'rgba(0,80,104,.12)' : 'var(--bgp-bg-dk)', color: i===0 ? 'var(--bgp-teal)' : 'var(--bgp-text-2)', border:`1px solid ${i===0 ? 'rgba(0,80,104,.2)' : 'var(--border)'}` }}>
                  {p.trim()}
                </span>
              ))}
              {card.rarity && <span style={{ fontSize:11, padding:'3px 10px', borderRadius:4, fontWeight:500, background:'var(--bgp-bg-dk)', color:'var(--bgp-text-2)', border:'1px solid var(--border)' }}>{card.rarity}</span>}
            </div>

            {statsItems.length > 0 && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
                {statsItems.map(([k, v]) => (
                  <div key={k} style={{ background:'var(--bgp-bg)', borderRadius:5, padding:'6px 8px' }}>
                    <div style={{ fontSize:10, color:'var(--bgp-text-3)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:2 }}>{k}</div>
                    <div style={{ fontSize:13, fontWeight:500, color:'var(--bgp-text)' }}>{v}</div>
                  </div>
                ))}
              </div>
            )}

            {oracle && (
              <div>
                <div style={{ fontSize:10, fontWeight:600, color:'var(--bgp-teal)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:4 }}>Effect</div>
                <div style={{ fontSize:13, color:'var(--bgp-text)', lineHeight:1.7, whiteSpace:'pre-wrap' }}
                  dangerouslySetInnerHTML={{ __html: escOracle(oracle) }}
                />
              </div>
            )}

            {flavor && <div style={{ fontSize:12, color:'var(--bgp-text-3)', fontStyle:'italic', lineHeight:1.6, paddingTop:10, borderTop:'1px solid var(--border)' }}>{flavor}</div>}

            {Object.keys(legalities).length > 0 && (
              <div>
                <div style={{ fontSize:10, fontWeight:600, color:'var(--bgp-teal)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:6 }}>Format legality</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:4 }}>
                  {fmtOrder.filter(f => f in legalities).map(f => {
                    const st = legalities[f]
                    const colors = { legal:{bg:'#c8edd0',color:'#14532d'}, not_legal:{bg:'var(--bgp-bg-dk)',color:'var(--bgp-text-3)'}, restricted:{bg:'#fff0c0',color:'#7c4a00'}, banned:{bg:'#fcd0d0',color:'#7f1d1d'} }
                    const c = colors[st] || colors.not_legal
                    return (
                      <div key={f} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:11, padding:'3px 6px', borderRadius:4, background:'var(--bgp-bg)' }}>
                        <span style={{ color:'var(--bgp-text-2)', textTransform:'capitalize' }}>{f}</span>
                        <span style={{ fontSize:10, padding:'1px 6px', borderRadius:3, fontWeight:500, background:c.bg, color:c.color }}>{st === 'not_legal' ? 'not legal' : st}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function escOracle(txt) {
  return txt
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\{([^}]+)\}/g, (_, sym) => {
      const m = {W:'W',U:'U',B:'B',R:'R',G:'G',C:'C',X:'X',S:'S',T:'T',Q:'Q'}
      const cls = m[sym] ? `pip-${sym}` : (isNaN(sym) ? 'pip-C' : 'pip-num')
      const lbl = sym==='T'?'⟳':sym==='Q'?'⟲':sym
      return `<span class="pip ${cls}" style="width:14px;height:14px;font-size:7px">${lbl}</span>`
    })
    .replace(/\n/g,'<br>')
    .replace(/\(([^)]+)\)/g,'<em style="color:var(--bgp-text-3)">($1)</em>')
}
