import { Agent, run } from '@openai/agents';
import 'dotenv/config';
import { z } from 'zod';

// Lesson 06
// Goal:
// Make the first transition from plain Responses API calls to the Agents SDK.
//
// What this lesson should teach:
// 1. What an Agent object is
// 2. How an agent receives instructions
// 3. How to run one simple agent end-to-end
// 4. How this differs from calling client.responses.create(...) manually
//
// Suggested logistics scenario:
// - "Explain incident status" for one shipment or warehouse incident
//
// What to add here later:
// 1. Install and import the Agents SDK pieces you want to study
// 2. Create one small agent with a narrow role
// 3. Pass a simple user message into the agent
// 4. Print the final result and inspect the run shape
//
// Keep this lesson intentionally small:
// - no handoffs yet
// - no shared state yet
// - no tracing deep dive yet
// - at most one tiny tool if you really need it

const calendarEvent = z.object({
  name: z.string(),
  date: z.string(),
  participants: z.array(z.string()),
});

const agent = new Agent({
  name: 'Calendar extractor',
  instructions: 'Extract calendar events from text.',
  model: 'gpt-5.4-mini',
  outputType: calendarEvent,
});

async function main() {
  const result = await run(agent, 'Dinner with Priya and Sam on Friday.');
  console.log(result.finalOutput);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`agent example failed: ${message}`);
  process.exitCode = 1;
});
