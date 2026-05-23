import { prisma } from '../libs/prisma'
import copa2026 from './copa2026.json'


// Tipagem do JSON da API
interface TimeAPI {
  id:        number | null
  name:      string
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
}

interface CopaData {
  matches: JogoAPI[]
}


const FASE_MAP: Record<string, string> = {
  GROUP_STAGE:    'grupos',
  LAST_32:        'oitavas',
  LAST_16:        'quartas',
  QUARTER_FINALS: 'quartas',
  SEMI_FINALS:    'semi',
  THIRD_PLACE:    'terceiro',
  FINAL:          'final',
}

async function seed() {

  // 1. Cria a edição da Copa 2026
  console.log('Criando edição da Copa 2026...')
  const edicao = await prisma.edicaoCampeonato.upsert({
    where:  { apiId: '2000' },
    update: {},
    create: {
      apiId:    '2000',
      nome:     'FIFA World Cup 2026',
      ano:      2026,
      inicioEm: new Date('2026-06-11'),
      fimEm:    new Date('2026-07-19'),
    }
  })
  console.log('✓ Edição criada')

  // 2. Coleta times únicos do JSON
  console.log('Inserindo times...')
  const timesMap = new Map<string, {
    apiId:       string
    nome:        string
    nomeCurto:   string
    sigla:       string
    bandeiraUrl: string
    grupoFase:   string | null
  }>()

  for (const jogo of copa2026.matches) {
    const { homeTeam, awayTeam, group } = jogo

    if (homeTeam.id && !timesMap.has(String(homeTeam.id))) {
      timesMap.set(String(homeTeam.id), {
        apiId:       String(homeTeam.id),
        nome:        homeTeam.name,
        nomeCurto:   homeTeam.shortName ?? homeTeam.name,
        sigla:       homeTeam.tla       ?? '',
        bandeiraUrl: homeTeam.crest     ?? '',
        grupoFase:   group ?? null,
      })
    }

    if (awayTeam.id && !timesMap.has(String(awayTeam.id))) {
      timesMap.set(String(awayTeam.id), {
        apiId:       String(awayTeam.id),
        nome:        awayTeam.name,
        nomeCurto:   awayTeam.shortName ?? awayTeam.name,
        sigla:       awayTeam.tla       ?? '',
        bandeiraUrl: awayTeam.crest     ?? '',
        grupoFase:   group ?? null,
      })
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

  // 3. Monta mapa apiId -> uuid do banco
  const todosOsTimes = await prisma.time.findMany()
  const timeIdMap    = new Map(todosOsTimes.map(t => [t.apiId, t.id]))

  // 4. Insere todos os jogos
  console.log('Inserindo jogos...')
  let total = 0

  for (const m of copa2026.matches) {
    const timeCasaId      = m.homeTeam.id
      ? timeIdMap.get(String(m.homeTeam.id)) ?? null
      : null

    const timeVisitanteId = m.awayTeam.id
      ? timeIdMap.get(String(m.awayTeam.id)) ?? null
      : null

    await prisma.jogo.upsert({
      where:  { apiId: String(m.id) },
      update: {},
      create: {
        apiId:            String(m.id),
        edicaoId:         edicao.id,
        timeCasaId,
        timeVisitanteId,
        fase:             FASE_MAP[m.stage] ?? m.stage,
        grupoFase:        m.group    ?? null,
        rodada:           m.matchday ?? null,
        golsCasa:         null,
        golsVisitante:    null,
        status:           'agendado',
        inicioEm:         new Date(m.utcDate),
      }
    })

    total++
  }

  console.log(`✓ ${total} jogos inseridos`)
  console.log('\n🎉 Seed concluído!')
  await prisma.$disconnect()
}

seed().catch(e => {
  console.error(e)
  prisma.$disconnect()
  process.exit(1)
})