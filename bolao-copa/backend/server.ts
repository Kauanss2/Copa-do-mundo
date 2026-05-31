import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import usuarioRoutes from './src/routes/usuario.routes'
import authRoutes from './src/routes/auth/loginAuth.routes'
import grupoRoutes from './src/routes/grupo.routes'
import palpiteRoutes from './src/routes/palpite.routes'
import jogoRoutes from './src/routes/jogo.routes'
import { prisma } from './src/libs/prisma'



dotenv.config()

const app = express()
const PORT = process.env.PORT || 3333

app.use(cors())
app.use(express.json())

// Rotas públicas
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`)
  next()
})
app.use('/usuarios', usuarioRoutes)
app.use('/auth', authRoutes)
app.use('/grupos', grupoRoutes)
app.use('/palpites', palpiteRoutes)
app.use('/jogos', jogoRoutes)
app.get('/edicoes', async (req, res) => {
  const edicoes = await prisma.edicaoCampeonato.findMany({
    orderBy: { ano: 'desc' },
    select: { id: true, nome: true, ano: true },
  })
  return res.json(edicoes)
})

import { sincronizarJogos } from './src/script/sync-jogos'

// Rota protegida por chave secreta — só o Railway chama
app.post('/sync/jogos', async (req, res) => {
  const chave = req.headers['x-sync-key']
  if (chave !== process.env.SYNC_SECRET) {
    return res.status(401).json({ error: 'Não autorizado' })
  }

  try {
    await sincronizarJogos()
    return res.json({ ok: true, hora: new Date().toISOString() })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Erro ao sincronizar' })
  }
})

import { calcularTodasPontuacoes } from './src/services/pontuacao.service'

app.post('/sync/pontuacao', async (req, res) => {
  const chave = req.headers['x-sync-key']
  if (chave !== process.env.SYNC_SECRET) {
    return res.status(401).json({ error: 'Não autorizado' })
  }
  try {
    await calcularTodasPontuacoes()
    return res.json({ ok: true })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Erro ao calcular pontuação' })
  }
})


app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})