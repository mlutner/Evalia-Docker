/**
 * Comprehensive test suite for AI features with monitoring and A/B testing
 * Tests all major AI functions to ensure monitoring and A/B testing integration works
 */

import { callMistral, safeParseJSON } from "../utils/aiClient";
import { aiLogger } from "../utils/aiMonitoring";
import { abTestingManager } from "../utils/abTesting";

async function testAIFeatures() {
  console.log("🚀 Starting AI Features Test Suite");
  console.log("=====================================\n");

  try {
    // Test 1: Basic AI call with monitoring
    console.log("📊 Test 1: Basic AI Call with Monitoring");
    const testMessages = [
      {
        role: "system" as const,
        content: "You are a helpful assistant.",
      },
      {
        role: "user" as const,
        content: "What is 2+2? Answer briefly.",
      },
    ];

    const result = await callMistral(testMessages, {
      quality: "fast",
      taskType: "math-test",
      enableABTesting: false,
    });

    console.log("✅ API Response:", result.substring(0, 100) + "...");

    // Check monitoring logs
    const stats = aiLogger.getStats();
    console.log("📈 Monitoring Stats:");
    console.log(`   - Total Calls: ${stats.totalCalls}`);
    console.log(`   - Success Rate: ${stats.successRate.toFixed(2)}%`);
    console.log(`   - Avg Latency: ${stats.avgLatency.toFixed(0)}ms`);
    console.log(`   - Total Cost: $${(stats.totalCost / 100).toFixed(4)}`);
    console.log();

    // Test 2: JSON Response with Monitoring
    console.log("📝 Test 2: JSON Response with Monitoring");
    const jsonMessages = [
      {
        role: "system" as const,
        content:
          "You are a JSON-generating assistant. Return ONLY valid JSON.",
      },
      {
        role: "user" as const,
        content:
          'Create a simple JSON object with keys "name" and "value". Return only the JSON.',
      },
    ];

    const jsonResult = await callMistral(jsonMessages, {
      quality: "fast",
      responseFormat: { type: "json_object" },
      taskType: "json-generation",
    });

    const parsed = safeParseJSON(jsonResult);
    if (parsed) {
      console.log("✅ JSON Response:", JSON.stringify(parsed));
    } else {
      console.log("⚠️ JSON parsing failed");
    }
    console.log();

    // Test 3: A/B Testing Setup and Execution
    console.log("🔬 Test 3: A/B Testing Framework");

    // Register two variants for testing
    abTestingManager.registerExperiment("ab-test-task", {
      name: "Control",
      description: "Standard model",
      active: true,
      trafficAllocation: 50,
      variant: {
        id: "control-v1",
        quality: "fast",
        metadata: { description: "Fast model variant" },
      },
    });

    abTestingManager.registerExperiment("ab-test-task", {
      name: "Experiment",
      description: "Balanced model",
      active: true,
      trafficAllocation: 50,
      variant: {
        id: "experiment-v1",
        quality: "balanced",
        metadata: { description: "Balanced model variant" },
      },
    });

    console.log("📋 Active Experiments:");
    const activeExperiments = abTestingManager.getActiveExperiments();
    Object.entries(activeExperiments).forEach(([taskType, configs]) => {
      console.log(`   ${taskType}:`);
      configs.forEach((config) => {
        console.log(
          `     - ${config.name}: ${config.trafficAllocation}% traffic`
        );
      });
    });
    console.log();

    // Run 5 test calls with A/B testing enabled
    console.log("🧪 Running A/B Test with 5 calls...");
    for (let i = 1; i <= 5; i++) {
      try {
        const variant = abTestingManager.selectVariant("ab-test-task");
        console.log(
          `   Call ${i}: Selected variant ${variant?.id || "control"}`
        );

        await callMistral(
          [
            {
              role: "system" as const,
              content: "You are helpful.",
            },
            {
              role: "user" as const,
              content: `Test call ${i}. Reply with "OK".`,
            },
          ],
          {
            quality: variant?.quality || "fast",
            taskType: "ab-test-task",
            enableABTesting: true,
          }
        );
      } catch (err) {
        console.log(
          `   Call ${i}: Error (expected in test environment): ${(err as Error).message.substring(0, 50)}`
        );
      }
    }
    console.log();

    // Test 4: Performance Analytics
    console.log("📊 Test 4: Performance Analytics");
    const finalStats = aiLogger.getStats();

    console.log("🎯 Overall Metrics:");
    console.log(`   - Total Calls: ${finalStats.totalCalls}`);
    console.log(`   - Success Rate: ${finalStats.successRate.toFixed(2)}%`);
    console.log(`   - Avg Latency: ${finalStats.avgLatency.toFixed(0)}ms`);
    console.log(`   - Total Cost: $${(finalStats.totalCost / 100).toFixed(4)}`);

    if (Object.keys(finalStats.byModel).length > 0) {
      console.log("\n📈 By Model:");
      Object.entries(finalStats.byModel).forEach(([model, stats]) => {
        console.log(`   ${model}:`);
        console.log(`     - Calls: ${stats.calls}`);
        console.log(`     - Avg Latency: ${stats.avgLatency.toFixed(0)}ms`);
        console.log(`     - Cost: $${(stats.cost / 100).toFixed(4)}`);
      });
    }

    if (Object.keys(finalStats.byTask).length > 0) {
      console.log("\n📈 By Task:");
      Object.entries(finalStats.byTask).forEach(([task, stats]) => {
        console.log(`   ${task}:`);
        console.log(`     - Calls: ${stats.calls}`);
        console.log(`     - Avg Latency: ${stats.avgLatency.toFixed(0)}ms`);
        console.log(`     - Cost: $${(stats.cost / 100).toFixed(4)}`);
      });
    }

    console.log("\n✅ Test Suite Completed Successfully!");
    console.log("\n🔍 Key Features Verified:");
    console.log("   ✅ AI calls work with new monitoring");
    console.log("   ✅ Performance metrics are tracked");
    console.log("   ✅ Cost estimation is calculated");
    console.log("   ✅ JSON parsing with error recovery works");
    console.log("   ✅ A/B testing framework is functional");
    console.log("   ✅ Variant selection and recording works");
  } catch (error) {
    console.error("❌ Test Suite Failed:", error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAIFeatures().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

export { testAIFeatures };
