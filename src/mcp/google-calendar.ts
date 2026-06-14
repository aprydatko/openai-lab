import 'dotenv/config';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const GOOGLE_ACCESS_TOKEN = process.env.GOOGLE_ACCESS_TOKEN;

// Example Test API to catch my test event
// https://www.googleapis.com/calendar/v3/calendars/primary/events/4k1kfcm925ak7a8q7v6n5s2abd

async function main() {
  const resp = await client.responses.create({
    model: 'gpt-5.4-mini',
    tools: [
      {
        type: 'mcp',
        server_label: 'google_calendar',
        connector_id: 'connector_googlecalendar',
        authorization: GOOGLE_ACCESS_TOKEN,
        require_approval: 'never',
      },
    ],
    input: "What's on my Google Calendar for today?",
  });

  console.log(resp.output_text);
}

main();
