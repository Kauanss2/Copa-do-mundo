import { prisma } from '../libs/prisma'
import { calcularTodasPontuacoes } from '../services/pontuacao.service'

const STATUS_MAP: Record<string, string> = {
  FINISHED:  'encerrado',
  IN_PLAY:   'em_andamento',
  PAUSED:    'em_andamento',
  TIMED:     'agendado',
  SCHEDULED: 'agendado',
  CANCELLED: 'cancelado',
  POSTPONED: 'cancelado',
}

const COMPETICOES = ['WC']

export async function sincronizarJogos() {
  console.log('🔄 Sincronizando jogos...')
  let total = 0

  for (const competicaoId of COMPETICOES) {
    const url = `https://api.football-data.org/v4/competitions/${competicaoId}/matches`

    console.log(`Buscando dados da competição ${competicaoId}...`)
    const res = await fetch(url, {
      headers: { 'X-Auth-Token': 'd8787e4307fe4bf9b6283822473d3d5E' },
    })

    if (!res.ok) {
      console.error(`Erro ao buscar competição ${competicaoId}: ${res.status}`)
      continue
    }

    const data = await res.json()

    for (const m of data.matches) {
      const status = STATUS_MAP[m.status] ?? 'agendado'

      let golsCasa: number | null = null
      let golsVisitante: number | null = null

      if (status === 'encerrado') {
        const usarRegularTime = m.score.duration !== 'REGULAR'
        const placar = usarRegularTime ? m.score.regularTime : m.score.fullTime

        golsCasa      = placar?.home ?? null
        golsVisitante = placar?.away ?? null
      }

      await prisma.jogo.updateMany({
        where: { apiId: String(m.id) },
        data:  { status, golsCasa, golsVisitante },
      })

      total++
    }

    await calcularTodasPontuacoes()
    console.log(`✓ Competição ${competicaoId} sincronizada`)
  }

  console.log(`✓ ${total} jogos atualizados`)
}

if (require.main === module) {
  sincronizarJogos()
    .then(() => prisma.$disconnect())
    .catch(e => {
      console.error(e)
      prisma.$disconnect()
      process.exit(1)
    })
}