import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import GrupoDetalhe from './GrupoDetalhe'

interface Grupo {
  id:            string
  nome:          string
  codigoConvite: string
  totalMembros:  number
  pontuacao:     number
  papel:         string
  status:        string
    edicaoId:      string  // ✅ adicione isso

}

interface Edicao {
  id:   string
  nome: string
  ano:  number
}

export default function Grupos() {
  const queryClient   = useQueryClient()

  const [grupoSelecionado, setGrupoSelecionado] = useState<Grupo | null>(null)
  const [modalAberto, setModalAberto]           = useState<'criar' | 'entrar' | null>(null)
  const [nomeGrupo, setNomeGrupo]               = useState('')
  const [edicaoId, setEdicaoId]                 = useState('')
  const [codigoEntrar, setCodigoEntrar]         = useState('')
  const [loadingAcao, setLoadingAcao]           = useState(false)

  const { data: grupos = [], isLoading } = useQuery<Grupo[]>({
    queryKey: ['grupos'],
    queryFn:  () => api.get('/grupos').then(r => r.data.filter((g: Grupo) => g.status === 'aprovado')),
  })

  const { data: edicoes = [] } = useQuery<Edicao[]>({
    queryKey: ['edicoes'],
    queryFn:  () => api.get('/edicoes').then(r => r.data),
  })

  useEffect(() => {
    if (edicoes.length > 0 && !edicaoId) {
      setEdicaoId(edicoes[0].id)
    }
  }, [edicoes])

  if (grupoSelecionado) {
    return <GrupoDetalhe grupo={grupoSelecionado} onVoltar={() => setGrupoSelecionado(null)} />
  }

  async function criarGrupo() {
    if (!nomeGrupo.trim() || !edicaoId) return
    setLoadingAcao(true)
    try {
      await api.post('/grupos', { nome: nomeGrupo.trim(), edicaoId })
      queryClient.invalidateQueries({ queryKey: ['grupos'] })
      setNomeGrupo('')
      setModalAberto(null)
    } catch (e: any) {
      alert(e.response?.data?.error || 'Erro ao criar grupo')
    } finally {
      setLoadingAcao(false)
    }
  }

  async function entrarGrupo() {
    if (!codigoEntrar.trim()) return
    setLoadingAcao(true)
    try {
      await api.post('/grupos/entrar', { codigo: codigoEntrar.trim().toUpperCase() })
      queryClient.invalidateQueries({ queryKey: ['grupos'] })
      setCodigoEntrar('')
      setModalAberto(null)
      alert('✅ Solicitação enviada! Aguarde o admin aprovar sua entrada.')
    } catch (e: any) {
      const msg: Record<string, string> = {
        'Grupo não encontrado.':              'Código inválido ou grupo não encontrado.',
        'Você já está pendente neste grupo.': 'Você já enviou uma solicitação para este grupo.',
        'Você já é membro deste grupo.':      'Você já faz parte deste grupo.',
      }
      alert(msg[e.response?.data?.error] ?? e.response?.data?.error ?? 'Erro ao entrar no grupo')
    } finally {
      setLoadingAcao(false)
    }
  }

  const papelLabel: Record<string, string> = {
    admin:  '👑 Admin',
    membro: '⚽ Membro',
  }

  return (
    <div style={{ padding: '24px 16px 100px', maxWidth: 600, margin: '0 auto' }}>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: '"Bebas Neue", cursive', fontSize: 36, letterSpacing: 2, marginBottom: 4 }}>
          Meus Grupos
        </h1>
        <p style={{ color: '#606070', fontSize: 14 }}>
          Selecione um grupo para ver palpites e ranking
        </p>
      </div>

      {/* Botões de ação */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <button
          onClick={() => setModalAberto('criar')}
          style={{
            flex: 1, padding: '12px 8px', background: '#00C853', border: 'none',
            borderRadius: 12, color: '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer',
          }}
        >
          + Criar grupo
        </button>
        <button
          onClick={() => setModalAberto('entrar')}
          style={{
            flex: 1, padding: '12px 8px', background: 'transparent',
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12,
            color: '#f0f0f0', fontWeight: 600, fontSize: 14, cursor: 'pointer',
          }}
        >
          🔑 Entrar com código
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#606070', padding: '20px 0' }}>
          <div style={{ width: 18, height: 18, border: '2px solid #333', borderTopColor: '#00C853', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          Carregando grupos...
        </div>
      )}

      {/* Empty state */}
      {!isLoading && grupos.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#606070', animation: 'fadeIn 0.4s ease' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
          <p style={{ fontSize: 16, marginBottom: 6 }}>Nenhum grupo ainda</p>
          <p style={{ fontSize: 13 }}>Crie um grupo ou entre com um código de convite</p>
        </div>
      )}

      {/* Lista de grupos */}
      {grupos.map((g, i) => (
        <div
          key={g.id}
          onClick={() => setGrupoSelecionado(g)}
          style={{
            background: '#13131a', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: '16px 20px', marginBottom: 10,
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
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{g.nome}</div>
            <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#606070' }}>
              <span>👥 {g.totalMembros} membros</span>
              <span>🎯 {g.pontuacao} pts</span>
              <span style={{ color: g.papel === 'admin' ? '#FFD600' : '#606070', fontWeight: 500 }}>
                {papelLabel[g.papel] ?? g.papel}
              </span>
            </div>
          </div>
          <div style={{ color: '#606070', fontSize: 22, marginLeft: 8 }}>›</div>
        </div>
      ))}

      {/* ✅ Modal — overlay completo e corrigido */}
      {modalAberto && (
        <div
          onClick={() => setModalAberto(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            zIndex: 1000, backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#13131a', borderRadius: '20px 20px 0 0', padding: '28px 24px 48px',
              width: '100%', maxWidth: 600, animation: 'slideUp 0.25s ease',
              border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none',
            }}
          >
            <div style={{ fontFamily: '"Bebas Neue", cursive', fontSize: 28, letterSpacing: 2, marginBottom: 20 }}>
              {modalAberto === 'criar' ? 'Criar Grupo' : 'Entrar no Grupo'}
            </div>

            {/* ── Modal Criar ── */}
            {modalAberto === 'criar' && (
              <>
                <input
                  placeholder="Nome do grupo"
                  value={nomeGrupo}
                  onChange={e => setNomeGrupo(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && criarGrupo()}
                  style={{
                    width: '100%', padding: '14px 16px', background: '#1c1c26',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
                    color: '#f0f0f0', fontSize: 15, outline: 'none', marginBottom: 12,
                    boxSizing: 'border-box',
                  }}
                />

                <select
                  value={edicaoId}
                  onChange={e => setEdicaoId(e.target.value)}
                  style={{
                    width: '100%', padding: '14px 16px', background: '#1c1c26',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
                    color: edicaoId ? '#f0f0f0' : '#606070', fontSize: 15,
                    outline: 'none', marginBottom: 16, boxSizing: 'border-box',
                    cursor: 'pointer',
                  }}
                >
                  <option value="" disabled>Selecione o campeonato</option>
                  {edicoes.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.nome} ({e.ano})
                    </option>
                  ))}
                </select>

                <button
                  onClick={criarGrupo}
                  disabled={loadingAcao || !nomeGrupo.trim() || !edicaoId}
                  style={{
                    width: '100%', padding: '14px',
                    background: loadingAcao || !nomeGrupo.trim() || !edicaoId ? '#333' : '#00C853',
                    border: 'none', borderRadius: 12, color: '#000',
                    fontWeight: 700, fontSize: 15,
                    cursor: loadingAcao || !nomeGrupo.trim() || !edicaoId ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loadingAcao ? 'Criando...' : 'Criar'}
                </button>
              </>
            )}

            {/* ── Modal Entrar ── */}
            {modalAberto === 'entrar' && (
              <>
                <input
                  placeholder="Código de convite (ex: ABC123)"
                  value={codigoEntrar}
                  onChange={e => setCodigoEntrar(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && entrarGrupo()}
                  maxLength={10}
                  style={{
                    width: '100%', padding: '14px 16px', background: '#1c1c26',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
                    color: '#FFD600', fontSize: 20, fontFamily: '"Bebas Neue", cursive',
                    letterSpacing: 4, textAlign: 'center', outline: 'none', marginBottom: 16,
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  onClick={entrarGrupo}
                  disabled={loadingAcao || !codigoEntrar.trim()}
                  style={{
                    width: '100%', padding: '14px',
                    background: loadingAcao || !codigoEntrar.trim() ? '#333' : '#00C853',
                    border: 'none', borderRadius: 12, color: '#000',
                    fontWeight: 700, fontSize: 15,
                    cursor: loadingAcao || !codigoEntrar.trim() ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loadingAcao ? 'Entrando...' : 'Entrar'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}