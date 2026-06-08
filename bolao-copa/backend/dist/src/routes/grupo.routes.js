"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const grupo_controller_1 = require("../controllers/grupo.controller");
const router = (0, express_1.Router)();
// Todas as rotas de grupo precisam de autenticação
router.use(auth_middleware_1.authMiddleware);
router.post('/', grupo_controller_1.criarGrupoController);
router.post('/entrar', grupo_controller_1.entrarNoGrupoController);
router.get('/', grupo_controller_1.listarMeusGruposController);
router.patch('/:grupoId/membros/:membroId/aprovar', grupo_controller_1.aprovarMembroController);
router.delete('/:grupoId/membros/:membroId/rejeitar', grupo_controller_1.rejeitarMembroController);
router.get('/:id', grupo_controller_1.verGrupoController);
exports.default = router;
