import 'dotenv/config';
import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  const ResearchPaperExtraction = z.object({
    title: z.string(),
    authors: z.array(z.string()),
    abstract: z.string(),
    keywords: z.array(z.string()),
  });

  const response = await client.responses.parse({
    model: 'gpt-5.5',
    input: [
      {
        role: 'system',
        content:
          'You are an expert at structured data extraction. You will be given unstructured text from a research paper and should convert it into the given structure.',
      },
      {
        role: 'user',
        content: `
          Application of Quantum Algorithms in Interstellar Navigation: A New Frontier

Dr. Stella Voyager, Dr. Nova Star, and Dr. Lyra Hunter present a study exploring how quantum algorithms can enhance interstellar navigation systems. The research focuses on the use of quantum computing principles, particularly quantum superposition and entanglement, to improve route planning across complex space-time environments.

According to the study, the proposed navigation framework is capable of identifying optimal travel paths through space-time anomalies more efficiently than traditional navigation methods. Through a series of experimental simulations, the researchers observed notable improvements in both travel time and fuel efficiency for long-distance space missions.

The findings suggest that quantum-based navigation could play a significant role in the future of space exploration, offering new possibilities for faster and more resource-efficient interstellar travel. Key areas discussed in the paper include quantum algorithms, interstellar navigation, space-time anomalies, quantum superposition, quantum entanglement, and advanced space travel technologies.

        `,
      },
    ],
    text: {
      format: zodTextFormat(
        ResearchPaperExtraction,
        'research_paper_extraction'
      ),
    },
  });

  const research_paper = response.output_parsed;
  console.log(research_paper);
}

main();
