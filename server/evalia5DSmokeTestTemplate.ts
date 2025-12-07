/**
 * Evalia 5D Smoke-Test Template
 * 
 * Purpose: Internal-only template to validate scoring, bands, and analytics 
 * across all five Evalia Insight Dimensions (EID).
 * 
 * Structure:
 * - 5 dimensions × 3 scored items each = 15 scored questions
 * - 2 demographics (role, department) = 17 total core questions
 * - 2 open-ended questions for qualitative feedback
 * 
 * Scoring categories mirror dimensions:
 * - engagement
 * - leadership-effectiveness
 * - psychological-safety
 * - team-wellbeing
 * - burnout-risk (reversed scoring - higher raw = worse)
 * 
 * For burnout-risk questions, we use `reverse: true` logic and inverted optionScores
 * so that higher agreement = lower score (higher burnout risk = lower performance).
 */

import { db } from "./db";
import { templates } from "@shared/schema";
import type { Question, SurveyScoreConfig } from "@shared/schema";

// Standard Likert 5-point optionScores (for positive dimensions)
const LIKERT_5_POSITIVE_SCORES: Record<string, number> = {
  "Strongly Disagree": 1,
  "Disagree": 2,
  "Neutral": 3,
  "Agree": 4,
  "Strongly Agree": 5,
};

// Reversed Likert 5-point optionScores (for burnout-risk - higher agreement = lower score)
const LIKERT_5_REVERSED_SCORES: Record<string, number> = {
  "Strongly Disagree": 5,
  "Disagree": 4,
  "Neutral": 3,
  "Agree": 2,
  "Strongly Agree": 1,
};

const evalia5DSmokeTestQuestions: Question[] = [
  // ============================================================================
  // DEMOGRAPHICS (Non-scorable)
  // ============================================================================
  {
    id: "q1_role",
    type: "multiple_choice",
    question: "What best describes your current role?",
    description: "Used for basic segmentation only.",
    required: true,
    options: [
      "Individual contributor",
      "People manager",
      "Senior leader",
      "Executive",
      "Other"
    ],
    displayStyle: "cards",
    scorable: false,
  },
  {
    id: "q2_department",
    type: "multiple_choice",
    question: "Which department do you primarily work in?",
    description: "Supports segmentation and manager comparison testing.",
    required: true,
    options: [
      "Operations",
      "Sales / Business Development",
      "Customer Support",
      "Product / Engineering",
      "People & Culture",
      "Other"
    ],
    displayStyle: "cards",
    scorable: false,
  },

  // ============================================================================
  // ENGAGEMENT (3 questions) - engagement dimension
  // ============================================================================
  {
    id: "q3_engagement_motivation",
    type: "likert",
    question: "I feel motivated to do my best work most days.",
    required: true,
    likertPoints: 5,
    likertType: "agreement",
    scorable: true,
    scoringCategory: "engagement",
    scoreWeight: 1,
    optionScores: LIKERT_5_POSITIVE_SCORES,
  },
  {
    id: "q4_engagement_pride",
    type: "likert",
    question: "I am proud to work for this organization.",
    required: true,
    likertPoints: 5,
    likertType: "agreement",
    scorable: true,
    scoringCategory: "engagement",
    scoreWeight: 1,
    optionScores: LIKERT_5_POSITIVE_SCORES,
  },
  {
    id: "q5_engagement_recommend",
    type: "likert",
    question: "I would recommend this organization as a great place to work.",
    required: true,
    likertPoints: 5,
    likertType: "agreement",
    scorable: true,
    scoringCategory: "engagement",
    scoreWeight: 1,
    optionScores: LIKERT_5_POSITIVE_SCORES,
  },

  // ============================================================================
  // LEADERSHIP EFFECTIVENESS (3 questions) - leadership-effectiveness dimension
  // ============================================================================
  {
    id: "q6_leadership_clarity",
    type: "likert",
    question: "Leaders provide a clear and consistent direction for our team.",
    required: true,
    likertPoints: 5,
    likertType: "agreement",
    scorable: true,
    scoringCategory: "leadership-effectiveness",
    scoreWeight: 1,
    optionScores: LIKERT_5_POSITIVE_SCORES,
  },
  {
    id: "q7_leadership_feedback",
    type: "likert",
    question: "My manager gives me useful feedback that helps me improve.",
    required: true,
    likertPoints: 5,
    likertType: "agreement",
    scorable: true,
    scoringCategory: "leadership-effectiveness",
    scoreWeight: 1,
    optionScores: LIKERT_5_POSITIVE_SCORES,
  },
  {
    id: "q8_leadership_trust",
    type: "likert",
    question: "I trust the decisions made by leaders in this organization.",
    required: true,
    likertPoints: 5,
    likertType: "agreement",
    scorable: true,
    scoringCategory: "leadership-effectiveness",
    scoreWeight: 1,
    optionScores: LIKERT_5_POSITIVE_SCORES,
  },

  // ============================================================================
  // PSYCHOLOGICAL SAFETY (3 questions) - psychological-safety dimension
  // ============================================================================
  {
    id: "q9_psych_safety_speak_up",
    type: "likert",
    question: "I feel safe to speak up about problems or concerns at work.",
    required: true,
    likertPoints: 5,
    likertType: "agreement",
    scorable: true,
    scoringCategory: "psychological-safety",
    scoreWeight: 1,
    optionScores: LIKERT_5_POSITIVE_SCORES,
  },
  {
    id: "q10_psych_safety_mistakes",
    type: "likert",
    question: "Mistakes are treated as learning opportunities rather than failures.",
    required: true,
    likertPoints: 5,
    likertType: "agreement",
    scorable: true,
    scoringCategory: "psychological-safety",
    scoreWeight: 1,
    optionScores: LIKERT_5_POSITIVE_SCORES,
  },
  {
    id: "q11_psych_safety_respect",
    type: "likert",
    question: "People on my team treat each other with respect.",
    required: true,
    likertPoints: 5,
    likertType: "agreement",
    scorable: true,
    scoringCategory: "psychological-safety",
    scoreWeight: 1,
    optionScores: LIKERT_5_POSITIVE_SCORES,
  },

  // ============================================================================
  // TEAM WELLBEING (3 questions) - team-wellbeing dimension
  // ============================================================================
  {
    id: "q12_wellbeing_energy",
    type: "likert",
    question: "At the end of most workdays, I still have enough energy for my personal life.",
    required: true,
    likertPoints: 5,
    likertType: "agreement",
    scorable: true,
    scoringCategory: "team-wellbeing",
    scoreWeight: 1,
    optionScores: LIKERT_5_POSITIVE_SCORES,
  },
  {
    id: "q13_wellbeing_support",
    type: "likert",
    question: "I feel supported by my team when work gets challenging.",
    required: true,
    likertPoints: 5,
    likertType: "agreement",
    scorable: true,
    scoringCategory: "team-wellbeing",
    scoreWeight: 1,
    optionScores: LIKERT_5_POSITIVE_SCORES,
  },
  {
    id: "q14_wellbeing_resources",
    type: "likert",
    question: "We have the tools and resources we need to manage workload in a healthy way.",
    required: true,
    likertPoints: 5,
    likertType: "agreement",
    scorable: true,
    scoringCategory: "team-wellbeing",
    scoreWeight: 1,
    optionScores: LIKERT_5_POSITIVE_SCORES,
  },

  // ============================================================================
  // BURNOUT RISK (3 questions) - burnout-risk dimension
  // NOTE: These use REVERSED scoring - higher agreement = LOWER score (bad)
  // ============================================================================
  {
    id: "q15_burnout_exhaustion",
    type: "likert",
    question: "I feel emotionally exhausted by my work.",
    description: "Higher agreement indicates higher burnout risk (reversed scoring).",
    required: true,
    likertPoints: 5,
    likertType: "agreement",
    scorable: true,
    scoringCategory: "burnout-risk",
    scoreWeight: 1,
    optionScores: LIKERT_5_REVERSED_SCORES, // Reversed: Strongly Agree = 1 (bad)
  },
  {
    id: "q16_burnout_detached",
    type: "likert",
    question: "I feel detached or cynical about my work.",
    description: "Higher agreement indicates higher burnout risk (reversed scoring).",
    required: true,
    likertPoints: 5,
    likertType: "agreement",
    scorable: true,
    scoringCategory: "burnout-risk",
    scoreWeight: 1,
    optionScores: LIKERT_5_REVERSED_SCORES, // Reversed: Strongly Agree = 1 (bad)
  },
  {
    id: "q17_burnout_stress",
    type: "likert",
    question: "The level of stress in my job feels unmanageable.",
    description: "Higher agreement indicates higher burnout risk (reversed scoring).",
    required: true,
    likertPoints: 5,
    likertType: "agreement",
    scorable: true,
    scoringCategory: "burnout-risk",
    scoreWeight: 1,
    optionScores: LIKERT_5_REVERSED_SCORES, // Reversed: Strongly Agree = 1 (bad)
  },

  // ============================================================================
  // OPEN-ENDED QUESTIONS (Non-scorable)
  // ============================================================================
  {
    id: "q18_open_bright_spots",
    type: "textarea",
    question: "What is one thing this organization is doing well that we should continue?",
    required: false,
    rows: 4,
    scorable: false,
  },
  {
    id: "q19_open_focus_areas",
    type: "textarea",
    question: "What is one area we should focus on improving over the next 6–12 months?",
    required: false,
    rows: 4,
    scorable: false,
  },
];

const evalia5DScoreConfig: SurveyScoreConfig = {
  enabled: true,
  categories: [
    {
      id: "engagement",
      name: "Engagement Energy",
    },
    {
      id: "leadership-effectiveness",
      name: "Leadership Effectiveness",
    },
    {
      id: "psychological-safety",
      name: "Psychological Safety",
    },
    {
      id: "team-wellbeing",
      name: "Team Wellbeing",
    },
    {
      id: "burnout-risk",
      name: "Burnout Risk",
    },
  ],
  scoreRanges: [
    { 
      id: "critical", 
      label: "Critical", 
      min: 0, 
      max: 39, 
      color: "#ef4444",
      shortDescription: "Critical risk level - immediate attention needed",
      longDescription: "Multiple dimensions are in critical range. Use this template only for internal analytics validation.",
    },
    { 
      id: "needs-improvement", 
      label: "Needs Improvement", 
      min: 40, 
      max: 54, 
      color: "#f97316",
      shortDescription: "Needs improvement - meaningful risk areas present",
      longDescription: "Dimensions show meaningful risk areas. For this internal test, confirm that analytics surfaces them clearly.",
    },
    { 
      id: "developing", 
      label: "Developing", 
      min: 55, 
      max: 69, 
      color: "#eab308",
      shortDescription: "Developing - foundations present but consistency limited",
      longDescription: "Some foundations are present, but consistency and depth are limited. Use this to check band boundaries and narratives.",
    },
    { 
      id: "effective", 
      label: "Effective", 
      min: 70, 
      max: 84, 
      color: "#84cc16",
      shortDescription: "Effective - most dimensions in healthy range",
      longDescription: "Most dimensions are in a healthy range. Verify that the leaderboard and trends reflect this.",
    },
    { 
      id: "highly-effective", 
      label: "Highly Effective", 
      min: 85, 
      max: 100, 
      color: "#22c55e",
      shortDescription: "Highly effective - consistently strong scores",
      longDescription: "Consistently strong scores across dimensions. This state is unlikely with synthetic data, but useful for edge-case testing.",
    },
  ],
  resultsScreen: {
    enabled: true,
    layout: "bands",
    showTotalScore: true,
    showPercentage: true,
    showOverallBand: true,
    showCategoryBreakdown: true,
    showCategoryBands: true,
    showStrengthsAndRisks: true,
    showCallToAction: false,
    title: "Your People Dynamics Snapshot",
    subtitle: "This internal view shows how your organization currently scores across the five Evalia Insight Dimensions.",
    themeVariant: "neutral",
    scoreRanges: [
      {
        id: "critical",
        min: 0,
        max: 39,
        label: "Critical Risk Zone",
        headline: "Critical Risk Zone",
        summary: "Multiple dimensions are in critical range. Use this template only for internal analytics validation.",
        tone: "risk",
      },
      {
        id: "needs-improvement",
        min: 40,
        max: 54,
        label: "Needs Improvement",
        headline: "Needs Improvement",
        summary: "Dimensions show meaningful risk areas. For this internal test, confirm that analytics surfaces them clearly.",
        tone: "risk",
      },
      {
        id: "developing",
        min: 55,
        max: 69,
        label: "Developing",
        headline: "Developing",
        summary: "Some foundations are present, but consistency and depth are limited. Use this to check band boundaries and narratives.",
        tone: "neutral",
      },
      {
        id: "effective",
        min: 70,
        max: 84,
        label: "Effective",
        headline: "Effective",
        summary: "Most dimensions are in a healthy range. Verify that the leaderboard and trends reflect this.",
        tone: "strength",
      },
      {
        id: "highly-effective",
        min: 85,
        max: 100,
        label: "Highly Effective",
        headline: "Highly Effective",
        summary: "Consistently strong scores across dimensions. This state is unlikely with synthetic data, but useful for edge-case testing.",
        tone: "strength",
      },
    ],
    categories: [
      { categoryId: "engagement", show: true, emphasize: true, bandsMode: "inherit" },
      { categoryId: "leadership-effectiveness", show: true, bandsMode: "inherit" },
      { categoryId: "psychological-safety", show: true, bandsMode: "inherit" },
      { categoryId: "team-wellbeing", show: true, bandsMode: "inherit" },
      { categoryId: "burnout-risk", show: true, bandsMode: "inherit" },
    ],
  },
};

// Export the template object for use in seeding
export const evalia5DSmokeTestTemplate = {
  id: "evalia_5d_smoke_test_v1",
  title: "Evalia Insight Dimensions – 5D Smoke Test",
  description: "Internal-only template to validate scoring, bands, and analytics across all five Evalia Insight Dimensions. 5 dimensions × 3 items = 15 scored questions, plus 2 demographics and 2 open-ended questions.",
  category: "Internal Testing",
  questions: evalia5DSmokeTestQuestions,
  scoreConfig: evalia5DScoreConfig,
  is_featured: false,
  tags: [
    "internal",
    "has_scoring",
    "evalia_5d",
    "analytics_smoke_test",
    "eid_framework",
  ],
  createdAt: new Date(),
};

/**
 * Seeds the Evalia 5D Smoke Test template into the database.
 * Uses onConflictDoUpdate to upsert (update if exists, insert if not).
 */
async function seedEvalia5DSmokeTestTemplate() {
  try {
    console.log("Seeding Evalia 5D Smoke Test template...");

    await db.insert(templates).values(evalia5DSmokeTestTemplate)
      .onConflictDoUpdate({
        target: templates.id,
        set: {
          title: evalia5DSmokeTestTemplate.title,
          description: evalia5DSmokeTestTemplate.description,
          questions: evalia5DSmokeTestTemplate.questions,
          category: evalia5DSmokeTestTemplate.category,
          scoreConfig: evalia5DSmokeTestTemplate.scoreConfig,
          is_featured: evalia5DSmokeTestTemplate.is_featured,
          tags: evalia5DSmokeTestTemplate.tags,
        }
      });

    console.log("✅ Evalia 5D Smoke Test template seeded successfully!");
    console.log(`   Template ID: ${evalia5DSmokeTestTemplate.id}`);
    console.log(`   Total questions: ${evalia5DSmokeTestTemplate.questions.length}`);
    console.log(`   Scored questions: ${evalia5DSmokeTestTemplate.questions.filter(q => q.scorable).length}`);
    console.log(`   Categories: ${evalia5DScoreConfig.categories?.map(c => c.name).join(", ")}`);
  } catch (error) {
    console.error("❌ Error seeding Evalia 5D Smoke Test template:", error);
    throw error;
  }
}

// Export the seed function
export { seedEvalia5DSmokeTestTemplate };

// Allow running directly with: npx tsx server/evalia5DSmokeTestTemplate.ts
// For ESM modules, check if this is the main entry point using import.meta
import { fileURLToPath } from 'url';

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

if (isMainModule) {
  seedEvalia5DSmokeTestTemplate()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

