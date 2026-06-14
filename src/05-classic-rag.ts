import 'dotenv/config';
import { readFile } from 'node:fs/promises';

import OpenAI from 'openai';

import { chunkDocument, rankChunks } from './rag/classic-rag.js';

const question = 'How should dispatch handle a delay with hazardous cargo?';

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY is missing. Add it to your environment before running classic-rag.',
    );
  }

  const client = new OpenAI({ apiKey });
  const documentPath = new URL('../data/logistics-policy.md', import.meta.url);
  const document = await readFile(documentPath, 'utf8');
  const chunks = chunkDocument(document);
  const selectedChunks = rankChunks(question, chunks).slice(0, 3);

  if (selectedChunks.length === 0) {
    throw new Error('No relevant chunks were found for the demo question.');
  }

  const context = selectedChunks
    .map(
      (chunk) =>
        `Chunk ${chunk.index} (score: ${chunk.score})\n${chunk.text}`,
    )
    .join('\n\n');

  console.log(`Question: ${question}\n`);
  console.log('Selected chunks:\n');
  console.log(`${context}\n`);

  const response = await client.responses.create({
    model: 'gpt-5.4-mini',
    input: [
      {
        role: 'system',
        content:
          'Answer only from the provided context. If the context does not contain the answer, say that clearly.',
      },
      {
        role: 'user',
        content: `Question: ${question}\n\nContext:\n${context}`,
      },
    ],
  });

  console.log('Answer:\n');
  console.log(response.output_text);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`classic-rag failed: ${message}`);
  process.exitCode = 1;
});
