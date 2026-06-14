import { Agent, run, tool } from '@openai/agents';
import 'dotenv/config';
import { z } from 'zod';

// Lesson 07
// Goal:
// Learn how an agent uses tools, not just plain instructions.
//
// Suggested logistics scenario:
// - create_incident
// - search_incidents
// - get_driver_status
//
// What to focus on:
// 1. Defining one or two narrow tools
// 2. Letting the agent decide when to call them
// 3. Executing the tool handler in local code
// 4. Returning the tool result back into the agent flow
//
// What to add here later:
// 1. Agent setup
// 2. Tool schema and descriptions
// 3. Mock local data or fake handlers
// 4. A small prompt that clearly requires a tool call
//
// Keep the scope tight:
// - prefer one successful tool path first
// - add tool errors only after the happy path is clear

const createIncident = tool({
  name: 'create_incident',
  description:
    'Create a mock logistics incident record for a shipment or warehouse problem.',
  parameters: z.object({
    shipmentId: z.string(),
    issueType: z.string(),
    severity: z.enum(['low', 'medium', 'high']),
  }),
  async execute(input) {
    return {
      incidentId: 'INC-1001',
      shipmentId: input.shipmentId,
      issueType: input.issueType,
      severity: input.severity,
      status: 'created',
      message: 'Mock incident created successfully.',
    };
  },
});

const agent = new Agent({
  name: 'Logistics incident assistant',
  instructions:
    'Help with simple logistics incident tasks. Use create_incident when the user asks you to log or create an incident.',
  model: 'gpt-5.4-mini',
  tools: [createIncident],
});

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      'OPENAI_API_KEY is missing. Add it to your environment before running agent-with-tools.'
    );
  }

  const result = await run(
    agent,
    'Create a high-severity incident for shipment SHP-204 because the cargo arrived damaged.'
  );

  console.log(result.finalOutput);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`agent example failed: ${message}`);
  process.exitCode = 1;
});
