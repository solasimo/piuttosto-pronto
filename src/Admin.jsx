import { useState, useEffect } from 'react'
import { supabase } from './supabase'

async function adminCall(action, payload = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch('/api/admin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ action, payload }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return data
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
    try {
      const [{ data: u }, { data: i }] = await Promise.all([
        adminCall('get_utenti'),
        adminCall('get_inviti'),
      ])
      setUtenti(u || []); setInviti(i || [])
    } catch(e) { showToast('Errore: ' + e.message) }
    setLoading(false)
  }

  const creaInvito = async () => {
    try {
      await adminCall('crea_invito')
      showToast('✓ Invito creato')
      carica()
    } catch(e) { showToast('Errore: ' + e.message) }
  }

  const revocaInvito = async (id) => {
    try {
      await adminCall('revoca_invito', { id })
      showToast('Invito revocato'); carica()
    } catch(e) { showToast('Errore: ' + e.message) }
  }

  const toggleAttivo = async (utente) => {
    try {
      await adminCall('toggle_attivo', { id: utente.id, is_active: !utente.is_active })
      showToast(utente.is_active ? 'Utente sospeso' : 'Utente riattivato'); carica()
    } catch(e) { showToast('Errore: ' + e.message) }
  }

  const eliminaUtente = async (utente) => {
    if (!confirm(`Eliminare ${utente.email}?`)) return
    try {
      await adminCall('elimina_utente', { id: utente.id })
      showToast('Utente eliminato'); carica()
    } catch(e) { showToast('Errore: ' + e.message) }
  }

  const fmtData = d => d ? new Date(d).toLocaleDateString('it-IT', { day:'numeric', month:'short', year:'numeric' }) : '—'
  const isScaduto = d => d && new Date(d) < new Date()

  return (
    <div style={{ position:'fixed', inset:0, zIndex:500, background:'#F4F1EC', display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <div style={{ background:'#1C1410', padding:'14px 16px', paddingTop:'calc(14px + env(safe-area-inset-top, 0px))', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <div>
          <div style={{ fontFamily:'Playfair Display, serif', color:'#F5EFE0', fontSize:17, fontWeight:600 }}>Dashboard Admin</div>
          <div style={{ color:'rgba(245,239,224,0.5)', fontSize:12 }}>Piuttosto Pronto</div>
        </div>
        <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', border:'none', background:'rgba(255,255,255,0.15)', color:'#F5EFE0', fontSize:16, cursor:'pointer' }}>✕</button>
      </div>

      {/* Tab */}
      <div style={{ display:'flex', background:'#fff', borderBottom:'1px solid #E2DDD6', flexShrink:0 }}>
        {[['utenti','👥 Utenti'],['inviti','✉️ Inviti']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            style={{ flex:1, padding:'12px 0', border:'none', borderBottom:tab===k?'2px solid #7B1E2E':'2px solid transparent', background:'none', fontSize:13, fontWeight:600, color:tab===k?'#7B1E2E':'#7A6E65', cursor:'pointer' }}>{l}</button>
        ))}
      </div>

      {/* Contenuto */}
      <div style={{ flex:1, overflowY:'auto', padding:16, WebkitOverflowScrolling:'touch' }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:40, color:'#B0A89E' }}>Caricamento…</div>
        ) : tab === 'utenti' ? (
          <>
            <div style={{ fontSize:12, color:'#7A6E65', marginBottom:12 }}>{utenti.length} utenti registrati</div>
            {utenti.map(u => (
              <div key={u.id} style={{ background:'#fff', border:'1px solid #E2DDD6', borderRadius:12, padding:14, marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#1C1410' }}>{u.nome} {u.cognome}</span>
                      <span style={{ fontSize: 12, color: '#7A6E65' }}>{u.email}</span>
                      {u.is_admin && <span style={{ fontSize:10, background:'#F5EFE0', color:'#854F0B', padding:'1px 6px', borderRadius:100, fontWeight:700 }}>ADMIN</span>}
                      {!u.is_active && <span style={{ fontSize:10, background:'#FFF0F0', color:'#9B2335', padding:'1px 6px', borderRadius:100, fontWeight:700 }}>SOSPESO</span>}
                    </div>
                    <div style={{ fontSize:12, color:'#B0A89E' }}>Iscritto: {fmtData(u.created_at)}</div>
                    {u.last_seen && <div style={{ fontSize:12, color:'#B0A89E' }}>Ultimo accesso: {fmtData(u.last_seen)}</div>}
                  </div>
                  {!u.is_admin && (
                    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                      <button onClick={() => toggleAttivo(u)}
                        style={{ fontSize:11, padding:'5px 10px', borderRadius:8, border:'1px solid #E2DDD6', background:'#fff', color:'#7A6E65', cursor:'pointer' }}>
                        {u.is_active ? 'Sospendi' : 'Riattiva'}
                      </button>
                      <button onClick={() => eliminaUtente(u)}
                        style={{ fontSize:11, padding:'5px 10px', borderRadius:8, border:'1px solid #FAECE7', background:'#FAECE7', color:'#993C1D', cursor:'pointer' }}>
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
              style={{ width:'100%', padding:13, background:'#1C1410', color:'#fff', border:'none', borderRadius:12, fontSize:14, fontWeight:600, cursor:'pointer', marginBottom:16 }}>
              + Genera nuovo invito
            </button>
            <div style={{ fontSize:12, color:'#7A6E65', marginBottom:12 }}>{inviti.length} inviti totali</div>
            {inviti.map(inv => {
              const usato = !!inv.usato_da
              const scaduto = isScaduto(inv.scade_at) && !usato
              return (
                <div key={inv.id} style={{ background:'#fff', border:'1px solid #E2DDD6', borderRadius:12, padding:14, marginBottom:10, opacity:usato||scaduto?0.6:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                        <span style={{ fontSize:16, fontWeight:700, letterSpacing:2, color:'#1C1410', fontFamily:'monospace' }}>{inv.codice}</span>
                        {usato && <span style={{ fontSize:10, background:'#F0F7F3', color:'#2D6A4F', padding:'1px 6px', borderRadius:100, fontWeight:700 }}>USATO</span>}
                        {scaduto && <span style={{ fontSize:10, background:'#FFF0F0', color:'#9B2335', padding:'1px 6px', borderRadius:100, fontWeight:700 }}>SCADUTO</span>}
                        {!usato && !scaduto && <span style={{ fontSize:10, background:'#F5EFE0', color:'#854F0B', padding:'1px 6px', borderRadius:100, fontWeight:700 }}>ATTIVO</span>}
                      </div>
                      <div style={{ fontSize:12, color:'#B0A89E' }}>Scade: {fmtData(inv.scade_at)}</div>
                      {usato && <div style={{ fontSize:12, color:'#B0A89E' }}>Usato: {fmtData(inv.usato_at)}</div>}
                    </div>
                    {!usato && !scaduto && (
                      <button onClick={() => revocaInvito(inv.id)}
                        style={{ fontSize:11, padding:'5px 10px', borderRadius:8, border:'1px solid #FAECE7', background:'#FAECE7', color:'#993C1D', cursor:'pointer' }}>
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

      {toast && (
        <div style={{ position:'fixed', bottom:80, left:'50%', transform:'translateX(-50%)', background:'#1C1410', color:'#fff', padding:'10px 20px', borderRadius:100, fontSize:13, fontWeight:500, zIndex:600, whiteSpace:'nowrap' }}>{toast}</div>
      )}
    </div>
  )
}
