export const FORMATS = {
  standard:  { max: 4, min: 60, sb: 15, lbl: 'Standard' },
  modern:    { max: 4, min: 60, sb: 15, lbl: 'Modern' },
  legacy:    { max: 4, min: 60, sb: 15, lbl: 'Legacy' },
  vintage:   { max: 4, min: 60, sb: 15, lbl: 'Vintage' },
  commander: { max: 1, min: 100, sb: 0, lbl: 'Commander' },
  pioneer:   { max: 4, min: 60, sb: 15, lbl: 'Pioneer' },
  pauper:    { max: 4, min: 60, sb: 15, lbl: 'Pauper' },
}

export const TYPE_ORDER = [
  'Creature', 'Planeswalker', 'Instant', 'Sorcery',
  'Enchantment', 'Artifact', 'Battle', 'Land', 'Other',
]

export const ARCHETYPES = [
  ['Burn',       ['lightning bolt', 'eidolon of the great revel', 'monastery swiftspear', 'searing blaze']],
  ['Control',    ['counterspell', 'wrath of god', 'teferi', 'snapcaster', 'force of will']],
  ['Aggro',      ['goblin guide', 'bloodghast', 'ragavan', 'steel overseer']],
  ['Combo',      ['splinter twin', 'through the breach', 'grapeshot', 'lotus field']],
  ['Midrange',   ['tarmogoyf', 'dark confidant', 'liliana of the veil', 'wrenn and six']],
  ['Tokens',     ['spectral procession', 'lingering souls', 'raise the alarm']],
  ['Reanimator', ['animate dead', 'reanimate', 'entomb', 'exhume']],
  ['Delver',     ['delver of secrets', 'daze', 'ponder', 'brainstorm']],
  ['Ramp',       ['cultivate', "kodama's reach", 'primeval titan', 'elvish mystic']],
]

export const BGP = {
  NAVY:    '#002838',
  TEAL:    '#005068',
  TEAL_LT: '#006e8a',
  TEAL_DIM:'#003d52',
  GOLD:    '#f8c840',
  BG:      '#d4d8d8',
  BG_LT:   '#e2e6e6',
  BG_DK:   '#c4c8c8',
  WHITE:   '#f4f8f8',
  TEXT:    '#001820',
  TEXT2:   '#2a4a58',
  TEXT3:   '#4a7080',
}

export const SUBMISSION_STATUS = {
  registered: { label: 'Registered', bg: 'rgba(0,80,104,.12)', fg: 'var(--bgp-teal)', topping: false },
  checkedin:  { label: 'Checked in', bg: '#d1fae5', fg: '#065f46', topping: false },
  top8:       { label: 'Top 8',      bg: '#fef3c7', fg: '#92400e', topping: true, emoji: '▲' },
  top4:       { label: 'Top 4',      bg: '#fed7aa', fg: '#9a3412', topping: true, emoji: '◆' },
  finalist:   { label: 'Finalist',   bg: '#e0e7ff', fg: '#3730a3', topping: true, emoji: '🥈' },
  winner:     { label: 'Winner',     bg: '#fef9c3', fg: '#713f12', topping: true, emoji: '🏆' },
}

export const LS_KEYS = {
  WEBHOOK: 'bgp_webhook_v1',
}
