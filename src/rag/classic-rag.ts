export type RetrievedChunk = {
  index: number;
  text: string;
  score: number;
};

export function chunkDocument(document: string): RetrievedChunk[] {
  return document
    .split(/\r?\n\r?\n/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((text, index) => ({ index, text, score: 0 }));
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

export function rankChunks(
  question: string,
  chunks: RetrievedChunk[],
): RetrievedChunk[] {
  const tokens = tokenize(question);

  return chunks
    .map((chunk) => {
      const haystack = chunk.text.toLowerCase();
      const score = tokens.reduce((total, token) => {
        return haystack.includes(token) ? total + 1 : total;
      }, 0);

      return { ...chunk, score };
    })
    .filter((chunk) => chunk.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index);
}
