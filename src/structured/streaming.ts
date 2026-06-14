import 'dotenv/config';
import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  const EntitiesSchema = z.object({
    attributes: z.array(z.string()),
    colors: z.array(z.string()),
    animals: z.array(z.string()),
  });

  const stream = client.responses
    .stream({
      model: 'gpt-5.4-mini',
      input: [
        { role: 'user', content: "What's the weather like in Paris today?" },
      ],
      text: {
        format: zodTextFormat(EntitiesSchema, 'entities'),
      },
    })
    .on('response.refusal.delta', (event) => {
      process.stdout.write(event.delta);
    })
    .on('response.output_text.done', () => {
      process.stdout.write('\n');
    })
    .on('response.error', (event) => {
      console.error(event.error);
    });

  const result = await stream.finalResponse();
  console.log(result);
}

main();
