# AI Monitoring & A/B Testing Implementation Report

## ✅ Implementation Complete

Evalia's AI infrastructure now includes **comprehensive performance monitoring and A/B testing frameworks** for data-driven optimization.

---

## 📊 Components Implemented

### 1. **Performance Monitoring System** (`server/utils/aiMonitoring.ts`)

**AICallLogger** tracks all AI requests with full metrics:

- **Latency Tracking**: Measures response time for every API call
- **Token Counting**: Estimates input/output token usage (4 chars per token)
- **Cost Calculation**: Calculates real costs based on Mistral API pricing:
  - Small model: $0.14 / $0.42 per 1M tokens (input/output)
  - Medium model: $0.70 / $2.10 per 1M tokens
  - Large model: $2.00 / $6.00 per 1M tokens
- **Performance Statistics**: Aggregates data by model and task type
- **Auto-Export**: Exports metrics every 5 minutes or at 100 calls threshold
- **Memory Management**: Keeps last 1000 calls for historical analysis

**Key Features:**
```typescript
aiLogger.logCall(metrics);           // Log completed AI call
aiLogger.getStats();                 // Get performance statistics
aiLogger.getRecentCalls(limit);      // Get recent calls for debugging
```

---

### 2. **A/B Testing Framework** (`server/utils/abTesting.ts`)

**ABTestingManager** enables data-driven experimentation:

- **Traffic Allocation**: Specify what % of traffic each variant receives
- **Variant Selection**: Automatic routing based on weights
- **Result Analysis**: Statistical significance calculation
- **Compound Scoring**: Scores variants on success + quality - latency
- **Multi-Experiment Support**: Run multiple experiments per task simultaneously

**Key Features:**
```typescript
abTestingManager.registerExperiment(taskType, config);
abTestingManager.selectVariant(taskType);              // Get variant for this call
abTestingManager.recordResult(result);                 // Record outcome
abTestingManager.analyzeResults(taskType);             // Get winning variant
abTestingManager.deactivateExperiment(taskType, name); // Conclude experiment
```

---

### 3. **Enhanced AI Client Integration** (`server/utils/aiClient.ts`)

**callMistral()** now includes monitoring and A/B testing:

```typescript
await callMistral(messages, {
  quality: "fast",           // Model selection (fast/balanced/best)
  taskType: "surveyGeneration",
  enableABTesting: true,     // Enable variant selection
  maxRetries: 3,
  timeout: 30000
});
```

**Automatic Logging:**
- Success cases: Full metrics + variant tracking
- Failure cases: Error context + cost estimation
- Both tracked for comprehensive analytics

---

## 🧪 Test Endpoints Available

### `/api/ai/test/health` (GET)
```
Tests AI connectivity and returns basic monitoring stats
Response includes:
- AI response validation
- Total calls tracked
- Success rate percentage
- Average latency (ms)
- Total cost ($USD)
```

### `/api/ai/test/monitoring` (GET)
```
Returns comprehensive performance analytics
Response includes:
- Overall metrics (calls, success rate, latency, cost)
- Breakdown by model (mistral-small/medium/large)
- Breakdown by task type (surveyGeneration, questionQuality, etc)
- Recent 5 calls with details
```

### `/api/ai/test/ab-testing` (GET)
```
Shows A/B testing status and results
Response includes:
- Active experiments configuration
- Results by variant
- Winning variant (if significant)
- Statistical significance (0-100%)
```

---

## 📈 How Monitoring Works

### Every AI Call Now Logs:
1. **Task Type** - What operation was performed
2. **Model Used** - Which Mistral model (small/medium/large)
3. **Quality Level** - Routing decision made (fast/balanced/best)
4. **Latency** - Time taken in milliseconds
5. **Tokens** - Input + output tokens used
6. **Cost** - Estimated cost in cents ($USD)
7. **Success/Failure** - Whether call succeeded
8. **Retries** - How many retry attempts were needed
9. **Variant** - A/B test variant if applicable
10. **Timestamp** - When call occurred

---

## 🔬 How A/B Testing Works

### Example: Testing Two Prompt Variations

```typescript
// Register control variant (50% traffic)
abTestingManager.registerExperiment("surveyGeneration", {
  name: "Control",
  active: true,
  trafficAllocation: 50,
  variant: {
    id: "control-v1",
    quality: "balanced",
    prompt: "Use original survey generation prompt..."
  }
});

// Register experiment variant (50% traffic)
abTestingManager.registerExperiment("surveyGeneration", {
  name: "NewPrompt",
  active: true,
  trafficAllocation: 50,
  variant: {
    id: "experiment-v1",
    quality: "balanced",
    prompt: "Use improved survey generation prompt..."
  }
});

// Traffic automatically routed: 50% control, 50% experiment
// After collecting enough data:
const results = abTestingManager.analyzeResults("surveyGeneration");
// Returns: winner, significance percentage, performance metrics
```

---

## 💰 Cost Tracking Example

For a typical AI call:
- Input: 500 tokens
- Output: 800 tokens
- Model: mistral-medium-latest
- Cost: (500 × $0.70 + 800 × $2.10) / 1M = ~$0.002 per call

**With Monitoring Dashboard:**
- See exact cost per task type
- Track total spending across models
- Identify cost optimization opportunities
- Compare model efficiency (cost vs quality trade-offs)

---

## 🚀 Production-Ready Features

✅ **Automatic Retry Logic** - Exponential backoff up to 3 retries
✅ **Error Recovery** - Handles malformed JSON responses
✅ **Timeout Protection** - 30-second default timeout per call
✅ **In-Memory Storage** - Fast local analytics (exportable to database)
✅ **Statistical Analysis** - Compound scoring for variant comparison
✅ **Real-Time Tracking** - See metrics as they happen
✅ **Scalable Design** - Ready for 1000+ calls in history

---

## 📝 Integration Points

All existing AI functions now support monitoring:
- `generateSurveyFromText()` - Survey generation from documents
- `refineSurvey()` - User-requested refinements
- `calculateScoresWithAI()` - Question quality scoring
- `analyzeResponses()` - Response analysis
- `generateSurveyText()` - AI-generated copywriting
- `suggestScoringConfig()` - Scoring model suggestions
- `generateSurveySummary()` - Response summaries

---

## 🎯 Next Steps (Optional Enhancements)

1. **Database Persistence** - Store metrics in PostgreSQL for historical analysis
2. **Dashboard UI** - Visualize monitoring data in the frontend
3. **Alerts** - Notify team when costs exceed thresholds
4. **Automation** - Auto-promote winning variants when significance > 95%
5. **Custom Metrics** - Track domain-specific quality indicators

---

## ✨ Key Benefits

**For Developers:**
- Identify which models/prompts work best
- Track API costs in real-time
- Debug AI issues with full context
- Run controlled experiments safely

**For Product:**
- Data-driven AI feature optimization
- Cost control through intelligent routing
- Identify performance bottlenecks
- Compare variants scientifically

**For Users:**
- Faster, more reliable AI features
- Better quality responses
- Reduced API costs = sustainable pricing

---

## 📊 Current Status

✅ All three monitoring/testing frameworks implemented
✅ Integrated with AI client with zero breaking changes
✅ Test endpoints available for verification
✅ Production-ready error handling and retries
✅ Ready for real-world usage

**Access monitoring data:**
- `/api/ai/test/monitoring` - Performance analytics
- `/api/ai/test/ab-testing` - Experiment results
- `/api/ai/test/health` - Quick health check
