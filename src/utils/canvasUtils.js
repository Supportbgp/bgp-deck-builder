import { BGP, TYPE_ORDER } from './constants'
import { groupByType, cardType } from './deckUtils'
import { getColorIdentity } from './manaUtils'

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

export function drawManaSymbol(ctx, sym, cx, cy, r) {
  const colors = { W: ['#f9faf4', '#7c7a6e'], U: ['#0070b8', '#fff'], B: ['#150b00', '#fff'], R: ['#d3202a', '#fff'], G: ['#00733e', '#fff'], C: ['#bbb', '#555'] }
  const [bg, fg] = colors[sym] || ['#888', '#fff']
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = bg; ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 0.5; ctx.stroke()
  ctx.fillStyle = fg
  ctx.font = `bold ${Math.round(r * 1.1)}px Arial`
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(sym, cx, cy + 0.5)
}

export function drawColorBar(ctx, x, y, w, h, colorIdentity) {
  const colorMap = { W: '#f9faf4', U: '#0070b8', B: '#150b00', R: '#d3202a', G: '#00733e', C: '#bbb' }
  const colors = colorIdentity.length ? colorIdentity : ['C']
  const sliceW = w / colors.length
  colors.forEach((c, i) => {
    ctx.fillStyle = colorMap[c] || BGP.TEAL
    ctx.fillRect(x + i * sliceW, y, sliceW + 0.5, h)
  })
}

export function drawCurve(ctx, x, y, w, h, cards) {
  const counts = {}
  cards.forEach(({ card, qty }) => {
    if (cardType(card) === 'Land') return
    const c = Math.min(card.cmc || 0, 7)
    counts[c] = (counts[c] || 0) + qty
  })
  const mx = Math.max(1, ...Object.values(counts))
  const colW = w / 8
  for (let i = 0; i <= 7; i++) {
    const v = counts[i] || 0
    const bh = Math.round((v / mx) * (h - 16))
    const bx = x + i * colW + colW * 0.1
    const bw = colW * 0.8
    ctx.fillStyle = v ? BGP.TEAL : 'rgba(0,80,104,0.2)'
    roundRect(ctx, bx, y + h - 16 - bh, bw, bh, 2); ctx.fill()
    if (v) {
      ctx.fillStyle = BGP.WHITE; ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
      ctx.fillText(v, bx + bw / 2, y + h - 18 - bh + 10)
    }
    ctx.fillStyle = BGP.TEXT3; ctx.font = '10px Arial'; ctx.textBaseline = 'top'
    ctx.fillText(i === 7 ? '7+' : i, bx + bw / 2, y + h - 13)
  }
}

export function drawHeader(ctx, logoImg, cw, h, subtitle) {
  ctx.fillStyle = BGP.NAVY; ctx.fillRect(0, 0, cw, h)
  ctx.fillStyle = BGP.GOLD; ctx.fillRect(0, h - 3, cw, 3)
  if (logoImg) {
    const logoH = h * 0.55
    const logoW = logoH * (logoImg.width / (logoImg.height || 1))
    const logoX = 28; const logoY = (h - logoH) / 2
    try { ctx.drawImage(logoImg, logoX, logoY, logoW, logoH) } catch {}
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(logoX + logoW + 16, h * 0.2); ctx.lineTo(logoX + logoW + 16, h * 0.8); ctx.stroke()
    const tx = logoX + logoW + 28
    ctx.fillStyle = BGP.GOLD; ctx.font = 'bold 13px Arial'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
    ctx.fillText('BOARD GAME PARADISE', tx, h * 0.35)
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = '12px Arial'
    ctx.fillText(subtitle, tx, h * 0.68)
  }
}

export function drawFooter(ctx, cw, y, fh) {
  ctx.fillStyle = BGP.NAVY; ctx.fillRect(0, y, cw, fh)
  ctx.fillStyle = BGP.GOLD; ctx.fillRect(0, y, cw, 3)
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = '12px Arial'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('www.boardgameparadise.store', cw / 2, y + fh / 2)
}

export function buildCardLines(cards) {
  const g = groupByType(cards)
  const lines = []
  TYPE_ORDER.forEach(type => {
    const entries = g[type]
    if (!entries.length) return
    const tot = entries.reduce((s, e) => s + e.qty, 0)
    lines.push({ type: 'header', text: `${type} (${tot})` })
    entries.forEach(({ card, qty }) => lines.push({ type: 'card', text: `${qty}  ${card.name}` }))
  })
  return lines
}

export function renderShareCard(canvas, logoImg, deckCards, deckName, deckFmt, FORMATS) {
  const cw = 800, PAD = 28, COLS = 5
  const CARD_W = Math.floor((cw - PAD * 2 - (COLS - 1) * 6) / COLS)
  const CARD_H = Math.round(CARD_W * 1.4), GAP = 6
  const slots = []
  const g = groupByType(deckCards)
  TYPE_ORDER.forEach(type => {
    g[type].forEach(({ card, qty }) => {
      const show = Math.min(qty, 4)
      for (let i = 0; i < show; i++) slots.push({ card, qty })
    })
  })
  const rows = Math.ceil(slots.length / COLS)
  const HEADER_H = 80, META_H = 68, CURVE_H = 80
  const totalH = HEADER_H + META_H + CURVE_H + 12 + rows * (CARD_H + GAP) + GAP + 48
  canvas.width = cw; canvas.height = totalH
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#1a2830'; ctx.fillRect(0, 0, cw, totalH)
  drawHeader(ctx, logoImg, cw, HEADER_H, 'Deck Builder — MTG')
  let cy = HEADER_H + 12
  const ci = getColorIdentity(deckCards)
  drawColorBar(ctx, PAD, cy, cw - PAD * 2, 4, ci); cy += 10
  ctx.fillStyle = '#f4f8f8'; ctx.font = 'bold 20px Arial'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'
  ctx.fillText(deckName || 'Untitled Deck', PAD, cy + 20)
  const fmtLabel = (FORMATS[deckFmt] || { lbl: deckFmt }).lbl
  ctx.font = 'bold 10px Arial'
  const bw = ctx.measureText(fmtLabel).width + 14
  roundRect(ctx, cw - PAD - bw, cy + 8, bw, 18, 3); ctx.fillStyle = BGP.TEAL; ctx.fill()
  ctx.fillStyle = BGP.WHITE; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(fmtLabel, cw - PAD - bw / 2, cy + 17)
  const total = deckCards.reduce((s, e) => s + e.qty, 0)
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '12px Arial'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'
  ctx.fillText(total + ' cards', PAD, cy + 42)
  ci.forEach((c, i) => drawManaSymbol(ctx, c, PAD + 66 + i * 20, cy + 36, 7))
  cy += META_H
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '10px Arial'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'
  ctx.fillText('MANA CURVE', PAD, cy + 10)
  drawCurve(ctx, PAD, cy + 14, cw - PAD * 2, CURVE_H - 14, deckCards)
  cy += CURVE_H + 12
  const imagePromises = slots.map(slot => new Promise(resolve => {
    const url = slot.card.image_uris?.normal || slot.card.card_faces?.[0]?.image_uris?.normal || ''
    if (!url) { resolve(null); return }
    const img = new Image(); img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img); img.onerror = () => resolve(null); img.src = url
  }))
  Promise.all(imagePromises).then(images => {
    images.forEach((img, idx) => {
      const col = idx % COLS, row = Math.floor(idx / COLS)
      const x = PAD + col * (CARD_W + GAP), y = cy + row * (CARD_H + GAP)
      if (img) {
        ctx.save(); roundRect(ctx, x, y, CARD_W, CARD_H, 4); ctx.clip()
        ctx.drawImage(img, x, y, CARD_W, CARD_H); ctx.restore()
        if (slots[idx].qty > 1) {
          roundRect(ctx, x + 3, y + CARD_H - 20, 22, 16, 3)
          ctx.fillStyle = 'rgba(0,20,30,0.85)'; ctx.fill()
          ctx.fillStyle = BGP.GOLD; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillText(slots[idx].qty + '×', x + 14, y + CARD_H - 12)
        }
      } else {
        roundRect(ctx, x, y, CARD_W, CARD_H, 4); ctx.fillStyle = '#1e3540'; ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '11px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(slots[idx].card.name.slice(0, 12), x + CARD_W / 2, y + CARD_H / 2)
      }
    })
    drawFooter(ctx, cw, totalH - 48, 48)
  })
}
