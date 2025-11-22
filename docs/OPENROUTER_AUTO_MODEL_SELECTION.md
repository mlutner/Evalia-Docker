# OpenRouter Auto Model Selection

Reference: https://openrouter.ai/docs/routing/auto-model-selection

## Overview

The Auto Router (`openrouter/auto`) automatically chooses the best model for your prompt, powered by NotDiamond's intelligent routing. This is perfect for cost optimization while maintaining quality.

## How It Works

Simply set `model: "openrouter/auto"` and OpenRouter intelligently selects the best model for your specific prompt based on:
- Prompt complexity
- Model capabilities
- Cost efficiency
- Performance characteristics

## Basic Usage

```javascript
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <OPENROUTER_API_KEY>',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'openrouter/auto',
    messages: [
      {
        role: 'user',
        content: 'What is the meaning of life?',
      },
    ],
  }),
});

const data = await response.json();
// data.model contains the actual model that was selected
console.log(`Used model: ${data.model}`);
console.log(`Response: ${data.choices[0].message.content}`);
```

## Cost Optimization with Provider Sorting

Use the `provider` object with `sort: "price"` to further optimize for lowest cost:

```javascript
{
  model: 'openrouter/auto',
  messages: [...],
  provider: {
    sort: 'price',           // Prioritize lowest cost
    allow_fallbacks: true,   // Allow fallback providers
  }
}
```

## Response Format

The response includes which model was actually used:

```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Response text..."
      }
    }
  ],
  "model": "openai/gpt-3.5-turbo"  // Actual model selected
}
```

## Implementation in Evalia

**Feature:** Enhance Prompt Button
**File:** `server/routes.ts`
**Endpoint:** `POST /api/enhance-prompt`

The Enhance Prompt button now uses OpenRouter's Auto Model Selection for intelligent, cost-optimized model routing:

### Configuration
- **Model:** `openrouter/auto` (automatically selects best model)
- **Provider Sort:** `"price"` (optimizes for lowest cost)
- **Fallbacks:** Enabled (ensures reliability)
- **Temperature:** Configurable via admin panel (default 0.7)
- **Max Tokens:** Configurable via admin panel (default 1024)

### Benefits
✅ **Automatic Model Selection** - Best model chosen for each prompt
✅ **Cost Optimization** - Lowest-cost suitable model selected
✅ **Quality Maintained** - NotDiamond-powered intelligent routing
✅ **No Configuration Needed** - Works with any OpenRouter API key
✅ **Transparency** - Response shows which model was selected

### How to Use
1. Ensure survey_generation API key is set in Admin Dashboard
2. Optionally configure temperature/max_tokens parameters
3. Click Enhance button on survey prompt
4. Auto Router intelligently selects best model and enhances your prompt

### Admin Configuration
In Admin Dashboard, configure "Survey Generation" settings:
- **API Key:** Your OpenRouter API key (required)
- **Model:** Leave as-is or can customize (Auto Router handles model selection)
- **Base URL:** `https://openrouter.ai/api/v1` (OpenRouter endpoint)
- **Temperature:** Adjust if needed (default 0.7)
- **Max Tokens:** Adjust if needed (default 1024)

### Model Selection Example

For a prompt like "Create a survey to assess employee mental health":
- Auto Router evaluates the task
- Might select GPT-3.5 Turbo (good quality, lower cost)
- Or Claude Haiku (if simpler task needs less compute)
- Or Mistral 7B (if cost is critical)
- Selection optimized for both quality and cost

## Advanced: Custom Provider Order with Auto Router

You can combine Auto Router with provider ordering:

```javascript
{
  model: 'openrouter/auto',
  messages: [...],
  provider: {
    order: ['openai', 'anthropic', 'mistralai'],  // Try these providers first
    sort: 'price',
    allow_fallbacks: true,
  }
}
```

## When to Use Auto Router

✅ **Use when:**
- You want cost optimization without sacrificing quality
- Prompt complexity varies (different tasks need different models)
- You want automatic load balancing
- You trust NotDiamond's intelligent routing

❌ **Don't use when:**
- You need a specific model for regulatory/compliance reasons
- You need consistent pricing (different models cost differently)
- You require maximum performance (specific model might be faster)

## Tracking Model Usage

The response tells you which model was selected, allowing you to:
- Track costs by model
- Understand what models work best for your use cases
- Optimize further based on actual usage patterns

This data can be logged and analyzed to refine configuration if needed.
