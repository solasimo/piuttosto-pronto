import { useState, useEffect } from 'react'
import { t, getLingua, onLinguaChange } from './i18n'

// Hook che forza re-render al cambio lingua
export function useT() {
  const [, forceUpdate] = useState(0)
  useEffect(() => {
    return onLinguaChange(() => forceUpdate(n => n + 1))
  }, [])
  return t
}
