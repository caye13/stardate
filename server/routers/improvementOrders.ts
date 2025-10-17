// server/routers/improvementOrders.ts
import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const improvementOrdersRouter = router({
  // Create a new analysis report with improvement orders
  createAnalysisReport: protectedProcedure
    .input(z.object({
      rawOutput: z.string(),
      orders: z.array(z.object({
        department: z.string(),
        severity: z.enum(['low', 'medium', 'high', 'critical']),
        description: z.string(),
        status: z.string().default('pending'),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const report = await ctx.prisma.analysisReport.create({
        data: {
          rawOutput: input.rawOutput,
          orders: {
            create: input.orders,
          },
        },
        include: {
          orders: true,
        },
      })
      return report
    }),

  // Get all improvement orders with optional filters
  getImprovementOrders: protectedProcedure
    .input(z.object({
      department: z.string().optional(),
      severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      status: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const where: any = {}

      if (input?.department && input.department !== 'All Departments') {
        where.department = input.department
      }
      if (input?.severity) {
        where.severity = input.severity
      }
      if (input?.status) {
        where.status = input.status
      }

      const orders = await ctx.prisma.improvementOrder.findMany({
        where,
        include: {
          analysisReport: {
            select: {
              id: true,
              createdAt: true,
            },
          },
        },
        orderBy: [
          { status: 'asc' }, // pending first
          {
            severity: 'asc' // This will need custom sorting in code
          },
          { createdAt: 'desc' },
        ],
      })

      // Custom sort by severity (critical > high > medium > low)
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      return orders.sort((a, b) => {
        if (a.status !== b.status) {
          return a.status === 'pending' ? -1 : 1
        }
        return severityOrder[a.severity as keyof typeof severityOrder] -
          severityOrder[b.severity as keyof typeof severityOrder]
      })
    }),

  // Update improvement order status
  updateOrderStatus: protectedProcedure
    .input(z.object({
      id: z.string(),
      status: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.prisma.improvementOrder.update({
        where: { id: input.id },
        data: { status: input.status },
      })
      return order
    }),

  // Toggle order completion (mark as completed or reopen)
  toggleOrderComplete: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.prisma.improvementOrder.findUnique({
        where: { id: input.id },
      })

      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found',
        })
      }

      const newStatus = order.status === 'completed' ? 'pending' : 'completed'

      const updatedOrder = await ctx.prisma.improvementOrder.update({
        where: { id: input.id },
        data: { status: newStatus },
      })

      return updatedOrder
    }),

  // Delete an improvement order
  deleteOrder: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.improvementOrder.delete({
        where: { id: input.id },
      })
      return { success: true }
    }),

  // Get a specific analysis report with all orders
  getAnalysisReport: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const report = await ctx.prisma.analysisReport.findUnique({
        where: { id: input.id },
        include: {
          orders: {
            orderBy: { createdAt: 'desc' },
          },
        },
      })

      if (!report) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Report not found',
        })
      }

      return report
    }),

  // Get all analysis reports (summary view)
  getAnalysisReports: protectedProcedure
    .query(async ({ ctx }) => {
      const reports = await ctx.prisma.analysisReport.findMany({
        include: {
          orders: true,
        },
        orderBy: { createdAt: 'desc' },
      })
      return reports
    }),

  // Get statistics
  getOrderStats: protectedProcedure
    .query(async ({ ctx }) => {
      const allOrders = await ctx.prisma.improvementOrder.findMany()

      const stats = {
        total: allOrders.length,
        pending: allOrders.filter(o => o.status === 'pending').length,
        inProgress: allOrders.filter(o => o.status === 'in-progress').length,
        completed: allOrders.filter(o => o.status === 'completed').length,
        bySeverity: {
          critical: allOrders.filter(o => o.severity === 'critical').length,
          high: allOrders.filter(o => o.severity === 'high').length,
          medium: allOrders.filter(o => o.severity === 'medium').length,
          low: allOrders.filter(o => o.severity === 'low').length,
        },
        byDepartment: {} as Record<string, number>,
      }

      // Count by department
      allOrders.forEach(order => {
        stats.byDepartment[order.department] =
          (stats.byDepartment[order.department] || 0) + 1
      })

      return stats
    }),
})

// Don't forget to add this router to your main router:
// export const appRouter = router({
//   auth: authRouter,
//   improvementOrders: improvementOrdersRouter,
//   // ... other routers
// })
