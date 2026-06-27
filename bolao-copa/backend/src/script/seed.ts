import { prisma } from '../libs/prisma'
import copa2026 from './copa2026.json'

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

  // 1. Edição da Copa
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

  // 2. Coleta times únicos
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

    // ✅ MUDANÇA 1: loop em vez de dois ifs duplicados
    // ✅ MUDANÇA 2: atualiza grupoFase se o time já existe mas ainda estava null
    for (const team of [homeTeam, awayTeam]) {
      if (!team.id) continue
      const key      = String(team.id)
      const existing = timesMap.get(key)

      if (!existing || (!existing.grupoFase && group)) {
        timesMap.set(key, {
          apiId:       key,
          nome:        team.name,
          nomeCurto:   team.shortName ?? team.name,
          sigla:       team.tla       ?? '',
          bandeiraUrl: team.crest     ?? '',
          grupoFase:   group ?? existing?.grupoFase ?? null,
        })
      }
    }
  }

  for (const time of timesMap.values()) {
    await prisma.time.upsert({
      where:  { apiId: time.apiId },
      // ✅ MUDANÇA 3: update preenchido — antes era {} e nunca atualizava nada
      update: {
        nome:        time.nome,
        nomeCurto:   time.nomeCurto,
        sigla:       time.sigla,
        bandeiraUrl: time.bandeiraUrl,
        // grupoFase propositalmente fora: não faz sentido mudar após definido no banco
      },
      create: time,
    })
  }
  console.log(`✓ ${timesMap.size} times inseridos`)

  // 3. Mapa apiId → uuid do banco
  const todosOsTimes = await prisma.time.findMany()
  const timeIdMap    = new Map(todosOsTimes.map(t => [t.apiId, t.id]))

  // 4. Jogos
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
      update: {
        // ✅ MUDANÇA 4: spread condicional — só atualiza se o valor vier definido
        // Evita sobrescrever timeCasaId/timeVisitanteId com null nas fases
        // eliminatórias onde o time ainda não foi definido na API
        ...(timeCasaId      && { timeCasaId }),
        ...(timeVisitanteId && { timeVisitanteId }),

        // ✅ MUDANÇA 5: status nunca regride
        // Se o JSON ainda vem como SCHEDULED, não toca no status atual do banco
        ...(m.status === 'FINISHED' && { status: 'finalizado'    }),
        ...(m.status === 'IN_PLAY'  && { status: 'em_andamento'  }),

        // Data e rodada podem mudar legitimamente (adiamentos, etc.)
        inicioEm: new Date(m.utcDate),
        ...(m.matchday !== null && { rodada: m.matchday }),
      },
      create: {
        apiId:         String(m.id),
        edicaoId:      edicao.id,
        timeCasaId,
        timeVisitanteId,
        fase:          FASE_MAP[m.stage] ?? m.stage,
        grupoFase:     m.group    ?? null,
        rodada:        m.matchday ?? null,
        golsCasa:      null,
        golsVisitante: null,
        status:        'agendado',
        inicioEm:      new Date(m.utcDate),
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