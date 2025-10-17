import { OfficerEntry, User } from "@prisma/client";

// This defines the structure of the data we expect, combining Prisma's auto-generated types.
export type OfficerEntryWithUser = OfficerEntry & {
  user: {
    email: string | null;
  };
};

/**
 * Builds a structured prompt for Claude to analyze officer entries using the Kaizen philosophy.
 * @param entries An array of officer entries, each including the user's email.
 * @returns A system prompt string ready to be sent to the Anthropic API.
 */
export function buildKaizenPrompt(entries: OfficerEntryWithUser[]): string {
  // 1. Format each officer entry into a readable string.
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

  // 2. Construct the main system prompt with clear instructions.
  const systemPrompt = `You are a Starship Command efficiency analyst specializing in the Kaizen philosophy of continuous improvement. Your mission is to analyze the following daily logs from various department officers to identify inefficiencies and suggest actionable improvements.

Analyze the reports holistically. Identify areas of waste (Muda), inconsistency (Mura), and overburden (Muri). The logs are presented with the most recent entries first; please give special consideration to recent trends or newly emerging issues.

Based on your analysis, generate a list of improvement orders.

**IMPORTANT OUTPUT FORMAT:**
Your response MUST be a valid JSON object. It should contain a single key "orders", which is an array of order objects.
Each order object in the array must have three keys:
- "department": The specific department the order is for ("Engineering", "Medical", "Security", "Sciences", "Command", "Operations"
).
- "severity": The priority of the order. Must be one of: "low", "medium", "high", or "critical".
- "description": A concise, clear, and actionable order detailing the improvement to be made.

Do not include any text, pleasantries, or explanations outside of the JSON object.

Create orders where necessary. Not every department needs an order.

Example response format:
{
  "orders": [
    {
      "department": "Engineering",
      "severity": "high",
      "description": "Standardize the calibration procedure for main deflector dish power couplings to reduce setup time."
    },
    {
      "department": "Logistics",
      "severity": "medium",
      "description": "Create a cross-referencing protocol for the ship's inventory database to prevent redundant entries."
    }
  ]
}`;

  // 3. Return the complete user-facing prompt including the formatted entries.
  return `
${systemPrompt}

Here are the officer logs to analyze:
---
${formattedEntries}
`;
}
