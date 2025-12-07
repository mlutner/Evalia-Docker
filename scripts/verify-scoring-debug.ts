
import { db } from "../server/db";
import { surveys, surveyResponses } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { buildScoringTrace } from "../server/utils/scoringDebug";
import type { Survey } from "@shared/schema";

async function verifyScoringDebug() {
    console.log("🔍 Verifying Scoring Debug Logic for Golden Survey...");

    // 1. Get Golden Survey
    const [survey] = await db
        .select()
        .from(surveys)
        .where(eq(surveys.title, "Golden Analytics Test Survey"))
        .limit(1);

    if (!survey) {
        console.error("❌ Golden Survey not found! Run 'npm run seed:analytics' first.");
        process.exit(1);
    }

    console.log(`✅ Survey found: ${survey.title} (${survey.id})`);

    // 2. Get a response
    const [response] = await db
        .select()
        .from(surveyResponses)
        .where(eq(surveyResponses.surveyId, survey.id))
        .limit(1);

    if (!response) {
        console.error("❌ No responses found for Golden Survey.");
        process.exit(1);
    }

    console.log(`✅ Response found: ${response.id}`);

    // 3. Run Scoring Trace
    const answers = response.answers as Record<string, string | string[]>;
    const trace = buildScoringTrace(survey as unknown as Survey, answers, response.id);

    // 4. Validate Results
    console.log("\n📊 Scoring Trace Results:");

    if (trace.errors.length > 0) {
        console.error("❌ Trace contains errors:");
        trace.errors.forEach(e => console.error(`   - ${e}`));
        process.exit(1);
    }

    // Check categories
    const expectedCategories = [
        "leadership-effectiveness",
        "team-wellbeing",
        "burnout-risk",
        "psychological-safety",
        "engagement"
    ];

    let allPass = true;

    for (const catId of expectedCategories) {
        const catResult = trace.categories.find(c => c.categoryId === catId);
        if (!catResult) {
            console.error(`❌ Missing category in trace: ${catId}`);
            allPass = false;
            continue;
        }

        console.log(`   - ${catId}: ${catResult.normalizedScore} (Band: ${catResult.bandLabel})`);

        if (catResult.normalizedScore === 0 && catResult.rawScore === 0) {
            // It's possible for a score to be 0, but for golden survey we expect non-zero
            console.warn(`   ⚠️  Score is 0 for ${catId}. Check if this is expected.`);
        }
    }

    if (allPass) {
        console.log("\n✅ Scoring Debug Logic Verified Successfully!");
        process.exit(0);
    } else {
        console.error("\n❌ Verification Failed.");
        process.exit(1);
    }
}

verifyScoringDebug().catch(console.error);
