import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import {
    criarPalpiteController,
    editarPalpiteController,
    listarMeusPalpitesController,
} from '../controllers/palpite.controller'

const router = Router()

router.use(authMiddleware)

router.post('/', criarPalpiteController)
router.put('/', editarPalpiteController)
router.get('/', listarMeusPalpitesController)

export default router