import { Agent, run } from '@openai/agents';
import 'dotenv/config';

const intakeAgent = new Agent({
  name: 'Incident intake agent',
  model: 'gpt-5.4-mini',
  instructions:
    'Extract the core incident facts from a logistics report. Identify the shipment ID, the issue, and the urgency level. Then hand off when a structured operational summary is needed.',
});

const summaryAgent = new Agent({
  name: 'Operations summary agent',
  model: 'gpt-5.4-mini',
  instructions:
    'Turn the incident facts into a short operations summary. Include the shipment ID, issue, urgency, and the recommended next step.',
});

const escalationAgent = new Agent({
  name: 'Escalation agent',
  model: 'gpt-5.4-mini',
  instructions:
    'Decide whether the incident should be escalated immediately. If yes, explain why in one short paragraph.',
});

const orchestrationAgent = Agent.create({
  name: 'Logistics orchestration agent',
  model: 'gpt-5.4-mini',
  instructions:
    'Coordinate a small logistics incident workflow. First use the intake agent to understand the report, then use the operations summary agent to prepare the final summary. Use the escalation agent only if the incident sounds severe or time-critical.',
  handoffs: [intakeAgent, summaryAgent, escalationAgent],
});

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      'OPENAI_API_KEY is missing. Add it to your environment before running orchestration.'
    );
  }

  const result = await run(
    orchestrationAgent,
    'Shipment SHP-204 arrived at the warehouse with damaged cargo and a broken seal. The customer is waiting for an update today.'
  );

  console.log('Final output:\n');
  console.log(result.finalOutput);
  console.log('\nLast agent:', result.lastAgent?.name ?? 'unknown');
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`orchestration example failed: ${message}`);
  process.exitCode = 1;
});
