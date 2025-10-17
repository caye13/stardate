import type { PrismaClient } from '@prisma/client';
import { anthropic } from '@/lib/anthropic';
import { buildKaizenPrompt } from '@/utils/prompt';

type Context = {
  prisma: PrismaClient;
};

/**
 * The core logic for running the Kaizen analysis. This function is now
 * separate from the tRPC router, so it can be called from other services.
 * @param ctx The tRPC context, we only need prisma from it.
 */
export async function runKaizenAnalysisLogic(ctx: Context) {
  console.log("Fetching recent officer entries for analysis...");

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const entries = await ctx.prisma.officerEntry.findMany({
    where: {
      createdAt: { gte: sevenDaysAgo },
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { email: true },
      },
    },
  });

  if (entries.length === 0) {
    console.log("No recent entries to analyze.");
    return;
  }

  console.log(`Found ${entries.length} entries. Building prompt...`);
  const prompt = buildKaizenPrompt(entries);

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 13000,
    system: "You are a Starship Command efficiency analyst. Your response MUST be a valid JSON object.",
    messages: [{ role: 'user', content: prompt }],
  });

  const rawText = response.content[0]?.type === 'text' ? response.content[0].text : "";

  // Regex to find a JSON block within markdown ```json ... ``` fences.
  const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
  const match = rawText.match(jsonRegex);
  let jsonString = rawText;

  // If the regex finds a match, use the captured group (the actual JSON).
  if (match && match[1]) {
    jsonString = match[1];
  }
  const { orders } = JSON.parse(jsonString) as { orders: any[] };

  console.log(`AI analysis complete. Found ${orders.length} potential improvements.`);

  const report = await ctx.prisma.analysisReport.create({
    data: {
      rawOutput: jsonString,
      orders: {
        create: orders.map(order => ({
          department: order.department,
          severity: order.severity,
          description: order.description,
        })),
      },
    },
  });

  console.log(`Successfully saved analysis report ${report.id} with ${orders.length} orders.`);
  return report;
}
