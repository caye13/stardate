import { router } from '../trpc'
import { authRouter } from './auth'
import { journalRouter } from './journal'

export const appRouter = router({
  auth: authRouter,
  journal: journalRouter,
})

export type AppRouter = typeof appRouter
