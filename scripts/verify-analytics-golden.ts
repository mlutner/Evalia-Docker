
import { db } from "../server/db";
import { surveys } from "../shared/schema";
import { eq } from "drizzle-orm";
import { computeIndexDistribution } from "../server/utils/analytics";

const GOLDEN_SURVEY_ID = 'golden-test-survey-001';

const INDICES = [
    'leadership-effectiveness',
    'team-wellbeing',
    'burnout-risk',
    'psychological-safety',
    'engagement'
];

async function verifyAnalytics() {
    console.log('🔍 Verifying Analytics for Golden Survey:', GOLDEN_SURVEY_ID);

    // Check if survey exists
    const [survey] = await db.select().from(surveys).where(eq(surveys.id, GOLDEN_SURVEY_ID));
    if (!survey) {
        console.error('❌ Golden Survey not found! Did you run the seed script?');
        process.exit(1);
    }

    console.log('✅ Survey found:', survey.title);

    let hasError = false;

    const EXPECTED = {
        engagement: 72,
        'leadership-effectiveness': 70,
        'psychological-safety': 71,
        'team-wellbeing': 70,
        'burnout-risk': 64,
    };

    for (const indexType of INDICES) {
        try {
            const distribution = await computeIndexDistribution(GOLDEN_SURVEY_ID, indexType);
            const meanScore = distribution.overall.statistics.mean;

            console.log(`\n📊 Index: ${indexType}`);
            console.log(`   Mean Score: ${meanScore}`);

            if (meanScore === 0 || meanScore === null) {
                console.error(`   ❌ ERROR: Score is 0 or null!`);
                console.error(`   Possible cause: Scoring engine mismatch for Likert text answers vs optionScores.`);
                hasError = true;
            } else {
                const expected = EXPECTED[indexType as keyof typeof EXPECTED];
                if (Math.abs(meanScore - expected) > 0.5) {
                    console.error(`   ❌ ERROR: Score mismatch! Expected ${expected}, got ${meanScore}`);
                    hasError = true;
                } else {
                    console.log(`   ✅ Score OK (Matches expected ${expected})`);
                }
            }
        } catch (err) {
            console.error(`   ❌ Exception computing ${indexType}:`, err);
            hasError = true;
        }
    }

    if (hasError) {
        console.log('\n❌ Verification FAILED. Please fix the scoring engine.');
        process.exit(1);
    } else {
        console.log('\n✅ Verification PASSED. All scores are valid.');
        process.exit(0);
    }
}

verifyAnalytics().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
