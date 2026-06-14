import 'dotenv/config';
import { createReadStream } from 'node:fs';
import { access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { basename } from 'node:path';

import OpenAI from 'openai';

// Lesson 05
// Goal:
// Learn how to upload a file, attach it to retrieval, ask grounded questions,
// and optionally combine internal retrieval with web search for current context.

const question = 'How should dispatch handle a delay with hazardous cargo?';
// This second prompt is designed to show when web search can add
// current public context on top of the internal company policy.
const combinedQuestion =
  'Using the company policy first and then any useful current public context, what should dispatch do about a hazardous cargo delay? Separate internal policy from external context in your answer.';
const filePath = new URL('../data/logistics-policy.md', import.meta.url);

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY is missing. Add it to your environment before running file-search.',
    );
  }

  await access(filePath, constants.R_OK);

  const client = new OpenAI({ apiKey });
  const vectorStore = await client.vectorStores.create({
    name: 'openai-lab-logistics-policy',
    expires_after: {
      anchor: 'last_active_at',
      days: 1,
    },
  });

  let uploadedFileId: string | null = null;

  try {
    const vectorStoreFile = await client.vectorStores.files.uploadAndPoll(
      vectorStore.id,
      createReadStream(filePath),
    );

    uploadedFileId = vectorStoreFile.id;

    if (vectorStoreFile.status !== 'completed') {
      const reason =
        vectorStoreFile.last_error?.message ??
        `unexpected file status: ${vectorStoreFile.status}`;

      throw new Error(`Vector store file was not ready: ${reason}`);
    }

    const searchResults = await client.vectorStores.search(vectorStore.id, {
      query: question,
      max_num_results: 3,
      rewrite_query: true,
    });

    console.log(`Question: ${question}\n`);
    console.log(`Vector store: ${vectorStore.id}`);
    console.log(`Vector store file: ${vectorStoreFile.id}`);
    console.log(`Uploaded file: ${basename(filePath.pathname)}\n`);

    console.log('Preview search results:\n');

    for (const [index, result] of searchResults.data.entries()) {
      const preview = result.content[0]?.text?.trim() ?? '(no text preview)';

      console.log(
        `${index + 1}. score=${result.score.toFixed(3)} file=${result.filename}`,
      );
      console.log(`${preview}\n`);
    }

    // First example: answer only from the uploaded internal file.
    const response = await client.responses.create({
      model: 'gpt-5.4-mini',
      instructions:
        'Answer only from the uploaded file search context. If the answer is not in the file, say so clearly.',
      input: question,
      include: ['file_search_call.results'],
      tools: [
        {
          type: 'file_search',
          vector_store_ids: [vectorStore.id],
          max_num_results: 3,
        },
      ],
    });

    console.log('Answer:\n');
    console.log(response.output_text);

    // Second example: keep file search as the main source, but allow the model
    // to use web search when fresh external context would improve the answer.
    const combinedResponse = await client.responses.create({
      model: 'gpt-5.4-mini',
      instructions:
        'Use file search as the primary source for company policy. You may use web search for supplemental current public context if helpful. Clearly label what comes from internal policy versus external context, and say when external context is not needed.',
      input: combinedQuestion,
      include: ['file_search_call.results'],
      tools: [
        {
          type: 'file_search',
          vector_store_ids: [vectorStore.id],
          max_num_results: 3,
        },
        {
          type: 'web_search',
        },
      ],
    });

    // Inspect which hosted tools the model actually used in this run.
    const toolSteps = combinedResponse.output.filter(
      (item) => item.type === 'file_search_call' || item.type === 'web_search_call',
    );

    console.log('\nCombined file search + web search answer:\n');
    console.log(combinedResponse.output_text);

    console.log('\nTool steps used:\n');

    if (toolSteps.length === 0) {
      console.log('No tool calls were returned.');
    } else {
      for (const [index, step] of toolSteps.entries()) {
        console.log(`${index + 1}. ${step.type}`);
      }
    }
  } finally {
    if (uploadedFileId) {
      await client.vectorStores.files
        .delete(uploadedFileId, { vector_store_id: vectorStore.id })
        .catch(() => undefined);
    }

    await client.vectorStores.delete(vectorStore.id).catch(() => undefined);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`file-search failed: ${message}`);
  process.exitCode = 1;
});
