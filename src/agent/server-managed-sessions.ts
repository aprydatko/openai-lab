import { Agent, run } from '@openai/agents';
import OpenAI from 'openai';

import 'dotenv/config';

async function main() {
  const agent = new Agent({
    name: 'Assistant',
    model: 'gpt-5.4-mini',
    instructions: 'Reply very concisely.',
  });

  const client = new OpenAI();
  const { id: conversationId } = await client.conversations.create({});

  const first = await run(agent, 'What city is the Golden Gate Bridge in?', {
    conversationId,
  });
  console.log(first.finalOutput);

  const second = await run(agent, 'What state is it in?', {
    conversationId,
  });
  console.log(second.finalOutput);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`agent example failed: ${message}`);
  process.exitCode = 1;
});
