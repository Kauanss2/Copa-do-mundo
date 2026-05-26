import { PrismaMariaDb } from "@prisma/adapter-mariadb"
import { PrismaClient } from '../generated/prisma/client.js'

const adapter = new PrismaMariaDb({
  host:            process.env.DATABASE_HOST,
  user:            process.env.DATABASE_USER,
  password:        process.env.DATABASE_PASSWORD,
  database:        process.env.DATABASE_NAME,
  port:            Number(process.env.DATABASE_PORT),
  connectionLimit: 5,
})

console.log('DB HOST:', process.env.DATABASE_HOST)
console.log('DB PORT:', process.env.DATABASE_PORT)
console.log('DB USER:', process.env.DATABASE_USER)
console.log('DB NAME:', process.env.DATABASE_NAME)

const prisma = new PrismaClient({ adapter })

export { prisma }