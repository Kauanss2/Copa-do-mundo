import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import { listarJogosController } from '../controllers/jogo.controller'

const router = Router()

router.use(authMiddleware)

router.get('/', listarJogosController)  // ← era /:edicaoId, agora é /

export default router