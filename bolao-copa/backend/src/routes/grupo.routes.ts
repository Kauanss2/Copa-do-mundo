import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import {
    criarGrupoController,
    entrarNoGrupoController,
    listarMeusGruposController,
    verGrupoController,aprovarMembroController,rejeitarMembroController
} from '../controllers/grupo.controller'

const router = Router()

// Todas as rotas de grupo precisam de autenticação
router.use(authMiddleware)

router.post('/', criarGrupoController)
router.post('/entrar', entrarNoGrupoController)
router.get('/', listarMeusGruposController)

router.patch('/:grupoId/membros/:membroId/aprovar',  aprovarMembroController)
router.delete('/:grupoId/membros/:membroId/rejeitar', rejeitarMembroController)

router.get('/:id', verGrupoController)

export default router