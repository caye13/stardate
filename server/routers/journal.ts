import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'

export const journalRouter = router({
  create: protectedProcedure
    .input(z.object({ title: z.string(), content: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.journalEntry.create({
        data: {
          title: input.title,
          content: input.content,
          userId: ctx.userId,
        },
      })
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.journalEntry.findMany({
      where: { userId: ctx.userId },
      orderBy: { createdAt: 'desc' },
    })
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.journalEntry.findFirst({
        where: { id: input.id, userId: ctx.userId },
      })
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string(), title: z.string(), content: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.journalEntry.update({
        where: { id: input.id },
        data: { title: input.title, content: input.content },
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.journalEntry.delete({
        where: { id: input.id },
      })
    }),
})
