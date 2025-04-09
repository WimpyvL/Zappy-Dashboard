const axios = require('axios');

// Ensure the API key is available in environment variables
const apiKey = process.env.DEEPSEEK_API_KEY;
const deepSeekApiUrl = 'https://api.deepseek.com/chat/completions'; // DeepSeek OpenAI-compatible endpoint

// Define the expected JSON structure for the form
const formSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', description: 'A concise title for the form.' },
    description: { type: 'string', description: 'A brief description of the form\'s purpose.' },
    pages: {
      type: 'array',
      description: 'An array of page objects.',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Title for this page.' },
          elements: {
            type: 'array',
            description: 'An array of form element objects for this page.',
            items: {
              type: 'object',
              properties: {
                // id: { type: 'string', description: 'A unique identifier for the element (will be generated later).' },
                type: {
                  type: 'string',
                  description: 'The type of the form element.',
                  enum: [
                    'short_text', 'paragraph', 'number', 'multiple_choice',
                    'checkboxes', 'dropdown', 'date', 'time', 'email',
                    'phone', 'name', 'address'
                  ]
                },
                label: { type: 'string', description: 'The question or label for the form element.' },
                placeholder: { type: 'string', description: 'Optional placeholder text for input fields.' },
                required: { type: 'boolean', description: 'Whether the field is mandatory.' },
                options: {
                  type: 'array',
                  description: 'Array of options for multiple_choice, checkboxes, or dropdown. Each option should be an object with a "value" string property.',
                  items: {
                    type: 'object',
                    properties: {
                      // id: { type: 'string', description: 'A unique identifier for the option (will be generated later).' },
                      value: { type: 'string' }
                    },
                    required: ['value']
                  }
                }
              },
              required: ['type', 'label']
            }
          }
        },
        required: ['title', 'elements']
      }
    }
  },
  required: ['title', 'pages']
};

// System prompt to guide the AI
const systemPrompt = `You are an expert medical form generator. Your task is to create a structured clinical form based on the user's request.

Output ONLY a valid JSON object matching the following schema. Do NOT include any introductory text, explanations, or markdown formatting like \`\`\`json. Do not include 'id' fields for elements or options, they will be generated later.

Schema:
${JSON.stringify(formSchema, null, 2)}

Ensure all generated element types are within the allowed enum values. For elements requiring options (multiple_choice, checkboxes, dropdown), provide a relevant array of option objects, each with a "value" property. Generate appropriate page titles and element labels based on the user prompt. If multiple logical sections are implied by the prompt, create multiple pages.`;

exports.handler = async (event) => {
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'DeepSeek API key is not configured. Please set the DEEPSEEK_API_KEY environment variable.' }),
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  let userPrompt;
  try {
    const body = JSON.parse(event.body);
    userPrompt = body.prompt;
    if (!userPrompt) {
      throw new Error('Missing prompt in request body');
    }
  } catch (error) {
    console.error("Error parsing request body:", error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid request body. Ensure JSON format with a "prompt" field.' }),
    };
  }

  const payload = {
    model: "deepseek-coder", // Or another suitable DeepSeek model
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    max_tokens: 2048, // Adjust as needed
    temperature: 0.5, // Adjust for creativity vs consistency
    response_format: { type: "json_object" } // Request JSON output if supported by the model/API version
  };

  try {
    console.log("Sending request to DeepSeek API...");
    const response = await axios.post(deepSeekApiUrl, payload, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000 // 30 second timeout
    });

    console.log("Received response from DeepSeek API.");

    if (response.data && response.data.choices && response.data.choices.length > 0) {
      const messageContent = response.data.choices[0].message?.content;
      if (messageContent) {
        try {
          // Attempt to parse the content directly as JSON
          const generatedJson = JSON.parse(messageContent);
          // TODO: Add validation against the formSchema here if desired
          console.log("Successfully parsed JSON response.");
          return {
            statusCode: 200,
            body: JSON.stringify(generatedJson), // Return the parsed JSON
          };
        } catch (parseError) {
          console.error("Error parsing DeepSeek response JSON:", parseError);
          console.error("Raw response content:", messageContent);
          return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to parse AI response as valid JSON.', rawResponse: messageContent }),
          };
        }
      } else {
        console.error("DeepSeek response missing message content:", response.data);
        return { statusCode: 500, body: JSON.stringify({ error: 'AI response did not contain expected content.' }) };
      }
    } else {
      console.error("Invalid response structure from DeepSeek:", response.data);
      return { statusCode: 500, body: JSON.stringify({ error: 'Received invalid response structure from AI service.' }) };
    }

  } catch (error) {
    console.error('Error calling DeepSeek API:', error.response ? error.response.data : error.message);
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({
        error: 'Failed to generate form using AI.',
        details: error.response?.data?.error?.message || error.message,
      }),
    };
  }
};
