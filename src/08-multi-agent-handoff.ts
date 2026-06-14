import { Agent, run } from '@openai/agents';
import 'dotenv/config';

// Lesson 08
// Goal:
// Learn how one agent hands work off to another agent.
//
// Suggested logistics scenario:
// - dispatcher-agent gathers incident facts
// - analyst-agent writes the final operations summary
//
// What to focus on:
// 1. Why two agents are useful instead of one overloaded prompt
// 2. Clear boundaries between agent responsibilities
// 3. A simple handoff from agent A to agent B
// 4. Inspecting the final output after the handoff completes
//
// What to add here later:
// 1. Two small agents with distinct instructions
// 2. One handoff path with a predictable example request
// 3. Console output that makes the role split easy to see
//
// Keep this lesson simple:
// - one handoff is enough
// - avoid adding extra tools unless the lesson really needs them

const dispatcherAgent = new Agent({
  name: 'Dispatcher agent',
  instructions:
    'Review the logistics incident request, identify the shipment and issue, then hand off to the analyst when a final operations summary is needed.',
  model: 'gpt-5.4-mini',
});

const analystAgent = new Agent({
  name: 'Analyst agent',
  instructions:
    'Write a short operations summary for the incident, including the shipment ID, the issue, the risk level, and the recommended next step.',
  model: 'gpt-5.4-mini',
});

const triageAgent = Agent.create({
  name: 'Logistics triage',
  instructions:
    'Route logistics incident requests to the right specialist. Use the dispatcher for request intake and the analyst for the final summary.',
  model: 'gpt-5.4-mini',
  handoffs: [dispatcherAgent, analystAgent],
});

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      'OPENAI_API_KEY is missing. Add it to your environment before running multi-agent-handoff.',
    );
  }

  const result = await run(
    triageAgent,
    'Shipment SHP-204 arrived with damaged cargo. Prepare a short incident summary for operations.'
  );

  console.log(result.finalOutput);
  console.log(result.lastAgent?.name);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`multi-agent handoff failed: ${message}`);
  process.exitCode = 1;
});
