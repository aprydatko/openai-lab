import 'dotenv/config';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const mathExpressionGrammar = `
start: expr

?expr: expr "+" term   -> add
     | expr "-" term   -> sub
     | term

?term: term "*" factor -> mul
     | term "/" factor -> div
     | factor

?factor: NUMBER
       | "(" expr ")"

%import common.NUMBER
%import common.WS
%ignore WS
`.trim();

async function main() {
  const response = await client.responses.create({
    model: 'gpt-5.4-mini',
    input:
      'Use the math_expr tool to write an arithmetic expression for: open parenthesis 12 plus 8 close parenthesis times 3 minus 4.',
    tools: [
      {
        type: 'custom',
        name: 'math_expr',
        description:
          'Produces a valid arithmetic expression using numbers, +, -, *, /, and parentheses.',
        format: {
          type: 'grammar',
          syntax: 'lark',
          definition: mathExpressionGrammar,
        },
      },
    ],
  });

  console.log('Full response output:');
  console.log(JSON.stringify(response.output, null, 2));

  const customToolCall = response.output.find(
    (item) => item.type === 'custom_tool_call'
  );

  if (!customToolCall) {
    console.log('\nThe model did not call the custom tool.');
    return;
  }

  console.log('\nCustom tool call:');
  console.log(JSON.stringify(customToolCall, null, 2));

  console.log('\nGrammar-constrained input:');
  console.log(customToolCall.input);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
