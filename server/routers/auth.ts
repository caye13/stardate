import { z } from 'zod'
import { router, publicProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { createAdminClient } from '@/lib/supabase/server'

export const authRouter = router({
  signUp: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string().min(6) }))
    .mutation(async ({ ctx, input }) => {
      // Use admin client for privileged user creation
      const adminClient = createAdminClient()

      const { data, error } = await adminClient.auth.admin.createUser({
        email: input.email,
        password: input.password,
        email_confirm: true, // Auto-confirm email
      })

      if (error) throw new TRPCError({ code: 'BAD_REQUEST', message: error.message })

      if (data.user) {
        await ctx.prisma.user.create({
          data: { id: data.user.id, email: data.user.email! },
        })
      }

      return { user: data.user }
    }),

  signIn: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      })

      if (error) throw new TRPCError({ code: 'UNAUTHORIZED', message: error.message })

      return { user: data.user }
    }),

  signOut: publicProcedure.mutation(async ({ ctx }) => {
    await ctx.supabase.auth.signOut()
    return { success: true }
  }),

  getUser: publicProcedure.query(async ({ ctx }) => {
    const { data: { user } } = await ctx.supabase.auth.getUser()
    return { user }
  }),
})
