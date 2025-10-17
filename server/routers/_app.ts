import { router } from '../trpc'
import { audioRouter } from './audio'
import { authRouter } from './auth'
import { journalRouter } from './journal'
import { officerRouter } from './officer'

export const appRouter = router({
  auth: authRouter,
  journal: journalRouter,
  audio: audioRouter,
  officer: officerRouter,
})

export type AppRouter = typeof appRouter

