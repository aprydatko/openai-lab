import { Agent, run, tool } from '@openai/agents';
import 'dotenv/config';
import { z } from 'zod';

const cancelOrder = tool({
  name: 'cancel_order',
  description: 'Cancel a customer order.',
  parameters: z.object({ orderId: z.number() }),
  needsApproval: true,
  async execute({ orderId }) {
    return `Cancelled order ${orderId}`;
  },
});

async function main() {
  const agent = new Agent({
    name: 'Support agent',
    instructions: 'Handle support requests and ask for approval when needed.',
    tools: [cancelOrder],
  });

  let result = await run(agent, 'Cancel order 123.');

  if (result.interruptions?.length) {
    const state = result.state;
    for (const interruption of result.interruptions) {
      state.approve(interruption);
    }
    result = await run(agent, state);
  }

  console.log(result.finalOutput);
}

main();
