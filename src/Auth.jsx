import { useState } from 'react'
import { supabase } from './supabase'

const S = {
  inp: { width: '100%', padding: '13px 16px', border: '1.5px solid #E2DDD6', borderRadius: 12, fontSize: 15, background: '#fff', color: '#1C1410', WebkitAppearance: 'none', boxSizing: 'border-box' },
  btn: { width: '100%', padding: 14, background: '#7B1E2E', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  lbl: { display: 'block', fontSize: 12, fontWeight: 500, color: '#7A6E65', marginBottom: 6 },
  err: { background: '#FFF0F0', border: '1px solid #F6A6A6', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#9B2335', marginBottom: 16 },
  ok:  { background: '#F0F7F3', border: '1px solid #2D6A4F44', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#2D6A4F', marginBottom: 16 },
}

export default function Auth() {
  const [modo, setModo] = useState('login') // login | register | reset
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [codiceInvito, setCodiceInvito] = useState('')
  const [loading, setLoading] = useState(false)
  const [errore, setErrore] = useState('')
  const [messaggio, setMessaggio] = useState('')

  const reset = () => { setErrore(''); setMessaggio('') }

  const handleLogin = async () => {
    if (!email || !password) { setErrore('Inserisci email e password'); return }
    setLoading(true); reset()
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) {
      setErrore(error.message === 'Invalid login credentials' ? 'Email o password non corretti' : error.message)
    }
    setLoading(false)
  }

  const handleRegister = async () => {
    if (!email || !password || !codiceInvito) { setErrore('Compila tutti i campi'); return }
    if (password.length < 8) { setErrore('La password deve essere di almeno 8 caratteri'); return }
    setLoading(true); reset()
    try {
      // Verifica invito
const marcaRes = await fetch('/api/verifica-invito', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ codice: codiceInvito.trim(), user_id: data.user.id })
})
const marcaData = await marcaRes.json()
console.log('Marca invito:', JSON.stringify(marcaData))
const verificaData = await verificaRes.json()
if (!verificaRes.ok) { setErrore(verificaData.error || 'Codice invito non valido'); setLoading(false); return }
const invito = verificaData

      // Registra utente
const { data, error } = await supabase.auth.signUp({
  email: email.trim(), password,
  options: { emailRedirectTo: 'https://piuttosto-pronto.vercel.app' }
})
if (error) { setErrore(error.message); setLoading(false); return }
if (!data.user) { setErrore('Errore durante la registrazione'); setLoading(false); return }
console.log('User dopo signUp:', data.user.id)
      
      // Aggiorna invito come usato
      await fetch('/api/verifica-invito', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ codice: codiceInvito.trim(), user_id: data.user.id })
})

      // Crea profilo
      await supabase.from('profili').insert({ id: data.user.id, email: email.trim() })

      setMessaggio('Registrazione completata! Controlla la tua email per confermare l\'account.')
      setModo('login')
    } catch(e) { setErrore('Errore: ' + e.message); console.error('ERRORE REGISTRAZIONE:', e) }
    setLoading(false)
  }

  const handleReset = async () => {
    if (!email) { setErrore('Inserisci la tua email'); return }
    setLoading(true); reset()
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: 'https://piuttosto-pronto.vercel.app'
    })
    if (error) setErrore(error.message)
    else setMessaggio('Email di reset inviata! Controlla la tua casella.')
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#F4F1EC', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px 24px 48px' }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🍷</div>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 600, color: '#1C1410' }}>Piuttosto Pronto</div>
        <div style={{ fontSize: 13, color: '#7A6E65', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 4 }}>La mia cantina</div>
      </div>

      {/* Card */}
      <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #E2DDD6' }}>
        {/* Toggle */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 24, background: '#F4F1EC', borderRadius: 10, padding: 3 }}>
          {[['login','Accedi'],['register','Registrati']].map(([m,l]) => (
            <button key={m} onClick={() => { setModo(m); reset() }}
              style={{ flex: 1, padding: '9px 0', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: modo === m ? '#fff' : 'transparent', color: modo === m ? '#1C1410' : '#7A6E65' }}>{l}</button>
          ))}
        </div>

        {errore && <div style={S.err}>{errore}</div>}
        {messaggio && <div style={S.ok}>{messaggio}</div>}

        {/* Login */}
        {modo === 'login' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><span style={S.lbl}>Email</span><input style={S.inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tua@email.com" autoComplete="email" /></div>
            <div><span style={S.lbl}>Password</span><input style={S.inp} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" onKeyDown={e=>e.key==='Enter'&&handleLogin()} /></div>
            <button onClick={handleLogin} disabled={loading} style={{ ...S.btn, opacity: loading ? 0.7 : 1 }}>{loading ? 'Accesso…' : 'Accedi'}</button>
            <button onClick={() => { setModo('reset'); reset() }} style={{ background: 'none', border: 'none', fontSize: 13, color: '#7A6E65', cursor: 'pointer', textDecoration: 'underline' }}>Password dimenticata?</button>
          </div>
        )}

        {/* Registrazione */}
        {modo === 'register' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><span style={S.lbl}>Codice invito</span><input style={{ ...S.inp, textTransform: 'uppercase', letterSpacing: 2 }} value={codiceInvito} onChange={e=>setCodiceInvito(e.target.value)} placeholder="XXXXXX" /></div>
            <div><span style={S.lbl}>Email</span><input style={S.inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tua@email.com" autoComplete="email" /></div>
            <div>
              <span style={S.lbl}>Password</span>
              <input style={S.inp} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Min. 8 caratteri" autoComplete="new-password" />
              <div style={{ fontSize: 11, color: '#B0A89E', marginTop: 4 }}>Minimo 8 caratteri, usa lettere e numeri</div>
            </div>
            <button onClick={handleRegister} disabled={loading} style={{ ...S.btn, opacity: loading ? 0.7 : 1 }}>{loading ? 'Registrazione…' : 'Crea account'}</button>
          </div>
        )}

        {/* Reset password */}
        {modo === 'reset' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 14, color: '#7A6E65', marginBottom: 4 }}>Inserisci la tua email e ti mandiamo un link per reimpostare la password.</div>
            <div><span style={S.lbl}>Email</span><input style={S.inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tua@email.com" /></div>
            <button onClick={handleReset} disabled={loading} style={{ ...S.btn, opacity: loading ? 0.7 : 1 }}>{loading ? 'Invio…' : 'Invia link reset'}</button>
            <button onClick={() => { setModo('login'); reset() }} style={{ background: 'none', border: 'none', fontSize: 13, color: '#7A6E65', cursor: 'pointer', textDecoration: 'underline' }}>Torna al login</button>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#B0A89E' }}>
        Piuttosto Pronto · Club privato
      </div>
    </div>
  )
}
