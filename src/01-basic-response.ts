import 'dotenv/config';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  // const response = await client.responses.create({
  //   model: 'gpt-5.4-mini',
  //   input: 'Write a one-sentence bedtime story about a unicorn.',
  // });
  // -------------------------------------------------------------- //
  // const response = await client.responses.create({
  //   model: 'gpt-5.4-mini',
  //   reasoning: { effort: 'low' },
  //   instructions: 'Talk like a pirate',
  //   input: 'Are semicolons optional in JavaScript',
  // });
  // -------------------------------------------------------------- //
  // const response = await client.responses.create({
  //   model: 'gpt-5.5',
  //   reasoning: { effort: 'low' },
  //   input: [
  //     {
  //       role: 'developer',
  //       content: 'Talk like a pirate.',
  //     },
  //     {
  //       role: 'user',
  //       content: 'Are semicolons optional in JavaScript?',
  //     },
  //   ],
  // });
  // -------------------------------------------------------------- //
  // const response = await client.responses.create({
  //   model: 'gpt-5.4-mini',
  //   input: [
  //     {
  //       role: 'user',
  //       content: 'knock knock.',
  //     },
  //     {
  //       role: 'assistant',
  //       content: "Who's there?",
  //     },
  //     {
  //       role: 'user',
  //       content: 'Orange.',
  //     },
  //   ],
  // });
  // -------------------------------------------------------------- //
  // Manage conversation state with Response API
  //   let history: ResponseInputItem[] = [
  //     {
  //       role: 'user',
  //       content: 'tell me a joke',
  //     },
  //   ];
  //   const response = await client.responses.create({
  //     model: 'gpt-5.4-mini',
  //     input: history,
  //     store: true,
  //   });
  //   console.log(response.output_text);
  //   history = [...history, ...(response.output as ResponseInputItem[])];
  //   history.push({
  //     role: 'user',
  //     content: 'tell me another',
  //   });
  //   const secondResponse = await client.responses.create({
  //     model: 'gpt-5.4-mini',
  //     input: history,
  //     store: true,
  //   });
  // -------------------------------------------------------------- //

  const response = await client.responses.create({
    model: 'gpt-5.4-mini',
    input: 'tell me a joke',
    store: true,
  });

  console.log(response.output_text);

  const secondResponse = await client.responses.create({
    model: 'gpt-5.4-mini',
    previous_response_id: response.id,
    input: [{ role: 'user', content: 'explain why this is funny.' }],
  });

  console.log(secondResponse.output_text);
}

main();
