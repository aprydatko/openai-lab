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

async function getWeather(location: string) {
  const weatherByCity: Record<string, string> = {
    'Paris, France': '15C, cloudy',
    'Bogota, Colombia': '18C, light rain',
    'Bogotá, Colombia': '18C, light rain',
  };

  return weatherByCity[location] ?? '22C, sunny';
}

async function getExchangeRate(base: string, target: string) {
  const key = `${base}/${target}`.toUpperCase();
  const rates: Record<string, string> = {
    'USD/EUR': '0.92',
    'EUR/USD': '1.09',
  };

  return rates[key] ?? '1.00';
}

async function callFunction(name: string, args: Record<string, unknown>) {
  if (name === 'get_weather') {
    return getWeather(String(args.location));
  }

  if (name === 'get_exchange_rate') {
    return getExchangeRate(String(args.base), String(args.target));
  }

  return `Unknown function: ${name}`;
}

async function main() {
  const input: ResponseInputItem[] = [
    {
      role: 'user',
      content:
        'In one go, check the weather in Paris and Bogota, and also get the USD to EUR exchange rate.',
    },
  ];

  const response = await client.responses.create({
    model: 'gpt-5.4-mini',
    input,
    tools,
    parallel_tool_calls: true,
  });

  input.push(...(response.output as ResponseInputItem[]));

  const functionCalls = response.output.filter(
    (item): item is ResponseFunctionToolCall => item.type === 'function_call'
  );

  console.log('Function calls returned by the model in one step:');
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

  // These calls are independent, so we can execute them in parallel.
  const toolOutputs = await Promise.all(
    functionCalls.map(async (toolCall) => {
      const args = JSON.parse(toolCall.arguments) as Record<string, unknown>;
      const result = await callFunction(toolCall.name, args);

      return {
        type: 'function_call_output' as const,
        call_id: toolCall.call_id,
        output: String(result),
      };
    })
  );

  input.push(...toolOutputs);

  const finalResponse = await client.responses.create({
    model: 'gpt-5.4-mini',
    input,
    tools,
    parallel_tool_calls: true,
  });

  console.log('\nFinal answer:');
  console.log(finalResponse.output_text);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
