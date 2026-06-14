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
    description: 'Get current temperature for provided coordinates in celsius.',
    parameters: {
      type: 'object',
      properties: {
        latitude: { type: 'number' },
        longitude: { type: 'number' },
      },
      required: ['latitude', 'longitude'],
      additionalProperties: false,
    },
    strict: true,
  },
];

function getWeather(latitude: number, longitude: number) {
  if (latitude === 48.8566 && longitude === 2.3522) {
    return '15C, cloudy';
  }

  return '22C, sunny';
}

async function main() {
  const input: ResponseInputItem[] = [
    {
      role: 'user',
      content: "What's the weather like in Paris today?",
    },
  ];

  const stream = await client.responses.create({
    model: 'gpt-5.4-mini',
    input,
    tools,
    stream: true,
    store: true,
  });

  const finalToolCalls: Record<number, ResponseFunctionToolCall> = {};

  for await (const event of stream) {
    if (
      event.type === 'response.output_item.added' &&
      event.item.type === 'function_call'
    ) {
      finalToolCalls[event.output_index] = {
        ...event.item,
        arguments: event.item.arguments ?? '',
      };
      continue;
    }

    if (event.type === 'response.function_call_arguments.delta') {
      const toolCall = finalToolCalls[event.output_index];

      if (toolCall) {
        toolCall.arguments += event.delta;
      }
    }
  }

  console.log('Accumulated tool calls from the stream:');
  console.log(JSON.stringify(finalToolCalls, null, 2));

  const firstToolCall = finalToolCalls[0];

  if (!firstToolCall) {
    console.log('\nNo tool call was produced by the stream.');
    return;
  }

  input.push(firstToolCall as ResponseInputItem);

  const args = JSON.parse(firstToolCall.arguments) as {
    latitude: number;
    longitude: number;
  };

  const weather = getWeather(args.latitude, args.longitude);

  console.log('\nParsed arguments:');
  console.log(args);

  console.log('\nLocal tool result:');
  console.log(weather);

  input.push({
    type: 'function_call_output',
    call_id: firstToolCall.call_id,
    output: weather,
  });

  const finalResponse = await client.responses.create({
    model: 'gpt-5.4-mini',
    input,
    tools,
  });

  console.log('\nFinal answer:');
  console.log(finalResponse.output_text);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
