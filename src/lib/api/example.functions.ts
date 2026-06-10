import { z } from "zod";

// Example async function. Previously used TanStack Server Functions
// Now converted to a simple async utility function

export async function getGreeting(input: { name: string }) {
  const data = z.object({ name: z.string().min(1) }).parse(input);
  
  return {
    greeting: `Hello, ${data.name}!`,
    mode: process.env.NODE_ENV ?? "unknown",
  };
}
