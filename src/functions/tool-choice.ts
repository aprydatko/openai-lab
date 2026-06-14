import 'dotenv/config';
import OpenAI from 'openai';
import type { Tool } from 'openai/resources/responses/responses.js';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const tools: Tool[] = [
  {
    type: 'function',
    name: 'get_weather',
    description: 'Get the current weather for a city.',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'City and country, for example Paris, France',
        },
      },
      required: ['location'],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: 'function',
    name: 'get_exchange_rate',
    description: 'Get the exchange rate between two currencies.',
    parameters: {
      type: 'object',
      properties: {
        base: {
          type: 'string',
          description: 'Base currency code, for example USD',
        },
        target: {
          type: 'string',
          description: 'Target currency code, for example EUR',
        },
      },
      required: ['base', 'target'],
      additionalProperties: false,
    },
    strict: true,
  },
];

async function runScenario(
  title: string,
  toolChoice: 'auto' | 'required' | { type: 'function'; name: string },
  input: string,
) {
  const response = await client.responses.create({
    model: 'gpt-5.4-mini',
    input,
    tools,
    tool_choice: toolChoice,
  });

  console.log(`\n=== ${title} ===`);
  console.log(`Prompt: ${input}`);
  console.log('Output items:');
  console.log(JSON.stringify(response.output, null, 2));
  console.log('\nOutput text:');
  console.log(response.output_text || '(empty because the model chose a tool call)');
}

async function main() {
  await runScenario(
    '1. tool_choice: auto',
    'auto',
    'What is the weather in Paris, France?',
  );

  await runScenario(
    '2. tool_choice: required',
    'required',
    'Say hello to me without using a tool.',
  );

  await runScenario(
    '3. tool_choice: force get_exchange_rate',
    { type: 'function', name: 'get_exchange_rate' },
    'What is the weather in Paris, France?',
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
