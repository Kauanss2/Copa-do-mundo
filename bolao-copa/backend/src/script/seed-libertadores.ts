import { prisma } from '../libs/prisma'
import libertadores from './libertadores.json'

interface TimeAPI {
  id:        number | null
  name:      string | null
  shortName: string | null
  tla:       string | null
  crest:     string | null
}

interface JogoAPI {
  id:       number
  utcDate:  string
  status:   string
  matchday: number | null
  stage:    string
  group:    string | null
  homeTeam: TimeAPI
  awayTeam: TimeAPI
  score:    { fullTime: { home: number | null; away: number | null } }
}

const FASE_MAP: Record<string, string> = {
  GROUP_STAGE:    'grupos',
  ROUND_1:        'primeira-fase',
  ROUND_2:        'segunda-fase',
  ROUND_3:        'terceira-fase',
  LAST_16:        'oitavas',
  QUARTER_FINALS: 'quartas',
  SEMI_FINALS:    'semi',
  FINAL:          'final',
}

const STATUS_MAP: Record<string, string> = {
  FINISHED:  'encerrado',
  IN_PLAY:   'em_andamento',
  PAUSED:    'em_andamento',
  TIMED:     'agendado',
  SCHEDULED: 'agendado',
  CANCELLED: 'cancelado',
  POSTPONED: 'cancelado',
}

async function seed() {
  console.log('\n🌱 Seed Libertadores 2026...\n')

  const edicao = await prisma.edicaoCampeonato.upsert({
    where:  { apiId: '2152' },
    update: {},
    create: {
      apiId:    '2152',
      nome:     'Copa Libertadores 2026',
      ano:      2026,
      inicioEm: new Date('2026-02-04'),
      fimEm:    new Date('2026-11-28'),
    },
  })
  console.log('✓ Edição criada/verificada')

  const timesMap = new Map<string, any>()
  for (const jogo of (libertadores as any).matches) {
    for (const time of [jogo.homeTeam, jogo.awayTeam]) {
      if (!time.id || !time.name) continue
      const key = String(time.id)
      if (!timesMap.has(key)) {
        timesMap.set(key, {
          apiId:       key,
          nome:        time.name,
          nomeCurto:   time.shortName ?? time.name,
          sigla:       time.tla       ?? '',
          bandeiraUrl: time.crest     ?? '',
          grupoFase:   jogo.group ?? null,
        })
      }
    }
  }

  for (const time of timesMap.values()) {
    await prisma.time.upsert({
      where:  { apiId: time.apiId },
      update: {},
      create: time,
    })
  }
  console.log(`✓ ${timesMap.size} times inseridos`)

  const todosOsTimes = await prisma.time.findMany()
  const timeIdMap    = new Map(todosOsTimes.map(t => [t.apiId, t.id]))

  let total = 0, pulados = 0
  for (const m of (libertadores as any).matches) {
    const timeCasaId      = m.homeTeam.id ? timeIdMap.get(String(m.homeTeam.id)) ?? null : null
    const timeVisitanteId = m.awayTeam.id ? timeIdMap.get(String(m.awayTeam.id)) ?? null : null
    const status          = STATUS_MAP[m.status] ?? 'agendado'
    const golsCasa        = status === 'encerrado' ? (m.score.fullTime.home ?? null) : null
    const golsVisitante   = status === 'encerrado' ? (m.score.fullTime.away ?? null) : null

    if (!timeCasaId && !timeVisitanteId && m.stage !== 'GROUP_STAGE') {
      pulados++
      continue
    }

    await prisma.jogo.upsert({
      where:  { apiId: String(m.id) },
      update: { status, golsCasa, golsVisitante, timeCasaId, timeVisitanteId },
      create: {
        apiId: String(m.id),
        edicaoId: edicao.id,
        timeCasaId,
        timeVisitanteId,
        fase:      FASE_MAP[m.stage] ?? m.stage,
        grupoFase: m.group    ?? null,
        rodada:    m.matchday ?? null,
        golsCasa,
        golsVisitante,
        status,
        inicioEm:  new Date(m.utcDate),
      },
    })
    total++
  }

  console.log(`✓ ${total} jogos inseridos (${pulados} pulados - times TBD)`)
  console.log('\n🎉 Concluído!')
  await prisma.$disconnect()
}

seed().catch(e => {
  console.error(e)
  prisma.$disconnect()
  process.exit(1)
})