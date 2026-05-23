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



app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})