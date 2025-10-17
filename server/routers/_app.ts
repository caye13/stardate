import { router } from '../trpc'
import { audioRouter } from './audio'
import { authRouter } from './auth'
import { improvementOrdersRouter } from './improvementOrders'
import { journalRouter } from './journal'
import { officerRouter } from './officer'

export const appRouter = router({
  auth: authRouter,
  journal: journalRouter,
  audio: audioRouter,
  officer: officerRouter,
  improvementOrders: improvementOrdersRouter,
})

export type AppRouter = typeof appRouter

