import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import api from '../services/api'

interface Time {
  id:          string
  nome:        string
  sigla:       string
  bandeiraUrl: string
}

interface Jogo {
  id:               string
  timeCasaId:       string | null
  timeVisitanteId:  string | null
  timeCasa:         Time | null
  timeVisitante:    Time | null
  fase:             string
  grupoFase:        string | null
  golsCasa:         number | null
  golsVisitante:    number | null
  status:           string
  inicioEm:         string
}

interface Grupo {
  id:       string
  nome:     string
  edicaoId: string
}

function podeApostar(inicioEm: string) {
  return (new Date(inicioEm).getTime() - Date.now()) > 2 * 60 * 60 * 1000
}

export default function Jogos() {
  const [fase, setFase]         = useState('todos')
  const [grupoId, setGrupoId]   = useState('')
  const [palpites, setPalpites] = useState<Record<string, { casa: number; visitante: number }>>({})

  // Busca grupos do usuário
  const { data: grupos = [] } = useQuery<Grupo[]>({
    queryKey: ['grupos'],
    queryFn:  () => api.get('/grupos').then(r => r.data)
  })

  // Deriva o grupo e edicaoId selecionados
  const grupoSelecionado = useMemo(
    () => grupos.find(g => g.id === grupoId) ?? null,
    [grupos, grupoId]
  )
  const edicaoId = grupoSelecionado?.edicaoId

  // Busca jogos filtrados pela edição do grupo selecionado
const { data: jogos = [], isLoading } = useQuery<Jogo[]>({
  queryKey: ['jogos', edicaoId, grupoId],
  queryFn: () =>
    api.get('/jogos', {
      params: {
        edicaoId,
        grupoId
      }
    }).then(r => r.data),
  enabled: !!edicaoId && !!grupoId
})

  // Fases disponíveis dinamicamente com base nos jogos retornados
  const fasesDisponiveis = useMemo(() => {
    const unicas = Array.from(new Set(jogos.map(j => j.fase)))
    return ['todos', ...unicas]
  }, [jogos])

  // Reseta a fase quando trocar de grupo (evita fase inválida)
  function handleGrupoChange(novoGrupoId: string) {
    setGrupoId(novoGrupoId)
    setFase('todos')
  }

  const filtrados = useMemo(
    () => fase === 'todos' ? jogos : jogos.filter(j => j.fase === fase),
    [jogos, fase]
  )

  async function apostar(jogoId: string) {
    const p = palpites[jogoId]
    if (!p || !grupoId) return
    try {
      await api.post('/palpites', {
        jogoId,
        grupoId,
        golsCasa:      p.casa,
        golsVisitante: p.visitante
      })
      alert('Palpite registrado!')
    } catch (e: any) {
      alert(e.response?.data?.error || 'Erro ao registrar palpite')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">

      {/* Seletor de grupo — agora vem primeiro pois é o pivô de tudo */}
      <select
        value={grupoId}
        onChange={e => handleGrupoChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-white/10 text-sm outline-none mb-5 text-white"
        style={{ background: '#13131a' }}
      >
        <option value="">Selecione um grupo para ver os jogos</option>
        {grupos.map(g => (
          <option key={g.id} value={g.id}>{g.nome}</option>
        ))}
      </select>

      {/* Estado: nenhum grupo selecionado */}
      {!grupoId && (
        <div className="text-center py-16 text-gray-500">
          Selecione um grupo para ver os jogos da competição
        </div>
      )}

      {/* Estado: carregando */}
      {grupoId && isLoading && (
        <div className="flex items-center justify-center h-64 gap-3 text-gray-500">
          <div className="w-5 h-5 border-2 border-gray-700 border-t-[#00C853] rounded-full animate-spin" />
          Carregando jogos...
        </div>
      )}

      {/* Filtro de fases — dinâmico conforme jogos da edição */}
      {grupoId && !isLoading && jogos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {fasesDisponiveis.map(f => (
            <button
              key={f}
              onClick={() => setFase(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${
                fase === f
                  ? 'bg-[#00C853] border-[#00C853] text-black'
                  : 'border-white/10 text-gray-400 hover:border-[#00C853]'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Estado: sem jogos */}
      {grupoId && !isLoading && filtrados.length === 0 && (
        <div className="text-center py-16 text-gray-500">Nenhum jogo encontrado</div>
      )}

      {/* Lista de jogos */}
      {filtrados.map(j => {
        const temTimes = j.timeCasaId && j.timeVisitanteId
        const pode     = podeApostar(j.inicioEm) && !!temTimes && j.status === 'agendado'
        const p        = palpites[j.id] || { casa: 0, visitante: 0 }

        return (
          <div
            key={j.id}
            className="rounded-2xl border border-white/10 p-4 mb-3 hover:border-[#00C853]/30 transition-colors"
            style={{ background: '#13131a' }}
          >
            {/* Times */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 flex flex-col items-center gap-2">
                {j.timeCasa?.bandeiraUrl
                  ? <img src={j.timeCasa.bandeiraUrl} className="w-10 h-10 object-contain" onError={e => (e.currentTarget.style.display = 'none')} />
                  : <span className="text-3xl">🏳️</span>}
                <span className="text-xs font-medium text-center">{j.timeCasa?.sigla || j.timeCasa?.nome || '?'}</span>
              </div>

              <div className="flex flex-col items-center gap-1 min-w-16">
                <div style={{ fontFamily: '"Bebas Neue"', fontSize: 28, letterSpacing: 2 }}>
                  {j.status !== 'agendado'
                    ? `${j.golsCasa ?? 0} : ${j.golsVisitante ?? 0}`
                    : 'x'}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(j.inicioEm).toLocaleString('pt-BR', {
                    day:    '2-digit',
                    month:  '2-digit',
                    hour:   '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  j.status === 'agendado'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : j.status === 'em_andamento'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {j.status.replace('_', ' ')}
                </span>
              </div>

              <div className="flex-1 flex flex-col items-center gap-2">
                {j.timeVisitante?.bandeiraUrl
                  ? <img src={j.timeVisitante.bandeiraUrl} className="w-10 h-10 object-contain" onError={e => (e.currentTarget.style.display = 'none')} />
                  : <span className="text-3xl">🏳️</span>}
                <span className="text-xs font-medium text-center">{j.timeVisitante?.sigla || j.timeVisitante?.nome || '?'}</span>
              </div>
            </div>

            {/* Input palpite */}
            {pode && grupoId && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
                <input
                  type="number" min={0} max={20} value={p.casa}
                  onChange={e => setPalpites(prev => ({ ...prev, [j.id]: { ...p, casa: +e.target.value } }))}
                  className="w-14 text-center py-2 rounded-lg border border-white/10 text-white outline-none focus:border-[#00C853]"
                  style={{ fontFamily: '"Bebas Neue"', fontSize: 20, background: '#1c1c26' }}
                />
                <span style={{ fontFamily: '"Bebas Neue"', fontSize: 20, color: '#9090a0' }}>x</span>
                <input
                  type="number" min={0} max={20} value={p.visitante}
                  onChange={e => setPalpites(prev => ({ ...prev, [j.id]: { ...p, visitante: +e.target.value } }))}
                  className="w-14 text-center py-2 rounded-lg border border-white/10 text-white outline-none focus:border-[#00C853]"
                  style={{ fontFamily: '"Bebas Neue"', fontSize: 20, background: '#1c1c26' }}
                />
                <button
                  onClick={() => apostar(j.id)}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold text-black transition-all hover:-translate-y-0.5"
                  style={{ background: '#00C853' }}
                >
                  Apostar
                </button>
              </div>
            )}

            {!temTimes && (
              <div className="mt-3 text-center text-xs text-gray-500">Times a definir</div>
            )}
            {!grupoId && pode && (
              <div className="mt-3   text-center text-xs text-yellow-400">Selecione um grupo para apostar</div>
            )}
          </div>
        )
      })}
    </div>
  )
}