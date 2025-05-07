const DEEPSEEK_API_KEY = 'sk-86a00317cf934ec9b2b3ad91196b184a';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

/**
 * Sends a message to the DeepSeek AI API and retrieves a response.
 * @param {Array} messages - An array of message objects (e.g., [{ role: 'user', content: 'Hello' }]).
 * @param {Object} options - Additional options for the API call (e.g., temperature, max_tokens).
 * @returns {Promise<Object>} - The response from the DeepSeek API.
 */
export async function callDeepSeekAI(messages, options = {}) {
  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response from AI.';
  } catch (error) {
    console.error('Error calling DeepSeek AI:', error);
    throw error;
  }
}