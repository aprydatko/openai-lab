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
    name: 'send_email',
    description: 'Send a short email to a recipient.',
    parameters: {
      type: 'object',
      properties: {
        to: {
          type: 'string',
          description: 'Recipient email address',
        },
        body: {
          type: 'string',
          description: 'Email body text',
        },
      },
      required: ['to', 'body'],
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

  return weatherByCity[location] ?? '22C, sunny';
}

function sendEmail(to: string, body: string) {
  console.log(`Pretending to send email to ${to}: ${body}`);
  return 'success';
}

async function callFunction(name: string, args: Record<string, unknown>) {
  if (name === 'get_weather') {
    return getWeather(String(args.location));
  }

  if (name === 'send_email') {
    return sendEmail(String(args.to), String(args.body));
  }

  return `Unknown function: ${name}`;
}

async function main() {
  const input: ResponseInputItem[] = [
    {
      role: 'user',
      content:
        'Tell me the weather in Paris and Bogota, then send a short email to bob@email.com with the summary.',
    },
  ];

  const model = 'gpt-5.4-mini';
  let step = 1;

  while (true) {
    // 1. Ask the model what to do next.
    const response = await client.responses.create({
      model,
      input,
      tools,
    });

    // 2. Save the model output so the next request includes its tool calls.
    input.push(...(response.output as ResponseInputItem[]));

    const functionCalls = response.output.filter(
      (item): item is ResponseFunctionToolCall => item.type === 'function_call'
    );

    // 3. If there are no function calls, the model is done and we can print the final text.
    if (functionCalls.length === 0) {
      console.log('\nFinal answer:');
      console.log(response.output_text);
      break;
    }

    console.log(`\nFunction calls returned by the model in step ${step}:`);
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

    // 4. Execute every function call returned in this step.
    for (const toolCall of functionCalls) {
      const args = JSON.parse(toolCall.arguments) as Record<string, unknown>;
      const result = await callFunction(toolCall.name, args);

      // 5. Send each function result back with the matching call_id.
      input.push({
        type: 'function_call_output',
        call_id: toolCall.call_id,
        output: String(result),
      });
    }

    step += 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
