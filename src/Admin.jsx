import { useState, useEffect } from 'react'
import { supabase } from './supabase'

function nanoid(len = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export default function Admin({ onClose }) {
  const [tab, setTab] = useState('utenti')
  const [utenti, setUtenti] = useState([])
  const [inviti, setInviti] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => { carica() }, [])

  const carica = async () => {
    setLoading(true)
    const [{ data: p }, { data: i }] = await Promise.all([
      supabase.from('profili').select('*').order('created_at', { ascending: false }),
      supabase.from('inviti').select('*').order('created_at', { ascending: false }),
    ])
    setUtenti(p || [])
    setInviti(i || [])
    setLoading(false)
  }

  const creaInvito = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const codice = nanoid(8)
    const scade = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    await supabase.from('inviti').insert({ codice, creato_da: user.id, scade_at: scade })
    showToast(`✓ Invito creato: ${codice}`)
    carica()
  }

  const revocaInvito = async (id) => {
    await supabase.from('inviti').delete().eq('id', id)
    showToast('Invito revocato')
    carica()
  }

  const toggleAttivo = async (utente) => {
    await supabase.from('profili').update({ is_active: !utente.is_active }).eq('id', utente.id)
    showToast(utente.is_active ? 'Utente disattivato' : 'Utente riattivato')
    carica()
  }

  const eliminaUtente = async (utente) => {
    if (!confirm(`Eliminare ${utente.email}? I suoi dati verranno mantenuti.`)) return
    await supabase.from('profili').delete().eq('id', utente.id)
    showToast('Utente eliminato')
    carica()
  }

  const fmtData = d => d ? new Date(d).toLocaleDateString('it-IT', { day:'numeric', month:'short', year:'numeric' }) : '—'
  const isScaduto = d => d && new Date(d) < new Date()

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: '#F4F1EC', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: '#1C1410', padding: '14px 16px', paddingTop: 'calc(14px + env(safe-area-inset-top, 0px))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ fontFamily: 'Playfair Display, serif', color: '#F5EFE0', fontSize: 17, fontWeight: 600 }}>Dashboard Admin</div>
          <div style={{ color: 'rgba(245,239,224,0.5)', fontSize: 12 }}>Piuttosto Pronto</div>
        </div>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.15)', color: '#F5EFE0', fontSize: 16, cursor: 'pointer' }}>✕</button>
      </div>

      {/* Tab */}
      <div style={{ display: 'flex', background: '#fff', borderBottom: '1px solid #E2DDD6', flexShrink: 0 }}>
        {[['utenti','👥 Utenti'],['inviti','✉️ Inviti']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            style={{ flex: 1, padding: '12px 0', border: 'none', borderBottom: tab === k ? '2px solid #7B1E2E' : '2px solid transparent', background: 'none', fontSize: 13, fontWeight: 600, color: tab === k ? '#7B1E2E' : '#7A6E65', cursor: 'pointer' }}>{l}</button>
        ))}
      </div>

      {/* Contenuto */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, WebkitOverflowScrolling: 'touch' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#B0A89E' }}>Caricamento…</div>
        ) : tab === 'utenti' ? (
          <>
            <div style={{ fontSize: 12, color: '#7A6E65', marginBottom: 12 }}>{utenti.length} utenti registrati</div>
            {utenti.map(u => (
              <div key={u.id} style={{ background: '#fff', border: '1px solid #E2DDD6', borderRadius: 12, padding: 14, marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#1C1410' }}>{u.email}</span>
                      {u.is_admin && <span style={{ fontSize: 10, background: '#F5EFE0', color: '#854F0B', padding: '1px 6px', borderRadius: 100, fontWeight: 700 }}>ADMIN</span>}
                      {!u.is_active && <span style={{ fontSize: 10, background: '#FFF0F0', color: '#9B2335', padding: '1px 6px', borderRadius: 100, fontWeight: 700 }}>SOSPESO</span>}
                    </div>
                    <div style={{ fontSize: 12, color: '#B0A89E' }}>Iscritto: {fmtData(u.created_at)}</div>
                    {u.last_seen && <div style={{ fontSize: 12, color: '#B0A89E' }}>Ultimo accesso: {fmtData(u.last_seen)}</div>}
                  </div>
                  {!u.is_admin && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <button onClick={() => toggleAttivo(u)}
                        style={{ fontSize: 11, padding: '5px 10px', borderRadius: 8, border: '1px solid #E2DDD6', background: '#fff', color: '#7A6E65', cursor: 'pointer' }}>
                        {u.is_active ? 'Sospendi' : 'Riattiva'}
                      </button>
                      <button onClick={() => eliminaUtente(u)}
                        style={{ fontSize: 11, padding: '5px 10px', borderRadius: 8, border: '1px solid #FAECE7', background: '#FAECE7', color: '#993C1D', cursor: 'pointer' }}>
                        Elimina
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            <button onClick={creaInvito}
              style={{ width: '100%', padding: 13, background: '#1C1410', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 16 }}>
              + Genera nuovo invito
            </button>
            <div style={{ fontSize: 12, color: '#7A6E65', marginBottom: 12 }}>{inviti.length} inviti totali</div>
            {inviti.map(inv => {
              const usato = !!inv.usato_da
              const scaduto = isScaduto(inv.scade_at) && !usato
              return (
                <div key={inv.id} style={{ background: '#fff', border: '1px solid #E2DDD6', borderRadius: 12, padding: 14, marginBottom: 10, opacity: usato || scaduto ? 0.6 : 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: 2, color: '#1C1410', fontFamily: 'monospace' }}>{inv.codice}</span>
                        {usato && <span style={{ fontSize: 10, background: '#F0F7F3', color: '#2D6A4F', padding: '1px 6px', borderRadius: 100, fontWeight: 700 }}>USATO</span>}
                        {scaduto && <span style={{ fontSize: 10, background: '#FFF0F0', color: '#9B2335', padding: '1px 6px', borderRadius: 100, fontWeight: 700 }}>SCADUTO</span>}
                        {!usato && !scaduto && <span style={{ fontSize: 10, background: '#F5EFE0', color: '#854F0B', padding: '1px 6px', borderRadius: 100, fontWeight: 700 }}>ATTIVO</span>}
                      </div>
                      <div style={{ fontSize: 12, color: '#B0A89E' }}>Scade: {fmtData(inv.scade_at)}</div>
                      {usato && <div style={{ fontSize: 12, color: '#B0A89E' }}>Usato: {fmtData(inv.usato_at)}</div>}
                    </div>
                    {!usato && !scaduto && (
                      <button onClick={() => revocaInvito(inv.id)}
                        style={{ fontSize: 11, padding: '5px 10px', borderRadius: 8, border: '1px solid #FAECE7', background: '#FAECE7', color: '#993C1D', cursor: 'pointer' }}>
                        Revoca
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: '#1C1410', color: '#fff', padding: '10px 20px', borderRadius: 100, fontSize: 13, fontWeight: 500, zIndex: 600, whiteSpace: 'nowrap' }}>{toast}</div>
      )}
    </div>
  )
}
