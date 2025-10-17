import type { OfficerEntry, User, ImprovementOrder } from "@prisma/client";

// This defines the structure of the data we expect, combining Prisma's auto-generated types.
export type OfficerEntryWithUser = OfficerEntry & {
  user: {
    email: string | null;
  };
};

/**
 * Builds a structured prompt for Claude to analyze officer entries using the Kaizen philosophy.
 * @param entries An array of officer entries, each including the user's email.
 * @param recentOrders An array of recently created improvement orders to avoid duplication.
 * @returns A system prompt string ready to be sent to the Anthropic API.
 */
export function buildKaizenPrompt(entries: OfficerEntryWithUser[], recentOrders: ImprovementOrder[]): string {
  // Format each officer entry into a readable string.
  const formattedEntries = entries
    .map((entry) => {
      return `
Date: ${entry.createdAt.toLocaleDateString()}
Officer: ${entry.user.email ?? "Unknown"}
Department: ${entry.department}
Report:
"${entry.content}"
`;
    })
    .join("\n---\n");

  // Format the recent orders into a simple list for the AI to reference.
  let formattedRecentOrders = "No recent orders on file.";
  if (recentOrders.length > 0) {
    formattedRecentOrders = recentOrders
      .map(order => `- [${order.department}] [${order.severity}]: ${order.description}`)
      .join("\n");
  }

  // Construct the main system prompt with the new instructions.
  const systemPrompt = `You are a Starship Command efficiency analyst specializing in the Kaizen philosophy of continuous improvement. Your mission is to analyze the following daily logs from various department officers to identify inefficiencies and suggest actionable improvements.

Analyze the reports holistically. The logs are presented with the most recent entries first; please give special consideration to recent trends or newly emerging issues.

Based on your analysis, generate a list of NEW improvement orders.

**IMPORTANT CONTEXT - EXISTING ORDERS:**
The following improvement orders have been created recently. **DO NOT** create new orders that are duplicates or address the exact same issue as the ones listed below. Your goal is to identify *new* areas for improvement.
---
${formattedRecentOrders}
---

**IMPORTANT OUTPUT FORMAT:**
Your response MUST be a valid JSON object. It should contain a single key "orders", which is an array of order objects. Each order object must have "department", "severity", and "description" keys. Do not include any text outside of the JSON object.`;

  // Return the complete user-facing prompt including the formatted entries.
  return `
${systemPrompt}

Here are the officer logs to analyze:
---
${formattedEntries}
`;
}
