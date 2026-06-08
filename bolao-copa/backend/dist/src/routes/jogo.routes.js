"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const jogo_controller_1 = require("../controllers/jogo.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.get('/', jogo_controller_1.listarJogosController); // ← era /:edicaoId, agora é /
exports.default = router;
