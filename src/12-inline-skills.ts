import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

import OpenAI from 'openai';

// Lesson 12
// Goal:
// Show what an inline skill looks like when packaged into a container.
//
// Compare with Lesson 11:
// - Lesson 11 uses a local skill by path inside a local shell environment.
// - Lesson 12 uploads a zipped skill into a container and sends the document
//   itself as an input_file inside the request.
//
// Important:
// This example expects a ready zip archive such as:
// skills/logistics-incident-brief.zip

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const skillArchivePath = resolve(
  process.cwd(),
  'skills',
  'logistics-incident-brief.zip',
);
const incidentPath = resolve(process.cwd(), 'data', 'sample-incident.md');

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      'OPENAI_API_KEY is missing. Add it to your environment before running inline-skills.',
    );
  }

  await access(skillArchivePath, constants.R_OK);
  await access(incidentPath, constants.R_OK);

  const inlineZip = readFileSync(skillArchivePath).toString('base64');
  const incidentMarkdown = readFileSync(incidentPath).toString('base64');

  const container = await client.containers.create({
    name: 'openai-lab-inline-skill-container',
    skills: [
      {
        type: 'inline',
        name: 'logistics-incident-brief',
        description:
          'Use when the user wants a short logistics incident brief from a local incident note. Read the incident file, extract the key facts, risks, and next actions, then produce a concise markdown brief.',
        source: {
          type: 'base64',
          media_type: 'application/zip',
          data: inlineZip,
        },
      },
    ],
  });

  try {
    const response = await client.responses.create({
      model: 'gpt-5.4-mini',
      tools: [
        {
          type: 'shell',
          environment: {
            type: 'container_reference',
            container_id: container.id,
          },
        },
      ],
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_file',
              filename: 'sample-incident.md',
              file_data: `data:text/markdown;base64,${incidentMarkdown}`,
            },
            {
              type: 'input_text',
              text: 'Use the logistics-incident-brief skill to summarize sample-incident.md as a short operational markdown brief.',
            },
          ],
        },
      ],
    });

    console.log(`Container: ${container.id}\n`);
    console.log('Response output text:\n');
    console.log(response.output_text || '(no direct assistant text returned)');

    console.log('\nOutput items:\n');

    for (const [index, item] of response.output.entries()) {
      console.log(`${index + 1}. ${item.type}`);
    }
  } finally {
    await client.containers.delete(container.id).catch(() => undefined);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`inline-skills failed: ${message}`);
  process.exitCode = 1;
});
