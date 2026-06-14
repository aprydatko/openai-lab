import 'dotenv/config';
import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  const UI = z.lazy(() =>
    z.object({
      type: z.enum(['div', 'button', 'header', 'section', 'field', 'form']),
      label: z.string(),
      children: z.array(UI),
      attributes: z.array(
        z.object({
          name: z.string(),
          value: z.string(),
        })
      ),
    })
  );

  const response = await client.responses.parse({
    model: 'gpt-5.4-mini',
    input: [
      {
        role: 'system',
        content: 'You are a UI generator AI. Convert the user input into a UI.',
      },
      {
        role: 'user',
        content: 'Make a User Profile Form',
      },
    ],
    text: {
      format: zodTextFormat(UI, 'ui'),
    },
  });

  const ui = response.output_parsed;
  console.log(ui);
}

main();
