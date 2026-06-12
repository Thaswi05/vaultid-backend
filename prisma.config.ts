import path from 'path'
import { defineConfig } from 'prisma/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { config } from 'dotenv'

config()

export default defineConfig({
  earlyAccess: true,
  schema: path.join('prisma', 'schema.prisma'),
  migrate: {
    adapter: async () => {
      return new PrismaPg({ connectionString: process.env.DATABASE_URL })
    }
  },
  datasource: {
    url: process.env.DATABASE_URL as string
  }
})