import { useState, useEffect } from 'react'
import { t, getLingua } from './i18n'

export function useT() {
  const [lingua, setLingua] = useState(getLingua())

  useEffect(() => {
    const handler = () => setLingua(getLingua())
    window.addEventListener('lingua-changed', handler)
    return () => window.removeEventListener('lingua-changed', handler)
  }, [])

  // Ritorna una funzione t che usa la lingua corrente
  return (key) => t(key, lingua)
}
