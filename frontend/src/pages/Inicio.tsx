import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import logo from '../assets/logo.png'

interface Grupo {
  id:           string
  nome:         string
  totalMembros: number
  pontuacao:    number
  papel:        string
}

export default function Inicio() {
  const { usuario } = useAuth()
  const navigate    = useNavigate()
  const [showRegras, setShowRegras] = React.useState(false)

  const { data: grupos = [], isLoading } = useQuery<Grupo[]>({
    queryKey: ['grupos'],
    queryFn:  () => api.get('/grupos').then(r => r.data),
  })

  const diaSemana = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })

  return (
    <div style={{ padding: '24px 16px 100px', maxWidth: 600, margin: '0 auto' }}>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes gradShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* ── Logo ── */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32, animation: 'fadeIn 0.4s ease' }}>
        <img src={logo} alt="Logo" style={{ width: 140, height: 140, objectFit: 'contain' }} />
      </div>

      {/* ── Saudação ── */}
      <div style={{ marginBottom: 36, animation: 'fadeIn 0.4s ease' }}>
        <div style={{ fontSize: 13, color: '#606070', marginBottom: 4, textTransform: 'capitalize' }}>
          {diaSemana}
        </div>
        <h1 style={{ fontFamily: '"Bebas Neue", cursive', fontSize: 38, letterSpacing: 2, lineHeight: 1.1, marginBottom: 8 }}>
          Bem-vindo,<br />
          <span style={{
            background: 'linear-gradient(135deg, #00C853, #FFD600, #00C853)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'gradShift 4s ease infinite',
          }}>
            {usuario?.nome}!
          </span>
        </h1>
        <p style={{ color: '#606070', fontSize: 14 }}>⚽ Qual é o seu palpite hoje?</p>
      </div>

      {/* ── Acesso rápido ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 32 }}>
        {[
          { icon: '⚽', label: 'Fazer palpites', sub: 'Aposte nos jogos',    rota: '/grupos' },
          { icon: '🏆', label: 'Ver rankings',   sub: 'Compare com amigos', rota: '/grupos' },
        ].map((item, i) => (
          <button
            key={i}
            onClick={() => navigate(item.rota)}
            style={{
              background: '#13131a', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: '18px 14px', cursor: 'pointer', textAlign: 'left',
              animation: `fadeIn 0.35s ease ${i * 0.08}s both`,
              transition: 'border-color 0.2s, background 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,200,83,0.35)'
              ;(e.currentTarget as HTMLButtonElement).style.background = '#161620'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)'
              ;(e.currentTarget as HTMLButtonElement).style.background = '#13131a'
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{item.label}</div>
            <div style={{ fontSize: 12, color: '#606070' }}>{item.sub}</div>
          </button>
        ))}
      </div>

      {/* ── Regras ── */}
      <div style={{ marginBottom: 32, animation: 'fadeIn 0.4s ease' }}>
        <button
          onClick={() => setShowRegras(!showRegras)}
          style={{
            width: '100%', background: '#13131a', border: '1px solid rgba(0,200,83,0.3)',
            borderRadius: 16, padding: '16px 18px', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,200,83,0.6)'
            ;(e.currentTarget as HTMLButtonElement).style.background = '#161620'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,200,83,0.3)'
            ;(e.currentTarget as HTMLButtonElement).style.background = '#13131a'
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 600 }}>📋 Como funciona</span>
          <span style={{ fontSize: 20, transform: showRegras ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }}>⌄</span>
        </button>

        {showRegras && (
          <div style={{ marginTop: 12, padding: '20px 18px', background: 'rgba(0,200,83,0.05)', border: '1px solid rgba(0,200,83,0.2)', borderRadius: 12, animation: 'fadeIn 0.3s ease' }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#00C853', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>🎯 Pontuação</div>
              <div style={{ fontSize: 13, color: '#c0c0d0', lineHeight: 1.6 }}>
                <div style={{ marginBottom: 6 }}>✅ Placar exato → <span style={{ color: '#FFD600', fontWeight: 600 }}>30 pontos</span></div>
                <div style={{ marginBottom: 6 }}>🟡 Acertou vencedor/empate → <span style={{ color: '#FFD600', fontWeight: 600 }}>15 pontos</span></div>
                <div>❌ Errou o resultado → <span style={{ color: '#888', fontWeight: 600 }}>0 pontos</span></div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#00C853', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>🏅 Ranking</div>
              <div style={{ fontSize: 13, color: '#c0c0d0' }}>Atualizado automaticamente <span style={{ color: '#FFD600', fontWeight: 600 }}>3 vezes por dia</span></div>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#00C853', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>📌 Regras Gerais</div>
              <div style={{ fontSize: 13, color: '#c0c0d0', lineHeight: 1.7 }}>
                <div style={{ marginBottom: 4 }}>• Altere palpites até <span style={{ color: '#FFD600' }}>2 horas</span> antes do jogo</div>
                <div style={{ marginBottom: 4 }}>• Cada palpite vale apenas no grupo</div>
                <div style={{ marginBottom: 4 }}>• Participe de vários grupos simultane</div>
                <div style={{ marginBottom: 4 }}>• Jogos cancelados não geram pontos</div>
                <div style={{ marginBottom: 4 }}>• Considera tempo regulamentar + prorrogação</div>
                <div>• Pênaltis não são considerados</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Meus grupos ── */}
      <div style={{ marginBottom: 12, fontSize: 11, fontWeight: 600, color: '#606070', textTransform: 'uppercase', letterSpacing: 1 }}>
        Meus Grupos
      </div>

      {isLoading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#606070', padding: '16px 0' }}>
          <div style={{ width: 16, height: 16, border: '2px solid #333', borderTopColor: '#00C853', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          Carregando...
        </div>
      )}

      {!isLoading && grupos.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#606070', animation: 'fadeIn 0.4s ease' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
          <p style={{ marginBottom: 4 }}>Você não está em nenhum grupo ainda.</p>
          <p style={{ fontSize: 13 }}>
            Vá em{' '}
            <span onClick={() => navigate('/grupos')} style={{ color: '#00C853', fontWeight: 600, cursor: 'pointer' }}>
              Grupos
            </span>{' '}
            para criar ou entrar em um.
          </p>
        </div>
      )}

      {grupos.map((g, i) => (
        <div
          key={g.id}
          onClick={() => navigate(`/grupos/${g.id}`)}
          style={{
            background: '#13131a', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: '14px 18px', marginBottom: 10,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            animation: `fadeIn 0.3s ease ${i * 0.06}s both`,
            transition: 'border-color 0.2s, background 0.2s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,200,83,0.35)'
            ;(e.currentTarget as HTMLDivElement).style.background = '#161620'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)'
            ;(e.currentTarget as HTMLDivElement).style.background = '#13131a'
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{g.nome}</div>
            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#606070' }}>
              <span>👥 {g.totalMembros} membros</span>
              <span>🎯 {g.pontuacao} pts</span>
              <span style={{ color: g.papel === 'admin' ? '#FFD600' : '#606070', fontWeight: 500 }}>
                {g.papel === 'admin' ? '👑 Admin' : '⚽ Membro'}
              </span>
            </div>
          </div>
          <div style={{ color: '#606070', fontSize: 22 }}>›</div>
        </div>
      ))}
    </div>
  )
}