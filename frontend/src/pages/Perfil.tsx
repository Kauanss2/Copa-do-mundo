import { useAuth } from '../contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'

export default function Perfil() {
  const { usuario, logout } = useAuth()

  const { data: grupos = [] } = useQuery({
    queryKey: ['grupos'],
    queryFn:  () => api.get('/grupos').then(r => r.data)
  })

  const totalPontos = grupos.reduce((acc: number, g: any) => acc + (g.pontuacao || 0), 0)

  return (
    <div style={{ padding: '24px 16px 100px', maxWidth: 600, margin: '0 auto' }}>

      {/* Avatar */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, #00C853, #0D47A1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, fontWeight: 700, color: '#fff', marginBottom: 12,
        }}>
          {usuario?.nome[0].toUpperCase()}
        </div>
        <h2 style={{ fontFamily: '"Bebas Neue", cursive', fontSize: 28, letterSpacing: 2 }}>{usuario?.nome}</h2>
        <p style={{ color: '#606070', fontSize: 14 }}>{usuario?.email}</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, textAlign: 'center' }}>
          <div style={{ fontFamily: '"Bebas Neue", cursive', fontSize: 36, color: '#00C853', letterSpacing: 2 }}>{totalPontos}</div>
          <div style={{ fontSize: 12, color: '#606070' }}>Total de pontos</div>
        </div>
        <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, textAlign: 'center' }}>
          <div style={{ fontFamily: '"Bebas Neue", cursive', fontSize: 36, color: '#FFD600', letterSpacing: 2 }}>{grupos.length}</div>
          <div style={{ fontSize: 12, color: '#606070' }}>Grupos</div>
        </div>
      </div>

      {/* Meus grupos */}
      <div style={{ fontSize: 11, fontWeight: 600, color: '#606070', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
        Meus grupos
      </div>

      {grupos.map((g: any) => (
        <div key={g.id} style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 500, marginBottom: 2 }}>{g.nome}</div>
            <div style={{ fontSize: 12, color: '#606070' }}>👥 {g.totalMembros} membros</div>
          </div>
          <div style={{ fontFamily: '"Bebas Neue", cursive', fontSize: 22, color: '#00C853', letterSpacing: 1 }}>
            {g.pontuacao} <span style={{ fontFamily: 'sans-serif', fontSize: 11, color: '#606070' }}>pts</span>
          </div>
        </div>
      ))}

      {/* Botão sair */}
      <button
        onClick={logout}
        style={{ width: '100%', padding: 14, marginTop: 24, background: 'rgba(244,67,54,0.1)', border: '1px solid rgba(244,67,54,0.3)', borderRadius: 12, color: '#f44336', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
        Sair da conta
      </button>

    </div>
  )
}