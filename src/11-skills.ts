import 'dotenv/config';
import { resolve } from 'node:path';
import OpenAI from 'openai';

// Lesson 11
// Goal:
// Show what a local skill looks like when attached to the shell tool.
//
// Important:
// This example demonstrates the request shape for a local skill.
// A full local-shell harness is needed to actually execute returned shell commands.

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const skillPath = resolve(process.cwd(), 'skills', 'logistics-incident-brief');
const incidentPath = resolve(process.cwd(), 'data', 'sample-incident.md');

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      'OPENAI_API_KEY is missing. Add it to your environment before running skills.'
    );
  }

  const response = await client.responses.create({
    model: 'gpt-5.4-mini',
    tools: [
      {
        type: 'shell',
        environment: {
          type: 'local',
          skills: [
            {
              name: 'logistics-incident-brief',
              description:
                'Read a local logistics incident note and produce a short operational markdown brief.',
              path: skillPath,
            },
          ],
        },
      },
    ],
    input: `Use the logistics-incident-brief skill on this local file: ${incidentPath}`,
  });

  console.log('Response output text:\n');
  console.log(response.output_text || '(no direct assistant text returned)');

  console.log('\nOutput items:\n');

  for (const [index, item] of response.output.entries()) {
    console.log(`${index + 1}. ${item.type}`);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`skills example failed: ${message}`);
  process.exitCode = 1;
});
