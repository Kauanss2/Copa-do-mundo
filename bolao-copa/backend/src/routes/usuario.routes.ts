import { Router } from 'express'
import {
  createUserController,
  getAllUsersController,
  resetPasswordController,
} from '../controllers/Usuario.controller.js'

const router = Router()

router.post('/', createUserController)
router.get('/',  getAllUsersController)
router.post('/reset-password', resetPasswordController)

export default router