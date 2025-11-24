import { db } from "./db";
import { templates } from "@shared/schema";
import { sql } from "drizzle-orm";

const defaultTemplates = [
  {
    id: "1",
    title: "Training Session Feedback",
    description: "Collect feedback on training effectiveness, content, and delivery",
    category: "Training Feedback",
    questions: [
      { id: "q1", type: "rating" as const, question: "How relevant was the training content to your role?", ratingScale: 5, required: true },
      { id: "q2", type: "rating" as const, question: "How effective was the trainer?", ratingScale: 5, required: true },
      { id: "q3", type: "textarea" as const, question: "What were the most valuable takeaways?", required: false },
      { id: "q4", type: "textarea" as const, question: "What could be improved?", required: false }
    ],
    scoreConfig: null,
    createdAt: new Date(),
  },
  {
    id: "2",
    title: "Employee Satisfaction Survey",
    description: "Measure employee engagement and workplace satisfaction",
    category: "Satisfaction",
    questions: [
      { id: "q1", type: "rating" as const, question: "How satisfied are you with your current role?", ratingScale: 5, required: true },
      { id: "q2", type: "rating" as const, question: "How well do you feel supported by your manager?", ratingScale: 5, required: true },
      { id: "q3", type: "rating" as const, question: "How would you rate your work-life balance?", ratingScale: 5, required: true },
      { id: "q4", type: "multiple_choice" as const, question: "What would most improve your work experience?", options: ["More flexibility", "Better tools", "Career development", "Other"], required: true }
    ],
    scoreConfig: null,
    createdAt: new Date(),
  },
  {
    id: "3",
    title: "Product Feedback Form",
    description: "Gather user feedback on product features and usability",
    category: "Product Feedback",
    questions: [
      { id: "q1", type: "rating" as const, question: "How user-friendly is the product?", ratingScale: 5, required: true },
      { id: "q2", type: "rating" as const, question: "How well does the product meet your needs?", ratingScale: 5, required: true },
      { id: "q3", type: "checkbox" as const, question: "Which features do you use most?", options: ["Feature A", "Feature B", "Feature C", "Feature D"], required: false },
      { id: "q4", type: "textarea" as const, question: "What features would you like to see added?", required: false }
    ],
    scoreConfig: null,
    createdAt: new Date(),
  },
  {
    id: "4",
    title: "Course Completion Assessment",
    description: "Evaluate learner comprehension and course effectiveness",
    category: "Assessment",
    questions: [
      { id: "q1", type: "multiple_choice" as const, question: "What was the main topic covered?", options: ["Option 1", "Option 2", "Option 3", "Option 4"], required: true },
      { id: "q2", type: "rating" as const, question: "Rate your understanding of the material", ratingScale: 5, required: true },
      { id: "q3", type: "textarea" as const, question: "How will you apply what you learned?", required: false }
    ],
    scoreConfig: null,
    createdAt: new Date(),
  },
  {
    id: "5",
    title: "Event Feedback Survey",
    description: "Collect feedback from event attendees",
    category: "Event Feedback",
    questions: [
      { id: "q1", type: "rating" as const, question: "How would you rate the overall event?", ratingScale: 5, required: true },
      { id: "q2", type: "rating" as const, question: "How relevant was the content?", ratingScale: 5, required: true },
      { id: "q3", type: "rating" as const, question: "How well was the event organized?", ratingScale: 5, required: true },
      { id: "q4", type: "textarea" as const, question: "What topics would you like to see at future events?", required: false }
    ],
    scoreConfig: null,
    createdAt: new Date(),
  },
  {
    id: "6",
    title: "Customer Service Quality",
    description: "Measure customer satisfaction with support services",
    category: "Customer Service",
    questions: [
      { id: "q1", type: "rating" as const, question: "How quickly was your issue resolved?", ratingScale: 5, required: true },
      { id: "q2", type: "rating" as const, question: "Was the support representative helpful?", ratingScale: 5, required: true },
      { id: "q3", type: "nps" as const, question: "How likely are you to recommend us to others?", required: true },
      { id: "q4", type: "textarea" as const, question: "Additional comments", required: false }
    ],
    scoreConfig: null,
    createdAt: new Date(),
  },
  {
    id: "7",
    title: "Website Usability Test",
    description: "Evaluate website user experience and navigation",
    category: "Usability",
    questions: [
      { id: "q1", type: "rating" as const, question: "How easy was it to find what you needed?", ratingScale: 5, required: true },
      { id: "q2", type: "rating" as const, question: "How intuitive was the navigation?", ratingScale: 5, required: true },
      { id: "q3", type: "textarea" as const, question: "What was confusing or difficult?", required: false }
    ],
    scoreConfig: null,
    createdAt: new Date(),
  },
  {
    id: "8",
    title: "Program Evaluation",
    description: "Comprehensive program assessment and impact measurement",
    category: "Program Evaluation",
    questions: [
      { id: "q1", type: "rating" as const, question: "Did the program meet your expectations?", ratingScale: 5, required: true },
      { id: "q2", type: "rating" as const, question: "How applicable is the knowledge to your work?", ratingScale: 5, required: true },
      { id: "q3", type: "rating" as const, question: "Would you recommend this program to others?", ratingScale: 5, required: true },
      { id: "q4", type: "textarea" as const, question: "How will you apply what you learned?", required: false }
    ],
    scoreConfig: null,
    createdAt: new Date(),
  },
  {
    id: "9",
    title: "Onboarding Experience",
    description: "Assess new employee onboarding effectiveness",
    category: "Onboarding",
    questions: [
      { id: "q1", type: "rating" as const, question: "How well were you prepared for your role?", ratingScale: 5, required: true },
      { id: "q2", type: "rating" as const, question: "How effective was the onboarding process?", ratingScale: 5, required: true },
      { id: "q3", type: "textarea" as const, question: "What could improve the onboarding experience?", required: false }
    ],
    scoreConfig: null,
    createdAt: new Date(),
  },
  {
    id: "10",
    title: "Skills Assessment",
    description: "Evaluate proficiency in key competencies",
    category: "Assessment",
    questions: [
      { id: "q1", type: "rating" as const, question: "Communication skills", ratingScale: 5, required: true },
      { id: "q2", type: "rating" as const, question: "Problem-solving ability", ratingScale: 5, required: true },
      { id: "q3", type: "rating" as const, question: "Technical knowledge", ratingScale: 5, required: true },
      { id: "q4", type: "rating" as const, question: "Teamwork and collaboration", ratingScale: 5, required: true }
    ],
    scoreConfig: null,
    createdAt: new Date(),
  },
];

async function seed() {
  try {
    console.log("Seeding templates...");
    await db.insert(templates).values(defaultTemplates).onConflictDoNothing();
    console.log("Templates seeded successfully!");
  } catch (error) {
    console.error("Error seeding templates:", error);
  }
}

seed().then(() => process.exit(0));
