import { parsePips, getPipClass, getPipLabel } from '../../utils/manaUtils'

export default function ManaPips({ cost, size = 15 }) {
  const pips = parsePips(cost)
  if (!pips.length) return null
  return (
    <>
      {pips.map((sym, i) => (
        <span key={i} className={`pip ${getPipClass(sym)}`} style={{ width: size, height: size, fontSize: size * 0.53 }}>
          {getPipLabel(sym)}
        </span>
      ))}
    </>
  )
}
