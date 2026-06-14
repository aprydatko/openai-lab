import 'dotenv/config';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  const response = await client.responses.create({
    model: 'gpt-5.4-mini',
    reasoning: { effort: 'low' },
    tools: [
      {
        type: 'web_search',
        filters: {
          allowed_domains: [
            'pubmed.ncbi.nlm.nih.gov',
            'clinicaltrials.gov',
            'www.who.int',
            'www.cdc.gov',
            'www.fda.gov',
          ],
          blocked_domains: ['reddit.com', 'quora.com', 'wikipedia.org'],
        },
      },
    ],
    tool_choice: 'auto',
    include: ['web_search_call.action.sources'],
    input:
      'Please perform a web search on how semaglutide is used in the treatment of diabetes.',
  });

  console.log(response.output_text);
}

main();
