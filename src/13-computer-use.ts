import 'dotenv/config';
import OpenAI from 'openai';

// Lesson 13
// Goal:
// Show the simplest Computer use request shape in the Responses API.
//
// Important:
// This example does not implement the full screenshot/action loop yet.
// It only sends the first request and prints the returned output items so you
// can inspect whether the model asks for a screenshot or proposes UI actions.

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      'OPENAI_API_KEY is missing. Add it to your environment before running computer-use.'
    );
  }

  const response = await client.responses.create({
    model: 'gpt-5.4-mini',
    tools: [
      {
        type: 'computer',
      },
    ],
    input:
      'Check whether the Filters panel is open. If it is not open, click Show filters. Then type penguin in the search box. Use the computer tool for UI interaction.',
  });

  console.log('Response output text:\n');
  console.log(response.output_text || '(no direct assistant text returned)');

  console.log('\nOutput items:\n');

  if (response.output.length === 0) {
    console.log('No output items were returned.');
    return;
  }

  for (const [index, item] of response.output.entries()) {
    console.log(`${index + 1}. ${item.type}`);

    if (item.type === 'computer_call') {
      console.log(`   call_id: ${item.call_id}`);
      console.log(`   action_count: ${item.actions.length}`);
    }
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`computer-use failed: ${message}`);
  process.exitCode = 1;
});
