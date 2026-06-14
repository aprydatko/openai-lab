import { Agent, run } from '@openai/agents';
import 'dotenv/config';

async function main() {
  const agent = new Agent({
    name: 'Planet guide',
    instructions: 'Answer with short facts.',
    model: 'gpt-5.4-mini',
  });

  const stream = await run(agent, 'Give me three short facts about Saturn.', {
    stream: true,
  });

  for await (const event of stream) {
    if (
      event.type === 'raw_model_stream_event' &&
      event.data.type === 'response.output_text.delta'
    ) {
      process.stdout.write(event.data.delta);
    }
  }

  await stream.completed;
  console.log('\nFinal:', stream.finalOutput);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`agent example failed: ${message}`);
  process.exitCode = 1;
});
