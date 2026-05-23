import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useState } from 'react'

interface RegistroForm {
  nome:     string
  email:    string
  password: string
}

const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: 'radial-gradient(ellipse at 60% 0%, rgba(0,200,83,0.15) 0%, transparent 60%), #0a0a0f',
  },
  box: { width: '100%', maxWidth: 420 },
  logo: { textAlign: 'center' as const, marginBottom: 40 },
  logoText: {
    fontFamily: '"Bebas Neue", cursive',
    fontSize: 56, letterSpacing: 4, lineHeight: 1,
    background: 'linear-gradient(135deg, #00C853, #FFD600)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  logoSub: { color: '#606070', fontSize: 12, letterSpacing: 3, textTransform: 'uppercase' as const, marginTop: 6 },
  card: { background: '#13131a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 32 },
  cardTitle: { fontSize: 20, fontWeight: 600, color: '#f0f0f0', marginBottom: 24 },
  group: { marginBottom: 16 },
  label: { display: 'block', fontSize: 11, fontWeight: 500, color: '#9090a0', textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 8 },
  input: { width: '100%', padding: '12px 16px', background: '#1c1c26', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#f0f0f0', fontSize: 15, outline: 'none', boxSizing: 'border-box' as const },
  btn: { width: '100%', padding: '14px', background: '#00C853', border: 'none', borderRadius: 12, color: '#000', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 8 },
  erro: { color: '#f44336', fontSize: 13, marginBottom: 8 },
  footer: { textAlign: 'center' as const, fontSize: 14, color: '#606070', marginTop: 24 },
}

export default function Registro() {
  const { register, handleSubmit } = useForm<RegistroForm>()
  const navigate = useNavigate()
  const [erro, setErro]       = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(data: RegistroForm) {
    try {
      setLoading(true)
      setErro('')
      await api.post('/usuarios', data)
      navigate('/login')
    } catch(e: any) {
      setErro(e.response?.data?.error || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.box}>

        <div style={s.logo}>
          <div style={s.logoText}>BOLÃO COPA</div>
          <div style={s.logoSub}>FIFA World Cup 2026</div>
        </div>

        <div style={s.card}>
          <div style={s.cardTitle}>Criar conta</div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={s.group}>
              <label style={s.label}>Nome</label>
              <input {...register('nome', { required: true })} type="text" placeholder="Seu nome" style={s.input}/>
            </div>
            <div style={s.group}>
              <label style={s.label}>Email</label>
              <input {...register('email', { required: true })} type="email" placeholder="seu@email.com" style={s.input}/>
            </div>
            <div style={s.group}>
              <label style={s.label}>Senha</label>
              <input {...register('password', { required: true })} type="password" placeholder="••••••••" style={s.input}/>
            </div>

            {erro && <div style={s.erro}>{erro}</div>}

            <button type="submit" disabled={loading} style={s.btn}>
              {loading ? 'Criando...' : 'Criar conta'}
            </button>
          </form>

          <div style={s.footer}>
            Já tem conta?{' '}
            <Link to="/login" style={{ color: '#00C853' }}>Entrar</Link>
          </div>
        </div>

      </div>
    </div>
  )
}