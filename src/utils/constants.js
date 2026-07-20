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

export const LS_KEYS = {
  EVENTS:  'bgp_events_v1',
  SUBS:    'bgp_subs_v1',
  WEBHOOK: 'bgp_webhook_v1',
  AUTH:    'bgp_admin_auth_v1',
}

export const SEED_EVENTS = [
  { id: 'ev1', name: 'Friday Night Magic — Modern',  date: '2026-08-01', time: '18:00', format: 'modern',    location: 'BGP — Main store', notes: 'Entry $10. Top 8 prizing.' },
  { id: 'ev2', name: 'Commander Night',              date: '2026-08-03', time: '14:00', format: 'commander', location: 'BGP — Main store', notes: 'Casual pods, no entry fee.' },
  { id: 'ev3', name: 'Standard Showdown',            date: '2026-08-08', time: '17:00', format: 'standard',  location: 'BGP — Main store', notes: 'WPN promo packs.' },
]
