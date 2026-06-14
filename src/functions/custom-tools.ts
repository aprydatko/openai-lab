import 'dotenv/config';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  const response = await client.responses.create({
    model: 'gpt-5.4-mini',
    input: 'Use the code_exec tool to print hello world to the console.',
    tools: [
      {
        type: 'custom',
        name: 'code_exec',
        description: 'Executes arbitrary Python code.',
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

  console.log('\nRaw custom tool input:');
  console.log(customToolCall.input);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
