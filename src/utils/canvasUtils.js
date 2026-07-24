import { BGP, TYPE_ORDER } from './constants'
import { groupByType, cardType, parseCardListString } from './deckUtils'
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

export function buildCardSlots(deckCards) {
  const slots = []
  const g = groupByType(deckCards)
  TYPE_ORDER.forEach(type => {
    g[type].forEach(({ card, qty }) => {
      const show = Math.min(qty, 4)
      for (let i = 0; i < show; i++) slots.push({ card, qty })
    })
  })
  return slots
}

export function loadCardImages(slots) {
  return Promise.all(slots.map(slot => new Promise(resolve => {
    const url = slot.card.image_uris?.normal || slot.card.card_faces?.[0]?.image_uris?.normal || ''
    if (!url) { resolve(null); return }
    const img = new Image(); img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img); img.onerror = () => resolve(null); img.src = url
  })))
}

export function drawCardGrid(ctx, slots, images, x, y, gridW, cols, gap) {
  const cardW = Math.floor((gridW - (cols - 1) * gap) / cols)
  const cardH = Math.round(cardW * 1.4)
  images.forEach((img, idx) => {
    const col = idx % cols, row = Math.floor(idx / cols)
    const cx = x + col * (cardW + gap), cy = y + row * (cardH + gap)
    if (img) {
      ctx.save(); roundRect(ctx, cx, cy, cardW, cardH, 4); ctx.clip()
      ctx.drawImage(img, cx, cy, cardW, cardH); ctx.restore()
      if (slots[idx].qty > 1) {
        roundRect(ctx, cx + 3, cy + cardH - 20, 22, 16, 3)
        ctx.fillStyle = 'rgba(0,20,30,0.85)'; ctx.fill()
        ctx.fillStyle = BGP.GOLD; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(slots[idx].qty + '×', cx + 14, cy + cardH - 12)
      }
    } else {
      roundRect(ctx, cx, cy, cardW, cardH, 4); ctx.fillStyle = '#1e3540'; ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '11px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(slots[idx].card.name.slice(0, 12), cx + cardW / 2, cy + cardH / 2)
    }
  })
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
  const cw = 800, PAD = 28, COLS = 5, GAP = 6
  const CARD_W = Math.floor((cw - PAD * 2 - (COLS - 1) * GAP) / COLS)
  const CARD_H = Math.round(CARD_W * 1.4)
  const slots = buildCardSlots(deckCards)
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
  loadCardImages(slots).then(images => {
    drawCardGrid(ctx, slots, images, PAD, cy, cw - PAD * 2, COLS, GAP)
    drawFooter(ctx, cw, totalH - 48, 48)
  })
}

export function renderResultsCard(canvas, logoImg, submission, entries, placementLabel, FORMATS) {
  const cw = 800, PAD = 28, COLS = 5, GAP = 6
  const CARD_W = Math.floor((cw - PAD * 2 - (COLS - 1) * GAP) / COLS)
  const CARD_H = Math.round(CARD_W * 1.4)
  const hasEntries = entries.length > 0
  const slots = hasEntries ? buildCardSlots(entries) : []
  const rows = Math.ceil(slots.length / COLS)
  const gridH = hasEntries ? rows * (CARD_H + GAP) - GAP : 0

  const HEADER_H = 80, BANNER_H = 70, META_H = 64, CURVE_H = hasEntries ? 76 : 0, FOOTER_H = 48
  const fallbackLines = hasEntries ? [] : parseCardListString(submission.card_list).map(p => `${p.qty}x ${p.name}`)
  const LIST_COLS = 3
  const listRows = Math.ceil(fallbackLines.length / LIST_COLS)
  const LIST_H = hasEntries ? 0 : Math.max(40, listRows * 16 + 20)

  const totalH = HEADER_H + BANNER_H + META_H + CURVE_H + 12 + gridH + LIST_H + 20 + FOOTER_H
  canvas.width = cw; canvas.height = totalH
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#1a2830'; ctx.fillRect(0, 0, cw, totalH)

  drawHeader(ctx, logoImg, cw, HEADER_H, 'Tournament Results — MTG')

  let cy = HEADER_H
  ctx.fillStyle = BGP.GOLD; ctx.fillRect(0, cy, cw, BANNER_H)
  ctx.fillStyle = BGP.NAVY; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'
  ctx.font = 'bold 30px Arial'
  ctx.fillText(placementLabel.toUpperCase(), cw / 2, cy + 38)
  ctx.font = '12px Arial'
  const evDate = submission.event_date ? new Date(submission.event_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
  ctx.fillText(`${submission.event_name || 'Event'}${evDate ? ' · ' + evDate : ''}`, cw / 2, cy + 58)
  cy += BANNER_H

  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = BGP.WHITE; ctx.font = 'bold 20px Arial'
  ctx.fillText(submission.player_name || 'Player', PAD, cy + 26)
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = '13px Arial'
  const subLine = `${submission.deck_name || 'Untitled deck'}${submission.archetype && submission.archetype !== 'Unknown' ? ' · ' + submission.archetype : ''}`
  ctx.fillText(subLine, PAD, cy + 46)
  const fmtLabel = (FORMATS[submission.format] || { lbl: submission.format }).lbl
  ctx.font = 'bold 10px Arial'
  const bw = ctx.measureText(fmtLabel).width + 14
  roundRect(ctx, cw - PAD - bw, cy + 6, bw, 18, 3); ctx.fillStyle = BGP.TEAL; ctx.fill()
  ctx.fillStyle = BGP.WHITE; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(fmtLabel, cw - PAD - bw / 2, cy + 15)
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '11px Arial'; ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic'
  ctx.fillText(`${submission.main_count || 0} cards`, cw - PAD, cy + 46)
  cy += META_H

  if (hasEntries) {
    const ci = getColorIdentity(entries)
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '10px Arial'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'
    ctx.fillText('MANA CURVE', PAD, cy + 10)
    ci.forEach((c, i) => drawManaSymbol(ctx, c, cw - PAD - 10 - i * 20, cy + 6, 7))
    drawCurve(ctx, PAD, cy + 14, cw - PAD * 2, CURVE_H - 14, entries)
    cy += CURVE_H + 12
  } else {
    cy += 12
  }

  const finish = (images) => {
    if (hasEntries) {
      drawCardGrid(ctx, slots, images, PAD, cy, cw - PAD * 2, COLS, GAP)
      cy += gridH
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '10px Arial'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'
      ctx.fillText('DECKLIST', PAD, cy + 10)
      cy += 16
      const colW = (cw - PAD * 2) / LIST_COLS
      ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.font = '11px Arial'
      fallbackLines.forEach((line, i) => {
        const col = i % LIST_COLS, row = Math.floor(i / LIST_COLS)
        ctx.fillText(line, PAD + col * colW, cy + row * 16 + 10)
      })
      cy += LIST_H
    }
    cy += 20
    drawFooter(ctx, cw, totalH - FOOTER_H, FOOTER_H)
  }

  if (hasEntries) loadCardImages(slots).then(finish)
  else finish([])
}
