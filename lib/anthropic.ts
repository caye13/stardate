import Anthropic from "@anthropic-ai/sdk";

/**
 * Initializes a single, reusable Anthropic client instance.
 * This prevents creating a new client for every API call, which is more efficient.
 * The API key is securely read from your environment variables.
 */
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
