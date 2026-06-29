import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Grupo {
  id:            string
  nome:          string
  codigoConvite: string
  totalMembros:  number
  pontuacao:     number
  papel:         string
  edicaoId:      string  // ← essencial para filtrar jogos
}

interface Membro {
  usuario:        { id: string; nome: string }
  pontuacaoTotal: number
  papel:          string
  status:         string
}

type Aba    = 'palpites' | 'ranking' | 'equipes' | 'membros'
type SubAba = 'meuspalpites' | 'futuras' | 'aovivo' | 'encerradas'

// ─── GrupoDetalhe ─────────────────────────────────────────────────────────────

interface Props {
  grupo:    Grupo
  onVoltar: () => void
}

export default function GrupoDetalhe({ grupo, onVoltar }: Props) {
  const { usuario } = useAuth()
  const [aba, setAba] = useState<Aba>('palpites')

  const abas = [
    { key: 'palpites' as Aba, label: 'Palpites', icon: '⚽' },
    { key: 'ranking'  as Aba, label: 'Ranking',  icon: '🏆' },
    { key: 'equipes'  as Aba, label: 'Equipes',  icon: '🛡️' },
    ...(grupo.papel === 'admin' ? [{ key: 'membros' as Aba, label: 'Membros', icon: '👥' }] : []),
  ]

  return (
    <div style={{ padding: '0 0 100px', maxWidth: 600, margin: '0 auto' }}>
      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* ── Header ── */}
      <div style={{ padding: '20px 16px 0', marginBottom: 4 }}>
        <button
          onClick={onVoltar}
          style={{ background: 'none', border: 'none', color: '#606070', fontSize: 14, cursor: 'pointer', padding: '4px 0', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          ← Meus Grupos
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: '"Bebas Neue", cursive', fontSize: 30, letterSpacing: 2, marginBottom: 4 }}>
              {grupo.nome}
            </h1>
            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#606070' }}>
              <span>👥 {grupo.totalMembros} membros</span>
              <span>🎯 {grupo.pontuacao} pts</span>
            </div>
          </div>
          <CopiarCodigo codigo={grupo.codigoConvite} />
        </div>
      </div>

      {/* ── Navegação de abas ── */}
      <div style={{ display: 'flex', margin: '16px 16px 0', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
        {abas.map((a, i) => (
          <button
            key={a.key}
            onClick={() => setAba(a.key)}
            style={{
              flex: 1, padding: '11px 4px', border: 'none', cursor: 'pointer',
              background: aba === a.key ? '#00C853' : '#13131a',
              color: aba === a.key ? '#000' : '#606070',
              fontWeight: 700, fontSize: 12,
              borderRight: i < abas.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            {a.icon} {a.label}
          </button>
        ))}
      </div>

      {/* ── Conteúdo ── */}
      <div style={{ padding: '20px 16px 0' }}>
        {aba === 'palpites' && (
          <AbaPalpites grupoId={grupo.id} edicaoId={grupo.edicaoId} />
        )}
        {aba === 'ranking' && (
          <AbaRanking grupoId={grupo.id} usuarioId={usuario?.id} />
        )}
        {aba === 'equipes' && (
          <AbaEquipes grupoId={grupo.id} />
        )}
        {aba === 'membros' && grupo.papel === 'admin' && (
          <AbaMembros grupoId={grupo.id} />
        )}
      </div>
    </div>
  )
}

// ─── Copiar Código ────────────────────────────────────────────────────────────

function CopiarCodigo({ codigo }: { codigo: string }) {
  const [copiado, setCopiado] = useState(false)

  function copiar() {
    navigator.clipboard.writeText(codigo)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div
      onClick={copiar}
      title="Clique para copiar o código de convite"
      style={{ cursor: 'pointer', textAlign: 'center', background: '#1c1c26', borderRadius: 10, padding: '8px 14px', border: '1px dashed rgba(255,214,0,0.35)' }}
    >
      <div style={{ fontFamily: '"Bebas Neue", cursive', fontSize: 20, letterSpacing: 4, color: '#FFD600' }}>
        {codigo}
      </div>
      <div style={{ fontSize: 10, color: copiado ? '#00C853' : '#606070', marginTop: 2 }}>
        {copiado ? '✓ Copiado!' : 'Copiar convite'}
      </div>
    </div>
  )
}

// ─── Aba Palpites ─────────────────────────────────────────────────────────────

function AbaPalpites({ grupoId, edicaoId }: { grupoId: string; edicaoId: string }) {
  const queryClient = useQueryClient()
  const [subAba, setSubAba]   = useState<SubAba>('futuras')
  const [draft, setDraft]     = useState<Record<string, { casa: number; visitante: number }>>({})
  const [editando, setEditando] = useState<Record<string, boolean>>({})
  const [loading, setLoading]  = useState<Record<string, boolean>>({})
  const [exportando, setExportando] = useState(false)

  // Jogos filtrados pela edição do campeonato do grupo
  const { data: jogos = [] } = useQuery({
    queryKey: ['jogos', edicaoId],
    queryFn:  () => api.get('/jogos', { params: { grupoId  } }).then(r => r.data),
    enabled:  !!edicaoId,
  })

  // Palpites do usuário neste grupo
  const { data: meuspalpites = [] } = useQuery({
    queryKey: ['meuspalpites', grupoId],
    queryFn:  () => api.get('/palpites', { params: { grupoId } }).then(r => r.data),
    enabled:  !!grupoId,
  })

  const PRAZO_FASE_GRUPOS = new Date('2026-06-15T23:59:59.999')

function podeApostar(jogo: any) {
  const agora = Date.now()
  const inicioJogo = new Date(jogo.inicioEm).getTime()

  const faltamMaisDeDuasHoras = inicioJogo - agora < 15 * 60 * 1000

  if (!faltamMaisDeDuasHoras) {
    return false
  }

  if (jogo.fase === 'grupos') {
    return agora < PRAZO_FASE_GRUPOS.getTime()
  }

  return true
}
  const jogosFiltrados = (jogos as any[]).filter(j => {
    if (subAba === 'meuspalpites') return !!getMeuPalpite(j.id)
    if (subAba === 'aovivo')     return j.status === 'em_andamento'
    if (subAba === 'encerradas') return j.status === 'encerrado' || (j.status === 'agendado' && new Date(j.inicioEm).getTime() <= Date.now())
    if (subAba === 'futuras')    return j.status === 'agendado' && j.timeCasaId && j.timeVisitanteId && new Date(j.inicioEm).getTime() > Date.now()
    return false
  })

  function getMeuPalpite(jogoId: string) {
    return (meuspalpites as any[]).find(p => p.jogoId === jogoId)
  }

  function getDraft(jogoId: string, fallback = { casa: 0, visitante: 0 }) {
    return draft[jogoId] ?? fallback
  }

  function setGol(jogoId: string, lado: 'casa' | 'visitante', valor: number) {
    setDraft(prev => ({
      ...prev,
      [jogoId]: { ...getDraft(jogoId, prev[jogoId] ?? { casa: 0, visitante: 0 }), [lado]: Math.max(0, Math.min(20, valor)) },
    }))
  }

  async function apostar(jogoId: string) {
    const p = getDraft(jogoId)
    setLoading(prev => ({ ...prev, [jogoId]: true }))
    try {
      await api.post('/palpites', { jogoId, grupoId, golsCasa: p.casa, golsVisitante: p.visitante })
      queryClient.invalidateQueries({ queryKey: ['meuspalpites', grupoId] })
    } catch (e: any) {
      alert(e.response?.data?.error || 'Erro ao apostar')
    } finally {
      setLoading(prev => ({ ...prev, [jogoId]: false }))
    }
  }

  async function salvar(jogoId: string) {
    const p = getDraft(jogoId)
    setLoading(prev => ({ ...prev, [jogoId]: true }))
    try {
      await api.put('/palpites', { jogoId, grupoId, golsCasa: p.casa, golsVisitante: p.visitante })
      queryClient.invalidateQueries({ queryKey: ['meuspalpites', grupoId] })
      setEditando(prev => ({ ...prev, [jogoId]: false }))
    } catch (e: any) {
      alert(e.response?.data?.error || 'Erro ao salvar')
    } finally {
      setLoading(prev => ({ ...prev, [jogoId]: false }))
    }
  }

  function iniciarEdicao(jogoId: string, palpite: any) {
    setDraft(prev => ({ ...prev, [jogoId]: { casa: palpite.golsCasa, visitante: palpite.golsVisitante } }))
    setEditando(prev => ({ ...prev, [jogoId]: true }))
  }

  function cancelarEdicao(jogoId: string) {
    setEditando(prev => ({ ...prev, [jogoId]: false }))
  }

  async function exportarExcel() {
    setExportando(true)
    try {
      const response = await api.get(`/palpites/grupo/${grupoId}/export-excel`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `palpites-grupo-${grupoId}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
    } catch (e: any) {
      alert('Erro ao exportar arquivo: ' + (e.response?.data?.error || 'Tente novamente'))
    } finally {
      setExportando(false)
    }
  }

  function agruparPorData(jogos: any[]) {
    const grupos: Record<string, any[]> = {}
    jogos.forEach(jogo => {
      const data = new Date(jogo.inicioEm).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
      if (!grupos[data]) grupos[data] = []
      grupos[data].push(jogo)
    })
    return Object.entries(grupos).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
  }

  const subAbas: { key: SubAba; label: string; icon: string }[] = [
    { key: 'futuras',    label: 'Futuras',    icon: '📅' },
    { key: 'aovivo',     label: 'Ao Vivo',    icon: '🔴' },
    { key: 'encerradas', label: 'Encerradas', icon: '✅' },
    { key: 'meuspalpites', label: 'Meus Palpites', icon: '⭐' },
  ]

  const inputStyle: React.CSSProperties = {
    width: 56, padding: '10px 4px',
    background: '#1c1c26',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10,
    color: '#f0f0f0',
    fontFamily: '"Bebas Neue", cursive',
    fontSize: 26,
    textAlign: 'center',
    outline: 'none',
  }

  return (
    <div>
      {/* Sub-abas */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {subAbas.map(a => (
          <button
            key={a.key}
            onClick={() => setSubAba(a.key)}
            style={{
              flex: 1, padding: '8px 4px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: subAba === a.key ? 'rgba(0,200,83,0.15)' : '#13131a',
              color: subAba === a.key ? '#00C853' : '#606070',
              fontWeight: 600, fontSize: 12,
              outline: subAba === a.key ? '1px solid rgba(0,200,83,0.3)' : '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {a.icon} {a.label}
          </button>
        ))}
      </div>

      <div style={{
        marginBottom: 16,
        padding: '10px 12px',
        borderRadius: 12,
        background: 'rgba(255, 214, 0, 0.08)',
        border: '1px solid rgba(255, 214, 0, 0.25)',
        color: '#FFD600',
        fontSize: 12,
        lineHeight: 1.4,
      }}>
        ⚠️ Os palpites da fase de grupos só podem ser feitos até 15/06/2026.
      </div>

      {/* Botão Exportar Excel */}
      <button
        onClick={exportarExcel}
        disabled={exportando}
        style={{
          width: '100%', padding: '10px', marginBottom: 20, borderRadius: 10,
          background: exportando ? '#333' : 'rgba(0,200,83,0.1)',
          border: '1px solid rgba(0,200,83,0.3)', color: '#00C853',
          fontWeight: 600, fontSize: 13, cursor: exportando ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          if (!exportando) {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,200,83,0.2)'
          }
        }}
        onMouseLeave={e => {
          if (!exportando) {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,200,83,0.1)'
          }
        }}
      >
        {exportando ? '⏳ Gerando...' : '📊 Exportar Excel'}
      </button>

      {jogosFiltrados.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#606070' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>
            {subAba === 'aovivo' ? '🔴' : subAba === 'encerradas' ? '✅' : subAba === 'meuspalpites' ? '⭐' : '📅'}
          </div>
          Nenhum jogo {subAba === 'aovivo' ? 'ao vivo' : subAba === 'encerradas' ? 'encerrado' : subAba === 'meuspalpites' ? 'palpitado' : 'disponível'} no momento
        </div>
      )}

      {agruparPorData(jogosFiltrados).map(([data, jogosDoDia]) => (
        <div key={data}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#FFD600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: 20 }}>
            📅 {data}
          </div>
          {jogosDoDia.map((j: any) => {
            const meuPalpite = getMeuPalpite(j.id)
            const modoEdicao = !!editando[j.id]
            const pode       = podeApostar(j)
            const carregando = !!loading[j.id]
            const d = modoEdicao
              ? getDraft(j.id, { casa: meuPalpite?.golsCasa ?? 0, visitante: meuPalpite?.golsVisitante ?? 0 })
              : getDraft(j.id)
            const modoInput = (!meuPalpite && subAba === 'futuras' && pode) || modoEdicao

            return (
              <div key={j.id} style={{
                background: '#13131a',
                border: `1px solid ${modoInput ? 'rgba(0,200,83,0.25)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 16, padding: '16px 14px', marginBottom: 10,
                animation: 'fadeIn 0.25s ease',
                transition: 'border-color 0.2s',
              }}>
                {/* Data + status */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <span style={{ fontSize: 11, color: '#606070' }}>
                    {new Date(j.inicioEm).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <StatusBadge status={j.status} inicioEm={j.inicioEm} />
                </div>

                {/* Times */}
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
                  {/* Casa */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    {j.timeCasa?.bandeiraUrl
                      ? <img src={j.timeCasa.bandeiraUrl} style={{ width: 40, height: 40, objectFit: 'contain' }} onError={e => (e.currentTarget.style.display = 'none')} />
                      : <span style={{ fontSize: 32 }}>🏳️</span>}
                    <span style={{ fontSize: 12, fontWeight: 600, textAlign: 'center' }}>{j.timeCasa?.sigla || '?'}</span>
                    {modoInput ? (
                      <input type="number" min={0} max={20} value={d.casa}
                        onChange={e => setGol(j.id, 'casa', +e.target.value)} style={inputStyle} />
                    ) : meuPalpite ? (
                      <div style={{ fontFamily: '"Bebas Neue", cursive', fontSize: 26, color: '#00C853' }}>{meuPalpite.golsCasa}</div>
                    ) : null}
                  </div>

                  {/* Centro */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, paddingBottom: modoInput || meuPalpite ? 8 : 0 }}>
                    {j.status !== 'agendado' && (
                      <div style={{ fontFamily: '"Bebas Neue", cursive', fontSize: 22, letterSpacing: 2, color: '#f0f0f0' }}>
                        {j.golsCasa ?? 0} : {j.golsVisitante ?? 0}
                      </div>
                    )}
                    <span style={{ fontFamily: '"Bebas Neue", cursive', fontSize: 22, color: '#404050', lineHeight: 1 }}>
                      {j.status === 'agendado' ? 'x' : '|'}
                    </span>
                  </div>

                  {/* Visitante */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    {j.timeVisitante?.bandeiraUrl
                      ? <img src={j.timeVisitante.bandeiraUrl} style={{ width: 40, height: 40, objectFit: 'contain' }} onError={e => (e.currentTarget.style.display = 'none')} />
                      : <span style={{ fontSize: 32 }}>🏳️</span>}
                    <span style={{ fontSize: 12, fontWeight: 600, textAlign: 'center' }}>{j.timeVisitante?.sigla || '?'}</span>
                    {modoInput ? (
                      <input type="number" min={0} max={20} value={d.visitante}
                        onChange={e => setGol(j.id, 'visitante', +e.target.value)} style={inputStyle} />
                    ) : meuPalpite ? (
                      <div style={{ fontFamily: '"Bebas Neue", cursive', fontSize: 26, color: '#00C853' }}>{meuPalpite.golsVisitante}</div>
                    ) : null}
                  </div>
                </div>

                {/* Rodapé */}
                <div style={{ marginTop: 14 }}>
                  {!meuPalpite && subAba === 'futuras' && pode && (
                    <button onClick={() => apostar(j.id)} disabled={carregando}
                      style={{ width: '100%', padding: '11px', background: carregando ? '#333' : '#00C853', border: 'none', borderRadius: 10, color: '#000', fontWeight: 700, fontSize: 14, cursor: carregando ? 'not-allowed' : 'pointer' }}>
                      {carregando ? 'Enviando...' : '⚽ Apostar'}
                    </button>
                  )}

                  {meuPalpite && !modoEdicao && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: 11, color: '#606070' }}>
                        Seu palpite
                        {meuPalpite.pontosGanhos > 0 && (
                          <span style={{ color: '#FFD600', marginLeft: 8 }}>+{meuPalpite.pontosGanhos} pts</span>
                        )}
                      </div>
                      {pode && (j.status === 'agendado' || subAba === 'meuspalpites') && (
                        <button onClick={() => iniciarEdicao(j.id, meuPalpite)}
                          style={{ padding: '6px 14px', background: 'transparent', border: '1px solid rgba(0,200,83,0.4)', borderRadius: 8, color: '#00C853', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          Editar
                        </button>
                      )}
                    </div>
                  )}

                  {meuPalpite && modoEdicao && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => salvar(j.id)} disabled={carregando}
                        style={{ flex: 1, padding: '11px', background: carregando ? '#333' : '#00C853', border: 'none', borderRadius: 10, color: '#000', fontWeight: 700, fontSize: 14, cursor: carregando ? 'not-allowed' : 'pointer' }}>
                        {carregando ? 'Salvando...' : '✓ Salvar'}
                      </button>
                      <button onClick={() => cancelarEdicao(j.id)}
                        style={{ padding: '11px 16px', background: '#1c1c26', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#606070', fontSize: 13, cursor: 'pointer' }}>
                        ✕
                      </button>
                    </div>
                  )}

                  {!meuPalpite && subAba === 'futuras' && !pode && (
                    <div style={{ fontSize: 12, color: '#606070', textAlign: 'center' }}>🔒 Prazo encerrado</div>
                  )}

                  {!meuPalpite && subAba === 'encerradas' && (
                    <div style={{ fontSize: 12, color: '#606070', textAlign: 'center' }}>Você não apostou neste jogo</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ─── Aba Ranking ──────────────────────────────────────────────────────────────

function AbaRanking({ grupoId, usuarioId }: { grupoId: string; usuarioId?: string }) {
  const { data: detalhe, isLoading } = useQuery({
    queryKey: ['grupo', grupoId],
    queryFn:  () => api.get(`/grupos/${grupoId}`).then(r => r.data),
  })

  const membros: Membro[] = detalhe?.membros ?? []
  const cores = ['#FFD700', '#C0C0C0', '#CD7F32']

  if (isLoading) return <Spinner />
  if (membros.length === 0) return <EmptyState icon="🏆" texto="Nenhum membro com pontuação ainda" />

  return (
    <div>
      {membros.map((m, i) => {
        const ehEu = m.usuario.id === usuarioId
        return (
          <div key={m.usuario.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px', borderRadius: 12, marginBottom: 8,
            background: ehEu ? 'rgba(0,200,83,0.08)' : '#13131a',
            border: ehEu ? '1px solid rgba(0,200,83,0.2)' : '1px solid rgba(255,255,255,0.06)',
            animation: `fadeIn 0.25s ease ${i * 0.05}s both`,
          }}>
            <div style={{ fontFamily: '"Bebas Neue", cursive', fontSize: 22, width: 30, textAlign: 'center', color: cores[i] || '#606070' }}>
              {i + 1}
            </div>
            <div style={{ flex: 1, fontWeight: ehEu ? 700 : 400 }}>
              {m.usuario.nome}
              {ehEu && <span style={{ fontSize: 11, color: '#00C853', marginLeft: 6 }}>(você)</span>}
            </div>
            <div style={{ fontFamily: '"Bebas Neue", cursive', fontSize: 22, color: '#00C853', letterSpacing: 1 }}>
              {m.pontuacaoTotal}
              <span style={{ fontFamily: 'sans-serif', fontSize: 11, color: '#606070', marginLeft: 2 }}>pts</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Aba Equipes ──────────────────────────────────────────────────────────────

function AbaEquipes({ grupoId }: { grupoId: string }) {
  const { data: jogos = [], isLoading } = useQuery({
queryKey: ['jogos', grupoId],
    queryFn:  () => api.get('/jogos', { params: { grupoId } }).then(r => r.data),
    enabled:  !!grupoId,
  })
 
  if (isLoading) return <Spinner />

  const timesMap = new Map<string, any>()
  ;(jogos as any[]).forEach(j => {
    if (j.timeCasa)      timesMap.set(j.timeCasa.id,      j.timeCasa)
    if (j.timeVisitante) timesMap.set(j.timeVisitante.id, j.timeVisitante)
  })
  const times = Array.from(timesMap.values())

  if (times.length === 0) return <EmptyState icon="🛡️" texto="Nenhuma equipe cadastrada ainda" />

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {times.map((t: any, i: number) => (
        <div key={t.id} style={{
          background: '#13131a', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 14, padding: '14px 12px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          animation: `fadeIn 0.25s ease ${i * 0.04}s both`,
        }}>
          {t.bandeiraUrl
            ? <img src={t.bandeiraUrl} style={{ width: 44, height: 44, objectFit: 'contain' }} onError={e => (e.currentTarget.style.display = 'none')} />
            : <span style={{ fontSize: 36 }}>🏳️</span>}
          <div style={{ fontSize: 13, fontWeight: 600, textAlign: 'center' }}>{t.nome || t.sigla}</div>
          {t.sigla && t.nome && <div style={{ fontSize: 11, color: '#606070' }}>{t.sigla}</div>}
        </div>
      ))}
    </div>
  )
}

// ─── Aba Membros ──────────────────────────────────────────────────────────────

function AbaMembros({ grupoId }: { grupoId: string }) {
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const { data: detalhe, isLoading } = useQuery({
    queryKey: ['grupo', grupoId],
    queryFn:  () => api.get(`/grupos/${grupoId}`).then(r => r.data),
  })

  const membros: any[] = detalhe?.membros ?? []
  const pendentes = membros.filter(m => m.status === 'pendente')
  const aprovados = membros.filter(m => m.status === 'aprovado')

  async function aprovar(usuarioId: string) {
    setLoading(prev => ({ ...prev, [usuarioId]: true }))
    try {
      await api.patch(`/grupos/${grupoId}/membros/${usuarioId}/aprovar`)
      queryClient.invalidateQueries({ queryKey: ['grupo', grupoId] })
    } catch (e: any) {
      alert(e.response?.data?.error || 'Erro ao aprovar')
    } finally {
      setLoading(prev => ({ ...prev, [usuarioId]: false }))
    }
  }

  async function rejeitar(usuarioId: string) {
    if (!confirm('Rejeitar esta solicitação?')) return
    setLoading(prev => ({ ...prev, [usuarioId]: true }))
    try {
      await api.delete(`/grupos/${grupoId}/membros/${usuarioId}/rejeitar`)
      queryClient.invalidateQueries({ queryKey: ['grupo', grupoId] })
    } catch (e: any) {
      alert(e.response?.data?.error || 'Erro ao rejeitar')
    } finally {
      setLoading(prev => ({ ...prev, [usuarioId]: false }))
    }
  }

  if (isLoading) return <Spinner />

  return (
    <div>
      {pendentes.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#FFD600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
            ⏳ Aguardando aprovação ({pendentes.length})
          </div>
          {pendentes.map((m: any) => (
            <div key={m.usuario.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 14px', borderRadius: 12, marginBottom: 8,
              background: 'rgba(255,214,0,0.06)', border: '1px solid rgba(255,214,0,0.2)',
            }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{m.usuario.nome}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => aprovar(m.usuario.id)} disabled={!!loading[m.usuario.id]}
                  style={{ padding: '6px 14px', background: '#00C853', border: 'none', borderRadius: 8, color: '#000', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                  {loading[m.usuario.id] ? '...' : '✓ Aprovar'}
                </button>
                <button onClick={() => rejeitar(m.usuario.id)} disabled={!!loading[m.usuario.id]}
                  style={{ padding: '6px 14px', background: 'transparent', border: '1px solid rgba(255,80,80,0.4)', borderRadius: 8, color: '#ff5050', fontSize: 12, cursor: 'pointer' }}>
                  ✕
                </button>
              </div>
            </div>
          ))}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '16px 0' }} />
        </>
      )}

      <div style={{ fontSize: 11, fontWeight: 600, color: '#606070', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
        Membros ({aprovados.length})
      </div>
      {aprovados.map((m: any, i: number) => (
        <div key={m.usuario.id} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 14px', borderRadius: 12, marginBottom: 8,
          background: '#13131a', border: '1px solid rgba(255,255,255,0.06)',
          animation: `fadeIn 0.25s ease ${i * 0.05}s both`,
        }}>
          <span style={{ fontWeight: m.papel === 'admin' ? 700 : 400 }}>{m.usuario.nome}</span>
          <span style={{ fontSize: 12, color: m.papel === 'admin' ? '#FFD600' : '#606070' }}>
            {m.papel === 'admin' ? '👑 Admin' : '⚽ Membro'}
          </span>
        </div>
      ))}

      {aprovados.length === 0 && pendentes.length === 0 && (
        <EmptyState icon="👥" texto="Nenhum membro ainda" />
      )}
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatusBadge({ status, inicioEm }: { status: string; inicioEm?: string }) {
  const passouData = inicioEm && new Date(inicioEm).getTime() <= Date.now()
  const cfg: Record<string, { bg: string; color: string; label: string }> = {
    em_andamento: { bg: 'rgba(0,200,83,0.15)',    color: '#00C853', label: '● AO VIVO'  },
    encerrado:    { bg: 'rgba(144,144,160,0.15)', color: '#9090a0', label: 'ENCERRADO'  },
    agendado:     { bg: 'rgba(255,214,0,0.15)',   color: '#FFD600', label: 'FUTURO'      },
  }
  let s = cfg[status] ?? cfg.agendado
  if (status === 'agendado' && passouData) {
    s = cfg.encerrado
  }
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#606070', padding: '20px 0' }}>
      <div style={{ width: 18, height: 18, border: '2px solid #333', borderTopColor: '#00C853', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      Carregando...
    </div>
  )
}

function EmptyState({ icon, texto }: { icon: string; texto: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 0', color: '#606070' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      {texto}
    </div>
  )
}
