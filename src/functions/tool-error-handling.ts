import 'dotenv/config';
import OpenAI from 'openai';
import type {
  ResponseFunctionToolCall,
  ResponseInputItem,
  Tool,
} from 'openai/resources/responses/responses.js';

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
];

function getWeather(location: string) {
  const weatherByCity: Record<string, string> = {
    'Paris, France': '15C, cloudy',
    'Bogota, Colombia': '18C, light rain',
    'Bogotá, Colombia': '18C, light rain',
  };

  const weather = weatherByCity[location];

  if (!weather) {
    throw new Error(`Weather data not found for ${location}`);
  }

  return weather;
}

async function runScenario(title: string, userMessage: string) {
  const input: ResponseInputItem[] = [{ role: 'user', content: userMessage }];

  let response = await client.responses.create({
    model: 'gpt-5.4-mini',
    input,
    tools,
  });

  input.push(...(response.output as ResponseInputItem[]));

  const functionCalls = response.output.filter(
    (item): item is ResponseFunctionToolCall => item.type === 'function_call'
  );

  console.log(`\n=== ${title} ===`);
  console.log(`Prompt: ${userMessage}`);
  console.log('Function calls:');
  console.log(
    JSON.stringify(
      functionCalls.map((call) => ({
        name: call.name,
        call_id: call.call_id,
        arguments: call.arguments,
      })),
      null,
      2
    )
  );

  for (const toolCall of functionCalls) {
    const args = JSON.parse(toolCall.arguments) as { location: string };

    try {
      const weather = getWeather(args.location);

      input.push({
        type: 'function_call_output',
        call_id: toolCall.call_id,
        output: JSON.stringify({
          ok: true,
          weather,
        }),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown tool error';

      input.push({
        type: 'function_call_output',
        call_id: toolCall.call_id,
        output: JSON.stringify({
          ok: false,
          error: message,
        }),
      });
    }
  }

  response = await client.responses.create({
    model: 'gpt-5.4-mini',
    input,
    tools,
  });

  console.log('\nFinal answer:');
  console.log(response.output_text);
}

async function main() {
  await runScenario(
    '1. Successful tool result',
    'What is the weather in Paris, France?'
  );

  await runScenario('2. Tool error result', 'What is the weather in Atlantis?');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
