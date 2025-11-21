import type { Question } from "@/components/QuestionCard";

export interface SurveyTemplate {
  id: string;
  title: string;
  description: string;
  timing: string;
  audience: string;
  questionCount: number;
  questions: Question[];
}

export const surveyTemplates: SurveyTemplate[] = [
  {
    id: "know-your-team",
    title: "Know Your Team",
    description: "Pre-training discovery to understand participant roles, needs, and learning preferences.",
    timing: "Pre-training",
    audience: "Participants",
    questionCount: 5,
    questions: [
      {
        id: "q1",
        type: "textarea",
        question: "What is your current role and how long have you been in it?",
        required: true,
      },
      {
        id: "q2",
        type: "multiple_choice",
        question: "How confident are you in your current skills related to this training topic?",
        options: ["Not confident", "Slightly confident", "Moderately confident", "Confident", "Very confident"],
        required: true,
      },
      {
        id: "q3",
        type: "checkbox",
        question: "How do you prefer to learn new concepts? (Select all that apply)",
        options: ["Visual examples", "Group discussions", "Hands-on practice", "Reading material", "Self-paced study"],
        required: true,
      },
      {
        id: "q4",
        type: "textarea",
        question: "What do you hope to gain from this training?",
        required: true,
      },
      {
        id: "q5",
        type: "textarea",
        question: "What challenges does your team face that this training could help with?",
        required: false,
      },
    ],
  },
  {
    id: "pulse-check",
    title: "Training Check-in",
    description: "Mid-training feedback to assess engagement and pacing during a session.",
    timing: "Mid-training",
    audience: "Participants",
    questionCount: 5,
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "The session pace has been appropriate for me.",
        options: ["Too slow", "A bit slow", "Just right", "A bit fast", "Too fast"],
        required: true,
      },
      {
        id: "q2",
        type: "multiple_choice",
        question: "I find the content relevant to my work.",
        options: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"],
        required: true,
      },
      {
        id: "q3",
        type: "multiple_choice",
        question: "The facilitator explains concepts clearly.",
        options: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"],
        required: true,
      },
      {
        id: "q4",
        type: "textarea",
        question: "What part of today's session was most helpful or engaging?",
        required: false,
      },
      {
        id: "q5",
        type: "textarea",
        question: "Is there anything you'd like to spend more time on or change for the next session?",
        required: false,
      },
    ],
  },
  {
    id: "after-action-review",
    title: "After Action Review",
    description: "Post-training feedback to gather immediate reflections on quality, relevance, and delivery.",
    timing: "Post-training",
    audience: "Participants",
    questionCount: 6,
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "The training objectives were clearly explained and met.",
        options: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"],
        required: true,
      },
      {
        id: "q2",
        type: "multiple_choice",
        question: "The facilitator was knowledgeable and engaging.",
        options: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"],
        required: true,
      },
      {
        id: "q3",
        type: "multiple_choice",
        question: "I can apply what I learned to my job.",
        options: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"],
        required: true,
      },
      {
        id: "q4",
        type: "textarea",
        question: "What is one specific insight or skill you plan to apply?",
        required: true,
      },
      {
        id: "q5",
        type: "multiple_choice",
        question: "How likely are you to recommend this training to a colleague?",
        description: "0 = Not likely, 10 = Extremely likely",
        options: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
        required: true,
      },
      {
        id: "q6",
        type: "textarea",
        question: "Any final comments or suggestions?",
        required: false,
      },
    ],
  },
  {
    id: "transfer-to-practice",
    title: "Transfer to Practice",
    description: "30-day follow-up to evaluate sustained behavior change and application on the job.",
    timing: "30 days post-training",
    audience: "Participants",
    questionCount: 5,
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "I have applied what I learned in my daily work.",
        options: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"],
        required: true,
      },
      {
        id: "q2",
        type: "textarea",
        question: "Can you give an example of how you've applied a new skill or concept?",
        required: true,
      },
      {
        id: "q3",
        type: "textarea",
        question: "What barriers have you faced when trying to implement your learning?",
        required: false,
      },
      {
        id: "q4",
        type: "textarea",
        question: "What additional resources or support would help you apply this training better?",
        required: false,
      },
      {
        id: "q5",
        type: "multiple_choice",
        question: "My team has noticed positive changes in my performance.",
        options: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"],
        required: true,
      },
    ],
  },
  {
    id: "trainer-effectiveness",
    title: "Trainer Effectiveness 360",
    description: "Evaluate trainers through structured feedback from participants, peers, and supervisors.",
    timing: "Post-training or quarterly",
    audience: "Managers/Peers",
    questionCount: 5,
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "The trainer encouraged participation and engagement.",
        options: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"],
        required: true,
      },
      {
        id: "q2",
        type: "multiple_choice",
        question: "The trainer handled questions and challenges effectively.",
        options: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"],
        required: true,
      },
      {
        id: "q3",
        type: "multiple_choice",
        question: "The trainer demonstrated deep subject expertise.",
        options: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"],
        required: true,
      },
      {
        id: "q4",
        type: "textarea",
        question: "What was the most valuable aspect of the trainer's delivery?",
        required: true,
      },
      {
        id: "q5",
        type: "textarea",
        question: "What could the trainer improve to enhance future sessions?",
        required: false,
      },
    ],
  },
];
