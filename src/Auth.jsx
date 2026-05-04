import { useState } from 'react'
import { supabase } from './supabase'

const S = {
  inp: { width:'100%', padding:'13px 16px', border:'1.5px solid #1e1a16', borderRadius:12, fontSize:15, background:'#1a1611', color:'#F5EFE0', WebkitAppearance:'none', boxSizing:'border-box' },
  btn: { width:'100%', padding:14, background:'#C8992A', color:'#0f0b08', border:'none', borderRadius:12, fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'DM Sans, sans-serif' },
  lbl: { display:'block', fontSize:12, fontWeight:500, color:'#8B7355', marginBottom:6 },
  err: { background:'#2a0a0a', border:'1px solid #9B233544', borderRadius:10, padding:'10px 14px', fontSize:13, color:'#C0393B', marginBottom:16 },
  ok:  { background:'#0a1a0a', border:'1px solid #2D6A4F44', borderRadius:10, padding:'10px 14px', fontSize:13, color:'#2D6A4F', marginBottom:16 },
}

export default function Auth() {
  const [modo, setModo] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [codiceInvito, setCodiceInvito] = useState('')
  const [nome, setNome] = useState('')
  const [cognome, setCognome] = useState('')
  const [loading, setLoading] = useState(false)
  const [errore, setErrore] = useState('')
  const [messaggio, setMessaggio] = useState('')

  const reset = () => { setErrore(''); setMessaggio('') }

  const handleLogin = async () => {
    if (!email || !password) { setErrore('Inserisci email e password'); return }
    setLoading(true); reset()
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) setErrore(error.message === 'Invalid login credentials' ? 'Email o password non corretti' : error.message)
    setLoading(false)
  }

  const handleRegister = async () => {
    if (!email || !password || !codiceInvito) { setErrore('Compila tutti i campi'); return }
    if (!nome.trim() || !cognome.trim()) { setErrore('Inserisci nome e cognome'); return }
    if (password.length < 8) { setErrore('La password deve essere di almeno 8 caratteri'); return }
    setLoading(true); reset()
    try {
      const verificaRes = await fetch('/api/verifica-invito', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ codice: codiceInvito.trim() })
      })
      const verificaData = await verificaRes.json()
      if (!verificaRes.ok) { setErrore(verificaData.error || 'Codice invito non valido'); setLoading(false); return }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(), password,
        options: { emailRedirectTo: 'https://piuttosto-pronto.vercel.app' }
      })
      if (error) { setErrore(error.message); setLoading(false); return }
      if (!data.user) { setErrore('Errore durante la registrazione'); setLoading(false); return }

      await fetch('/api/verifica-invito', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ codice: codiceInvito.trim(), user_id: data.user.id, email: email.trim(), nome: nome.trim(), cognome: cognome.trim() })
      })

      setMessaggio("Registrazione completata! Controlla la tua email per confermare l'account.")
      setModo('login')
    } catch(e) { setErrore('Errore: ' + e.message) }
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
    <div style={{ minHeight:'100dvh', background:'#0f0b08', display:'flex', flexDirection:'column', justifyContent:'center', padding:'24px 24px 48px' }}>
      {/* Logo */}
      <div style={{ textAlign:'center', marginBottom:44 }}>
        <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:52, color:'#C8992A', marginBottom:12, fontStyle:'italic', lineHeight:1 }}>🍷</div>
        <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:30, fontWeight:300, color:'#F5EFE0', fontStyle:'italic' }}>Piuttosto Pronto</div>
        <div style={{ fontSize:11, color:'#5a4f3f', letterSpacing:3, textTransform:'uppercase', marginTop:6 }}>Club privato</div>
      </div>

      {/* Card */}
      <div style={{ background:'#141009', borderRadius:20, padding:24, border:'1px solid #1e1a16' }}>
        {/* Toggle */}
        <div style={{ display:'flex', marginBottom:24, background:'#1a1611', borderRadius:10, padding:3 }}>
          {[['login','Accedi'],['register','Registrati']].map(([m,l])=>(
            <button key={m} onClick={()=>{setModo(m);reset()}}
              style={{ flex:1, padding:'9px 0', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', background:modo===m?'#2a2318':'transparent', color:modo===m?'#F5EFE0':'#5a4f3f', transition:'all 0.15s' }}>{l}</button>
          ))}
        </div>

        {errore && <div style={S.err}>{errore}</div>}
        {messaggio && <div style={S.ok}>{messaggio}</div>}

        {modo==='login' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div><span style={S.lbl}>Email</span><input style={S.inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tua@email.com" autoComplete="email" /></div>
            <div><span style={S.lbl}>Password</span><input style={S.inp} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" onKeyDown={e=>e.key==='Enter'&&handleLogin()} /></div>
            <button onClick={handleLogin} disabled={loading} style={{ ...S.btn, opacity:loading?0.7:1 }}>{loading?'Accesso…':'Accedi'}</button>
            <button onClick={()=>{setModo('reset');reset()}} style={{ background:'none', border:'none', fontSize:13, color:'#5a4f3f', cursor:'pointer', textDecoration:'underline' }}>Password dimenticata?</button>
          </div>
        )}

        {modo==='register' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div><span style={S.lbl}>Codice invito</span><input style={{ ...S.inp, textTransform:'uppercase', letterSpacing:2, fontFamily:'monospace' }} value={codiceInvito} onChange={e=>setCodiceInvito(e.target.value)} placeholder="XXXXXXXX" /></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div><span style={S.lbl}>Nome</span><input style={S.inp} value={nome} onChange={e=>setNome(e.target.value)} placeholder="Mario" /></div>
              <div><span style={S.lbl}>Cognome</span><input style={S.inp} value={cognome} onChange={e=>setCognome(e.target.value)} placeholder="Rossi" /></div>
            </div>
            <div><span style={S.lbl}>Email</span><input style={S.inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tua@email.com" autoComplete="email" /></div>
            <div>
              <span style={S.lbl}>Password</span>
              <input style={S.inp} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Min. 8 caratteri" autoComplete="new-password" />
              <div style={{ fontSize:11, color:'#5a4f3f', marginTop:4 }}>Minimo 8 caratteri</div>
            </div>
            <button onClick={handleRegister} disabled={loading} style={{ ...S.btn, opacity:loading?0.7:1 }}>{loading?'Registrazione…':'Crea account'}</button>
          </div>
        )}

        {modo==='reset' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ fontSize:13, color:'#8B7355', marginBottom:4, lineHeight:1.5 }}>Inserisci la tua email e ti mandiamo un link per reimpostare la password.</div>
            <div><span style={S.lbl}>Email</span><input style={S.inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tua@email.com" /></div>
            <button onClick={handleReset} disabled={loading} style={{ ...S.btn, opacity:loading?0.7:1 }}>{loading?'Invio…':'Invia link reset'}</button>
            <button onClick={()=>{setModo('login');reset()}} style={{ background:'none', border:'none', fontSize:13, color:'#5a4f3f', cursor:'pointer', textDecoration:'underline' }}>Torna al login</button>
          </div>
        )}
      </div>
    </div>
  )
}
