import 'dotenv/config';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const we_did_not_specify_stop_tokens = true;

async function main() {
  try {
    const response = await client.responses.create({
      model: 'gpt-5.5',
      input: [
        {
          role: 'system',
          content: 'You are a helpful assistant designed to output JSON.',
        },
        {
          role: 'user',
          content:
            'Who won the world series in 2020? Please respond in the format {winner: ...}',
        },
      ],
      text: { format: { type: 'json_object' } },
    });

    const message = response.output.find((item) => item.type === 'message');
    const messageContent = message?.content[0];

    // Check if the conversation was too long for the context window, resulting in incomplete JSON
    if (
      response.status === 'incomplete' &&
      response.incomplete_details.reason === 'max_output_tokens'
    ) {
      // your code should handle this error case
    }

    // Check if the OpenAI safety system refused the request and generated a refusal instead
    if (messageContent?.type === 'refusal') {
      // your code should handle this error case
      // In this case, the .content field will contain the explanation (if any) that the model generated for why it is refusing
      console.log(messageContent.refusal);
    }

    // Check if the model's output included restricted content, so the generation of JSON was halted and may be partial
    if (
      response.status === 'incomplete' &&
      response.incomplete_details.reason === 'content_filter'
    ) {
      // your code should handle this error case
    }

    if (response.status === 'completed') {
      // In this case the model has either successfully finished generating the JSON object according to your schema, or the model generated one of the tokens you provided as a "stop token"

      if (we_did_not_specify_stop_tokens) {
        // If you didn't specify any stop tokens, then the generation is complete and the content key will contain the serialized JSON object
        // This will parse successfully and should now contain  {"winner": "Los Angeles Dodgers"}
        console.log(JSON.parse(response.output_text));
      } else {
        // Check if the response.output_text ends with one of your stop tokens and handle appropriately
      }
    }
  } catch (e) {
    // Your code should handle errors here, for example a network error calling the API
    console.error(e);
  }
}

main();
