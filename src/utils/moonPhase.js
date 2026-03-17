// Synodic period math — no network, pure JS
const SYNODIC_MONTH = 29.53058867 // days

const PHASES = [
  { name: 'New Moon',        emoji: '🌑', min: 0,    max: 1.85  },
  { name: 'Waxing Crescent', emoji: '🌒', min: 1.85, max: 7.38  },
  { name: 'First Quarter',   emoji: '🌓', min: 7.38, max: 11.08 },
  { name: 'Waxing Gibbous',  emoji: '🌔', min: 11.08,max: 14.77 },
  { name: 'Full Moon',       emoji: '🌕', min: 14.77,max: 16.61 },
  { name: 'Waning Gibbous',  emoji: '🌖', min: 16.61,max: 22.15 },
  { name: 'Last Quarter',    emoji: '🌗', min: 22.15,max: 25.84 },
  { name: 'Waning Crescent', emoji: '🌘', min: 25.84,max: 29.53 },
]

// Known new moon reference: Jan 6 2000 18:14 UTC (J2000 era)
const KNOWN_NEW_MOON = new Date('2000-01-06T18:14:00Z')

export function getMoonPhase(date = new Date()) {
  const elapsed = (date - KNOWN_NEW_MOON) / 86400000 // days since reference
  const dayInCycle = ((elapsed % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH
  const illumination = Math.round(
    (1 - Math.cos((2 * Math.PI * dayInCycle) / SYNODIC_MONTH)) / 2 * 100
  )

  const phase = PHASES.find(p => dayInCycle >= p.min && dayInCycle < p.max) ?? PHASES[0]

  return {
    name: phase.name,
    emoji: phase.emoji,
    illumination,
    dayInCycle: Math.round(dayInCycle * 10) / 10,
  }
}
