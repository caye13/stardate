// src/server/routers/officer.ts
import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'

export const officerRouter = router({
  create: protectedProcedure
    .input(z.object({
      title: z.string(),
      content: z.string(),
      department: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.officerEntry.create({
        data: {
          title: input.title,
          content: input.content,
          department: input.department,
          userId: ctx.userId,
        },
      })
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.officerEntry.findMany({
      orderBy: { createdAt: 'desc' },
      include: { 
        user: {
          select: { 
            email: true 
          }
        },
      },
    })
  }),

  listByDepartment: protectedProcedure
    .input(z.object({ department: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.officerEntry.findMany({
        where: {
          department: input.department,
        },
        orderBy: { createdAt: 'desc' },
      })
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.officerEntry.findFirst({
        where: { id: input.id, userId: ctx.userId },
      })
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: z.string(),
      content: z.string(),
      department: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.officerEntry.update({
        where: { id: input.id },
        data: {
          title: input.title,
          content: input.content,
          department: input.department,
        },
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.officerEntry.delete({
        where: { id: input.id },
      })
    }),

  // Get all unique departments for the current user
  getDepartments: protectedProcedure.query(async ({ ctx }) => {
    const entries = await ctx.prisma.officerEntry.findMany({
      where: { userId: ctx.userId },
      select: { department: true },
      distinct: ['department'],
    })
    return entries.map(e => e.department)
  }),
})
