import 'dotenv/config';
import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod.mjs';
import { z } from 'zod';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  const CalendarEvent = z.object({
    name: z.string(),
    date: z.string(),
    participants: z.array(z.string()),
  });

  const response = await client.responses.parse({
    model: 'gpt-5.4-mini',
    input: [
      { role: 'system', content: 'Extract the event information.' },
      {
        role: 'user',
        content: 'Alice and Bob are going to a science fair on Friday.',
      },
    ],
    text: {
      format: zodTextFormat(CalendarEvent, 'event'),
    },
  });

  const event = response.output_parsed;
  console.log(event);
}

main();
