import { Agent, run, withTrace } from '@openai/agents';
import 'dotenv/config';

// Lesson 10
// Goal:
// Learn how to inspect what the agent did during a run.
//
// Suggested logistics scenario:
// - trace how an incident-summary agent reasoned through tools and steps
//
// What to focus on:
// 1. What tracing is useful for
// 2. Where to inspect tool calls, steps, and outputs
// 3. How tracing helps debug wrong behavior
// 4. How to compare expected flow vs actual flow
//
// What to add here later:
// 1. A traced agent run
// 2. Console logging or inspection output
// 3. Notes on what you learned from the trace
//
// Keep this lesson observational:
// - do not add lots of new behavior here
// - reuse a small scenario you already understand from earlier lessons

const agent = new Agent({
  name: 'Logistics incident assistant',
  instructions:
    'Write short logistics incident summaries and follow-up recommendations.',
  model: 'gpt-5.4-mini',
});

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      'OPENAI_API_KEY is missing. Add it to your environment before running agent-tracing.',
    );
  }

  await withTrace('logistics-incident-trace', async () => {
    const first = await run(
      agent,
      'Summarize this incident: shipment SHP-204 arrived with damaged cargo at the warehouse.',
    );

    const second = await run(
      agent,
      `Based on this summary, suggest the next operational step: ${first.finalOutput}`,
    );

    console.log('Summary:', first.finalOutput);
    console.log('Next step:', second.finalOutput);
  });
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`agent-tracing failed: ${message}`);
  process.exitCode = 1;
});
