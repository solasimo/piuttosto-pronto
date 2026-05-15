import { useState } from 'react'
import { supabase } from './supabase'
import { useT } from './useT'
import { setLingua, getLingua, LINGUE } from './i18n'

const S = {
  inp: { width:'100%', padding:'13px 16px', border:'1.5px solid #E0D8CC', borderRadius:12, fontSize:15, background:'#EAE2D6', color:'#2C1A0E', WebkitAppearance:'none', boxSizing:'border-box' },
  btn: { width:'100%', padding:14, background:'#C4614A', color:'#FBF7F0', border:'none', borderRadius:12, fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'DM Sans, sans-serif' },
  lbl: { display:'block', fontSize:12, fontWeight:500, color:'#B8956A', marginBottom:6 },
  err: { background:'#FDF0EE', border:'1px solid #C4614A44', borderRadius:10, padding:'10px 14px', fontSize:13, color:'#C0393B', marginBottom:16 },
  ok:  { background:'#F0F9F4', border:'1px solid #2D6A4F44', borderRadius:10, padding:'10px 14px', fontSize:13, color:'#2D6A4F', marginBottom:16 },
}

export default function Auth() {
  const T = useT()
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
    if (!email || !password) { setErrore(T('auth.compila_campi')); return }
    setLoading(true); reset()
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) setErrore(error.message === 'Invalid login credentials' ? T('auth.errore_credenziali') : error.message)
    setLoading(false)
  }

  const handleRegister = async () => {
    if (!email || !password || !codiceInvito) { setErrore(T('auth.compila_campi')); return }
    if (!nome.trim() || !cognome.trim()) { setErrore(T('auth.nome_cognome')); return }
    if (password.length < 8) { setErrore(T('auth.pwd_corta')); return }
    setLoading(true); reset()
    try {
      const verificaRes = await fetch('/api/verifica-invito', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ codice: codiceInvito.trim() })
      })
      const verificaData = await verificaRes.json()
      if (!verificaRes.ok) { setErrore(verificaData.error || T('auth.codice_non_valido')); setLoading(false); return }
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(), password,
        options: { emailRedirectTo: 'https://cabinet-sommelier.vercel.app' }
      })
      if (error) { setErrore(error.message); setLoading(false); return }
      if (!data.user) { setErrore(T('auth.errore_reg')); setLoading(false); return }
      await fetch('/api/verifica-invito', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ codice: codiceInvito.trim(), user_id: data.user.id, email: email.trim(), nome: nome.trim(), cognome: cognome.trim() })
      })
      setMessaggio(T('auth.registrazione_ok'))
      setModo('login')
    } catch(e) { setErrore('Errore: ' + e.message) }
    setLoading(false)
  }

  const handleReset = async () => {
    if (!email) { setErrore(T('auth.compila_campi')); return }
    setLoading(true); reset()
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: 'https://cabinet-sommelier.vercel.app'
    })
    if (error) setErrore(error.message)
    else setMessaggio(T('auth.reset_ok'))
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100dvh', background:'#FBF7F0', display:'flex', flexDirection:'column', justifyContent:'center', padding:'24px 24px 48px' }}>

      {/* Selettore lingua in alto a destra */}
      <div style={{ position:'fixed', top:16, right:16, display:'flex', gap:6, zIndex:10 }}>
        {LINGUE.map(l => (
          <button key={l.code} onClick={() => setLingua(l.code)}
            style={{ width:34, height:34, borderRadius:'50%', border:`1.5px solid ${getLingua()===l.code?'#C4614A':'#D6CEBE'}`, background:getLingua()===l.code?'#C4614A22':'transparent', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>
            {l.flag}
          </button>
        ))}
      </div>

      {/* Logo */}
      <div style={{ textAlign:'center', marginBottom:44 }}>
        <div style={{ marginBottom:8 }}>
          <span style={{ fontFamily:'"DM Sans", sans-serif', fontSize:56, fontWeight:800, color:'#2C1A0E', letterSpacing:'-3px', lineHeight:1 }}>
            Cabi<span style={{ color:'#C4614A' }}>N</span>et
          </span>
        </div>
        <div style={{ fontSize:11, color:'#B8956A', letterSpacing:5, textTransform:'uppercase', fontFamily:'"DM Sans", sans-serif', fontWeight:400 }}>For sommeliers</div>
      </div>
      <div style={{ background:'#F5EDE0', borderRadius:20, padding:24, border:'1px solid #E0D8CC' }}>
        <div style={{ display:'flex', marginBottom:24, background:'#EAE2D6', borderRadius:10, padding:3 }}>
          {[['login',T('auth.accedi')],['register',T('auth.registrati')]].map(([m,l])=>(
            <button key={m} onClick={()=>{setModo(m);reset()}}
              style={{ flex:1, padding:'9px 0', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', background:modo===m?'#D6CEBE':'transparent', color:modo===m?'#2C1A0E':'#9A8070', transition:'all 0.15s' }}>{l}</button>
          ))}
        </div>
        {errore && <div style={S.err}>{errore}</div>}
        {messaggio && <div style={S.ok}>{messaggio}</div>}
        {modo==='login' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div><span style={S.lbl}>{T('auth.email')}</span><input style={S.inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tua@email.com" autoComplete="email" /></div>
            <div><span style={S.lbl}>{T('auth.password')}</span><input style={S.inp} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" onKeyDown={e=>e.key==='Enter'&&handleLogin()} /></div>
            <button onClick={handleLogin} disabled={loading} style={{ ...S.btn, opacity:loading?0.7:1 }}>{loading?T('auth.accesso'):T('auth.accedi')}</button>
            <button onClick={()=>{setModo('reset');reset()}} style={{ background:'none', border:'none', fontSize:13, color:'#9A8070', cursor:'pointer', textDecoration:'underline' }}>{T('auth.pwd_dimenticata')}</button>
          </div>
        )}
        {modo==='register' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div><span style={S.lbl}>{T('auth.codice')}</span><input style={{ ...S.inp, textTransform:'uppercase', letterSpacing:2, fontFamily:'monospace' }} value={codiceInvito} onChange={e=>setCodiceInvito(e.target.value)} placeholder="XXXXXXXX" /></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div><span style={S.lbl}>{T('auth.nome')}</span><input style={S.inp} value={nome} onChange={e=>setNome(e.target.value)} /></div>
              <div><span style={S.lbl}>{T('auth.cognome')}</span><input style={S.inp} value={cognome} onChange={e=>setCognome(e.target.value)} /></div>
            </div>
            <div><span style={S.lbl}>{T('auth.email')}</span><input style={S.inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tua@email.com" autoComplete="email" /></div>
            <div>
              <span style={S.lbl}>{T('auth.password')}</span>
              <input style={S.inp} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder={T('auth.pwd_min')} autoComplete="new-password" />
              <div style={{ fontSize:11, color:'#9A8070', marginTop:4 }}>{T('auth.pwd_hint')}</div>
            </div>
            <button onClick={handleRegister} disabled={loading} style={{ ...S.btn, opacity:loading?0.7:1 }}>{loading?T('auth.registrazione'):T('auth.crea_account')}</button>
          </div>
        )}
        {modo==='reset' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ fontSize:13, color:'#B8956A', marginBottom:4, lineHeight:1.5 }}>{T('auth.reset_desc')}</div>
            <div><span style={S.lbl}>{T('auth.email')}</span><input style={S.inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tua@email.com" /></div>
            <button onClick={handleReset} disabled={loading} style={{ ...S.btn, opacity:loading?0.7:1 }}>{loading?T('auth.invio'):T('auth.invia_reset')}</button>
            <button onClick={()=>{setModo('login');reset()}} style={{ background:'none', border:'none', fontSize:13, color:'#9A8070', cursor:'pointer', textDecoration:'underline' }}>{T('auth.torna_login')}</button>
          </div>
        )}
      </div>
    </div>
  )
}
