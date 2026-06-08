"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Usuario_controller_js_1 = require("../controllers/Usuario.controller.js");
const router = (0, express_1.Router)();
router.post('/', Usuario_controller_js_1.createUserController);
router.get('/', Usuario_controller_js_1.getAllUsersController);
router.post('/reset-password', Usuario_controller_js_1.resetPasswordController);
exports.default = router;
