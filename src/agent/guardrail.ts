import { Agent, InputGuardrailTripwireTriggered, run } from '@openai/agents';
import 'dotenv/config';
import { z } from 'zod';

const guardrailAgent = new Agent({
  name: 'Homework check',
  instructions: 'Detect whether the user is asking for math homework help.',
  outputType: z.object({
    isMathHomework: z.boolean(),
    reasoning: z.string(),
  }),
});

async function main() {
  const agent = new Agent({
    name: 'Customer support',
    instructions: 'Help customers with support questions.',
    inputGuardrails: [
      {
        name: 'Math homework guardrail',
        runInParallel: false,
        async execute({ input, context }) {
          const result = await run(guardrailAgent, input, { context });
          return {
            outputInfo: result.finalOutput,
            tripwireTriggered: result.finalOutput?.isMathHomework === true,
          };
        },
      },
    ],
  });

  try {
    await run(agent, 'Can you solve 2x + 3 = 11 for me?');
  } catch (error) {
    if (error instanceof InputGuardrailTripwireTriggered) {
      console.log('Guardrail blocked the request.');
    }
  }
}

main();
