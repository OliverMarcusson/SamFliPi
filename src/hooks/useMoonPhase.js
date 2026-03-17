import { useMemo } from 'react'
import { getMoonPhase } from '../utils/moonPhase.js'

export function useMoonPhase(date = new Date()) {
  return useMemo(() => getMoonPhase(date), [date.toDateString()])
}
