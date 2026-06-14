import 'dotenv/config';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  const response = await client.responses.create({
    model: 'gpt-5.4-mini',
    input:
      'Use the ticket_code tool to generate a support code in the format AAA-1234 for a high priority billing issue.',
    tools: [
      {
        type: 'custom',
        name: 'ticket_code',
        description:
          'Produces a support ticket code with exactly 3 uppercase letters, a dash, and 4 digits.',
        format: {
          type: 'grammar',
          syntax: 'regex',
          definition: '[A-Z]{3}-[0-9]{4}',
        },
      },
    ],
  });

  console.log('Full response output:');
  console.log(JSON.stringify(response.output, null, 2));

  const customToolCall = response.output.find(
    (item) => item.type === 'custom_tool_call'
  );

  if (!customToolCall) {
    console.log('\nThe model did not call the custom tool.');
    return;
  }

  console.log('\nCustom tool call:');
  console.log(JSON.stringify(customToolCall, null, 2));

  console.log('\nRegex-constrained input:');
  console.log(customToolCall.input);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
