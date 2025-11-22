# OpenRouter Provider Routing

Reference: https://openrouter.ai/docs/features/provider-routing

## Overview
OpenRouter routes requests to the best available providers for your model. By default, requests are load balanced across the top providers to maximize uptime and minimize cost.

You can customize routing using the `provider` object in the request body.

## Provider Object Fields

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `order` | string[] | - | List of provider slugs to try in order (e.g., `["anthropic", "openai"]`) |
| `allow_fallbacks` | boolean | `true` | Whether to allow backup providers when primary unavailable |
| `require_parameters` | boolean | `false` | Only use providers that support all request parameters |
| `data_collection` | "allow" \| "deny" | "allow" | Control whether to use providers that may store data |
| `zdr` | boolean | - | Restrict to ZDR (Zero Data Retention) endpoints only |
| `enforce_distillable_text` | boolean | - | Restrict to models allowing text distillation |
| `only` | string[] | - | List of provider slugs allowed for this request |
| `ignore` | string[] | - | List of provider slugs to skip for this request |
| `quantizations` | string[] | - | Filter by quantization levels (e.g., `["int4", "int8"]`) |
| `sort` | string | - | Sort providers: "price", "throughput", or "latency" |
| `max_price` | object | - | Maximum pricing for this request |

## Default Load Balancing Strategy

1. Prioritize providers with no significant outages in last 30 seconds
2. Among stable providers, weight selection by inverse square of price
3. Use remaining providers as fallbacks

### Example
If Provider A costs $1/M tokens, B costs $2, C costs $3, and B had outages:
- Request routed to Provider A (9x more likely than C due to 1/3² = 1/9)
- If A fails, try C next
- If C fails, try B last

## Provider Sorting

Disable load balancing and prioritize specific attributes:

### Sort Options
- `"price"`: Prioritize lowest cost
- `"throughput"`: Prioritize highest throughput (fast responses)
- `"latency"`: Prioritize lowest latency

### Example: Sort by throughput
```json
{
  "model": "meta-llama/llama-3.1-70b-instruct",
  "messages": [{ "role": "user", "content": "Hello" }],
  "provider": {
    "sort": "throughput"
  }
}
```

### Example: Sort by price
```json
{
  "model": "mistralai/mixtral-8x7b-instruct",
  "messages": [{ "role": "user", "content": "Hello" }],
  "provider": {
    "sort": "price"
  }
}
```

## Nitro and Floor Shortcuts

### Nitro (`:nitro`)
Append `:nitro` to model slug to sort by throughput:
```json
{
  "model": "meta-llama/llama-3.1-70b-instruct:nitro"
}
```
Equivalent to `provider: { sort: "throughput" }`

### Floor (`:floor`)
Append `:floor` to model slug to sort by price:
```json
{
  "model": "meta-llama/llama-3.1-70b-instruct:floor"
}
```
Equivalent to `provider: { sort: "price" }`

## Ordering Specific Providers

Use `order` field to specify provider priority:

### Example: Try Anthropic first, then OpenAI, then others
```json
{
  "model": "mistralai/mixtral-8x7b-instruct",
  "messages": [{ "role": "user", "content": "Hello" }],
  "provider": {
    "order": ["anthropic", "openai"]
  }
}
```

### With fallbacks disabled (fail if specified providers fail)
```json
{
  "model": "mistralai/mixtral-8x7b-instruct",
  "messages": [{ "role": "user", "content": "Hello" }],
  "provider": {
    "order": ["openai", "together"],
    "allow_fallbacks": false
  }
}
```

## Implementation in Evalia

**Feature:** Enhance Prompt Button
**File:** `server/routes.ts`
**Endpoint:** `POST /api/enhance-prompt`

The Enhance Prompt button is now fully configurable via the Admin Panel:

1. Uses `survey_generation` function configuration
2. Pulls API key, model, base URL, and parameters from admin settings
3. Supports any OpenRouter-compatible provider and model

**To use with different providers:**
1. Go to Admin Dashboard
2. Configure "Survey Generation" settings with desired:
   - API Key (OpenRouter API key)
   - Model (e.g., `mistralai/mixtral-8x7b-instruct`, `openai/gpt-4o`, `anthropic/claude-3-sonnet`)
   - Base URL (`https://openrouter.ai/api/v1`)
   - Parameters (temperature, max_tokens)

3. Enhance button automatically uses configured model

## Available OpenRouter Models

Common models across providers:
- **Mistral:** `mistralai/mistral-7b-instruct`, `mistralai/mixtral-8x7b-instruct`, `mistralai/mistral-large`
- **OpenAI:** `openai/gpt-4o`, `openai/gpt-4-turbo`, `openai/gpt-3.5-turbo`
- **Anthropic:** `anthropic/claude-3-sonnet`, `anthropic/claude-3-opus`, `anthropic/claude-3-haiku`
- **Meta:** `meta-llama/llama-3.1-70b-instruct`, `meta-llama/llama-2-70b-chat`

Check OpenRouter docs for complete list: https://openrouter.ai/docs/models
