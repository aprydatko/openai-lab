import { Agent, MemorySession, run } from '@openai/agents';
import 'dotenv/config';

async function main() {
  const agent = new Agent({
    name: 'Tour guide',
    model: 'gpt-5.4-mini',
    instructions: 'Answer with compact travel facts.',
  });

  const session = new MemorySession();

  const firstTurn = await run(
    agent,
    'What city is the Golden Gate Bridge in?',
    { session }
  );
  console.log(firstTurn.finalOutput);

  const secondTurn = await run(agent, 'What state is it in?', { session });
  console.log(secondTurn.finalOutput);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`agent example failed: ${message}`);
  process.exitCode = 1;
});
