import assert from 'node:assert/strict';
import test from 'node:test';

import { chunkDocument, rankChunks } from './classic-rag.js';

const source = `
# Logistics Policy

Drivers must report any incident to dispatch within 15 minutes.

Dispatch should notify the safety manager for hazardous cargo delays.

Temperature-controlled cargo must stay between 2C and 8C during transport.
`;

test('chunkDocument splits markdown into chunk objects', () => {
  const chunks = chunkDocument(source);

  assert.equal(chunks.length, 4);
  assert.equal(chunks[0]?.index, 0);
  assert.match(chunks[1]?.text ?? '', /incident/);
});

test('rankChunks returns the most relevant chunks first', () => {
  const chunks = chunkDocument(source);

  const ranked = rankChunks(
    'How quickly should a driver report an incident to dispatch?',
    chunks,
  );

  assert.equal(ranked[0]?.index, 1);
  assert.match(ranked[0]?.text ?? '', /15 minutes/);
});
