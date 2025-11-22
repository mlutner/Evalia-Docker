# OpenRouter API Configuration

Reference: https://openrouter.ai/docs/quickstart

## API Endpoint
```
https://openrouter.ai/api/v1/chat/completions
```

## Required Headers
```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <OPENROUTER_API_KEY>",
  "HTTP-Referer": "<YOUR_SITE_URL>",      // Optional but recommended for rankings
  "X-Title": "<YOUR_SITE_NAME>"            // Optional but recommended for rankings
}
```

## Request Format
```javascript
{
  "model": "provider/model-id",  // CRITICAL: Must include provider prefix
  "messages": [
    {
      "role": "system",
      "content": "System prompt here"
    },
    {
      "role": "user",
      "content": "User message here"
    }
  ],
  "temperature": 0.7,            // Optional, 0-2 range
  "max_tokens": 1024             // Optional
}
```

## Response Format
```javascript
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Response text here"
      }
    }
  ]
}
```

## Model IDs (Provider Prefix Required)

### Mistral Models
- `mistralai/mistral-7b-instruct` - Small, fast model
- `mistralai/mistral-medium` - Medium complexity
- `mistralai/mistral-large` - Large model

### OpenAI Models
- `openai/gpt-4o` - Latest GPT-4
- `openai/gpt-4-turbo` - GPT-4 Turbo
- `openai/gpt-3.5-turbo` - GPT-3.5

### Claude Models
- `anthropic/claude-3-sonnet` - Sonnet
- `anthropic/claude-3-opus` - Opus

## Complete Example (JavaScript/Node.js)
```javascript
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'HTTP-Referer': 'https://evalia.replit.dev',
    'X-Title': 'Evalia Survey Builder',
  },
  body: JSON.stringify({
    model: 'mistralai/mistral-7b-instruct',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant.'
      },
      {
        role: 'user',
        content: 'What is the meaning of life?'
      }
    ],
    temperature: 0.7,
    max_tokens: 1024,
  }),
});

const data = await response.json();
const content = data.choices[0].message.content;
```

## Implementation in Evalia (Enhance Prompt Feature)

**File:** `server/routes.ts`
**Endpoint:** `POST /api/enhance-prompt`

The Enhance Prompt button uses OpenRouter with Mistral 7B Instruct to improve survey prompts:
- Takes user's survey description
- Sends to Mistral for AI-powered enhancement
- Returns improved prompt with more details about question count, types, and scoring

**Current Configuration:**
- Model: `mistralai/mistral-7b-instruct`
- Temperature: 0.7 (balanced creativity)
- Max tokens: 1024
- Headers: Include HTTP-Referer and X-Title for proper attribution

## Important Notes
- **Model ID Format:** Always include provider prefix (e.g., `mistralai/`, `openai/`, `anthropic/`)
- **Mistral Model ID:** Use `mistralai/mistral-7b-instruct` (NOT `mistral/mistral-7b-instruct`)
- **Headers:** HTTP-Referer and X-Title are optional but help with OpenRouter rankings and attribution
- **Rate Limits:** Check OpenRouter dashboard for your API key's usage and limits
- **Errors:** Invalid model IDs return 400 error with "is not a valid model ID" message
