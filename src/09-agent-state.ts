import { Agent, MemorySession, run } from '@openai/agents';
import 'dotenv/config';

// Lesson 09
// Goal:
// Understand how agent workflows keep and reuse state across multiple steps.
//
// Suggested logistics scenario:
// - collect incident facts first
// - ask a follow-up question
// - produce a final report that reuses earlier context
//
// What this lesson demonstrates:
// 1. A local in-memory session shared across multiple runs
// 2. How the second prompt can depend on the first answer
// 3. Why session state matters for follow-up questions
//
// Related idea:
// - For server-managed state, see src/agent/server-managed-sessions.ts

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      'OPENAI_API_KEY is missing. Add it to your environment before running agent-state.',
    );
  }

  const agent = new Agent({
    name: 'Logistics incident assistant',
    instructions:
      'Answer logistics incident questions briefly and reuse earlier context when the follow-up depends on it.',
    model: 'gpt-5.4-mini',
  });

  const session = new MemorySession();

  const firstTurn = await run(
    agent,
    'Incident INC-204 is about shipment SHP-204. The cargo arrived damaged at the warehouse.',
    { session },
  );
  console.log('First turn:', firstTurn.finalOutput);

  const secondTurn = await run(
    agent,
    'What shipment is affected and what is the issue?',
    { session },
  );
  console.log('Second turn:', secondTurn.finalOutput);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`agent-state failed: ${message}`);
  process.exitCode = 1;
});
