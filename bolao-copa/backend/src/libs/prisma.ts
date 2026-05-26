import { PrismaClient } from '../generated/prisma/client.js'
import { createPool } from 'mysql2'

const pool = createPool(process.env.DATABASE_URL!)

console.log('Conectando ao banco de dados...')
const prisma = new PrismaClient({ adapter: pool as any })

export { prisma } 