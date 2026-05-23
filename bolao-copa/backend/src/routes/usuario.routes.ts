import { Router } from 'express'
import {
  createUserController,
  getAllUsersController,
} from '../controllers/Usuario.controller.js'

const router = Router()

router.post('/', createUserController)
router.get('/',  getAllUsersController)

export default router