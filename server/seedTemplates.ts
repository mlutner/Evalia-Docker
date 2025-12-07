import { db } from "./db";
import { templates } from "@shared/schema";
import type { Question } from "@shared/schema";

// Question type mapping from user's format to Evalia schema
const mapQuestionType = (type: string): Question['type'] => {
  const typeMap: Record<string, Question['type']> = {
    'rating': 'rating',
    'nps': 'nps',
    'matrix': 'matrix',
    'multiple_choice': 'multiple_choice',
    'checkbox': 'checkbox',
    'ranking': 'ranking',
    'text_long': 'textarea',
    'text': 'text',
    'dropdown': 'dropdown',
    'slider': 'slider',
    'likert': 'likert',
    'yes_no': 'yes_no',
  };
  return typeMap[type] || 'text';
};

// Helper to convert user's question format to Evalia Question schema
const convertQuestion = (q: any, index: number): Question => {
  const questionType = mapQuestionType(q.question_type);
  
  // Check if this should be a likert scale (agreement-based labels)
  const isAgreementScale = q.options?.min_label?.toLowerCase()?.includes('disagree') ||
                           q.options?.max_label?.toLowerCase()?.includes('agree');
  
  // Use likert type for agreement scales, rating for everything else
  const finalType = (questionType === 'rating' && isAgreementScale) ? 'likert' : questionType;
  
  const baseQuestion: Question = {
    id: `q${index + 1}`,
    type: finalType,
    question: q.question_text,
    required: true,
  };

  // Add options based on question type
  if (q.options) {
    if (q.options.choices) {
      baseQuestion.options = q.options.choices;
    }
    if (q.options.scale) {
      baseQuestion.ratingScale = q.options.scale;
    }
    if (q.options.min_label || q.options.max_label) {
      baseQuestion.ratingLabels = {
        low: q.options.min_label || '',
        high: q.options.max_label || '',
      };
    }
    // Matrix questions - use rowLabels and colLabels (schema-compliant field names)
    if (q.options.rows && q.options.columns) {
      baseQuestion.rowLabels = q.options.rows;
      baseQuestion.colLabels = q.options.columns;
    }
  }

  // For rating type questions, always set ratingStyle to 'number' (not stars)
  if (finalType === 'rating') {
    baseQuestion.ratingStyle = 'number';
  }
  
  // For likert type questions, set the likert points
  if (finalType === 'likert') {
    baseQuestion.likertPoints = q.options?.scale || 5;
    baseQuestion.likertType = 'agreement';
  }

  return baseQuestion;
};

const canadianTemplates = [
  {
    id: "ca-employee-engagement",
    title: "Canadian Employee Engagement Survey",
    description: "Comprehensive employee engagement survey for Canadian organizations, measuring energy, satisfaction, fairness, inclusion, growth, manager support, and retention risk.",
    category: "Employee Engagement",
    questions: [
      { question_text: "In the past 4 weeks, how engaged have you felt in your work on a typical day?", question_type: "rating", options: { scale: 5, min_label: "Not engaged at all", max_label: "Extremely engaged" } },
      { question_text: "Overall, how satisfied are you with your current job?", question_type: "rating", options: { scale: 5, min_label: "Very dissatisfied", max_label: "Very satisfied" } },
      { question_text: "How likely are you to recommend this organization as a great place to work?", question_type: "nps", options: { scale: 10, min_label: "Not at all likely", max_label: "Extremely likely" } },
      { question_text: "I would be happy to still be working for this organization in two years.", question_type: "rating", options: { scale: 5, min_label: "Strongly disagree", max_label: "Strongly agree" } },
      { question_text: "How likely are you to actively look for a job outside this organization in the next 12 months?", question_type: "rating", options: { scale: 10, min_label: "Very unlikely", max_label: "Very likely" } },
      { question_text: "In the past 4 weeks, how much energy and enthusiasm have you typically brought to your work?", question_type: "rating", options: { scale: 5, min_label: "Very low energy", max_label: "Very high energy" } },
      { question_text: "I believe people are treated fairly in this organization, regardless of background or identity.", question_type: "rating", options: { scale: 5, min_label: "Strongly disagree", max_label: "Strongly agree" } },
      { question_text: "I have good opportunities to grow and develop my skills here.", question_type: "rating", options: { scale: 5, min_label: "Strongly disagree", max_label: "Strongly agree" } },
      { question_text: "I feel respected and included in my team.", question_type: "rating", options: { scale: 5, min_label: "Strongly disagree", max_label: "Strongly agree" } },
      { question_text: "My immediate supervisor supports my growth and development.", question_type: "rating", options: { scale: 5, min_label: "Strongly disagree", max_label: "Strongly agree" } },
      { question_text: "Please rank the following factors in order of how important they are to your engagement at work (1 = most important, 6 = least important).", question_type: "ranking", options: { choices: ["Meaningful work", "Pay and benefits", "Manager support", "Team culture", "Growth and development opportunities", "Workload and work-life balance"] } },
      { question_text: "Which areas most reduce your engagement at work at the moment? (Select all that apply.)", question_type: "checkbox", options: { choices: ["High workload or pace of work", "Unclear priorities or direction", "Limited growth or career opportunities", "Pay and benefits", "Leadership or decision-making", "Organizational culture or policies", "Limited flexibility in how or where I work", "Other"] } },
      { question_text: "How long have you worked for this organization?", question_type: "multiple_choice", options: { choices: ["Less than 6 months", "6–12 months", "1–3 years", "3–5 years", "5–10 years", "More than 10 years"] } },
      { question_text: "What best describes your primary work arrangement?", question_type: "multiple_choice", options: { choices: ["On-site", "Hybrid (mix of on-site and remote)", "Fully remote", "Field-based or mobile", "Other"] } },
      { question_text: "What is the most important change that would improve your experience at work?", question_type: "text_long", options: {} },
      { question_text: "Is there anything else you would like to share about your engagement or experience working here?", question_type: "text_long", options: {} },
    ].map(convertQuestion),
    scoreConfig: null,
    createdAt: new Date(),
  },
  {
    id: "ca-psych-safety",
    title: "Psychological Safety & Team Voice (Canada)",
    description: "Team-level survey for Canadian organizations to assess psychological safety, openness, and comfort speaking up about ideas, risks, and wellbeing.",
    category: "Training & Development",
    questions: [
      { question_text: "Please rate the extent to which each statement has been true for your team in the past 4 weeks.", question_type: "matrix", options: { rows: ["In my team, it feels safe to speak up with ideas, questions, or concerns.", "When someone makes a mistake in this team, it is often held against them.", "It is easy to ask for help from members of this team.", "People on this team sometimes reject others for being different.", "Members of this team value each other's unique skills and talents.", "It is safe to take a risk in this team.", "I feel comfortable raising concerns about workload, stress, or wellbeing."], columns: ["Strongly disagree", "Disagree", "Neither agree nor disagree", "Agree", "Strongly agree"], scale: 5 } },
      { question_text: "How often does your team reflect together on how to improve the way you work (for example, retrospectives, debriefs, learning huddles)?", question_type: "multiple_choice", options: { choices: ["Weekly or more often", "Every 2–4 weeks", "Every few months", "Once a year or less", "Almost never"] } },
      { question_text: "In the past 4 weeks, how often have you chosen not to speak up with an idea, concern, or question even though you thought it was important?", question_type: "rating", options: { scale: 5, min_label: "Never", max_label: "Very often" } },
      { question_text: "What, if anything, makes it harder for you to speak up in your team? (Select all that apply.)", question_type: "checkbox", options: { choices: ["Concern about negative impact on my reputation or career", "Fear of conflict or tension with others", "Strong hierarchy or seniority in the team", "Past experiences of being ignored or dismissed", "Lack of time or space in meetings", "Unclear decision-making processes", "I do not find it hard to speak up", "Other"] } },
      { question_text: "Which factors most help you feel safe to share ideas, questions, or concerns in your team? (Select all that apply.)", question_type: "checkbox", options: { choices: ["Leader invites questions and feedback", "Colleagues listen respectfully", "Clear follow-up when issues are raised", "Private channels for sensitive topics", "Past examples where speaking up led to improvements", "Team norms that encourage learning from mistakes", "Other"] } },
      { question_text: "In my team, we regularly discuss what we can learn from both successes and failures.", question_type: "rating", options: { scale: 5, min_label: "Strongly disagree", max_label: "Strongly agree" } },
      { question_text: "Overall, how would you rate the level of psychological safety in your team?", question_type: "rating", options: { scale: 5, min_label: "Very low", max_label: "Very high" } },
      { question_text: "Please describe a recent situation where you did or did not feel comfortable speaking up. What happened?", question_type: "text_long", options: {} },
      { question_text: "What is one change that would most increase psychological safety in your team?", question_type: "text_long", options: {} },
    ].map(convertQuestion),
    scoreConfig: null,
    createdAt: new Date(),
  },
  {
    id: "ca-burnout-risk",
    title: "Workload & Burnout Risk Screening (Canada)",
    description: "Non-clinical burnout risk survey for Canadian workplaces, focusing on emotional exhaustion, cynicism, efficacy, workload, overtime, supports, and comfort discussing stress.",
    category: "Employee Engagement",
    questions: [
      { question_text: "In the past 4 weeks, how often have you experienced each of the following in relation to your work?", question_type: "matrix", options: { rows: ["Feeling emotionally exhausted because of your work", "Feeling physically drained or fatigued at the end of the workday", "Feeling detached or cynical about your work", "Feeling that you are effective and accomplish worthwhile things in your job"], columns: ["Never", "Rarely", "Sometimes", "Often", "Very often"], scale: 5 } },
      { question_text: "Overall, how close do you feel to \"burning out\" in your job?", question_type: "rating", options: { scale: 5, min_label: "Not close at all", max_label: "Extremely close" } },
      { question_text: "In the past 4 weeks, how manageable has your overall workload felt?", question_type: "rating", options: { scale: 5, min_label: "Completely unmanageable", max_label: "Very manageable" } },
      { question_text: "In a typical week, how many hours do you usually work (including paid and unpaid overtime)?", question_type: "multiple_choice", options: { choices: ["Less than 35 hours", "35–40 hours", "41–45 hours", "46–50 hours", "More than 50 hours"] } },
      { question_text: "In the past 4 weeks, how often have you worked evenings or weekends to keep up with your workload?", question_type: "multiple_choice", options: { choices: ["Never or almost never", "Less than once a month", "A few times a month", "A few times a week", "Most days"] } },
      { question_text: "Which factors currently contribute most to your stress at work? (Select all that apply.)", question_type: "checkbox", options: { choices: ["High volume of work", "Tight or unrealistic deadlines", "Conflicting priorities or demands", "Unclear expectations or role boundaries", "Interpersonal conflict or difficult relationships", "Technology, systems, or tools", "Organizational changes or uncertainty", "Other"] } },
      { question_text: "Which supports have you used in the past 12 months to help manage work-related stress? (Select all that apply.)", question_type: "checkbox", options: { choices: ["Talking with my manager", "Talking with colleagues or peers", "Employee Assistance Program (EAP) or counselling", "Health or wellness benefits", "Time off or vacation", "Adjusting work hours or flexibility", "I have not used any supports", "Other"] } },
      { question_text: "How comfortable do you feel discussing workload or stress with your manager or leader?", question_type: "rating", options: { scale: 5, min_label: "Not at all comfortable", max_label: "Very comfortable" } },
      { question_text: "How confident are you that this organization takes employee wellbeing seriously?", question_type: "rating", options: { scale: 5, min_label: "Not at all confident", max_label: "Very confident" } },
      { question_text: "Please rank the following potential improvements in order of how much they would reduce stress or burnout risk for you (1 = most helpful, 6 = least helpful).", question_type: "ranking", options: { choices: ["More realistic workloads or staffing levels", "Clearer priorities and expectations", "More flexibility in when or where I work", "Better tools, systems, or processes", "More support from my manager or leadership", "More access to mental health or wellbeing resources"] } },
      { question_text: "If you are comfortable sharing, are there any non-work factors that significantly affect your stress at work?", question_type: "text_long", options: {} },
      { question_text: "Is there anything else you would like to share about your workload, stress, or wellbeing at work?", question_type: "text_long", options: {} },
    ].map(convertQuestion),
    scoreConfig: null,
    createdAt: new Date(),
  },
  {
    id: "ca-healthcare-burnout",
    title: "Healthcare Staff Burnout & Wellbeing Pulse (Canada)",
    description: "A focused burnout and wellbeing pulse survey for Canadian healthcare staff, measuring exhaustion, recovery, staffing adequacy, moral distress, safety, and quality of care pressures.",
    category: "Healthcare",
    questions: [
      { question_text: "In the past 4 weeks, how often have you experienced each of the following in your healthcare role?", question_type: "matrix", options: { rows: ["Feeling emotionally exhausted because of patient or client care", "Having difficulty recovering between shifts or workdays", "Feeling physically drained after shifts", "Feeling detached or numb in response to patient or client needs", "Feeling unable to provide the care you believe is needed (moral distress)", "Feeling concerned about the quality or safety of care due to workload or staffing"], columns: ["Never", "Rarely", "Sometimes", "Often", "Very often"], scale: 5 } },
      { question_text: "Staffing levels on my unit or service are adequate to provide safe, high-quality care.", question_type: "rating", options: { scale: 5, min_label: "Strongly disagree", max_label: "Strongly agree" } },
      { question_text: "In the past 4 weeks, how often have you worried about the quality or safety of care due to workload or staffing?", question_type: "rating", options: { scale: 5, min_label: "Never", max_label: "Very often" } },
      { question_text: "How would you rate the quality of care your team is typically able to provide on an average shift?", question_type: "rating", options: { scale: 5, min_label: "Very poor", max_label: "Excellent" } },
      { question_text: "My immediate leader supports my wellbeing and encourages the use of mental health resources when needed.", question_type: "rating", options: { scale: 5, min_label: "Strongly disagree", max_label: "Strongly agree" } },
      { question_text: "What is your most common shift length?", question_type: "multiple_choice", options: { choices: ["8 hours or less", "10 hours", "12 hours", "More than 12 hours", "Varies significantly"] } },
      { question_text: "In a typical month, how many night or weekend shifts do you work?", question_type: "multiple_choice", options: { choices: ["None", "1–3 shifts", "4–6 shifts", "7–10 shifts", "More than 10 shifts"] } },
      { question_text: "Which factors most contribute to stress or burnout risk in your healthcare role? (Select all that apply.)", question_type: "checkbox", options: { choices: ["High patient or client volume", "Complexity of cases", "Moral distress", "Administrative or documentation demands", "Violence, abuse, or disrespect from patients or families", "Staffing levels or absenteeism", "Inadequate equipment or resources", "Other"] } },
      { question_text: "Please rank the following potential improvements in order of how much they would reduce stress and burnout risk (1 = most helpful, 5 = least helpful).", question_type: "ranking", options: { choices: ["More consistent staffing levels", "Improved recovery time or shift scheduling", "Reduced administrative/documentation load", "Better team communication and collaboration", "More access to mental health and wellness supports"] } },
      { question_text: "What is one change that would most reduce burnout risk for you in this healthcare setting?", question_type: "text_long", options: {} },
      { question_text: "Is there anything else you would like to share about burnout or wellbeing in your healthcare workplace?", question_type: "text_long", options: {} },
    ].map(convertQuestion),
    scoreConfig: null,
    createdAt: new Date(),
  },
  {
    id: "ca-education-engagement",
    title: "Education Staff Engagement & Stress Survey (Canada)",
    description: "Survey for Canadian educators to assess engagement, workload, stressors, student behaviour challenges, development access, and leadership support across K–12 and post-secondary settings.",
    category: "Employee Engagement",
    questions: [
      { question_text: "In the past 4 weeks, how often have the following been true for you in your education role?", question_type: "matrix", options: { rows: ["I have felt energized by my work with learners.", "I have felt that my work has a positive impact on student or learner outcomes.", "My workload (including planning, marking, and administration) has been manageable.", "I have had enough time for lesson planning and preparation.", "I have experienced stress related to student behaviour or complex needs.", "I have felt supported by school or institutional leadership.", "I have felt safe raising concerns about student needs, workload, or safety."], columns: ["Never", "Rarely", "Sometimes", "Often", "Very often"], scale: 5 } },
      { question_text: "Which factors most contribute to stress in your role? (Select all that apply.)", question_type: "checkbox", options: { choices: ["Class size or student load", "Student behaviour or safety issues", "Administrative or reporting requirements", "Curriculum or policy changes", "Parent or guardian expectations", "Limited resources or supports", "Technology or system issues", "Other"] } },
      { question_text: "Which supports would be most helpful to improve your wellbeing and effectiveness? (Select all that apply.)", question_type: "checkbox", options: { choices: ["More collaboration time with colleagues", "More education assistants or support staff", "More mental health or wellbeing resources", "More relevant professional development", "Smaller class sizes or reduced student load", "Clearer expectations and priorities", "Better administrative processes or tools", "Other"] } },
      { question_text: "On average, how many hours per week do you work outside scheduled class or contact time (e.g., evenings, weekends)?", question_type: "multiple_choice", options: { choices: ["None", "1–5 hours", "6–10 hours", "11–15 hours", "More than 15 hours"] } },
      { question_text: "What best describes your primary education setting?", question_type: "multiple_choice", options: { choices: ["K–12 public school", "K–12 independent or private school", "Post-secondary (college or university)", "Adult or continuing education", "Other education setting"] } },
      { question_text: "What is your employment status?", question_type: "multiple_choice", options: { choices: ["Full-time permanent", "Part-time permanent", "Term or contract", "Casual or substitute", "Other"] } },
      { question_text: "Please rank the following improvements in order of how much they would enhance your wellbeing and effectiveness (1 = most helpful, 6 = least helpful).", question_type: "ranking", options: { choices: ["Smaller class sizes or reduced student load", "More collaboration time", "More relevant professional development", "More support staff", "Reduced administrative tasks", "Better mental health resources"] } },
      { question_text: "What is the most important change that would improve your wellbeing as an educator or education staff member?", question_type: "text_long", options: {} },
      { question_text: "Is there anything else you would like to share about engagement, stress, or support needs in your education role?", question_type: "text_long", options: {} },
    ].map(convertQuestion),
    scoreConfig: null,
    createdAt: new Date(),
  },
  {
    id: "ca-training-evaluation",
    title: "Training Evaluation – Core Skills Program (Canada)",
    description: "Post-training evaluation for Canadian organizations, assessing satisfaction, relevance, learning gains, confidence, intention to apply skills, application barriers, and improvement opportunities.",
    category: "Training & Development",
    questions: [
      { question_text: "Overall, how satisfied are you with this training program?", question_type: "rating", options: { scale: 5, min_label: "Very dissatisfied", max_label: "Very satisfied" } },
      { question_text: "How likely are you to recommend this training to a colleague in a similar role?", question_type: "nps", options: { scale: 10, min_label: "Not at all likely", max_label: "Extremely likely" } },
      { question_text: "How relevant was the training content to your current role and responsibilities?", question_type: "rating", options: { scale: 5, min_label: "Not relevant", max_label: "Highly relevant" } },
      { question_text: "Compared to before the training, how would you rate your knowledge of this topic now?", question_type: "rating", options: { scale: 5, min_label: "Much lower", max_label: "Much higher" } },
      { question_text: "How confident do you feel in applying what you learned in your day-to-day work?", question_type: "rating", options: { scale: 5, min_label: "Not at all confident", max_label: "Very confident" } },
      { question_text: "How likely are you to apply what you learned in the next 30 days?", question_type: "rating", options: { scale: 10, min_label: "Very unlikely", max_label: "Very likely" } },
      { question_text: "Which aspects of the training did you find most valuable? (Select all that apply.)", question_type: "checkbox", options: { choices: ["Content and topics covered", "Facilitator or trainer", "Group discussions or interaction", "Practical exercises or activities", "Examples or case studies", "Job aids or supporting materials"] } },
      { question_text: "Which aspects of the training could be improved? (Select all that apply.)", question_type: "checkbox", options: { choices: ["Depth or level of content", "Length or duration", "Pacing or structure", "Opportunities for practice", "Use of technology or platform", "Follow-up or reinforcement", "Examples or case studies"] } },
      { question_text: "What, if anything, might make it difficult for you to apply what you learned?", question_type: "text_long", options: {} },
      { question_text: "What was the most useful thing you learned in this training?", question_type: "text_long", options: {} },
      { question_text: "What is one change we could make to improve this training for future participants?", question_type: "text_long", options: {} },
    ].map(convertQuestion),
    scoreConfig: null,
    createdAt: new Date(),
  },
  {
    id: "ca-pre-training-baseline",
    title: "Pre-Training Role Competency & Confidence Baseline (Self-Assessment)",
    description: "Self-assessment completed before training to establish a baseline of role clarity, competence, and readiness to apply new skills.",
    category: "Training & Development",
    questions: [
      { question_text: "I understand the core responsibilities and expectations of my role.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "I feel confident using the tools and systems required in my role.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "I know the standards of quality or performance expected of me.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "I have the knowledge I need to handle typical situations in my role.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "I often feel unprepared when unexpected situations arise at work.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "I am unsure where to find information or support when I need it for my role.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "I feel confident I can apply this upcoming training to my work.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "I am skeptical that this training will be relevant to my day-to-day work.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "I have time in my workload to practice and apply new skills from training.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "My manager supports my participation in this training and follow-up practice.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
    ].map(convertQuestion),
    scoreConfig: {
      enabled: true,
      categories: [
        { id: "role-clarity", name: "Role Clarity & Competence" },
        { id: "readiness", name: "Readiness & Support for Training" },
      ],
      scoreRanges: [
        { minScore: 45, maxScore: 50, interpretation: "High readiness - Participant is well-positioned to benefit from training. Focus on advanced application and stretch goals." },
        { minScore: 35, maxScore: 44, interpretation: "Moderate readiness - Good foundation. Clarify expectations and ensure manager support for practice and application." },
        { minScore: 25, maxScore: 34, interpretation: "Low readiness - Address gaps in role clarity, support, or relevance before or during training to maximize impact." },
        { minScore: 0, maxScore: 24, interpretation: "Very low readiness - High risk that training will not translate into impact. Consider 1:1 discussion and targeted support." },
      ],
      resultsSummary: "This assessment measures your readiness for training based on role clarity, competence, and support systems.",
    },
    createdAt: new Date(),
  },
  {
    id: "ca-post-training-behaviour",
    title: "Post-Training Behaviour Change & Skill Application Check-In (Self-Assessment)",
    description: "Self-assessment 30–60 days after training to measure behaviour change, skill application, and support in the work environment.",
    category: "Training & Development",
    questions: [
      { question_text: "In the past 4 weeks, I have intentionally used the skills from this training in my work.", question_type: "rating", options: { scale: 5, min_label: "Never", max_label: "Always" } },
      { question_text: "Using what I learned in this training helps me perform my job more effectively.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "I apply at least one concept or tool from this training every week.", question_type: "rating", options: { scale: 5, min_label: "Never", max_label: "Always" } },
      { question_text: "I rarely think about this training when doing my work.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "My manager encourages me to use skills from this training.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "I have opportunities in my role to practice what I learned.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "Workload or time pressures make it hard to apply what I learned.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "Colleagues are open to trying ideas or approaches from this training.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "How likely are you to continue applying what you learned from this training over the next 3 months?", question_type: "nps", options: { scale: 10, min_label: "Not at all likely", max_label: "Extremely likely" } },
    ].map(convertQuestion),
    scoreConfig: {
      enabled: true,
      categories: [
        { id: "application", name: "Application Frequency & Impact" },
        { id: "support", name: "Support & Environment" },
        { id: "sustainability", name: "Sustainability & Commitment" },
      ],
      scoreRanges: [
        { minScore: 40, maxScore: 50, interpretation: "High application - Training has translated into strong behaviour change. Capture success stories and consider scaling." },
        { minScore: 30, maxScore: 39, interpretation: "Moderate application - Some behaviour change observed. Strengthen manager support and reduce barriers to practice." },
        { minScore: 20, maxScore: 29, interpretation: "Limited application - Training value is at risk. Identify and address specific barriers in workload, relevance, or support." },
        { minScore: 0, maxScore: 19, interpretation: "Minimal or no application - Little evidence of transfer. Revisit program design, relevance, and manager involvement." },
      ],
      resultsSummary: "This assessment measures how well you've applied training skills on the job and the support you've received.",
    },
    createdAt: new Date(),
  },
  {
    id: "ca-training-roi",
    title: "Training Program ROI & Value Perception Survey",
    description: "Survey for HR and L&D leaders to understand perceived value, impact, and ROI of training programs from participant perspectives.",
    category: "Training & Development",
    questions: [
      { question_text: "Overall, how would you rate the value of this training program for your role?", question_type: "rating", options: { scale: 5, min_label: "Very low value", max_label: "Very high value" } },
      { question_text: "To what extent has this training improved your ability to meet your performance goals?", question_type: "rating", options: { scale: 5, min_label: "Not at all", max_label: "To a great extent" } },
      { question_text: "How clearly were the business or performance outcomes of this training communicated to you?", question_type: "rating", options: { scale: 5, min_label: "Not clear at all", max_label: "Extremely clear" } },
      { question_text: "How likely are you to say this training was a good use of your time?", question_type: "nps", options: { scale: 10, min_label: "Not at all likely", max_label: "Extremely likely" } },
      { question_text: "How well does this training align with your current role priorities and objectives?", question_type: "rating", options: { scale: 5, min_label: "Very poorly", max_label: "Extremely well" } },
      { question_text: "To what extent has this training contributed to any of the following outcomes? (Select all that apply.)", question_type: "checkbox", options: { choices: ["Improved quality of work", "Increased efficiency or productivity", "Better customer or client outcomes", "Improved collaboration or communication", "Reduced errors or rework", "No noticeable change yet"] } },
      { question_text: "Compared to other training you have attended in the past year, how would you rate the overall impact of this program?", question_type: "multiple_choice", options: { choices: ["Much lower impact", "Somewhat lower impact", "Similar impact", "Somewhat higher impact", "Much higher impact"] } },
      { question_text: "Please rank the following aspects of this training in order of the value they added for you (1 = most valuable, 5 = least valuable).", question_type: "ranking", options: { choices: ["Content and topics", "Facilitator or instructor", "Practical tools or templates", "Peer interaction and networking", "Digital platform or delivery format"] } },
      { question_text: "What specific business outcomes or performance metrics do you expect to see improve as a result of this training?", question_type: "text_long", options: {} },
      { question_text: "Is there anything that would have increased the value or impact of this training for you or your team?", question_type: "text_long", options: {} },
      { question_text: "Is there anything else you would like to share about the value or impact of this training program?", question_type: "text_long", options: {} },
    ].map(convertQuestion),
    scoreConfig: null,
    createdAt: new Date(),
  },
  {
    id: "ca-inclusive-learning",
    title: "Inclusive Learning Experience & Accessibility Survey",
    description: "Survey to assess how inclusive, accessible, and psychologically safe training experiences are for diverse participants.",
    category: "Training & Development",
    questions: [
      { question_text: "I felt that the training environment was inclusive and respectful of diverse perspectives.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "The materials and activities were accessible to me (for example, in terms of format, pacing, and language).", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "I felt comfortable participating and asking questions during the training.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "The examples, case studies, or scenarios used in the training reflected diverse people and contexts.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "If you used any accessibility features (for example, captions, alternative formats, assistive technology), how well did they work for you?", question_type: "multiple_choice", options: { choices: ["I did not need or use accessibility features", "They worked very poorly", "They worked somewhat poorly", "They worked somewhat well", "They worked very well"] } },
      { question_text: "Which aspects of the learning experience supported inclusion and accessibility for you? (Select all that apply.)", question_type: "checkbox", options: { choices: ["Facilitator style and behaviour", "Ground rules and norms", "Opportunities for different types of participation", "Accessible materials or formats", "Breaks and pacing", "Options to participate online or asynchronously", "Other"] } },
      { question_text: "Which aspects of the learning experience created barriers to inclusion or accessibility for you? (Select all that apply.)", question_type: "checkbox", options: { choices: ["Language or jargon used", "Pace of delivery", "Limited accessibility features", "Format (for example, fully in-person or fully online)", "Group dynamics or participation norms", "Examples that did not reflect diverse contexts", "Other"] } },
      { question_text: "Please rank the following potential improvements in order of importance for future inclusive learning experiences (1 = most important, 5 = least important).", question_type: "ranking", options: { choices: ["More accessible materials and formats", "More diverse examples and scenarios", "More options for how to participate", "Improved use of accessibility features or technology", "More explicit inclusion and psychological safety practices"] } },
      { question_text: "What, if anything, would have made this learning experience more inclusive or accessible for you?", question_type: "text_long", options: {} },
      { question_text: "Is there anything else you would like to share about inclusion or accessibility in this training?", question_type: "text_long", options: {} },
    ].map(convertQuestion),
    scoreConfig: null,
    createdAt: new Date(),
  },
  {
    id: "ca-manager-training-readiness",
    title: "Manager Training Readiness & Enablement Assessment (Self-Assessment)",
    description: "Self-assessment for managers to gauge their mindset, capability, and environment to support employees before and after training.",
    category: "Training & Development",
    questions: [
      { question_text: "I understand the learning objectives of the training programs my team attends.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "I believe developing my team through training is a core part of my role.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "Training is mostly a HR requirement rather than a business priority.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "I regularly discuss learning and development with my team members.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "I feel confident coaching team members to apply what they learn in training.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "I can give specific feedback on how team members use new skills on the job.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "I struggle to translate training content into practical expectations for my team.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "I know how to set clear on-the-job application goals with team members after training.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "Our workload allows time for team members to practice new skills from training.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "Our processes and tools (for example, performance management, goal setting) actively support learning and development.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "We rarely follow up on training once the session is over.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "I receive the information I need from HR or L&D (for example, objectives and key messages) to support my team after training.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
    ].map(convertQuestion),
    scoreConfig: {
      enabled: true,
      categories: [
        { id: "mindset", name: "Mindset & Ownership" },
        { id: "coaching", name: "Coaching Capability" },
        { id: "environment", name: "Environment & Support" },
      ],
      scoreRanges: [
        { minScore: 50, maxScore: 60, interpretation: "High readiness and enablement - Manager is well-positioned to champion learning. Consider involving them as a role model or mentor." },
        { minScore: 35, maxScore: 49, interpretation: "Moderate readiness - Solid foundation. Target specific lower-scoring sections with additional tools or support." },
        { minScore: 20, maxScore: 34, interpretation: "Developing readiness - Focus on building mindset and coaching skills; consider manager-focused development interventions." },
        { minScore: 0, maxScore: 19, interpretation: "Low readiness - Manager may struggle to support learning. Consider more intensive support and alignment discussions." },
      ],
      resultsSummary: "This assessment measures your readiness to support your team's learning and development.",
    },
    createdAt: new Date(),
  },
  {
    id: "ca-leadership-impact",
    title: "Leadership Development Program Impact Diagnostic",
    description: "Survey to evaluate the impact of leadership development programs on behaviours, team climate, and organizational outcomes.",
    category: "Training & Development",
    questions: [
      { question_text: "Since participating in the leadership program, how often do you apply the concepts or tools in your day-to-day leadership?", question_type: "rating", options: { scale: 5, min_label: "Never", max_label: "Very often" } },
      { question_text: "To what extent has the program improved your ability to give clear direction and set expectations?", question_type: "rating", options: { scale: 5, min_label: "Not at all", max_label: "To a great extent" } },
      { question_text: "To what extent has the program improved your ability to listen and respond to feedback from your team?", question_type: "rating", options: { scale: 5, min_label: "Not at all", max_label: "To a great extent" } },
      { question_text: "To what extent has the program influenced how you lead your team through change or uncertainty?", question_type: "rating", options: { scale: 5, min_label: "Not at all", max_label: "To a great extent" } },
      { question_text: "Please rate the extent to which you demonstrate the following leadership behaviours since the program.", question_type: "matrix", options: { rows: ["Encouraging open dialogue and feedback", "Recognizing and appreciating team contributions", "Addressing difficult issues in a timely way", "Coaching team members for growth", "Aligning team work with organizational priorities"], columns: ["Much less often", "Somewhat less often", "About the same", "Somewhat more often", "Much more often"], scale: 5 } },
      { question_text: "Overall, how would you rate the impact of this program on your effectiveness as a leader?", question_type: "rating", options: { scale: 5, min_label: "Very negative impact", max_label: "Very positive impact" } },
      { question_text: "How likely are you to recommend this leadership program to other leaders at your level?", question_type: "nps", options: { scale: 10, min_label: "Not at all likely", max_label: "Extremely likely" } },
      { question_text: "What aspects of the program were most valuable for your leadership practice? (Select all that apply.)", question_type: "checkbox", options: { choices: ["Workshops or classroom sessions", "Coaching or mentoring", "Peer learning or cohorts", "Assessments or feedback tools", "On-the-job assignments or projects", "Digital or self-paced learning"] } },
      { question_text: "What are the most significant changes you have noticed in your leadership since the program?", question_type: "text_long", options: {} },
      { question_text: "What additional support would help you sustain and deepen the impact of this program on your leadership?", question_type: "text_long", options: {} },
      { question_text: "Is there anything else you would like to share about the impact of this leadership development program?", question_type: "text_long", options: {} },
    ].map(convertQuestion),
    scoreConfig: null,
    createdAt: new Date(),
  },
  {
    id: "ca-learning-culture",
    title: "Learning Culture Maturity Assessment (Self-Assessment)",
    description: "Self-assessment to gauge the maturity of an organization or team's learning culture, including experimentation, feedback, and support for development.",
    category: "Employee Engagement",
    questions: [
      { question_text: "Please rate how often the following learning practices occur in your organization or team.", question_type: "matrix", options: { rows: ["We regularly reflect on what worked and what did not after projects or initiatives.", "People are encouraged to share what they learn with others.", "We experiment with new approaches and learn from the results.", "Learning and development goals are discussed during performance or check-in conversations.", "Learning from mistakes is treated as an opportunity rather than a failure.", "Time is protected for learning activities (for example, training, reading, peer learning)."], columns: ["Never", "Rarely", "Sometimes", "Often", "Always"], scale: 5 } },
      { question_text: "Leaders in our organization make time and space for learning activities (for example, reflection, training, experimentation).", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "Our systems and processes (for example, performance management, goal setting) actively support learning and development.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "We invest in tools and resources that make it easier for people to learn at work.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "Leaders in our organization role-model continuous learning.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "It feels safe to admit mistakes and discuss what we can learn from them.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "People feel comfortable asking questions when they do not understand something.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "Taking time to learn is seen as part of doing a good job, not as an extra or nice-to-have.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
    ].map(convertQuestion),
    scoreConfig: {
      enabled: true,
      categories: [
        { id: "practices", name: "Learning Culture Practices" },
        { id: "leadership", name: "Leadership & Systems Support" },
        { id: "safety", name: "Psychological Safety for Learning" },
      ],
      scoreRanges: [
        { minScore: 50, maxScore: 65, interpretation: "Advanced learning culture - Learning is well-embedded. Focus on refining strategy and sharing practices across the organization." },
        { minScore: 35, maxScore: 49, interpretation: "Developing learning culture - Good foundation. Strengthen weaker sections to progress." },
        { minScore: 20, maxScore: 34, interpretation: "Emerging learning culture - Some practices are in place. Clarify expectations and invest in leadership support for learning." },
        { minScore: 0, maxScore: 19, interpretation: "Limited learning culture - Learning may be ad hoc. Consider an intentional strategy to establish basic practices and safety." },
      ],
      resultsSummary: "This assessment measures your organization's learning culture maturity across practices, leadership support, and psychological safety.",
    },
    createdAt: new Date(),
  },
  {
    id: "ca-training-needs",
    title: "Training Needs Analysis (TNA) Survey for Departmental Planning",
    description: "Survey to identify current and future skill gaps, training priorities, and preferred learning formats across departments or teams.",
    category: "Training & Development",
    questions: [
      { question_text: "How confident do you feel in your current ability to perform the core tasks of your role?", question_type: "rating", options: { scale: 5, min_label: "Not at all confident", max_label: "Very confident" } },
      { question_text: "How confident do you feel in your ability to adapt to new tools, systems, or processes in your role?", question_type: "rating", options: { scale: 5, min_label: "Not at all confident", max_label: "Very confident" } },
      { question_text: "Which of the following skill areas are most important for your role in the next 12 months? (Select all that apply.)", question_type: "checkbox", options: { choices: ["Technical or job-specific skills", "Digital or technology skills", "Communication and collaboration", "Customer or client service", "Leadership or people management", "Project or time management", "Data and analytics", "Other"] } },
      { question_text: "Please rank the following skill areas in order of priority for your development (1 = highest priority, 5 = lowest priority).", question_type: "ranking", options: { choices: ["Technical or job-specific skills", "People or communication skills", "Leadership or management skills", "Digital or technology skills", "Business or financial acumen"] } },
      { question_text: "What types of learning formats work best for you? (Select all that apply.)", question_type: "checkbox", options: { choices: ["In-person workshops", "Virtual live sessions", "Self-paced eLearning", "On-the-job coaching or mentoring", "Reading or self-study", "Communities of practice or peer learning", "Other"] } },
      { question_text: "How much time can you realistically dedicate to learning and development in a typical month?", question_type: "multiple_choice", options: { choices: ["Less than 2 hours", "2–4 hours", "5–8 hours", "9–12 hours", "More than 12 hours"] } },
      { question_text: "In the past 12 months, how often have you had meaningful conversations with your manager about your development?", question_type: "multiple_choice", options: { choices: ["Never", "Once", "2–3 times", "4–6 times", "More than 6 times"] } },
      { question_text: "What are the biggest barriers to participating in learning and development? (Select all that apply.)", question_type: "checkbox", options: { choices: ["Lack of time", "Workload or deadlines", "Lack of manager support", "Limited access to relevant training", "Training schedules that do not fit", "Unclear learning priorities", "Other"] } },
      { question_text: "What is the most important skill or topic you would like to develop in the next 12 months?", question_type: "text_long", options: {} },
      { question_text: "Is there anything else you would like to share about your training and development needs?", question_type: "text_long", options: {} },
    ].map(convertQuestion),
    scoreConfig: null,
    createdAt: new Date(),
  },
  {
    id: "ca-coaching-effectiveness",
    title: "On-the-Job Coaching Effectiveness Self-Assessment",
    description: "Self-assessment for employees receiving coaching to rate the quality, safety, and impact of on-the-job coaching.",
    category: "Training & Development",
    questions: [
      { question_text: "I feel comfortable being open and honest with my coach.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "My coach listens actively and seeks to understand my perspective.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "I feel psychologically safe bringing up mistakes, concerns, or challenges in coaching sessions.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "Our coaching conversations are focused and use our time well.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "Coaching conversations help me make progress on real work challenges.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "Since starting coaching, I have changed how I approach at least one important aspect of my work.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "My coach helps me set clear, practical next steps between sessions.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "Coaching has had a positive impact on my performance or effectiveness at work.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "Coaching has helped me feel more confident in my role.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "Overall, how likely are you to recommend coaching to a colleague in a similar role?", question_type: "nps", options: { scale: 10, min_label: "Not at all likely", max_label: "Extremely likely" } },
    ].map(convertQuestion),
    scoreConfig: {
      enabled: true,
      categories: [
        { id: "relationship", name: "Coaching Relationship & Safety" },
        { id: "impact", name: "Impact & Follow-Through" },
        { id: "experience", name: "Overall Experience" },
      ],
      scoreRanges: [
        { minScore: 45, maxScore: 55, interpretation: "Highly effective coaching - Coaching is having a strong positive impact. Consider sustaining and sharing best practices." },
        { minScore: 30, maxScore: 44, interpretation: "Moderately effective coaching - Coaching is helpful, with room to strengthen specific areas such as follow-through or clarity of goals." },
        { minScore: 20, maxScore: 29, interpretation: "Limited coaching impact - Impact appears limited. Explore expectations, fit, or structure of coaching sessions." },
        { minScore: 0, maxScore: 19, interpretation: "Low coaching effectiveness - Coaching may not be working as intended. Consider redesigning the approach or providing additional support." },
      ],
      resultsSummary: "This assessment measures the effectiveness of your coaching experience.",
    },
    createdAt: new Date(),
  },
  {
    id: "ca-elearning-ux",
    title: "Digital Learning & eLearning UX Diagnostic",
    description: "Survey to evaluate the user experience, engagement, and usability of digital and eLearning programs.",
    category: "Training & Development",
    questions: [
      { question_text: "How easy was it to navigate the digital learning platform or course?", question_type: "rating", options: { scale: 5, min_label: "Very difficult", max_label: "Very easy" } },
      { question_text: "The instructions and expectations for each module or activity were clear.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "The pace and amount of content in the digital learning program felt manageable.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "The design and layout of the digital learning program made it easy to focus on the content.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "How engaging did you find the digital learning experience overall?", question_type: "rating", options: { scale: 5, min_label: "Not at all engaging", max_label: "Very engaging" } },
      { question_text: "Which elements of the digital learning experience were most engaging for you? (Select all that apply.)", question_type: "checkbox", options: { choices: ["Interactive quizzes or knowledge checks", "Videos or demonstrations", "Scenarios or simulations", "Discussions or forums", "Downloadable resources or job aids", "Gamification elements (for example, points or badges)", "Other"] } },
      { question_text: "Which elements, if any, made the digital learning experience less effective or more difficult? (Select all that apply.)", question_type: "checkbox", options: { choices: ["Technical issues or glitches", "Slow loading or performance", "Poor audio or video quality", "Too much text or information at once", "Confusing navigation", "Lack of interaction or feedback", "Other"] } },
      { question_text: "How well did this digital learning program prepare you to apply the content in your work?", question_type: "rating", options: { scale: 5, min_label: "Very poorly", max_label: "Extremely well" } },
      { question_text: "If you used this program on multiple devices (for example, desktop and mobile), how consistent was the experience across devices?", question_type: "multiple_choice", options: { choices: ["I only used one device", "Very inconsistent", "Somewhat inconsistent", "Mostly consistent", "Very consistent"] } },
      { question_text: "What is one change that would most improve the digital learning experience for you?", question_type: "text_long", options: {} },
      { question_text: "Is there anything else you would like to share about the user experience of this digital learning program?", question_type: "text_long", options: {} },
    ].map(convertQuestion),
    scoreConfig: null,
    createdAt: new Date(),
  },
  // ========================================
  // PULSE SURVEYS SECTION
  // ========================================
  {
    id: "pulse-engagement-morale",
    title: "Monthly Engagement & Morale Pulse (Canada)",
    description: "A short monthly pulse survey to track employee engagement, morale, and intent to stay in Canadian organizations.",
    category: "Pulse",
    is_featured: true,
    tags: ["employee-engagement", "pulse", "hr", "quick-5min", "canada", "morale"],
    questions: [
      { question_text: "Overall, how are you feeling about work this week?", question_type: "rating", options: { scale: 5, min_label: "Very Negative", max_label: "Very Positive" } },
      { question_text: "I feel motivated to do my best work.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "I have the clarity I need about my priorities for the upcoming week.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "How likely are you to recommend this organization as a great place to work?", question_type: "nps", options: { scale: 10, min_label: "Not at all likely", max_label: "Extremely likely" } },
      { question_text: "In the past two weeks, how often have you felt excited about your work?", question_type: "rating", options: { scale: 5, min_label: "Never", max_label: "Always" } },
      { question_text: "How manageable does your workload feel right now?", question_type: "multiple_choice", options: { choices: ["Far too light", "Somewhat light", "About right", "Somewhat heavy", "Far too heavy"] } },
      { question_text: "Which areas most affect how you feel about work right now? (Select all that apply)", question_type: "checkbox", options: { choices: ["Workload and deadlines", "Support from my manager", "Team relationships", "Recognition and appreciation", "Career growth opportunities", "Pay and benefits", "Hybrid/remote work setup"] } },
      { question_text: "Do you see yourself working here six months from now?", question_type: "multiple_choice", options: { choices: ["Yes", "Probably", "Not sure", "Probably not", "Definitely not"] } },
      { question_text: "I feel comfortable speaking up when something isn't working well.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "If there's one thing that would improve your experience at work in the next month, what would it be?", question_type: "text_long", options: {} },
    ].map(convertQuestion),
    scoreConfig: null,
    createdAt: new Date(),
  },
  {
    id: "pulse-manager-support",
    title: "Manager Support & Check-In Pulse",
    description: "A focused pulse survey to understand how employees experience support, feedback, and coaching from their direct manager.",
    category: "Pulse",
    is_featured: false,
    tags: ["manager-effectiveness", "pulse", "hr", "quick-5min", "feedback", "coaching"],
    questions: [
      { question_text: "My manager regularly checks in about my workload and wellbeing.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "I receive feedback from my manager that helps me improve my performance.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "My manager involves me in decisions that affect my work.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "I feel safe raising concerns or difficult topics with my manager.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "How often does your manager recognize your contributions?", question_type: "multiple_choice", options: { choices: ["At least weekly", "Every few weeks", "A few times per year", "Rarely", "Almost never"] } },
      { question_text: "My manager supports my learning and development goals.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "If a colleague asked, how likely would you be to recommend your manager as someone good to work for?", question_type: "nps", options: { scale: 10, min_label: "Not at all likely", max_label: "Extremely likely" } },
      { question_text: "Which aspects of your relationship with your manager are working best right now?", question_type: "text_long", options: {} },
      { question_text: "What is one thing your manager could do differently to better support you?", question_type: "text_long", options: {} },
    ].map(convertQuestion),
    scoreConfig: null,
    createdAt: new Date(),
  },
  {
    id: "pulse-hybrid-remote",
    title: "Hybrid & Remote Work Experience Pulse (Canada)",
    description: "A pulse survey for Canadian employees working in hybrid or remote arrangements, focusing on productivity, connection, and wellbeing.",
    category: "Pulse",
    is_featured: true,
    tags: ["hybrid-work", "remote-work", "pulse", "canada", "employee-experience", "flexibility"],
    questions: [
      { question_text: "My current hybrid/remote work setup enables me to be productive.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "I have the technology and tools I need to work effectively from my primary work location.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "I feel connected to my team, even when we are not in the same physical space.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "How often do you feel your work-life boundaries are respected in our hybrid/remote setup?", question_type: "rating", options: { scale: 5, min_label: "Never", max_label: "Always" } },
      { question_text: "Which hybrid/remote work pattern best describes your typical week?", question_type: "multiple_choice", options: { choices: ["Fully remote", "Mostly remote (1–2 days onsite)", "Balanced hybrid (2–3 days onsite)", "Mostly onsite (1–2 days remote)", "Fully onsite"] } },
      { question_text: "Which aspects of hybrid/remote work are most challenging for you? (Select all that apply)", question_type: "checkbox", options: { choices: ["Staying focused/productive", "Feeling connected to colleagues", "Communicating with my manager", "Access to information/resources", "Work-life boundaries", "Home workspace setup", "Time zones/scheduling"] } },
      { question_text: "Our organization's policies and norms for hybrid/remote work are clear and consistent.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "How satisfied are you with the current balance between onsite and remote work in your role?", question_type: "rating", options: { scale: 5, min_label: "Very Dissatisfied", max_label: "Very Satisfied" } },
      { question_text: "If you could change one thing about our hybrid/remote work approach, what would it be?", question_type: "text_long", options: {} },
      { question_text: "Is there anything else you'd like to share about your hybrid/remote work experience?", question_type: "text_long", options: {} },
    ].map(convertQuestion),
    scoreConfig: null,
    createdAt: new Date(),
  },
  {
    id: "pulse-inclusion-belonging",
    title: "Inclusion & Belonging Micro-Pulse",
    description: "A short pulse survey to monitor psychological inclusion, belonging, and respect within teams over time.",
    category: "Pulse",
    is_featured: false,
    tags: ["inclusion", "belonging", "dei", "pulse", "culture", "hr"],
    questions: [
      { question_text: "I feel a strong sense of belonging on my team.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "People with different identities and backgrounds are treated fairly in this organization.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "I feel comfortable sharing my ideas and perspectives, even when they differ from others.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "On my team, people listen to and respect one another.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "I see our leaders modelling inclusive behaviours.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "Which of the following have you experienced in the last three months? (Select all that apply)", question_type: "checkbox", options: { choices: ["My ideas were actively invited in a discussion", "I saw someone speak up for a colleague", "I witnessed inclusive behaviour being recognized", "I observed exclusion or disrespect", "I experienced exclusion or disrespect personally", "None of the above"] } },
      { question_text: "To what extent do you feel you can be your authentic self at work?", question_type: "rating", options: { scale: 5, min_label: "Not at all", max_label: "To a great extent" } },
      { question_text: "If you feel comfortable, please share one example (positive or negative) about inclusion or belonging in the past three months.", question_type: "text_long", options: {} },
    ].map(convertQuestion),
    scoreConfig: null,
    createdAt: new Date(),
  },
  {
    id: "pulse-learning-growth",
    title: "Learning & Growth Opportunities Pulse",
    description: "A pulse survey focused on how employees experience learning, development opportunities, and support for skill growth.",
    category: "Pulse",
    is_featured: false,
    tags: ["learning-and-development", "career-growth", "pulse", "hr", "ld", "skills"],
    questions: [
      { question_text: "I have good opportunities to learn and develop in my current role.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "My organization invests in my professional growth.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "I understand which skills I should focus on developing over the next 6–12 months.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "My manager has regular conversations with me about my development.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "Which forms of learning do you use most often? (Select all that apply)", question_type: "checkbox", options: { choices: ["Formal courses or workshops", "On-the-job stretch assignments", "Coaching or mentoring", "Peer learning or communities of practice", "Self-directed online learning", "Conferences or external events"] } },
      { question_text: "How satisfied are you with the learning resources available to you (e.g., courses, tools, budget)?", question_type: "rating", options: { scale: 5, min_label: "Very Dissatisfied", max_label: "Very Satisfied" } },
      { question_text: "I can apply what I learn to my day-to-day work.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "If you could change one thing about how learning and development is supported here, what would it be?", question_type: "text_long", options: {} },
    ].map(convertQuestion),
    scoreConfig: null,
    createdAt: new Date(),
  },
  {
    id: "pulse-change-communication",
    title: "Change & Communication Pulse",
    description: "A pulse survey to understand how employees experience organizational changes, communication, and change fatigue.",
    category: "Pulse",
    is_featured: false,
    tags: ["change-management", "communication", "pulse", "hr", "strategy", "culture"],
    questions: [
      { question_text: "I understand why recent changes are happening in our organization.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "Our leaders communicate clearly about upcoming changes that will affect my work.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "I have opportunities to ask questions and share my concerns about changes.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "In the past three months, how often have changes at work felt overwhelming?", question_type: "rating", options: { scale: 5, min_label: "Never", max_label: "Very Often" } },
      { question_text: "Changes are implemented in a way that allows me enough time to adjust.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "Which aspects of change are most challenging for you? (Select all that apply)", question_type: "checkbox", options: { choices: ["Lack of clarity about what is changing", "Insufficient communication", "Short timelines", "Increased workload", "Unclear roles or expectations", "Technology changes", "Impact on team structure or relationships"] } },
      { question_text: "Overall, how confident are you that current changes will have a positive impact on our organization?", question_type: "rating", options: { scale: 5, min_label: "Not at all confident", max_label: "Very confident" } },
      { question_text: "Please share one thing leadership could do to make change easier to navigate.", question_type: "text_long", options: {} },
    ].map(convertQuestion),
    scoreConfig: null,
    createdAt: new Date(),
  },
  {
    id: "pulse-team-collaboration",
    title: "Team Collaboration & Ways of Working Pulse",
    description: "A pulse survey focused on collaboration quality, communication norms, and how teams work together day to day.",
    category: "Pulse",
    is_featured: false,
    tags: ["teamwork", "collaboration", "communication", "pulse", "hr", "culture"],
    questions: [
      { question_text: "On my team, people collaborate effectively to get work done.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "Our team meetings are a good use of time.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "I have the information I need from my team to do my work effectively.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "How clear are our team's goals and priorities right now?", question_type: "rating", options: { scale: 5, min_label: "Not at all clear", max_label: "Very clear" } },
      { question_text: "When challenges come up, we address them constructively as a team.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "Which aspects of how your team works together are most effective? (Select all that apply)", question_type: "checkbox", options: { choices: ["Sharing information and updates", "Decision-making", "Giving and receiving feedback", "Supporting each other under pressure", "Cross-functional collaboration", "Using tools and technology"] } },
      { question_text: "Which aspects of how your team works together most need improvement? (Select up to two)", question_type: "checkbox", options: { choices: ["Sharing information and updates", "Decision-making", "Giving and receiving feedback", "Supporting each other under pressure", "Cross-functional collaboration", "Using tools and technology"] } },
      { question_text: "What is one change that would most improve how your team works together?", question_type: "text_long", options: {} },
    ].map(convertQuestion),
    scoreConfig: null,
    createdAt: new Date(),
  },
  {
    id: "pulse-wellbeing-workload",
    title: "Wellbeing & Workload Pulse (Non-Clinical)",
    description: "A brief pulse survey to monitor employee wellbeing and workload pressure in non-clinical settings.",
    category: "Pulse",
    is_featured: false,
    tags: ["wellbeing", "workload", "burnout-risk", "pulse", "hr", "employee-experience"],
    questions: [
      { question_text: "In the past two weeks, I have had enough energy for my work.", question_type: "rating", options: { scale: 5, min_label: "Never", max_label: "Always" } },
      { question_text: "My workload feels manageable most days.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "In the past month, how often have you felt emotionally drained after work?", question_type: "rating", options: { scale: 5, min_label: "Never", max_label: "Very Often" } },
      { question_text: "I can usually take the breaks and time off I need to recover.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "Which factors most impact your wellbeing at work right now? (Select all that apply)", question_type: "checkbox", options: { choices: ["Workload and deadlines", "Support from my manager", "Support from my team", "Work schedule or shifts", "Commuting or travel", "Hybrid/remote work setup", "Personal circumstances outside of work"] } },
      { question_text: "Compared to three months ago, how would you rate your overall wellbeing?", question_type: "multiple_choice", options: { choices: ["Much better", "Somewhat better", "About the same", "Somewhat worse", "Much worse"] } },
      { question_text: "I feel comfortable asking for help or adjustments when my workload or wellbeing are at risk.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "If you would like to, please share any suggestions for how we could better support employee wellbeing.", question_type: "text_long", options: {} },
    ].map(convertQuestion),
    scoreConfig: null,
    createdAt: new Date(),
  },
  {
    id: "pulse-onboarding-90days",
    title: "New Hire Onboarding Experience Pulse (First 90 Days)",
    description: "A pulse survey for employees in their first 90 days to track onboarding quality, role clarity, and early engagement.",
    category: "Pulse",
    is_featured: true,
    tags: ["onboarding", "new-hire", "pulse", "hr", "employee-experience", "talent"],
    questions: [
      { question_text: "I have a clear understanding of what is expected of me in my role.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "My onboarding experience has helped me feel welcomed and included.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "I received the information and resources I needed to get started effectively.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "How confident do you feel in your ability to perform your role successfully at this point?", question_type: "rating", options: { scale: 5, min_label: "Not at all confident", max_label: "Very confident" } },
      { question_text: "My manager and colleagues are available when I have questions.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "How likely are you to recommend this organization as a great place to work based on your onboarding so far?", question_type: "nps", options: { scale: 10, min_label: "Not at all likely", max_label: "Extremely likely" } },
      { question_text: "Which parts of your onboarding have been most helpful? (Select all that apply)", question_type: "checkbox", options: { choices: ["Welcome and orientation sessions", "Role-specific training", "Time with my manager", "Meeting my team and colleagues", "Access to tools and systems", "Buddy/mentor support", "Written guides or knowledge base"] } },
      { question_text: "What is one improvement that would have made your first weeks here easier?", question_type: "text_long", options: {} },
    ].map(convertQuestion),
    scoreConfig: null,
    createdAt: new Date(),
  },
  {
    id: "pulse-training-transfer",
    title: "Training Transfer & Application Pulse",
    description: "A pulse survey for learners 30–60 days after a training program to understand how well new skills are being applied on the job.",
    category: "Pulse",
    is_featured: false,
    tags: ["training-evaluation", "learning-transfer", "pulse", "ld", "hr", "skills-application"],
    questions: [
      { question_text: "I have had opportunities to apply what I learned in the training to my work.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "My manager supports me in using the new skills or tools from the training.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "The training content was relevant to my day-to-day work.", question_type: "rating", options: { scale: 5, min_label: "Strongly Disagree", max_label: "Strongly Agree" } },
      { question_text: "Since the training, how much has your confidence grown in applying the covered skills?", question_type: "rating", options: { scale: 5, min_label: "Not at all", max_label: "A great deal" } },
      { question_text: "Which barriers, if any, have made it hard to apply what you learned? (Select all that apply)", question_type: "checkbox", options: { choices: ["Limited time", "Lack of manager support", "Lack of team support", "Processes or systems haven't changed", "Training content was not relevant", "I forgot parts of the training", "No clear expectations to use the new skills", "No significant barriers"] } },
      { question_text: "How likely are you to recommend this training to a colleague in a similar role?", question_type: "nps", options: { scale: 10, min_label: "Not at all likely", max_label: "Extremely likely" } },
      { question_text: "Which aspects of the training have been most valuable to you?", question_type: "text_long", options: {} },
      { question_text: "What additional support, tools, or follow-up would help you apply the training more effectively?", question_type: "text_long", options: {} },
    ].map(convertQuestion),
    scoreConfig: null,
    createdAt: new Date(),
  },
];

// ========================================
// LOGIC-BASED ADAPTIVE TEMPLATES
// ========================================
// These templates demonstrate skip logic and adaptive survey flow.
// Each template is tagged with "has_logic" to indicate logic rules are present.

const logicBasedTemplates = [
  {
    id: "logic_engagement_manager_adaptive_v1",
    title: "Adaptive Engagement & Manager Experience Survey",
    description: "A research-backed engagement survey that adapts based on whether the respondent manages others. Non-managers skip leadership capability questions (Q5-Q7) and go directly to wellbeing questions. This template demonstrates conditional skip logic for role-based survey branching.",
    category: "Engagement",
    is_featured: true,
    tags: ["engagement", "logic", "leadership", "wellbeing", "has_logic", "best_practice", "pulse", "adaptive"],
    questions: [
      {
        id: "q1_role_type",
        type: "multiple_choice" as const,
        question: "Which of the following best describes your role?",
        options: [
          "I do not manage others",
          "I manage 1–5 people",
          "I manage 6–10 people",
          "I manage more than 10 people"
        ],
        required: true,
        scoringCategory: "Demographics",
        // Logic: Non-managers skip directly to Q8 (wellbeing), bypassing Q5-Q7 (manager questions)
        logicRules: [
          {
            id: "skip_to_wellbeing_if_not_manager",
            condition: 'answer("q1_role_type") == "I do not manage others"',
            action: 'skip' as const,
            targetQuestionId: "q8_workload_reasonable"
          }
        ]
      },
      {
        id: "q2_work_meaning",
        type: "likert" as const,
        question: "My work feels meaningful and contributes to the mission of the organization.",
        required: true,
        scoringCategory: "Engagement Drivers",
        likertPoints: 5,
        likertType: "agreement" as const,
        scorable: true,
        scoreWeight: 1
      },
      {
        id: "q3_strengths_utilization",
        type: "likert" as const,
        question: "I regularly have opportunities to use my strengths in my work.",
        required: true,
        scoringCategory: "Engagement Drivers",
        likertPoints: 5,
        likertType: "agreement" as const,
        scorable: true,
        scoreWeight: 1
      },
      {
        id: "q4_team_psych_safety",
        type: "likert" as const,
        question: "I feel safe sharing concerns or speaking up about issues within my team.",
        required: true,
        scoringCategory: "Psychological Safety",
        likertPoints: 5,
        likertType: "agreement" as const,
        scorable: true,
        scoreWeight: 1
      },
      {
        id: "q5_manager_clarity",
        type: "likert" as const,
        question: "I provide clear expectations and direction to my team.",
        description: "Only managers see this question.",
        required: true,
        scoringCategory: "Leadership Capability",
        likertPoints: 5,
        likertType: "agreement" as const,
        scorable: true,
        scoreWeight: 1
      },
      {
        id: "q6_manager_feedback",
        type: "likert" as const,
        question: "I give regular, constructive feedback that helps my team improve.",
        required: true,
        scoringCategory: "Leadership Capability",
        likertPoints: 5,
        likertType: "agreement" as const,
        scorable: true,
        scoreWeight: 1
      },
      {
        id: "q7_manager_support",
        type: "likert" as const,
        question: "I create an environment where team members feel supported and able to perform at their best.",
        required: true,
        scoringCategory: "Leadership Capability",
        likertPoints: 5,
        likertType: "agreement" as const,
        scorable: true,
        scoreWeight: 1
      },
      {
        id: "q8_workload_reasonable",
        type: "likert" as const,
        question: "My workload allows me to do my job effectively without excessive stress.",
        required: true,
        scoringCategory: "Wellbeing",
        likertPoints: 5,
        likertType: "agreement" as const,
        scorable: true,
        scoreWeight: 1
      },
      {
        id: "q9_progress_career",
        type: "likert" as const,
        question: "I believe I can grow and advance my career within this organization.",
        required: true,
        scoringCategory: "Growth & Development",
        likertPoints: 5,
        likertType: "agreement" as const,
        scorable: true,
        scoreWeight: 1
      },
      {
        id: "q10_open_comment",
        type: "textarea" as const,
        question: "What is one change that would most improve your work experience?",
        required: false,
        scoringCategory: "Open Feedback",
        scorable: false
      }
    ],
    scoreConfig: {
      enabled: true,
      categories: [
        { id: "demographics", name: "Demographics" },
        { id: "engagement-drivers", name: "Engagement Drivers" },
        { id: "psychological-safety", name: "Psychological Safety" },
        { id: "leadership-capability", name: "Leadership Capability" },
        { id: "wellbeing", name: "Wellbeing" },
        { id: "growth-development", name: "Growth & Development" }
      ],
      scoreRanges: [
        { id: "highly-engaged", label: "Highly Engaged", min: 35, max: 45, color: "#22c55e", shortDescription: "Strong engagement across all measured dimensions.", longDescription: "Respondent demonstrates high engagement, psychological safety, and positive work experience. Continue current practices and recognize contributions." },
        { id: "engaged", label: "Engaged", min: 25, max: 34, color: "#84cc16", shortDescription: "Generally positive engagement with some areas for growth.", longDescription: "Good overall engagement with opportunities to strengthen specific dimensions. Focus on targeted improvements in lower-scoring categories." },
        { id: "neutral", label: "Neutral", min: 15, max: 24, color: "#f59e0b", shortDescription: "Mixed engagement signals requiring attention.", longDescription: "Engagement is inconsistent. Identify specific pain points and address barriers to higher engagement through targeted interventions." },
        { id: "disengaged", label: "Disengaged", min: 0, max: 14, color: "#ef4444", shortDescription: "Low engagement indicating significant concerns.", longDescription: "Respondent shows signs of disengagement. Urgent attention needed to understand root causes and implement support mechanisms." }
      ],
      resultsSummary: "This adaptive survey measures engagement across key dimensions. For managers, it includes additional questions on leadership capability. Results are categorized into engagement bands to guide interventions."
    },
    createdAt: new Date(),
  },
  {
    id: "logic_turnover_risk_diagnostic_v1",
    title: "Turnover Risk & Experience Diagnostic",
    description: "A predictive turnover survey with two paths based on satisfaction. SATISFIED/NEUTRAL respondents take a short path (Q1→Q3→Q7→Q10) focusing on retention and growth. DISSATISFIED respondents take an extended path (Q1→Q6→END) with additional culture diagnostics to understand root causes.",
    category: "Retention",
    is_featured: true,
    tags: ["retention", "turnover", "logic", "wellbeing", "has_logic", "risk_analysis", "best_practice", "predictive", "adaptive"],
    questions: [
      {
        id: "q1_workplace_support",
        type: "likert" as const,
        question: "I feel supported by my organization in balancing work and personal needs.",
        required: true,
        scoringCategory: "Wellbeing",
        likertPoints: 5,
        likertType: "agreement" as const,
        scorable: true,
        scoreWeight: 1
      },
      {
        id: "q2_recognition",
        type: "likert" as const,
        question: "I receive meaningful recognition for the work I do.",
        required: true,
        scoringCategory: "Engagement Drivers",
        likertPoints: 5,
        likertType: "agreement" as const,
        scorable: true,
        scoreWeight: 1
      },
      {
        id: "q3_overall_satisfaction",
        type: "multiple_choice" as const,
        question: "Overall, how satisfied are you with your experience at this organization?",
        options: [
          "Very dissatisfied",
          "Dissatisfied",
          "Neutral",
          "Satisfied",
          "Very satisfied"
        ],
        required: true,
        scoringCategory: "Engagement",
        scorable: true,
        scoreWeight: 2,
        optionScores: {
          "Very dissatisfied": 1,
          "Dissatisfied": 2,
          "Neutral": 3,
          "Satisfied": 4,
          "Very satisfied": 5
        },
        // Logic: Neutral/Satisfied/Very Satisfied → Skip culture diagnostic (Q4-Q6), go to retention (Q7)
        // Dissatisfied employees continue to Q4-Q6 for deeper diagnostics
        logicRules: [
          {
            id: "skip_to_retention_if_neutral",
            condition: 'answer("q3_overall_satisfaction") == "Neutral"',
            action: 'skip' as const,
            targetQuestionId: "q7_intent_to_stay"
          },
          {
            id: "skip_to_retention_if_satisfied",
            condition: 'answer("q3_overall_satisfaction") == "Satisfied"',
            action: 'skip' as const,
            targetQuestionId: "q7_intent_to_stay"
          },
          {
            id: "skip_to_retention_if_very_satisfied",
            condition: 'answer("q3_overall_satisfaction") == "Very satisfied"',
            action: 'skip' as const,
            targetQuestionId: "q7_intent_to_stay"
          }
        ]
      },
      {
        id: "q4_culture",
        type: "likert" as const,
        question: "I experience a healthy, respectful workplace culture.",
        description: "DISSATISFIED PATH: This question only appears for dissatisfied respondents.",
        required: true,
        scoringCategory: "Culture",
        likertPoints: 5,
        likertType: "agreement" as const,
        scorable: true,
        scoreWeight: 1
      },
      {
        id: "q5_fairness",
        type: "likert" as const,
        question: "People here are treated fairly, regardless of background or identity.",
        description: "DISSATISFIED PATH: Culture diagnostic question.",
        required: true,
        scoringCategory: "Equity & Inclusion",
        likertPoints: 5,
        likertType: "agreement" as const,
        scorable: true,
        scoreWeight: 1
      },
      {
        id: "q6_open_dissatisfied",
        type: "textarea" as const,
        question: "What specific changes would most improve your experience here? (Your feedback helps us understand what matters most.)",
        description: "DISSATISFIED PATH: Final question for dissatisfied respondents. Survey ends after this.",
        required: true, // Required to ensure END rule triggers
        scoringCategory: "Open Feedback",
        scorable: false,
        // Logic: End survey after this question (dissatisfied path complete)
        logicRules: [
          {
            id: "end_dissatisfied_path",
            condition: 'answer("q6_open_dissatisfied") != ""',
            action: 'end' as const,
            targetQuestionId: null
          }
        ]
      },
      {
        id: "q7_intent_to_stay",
        type: "multiple_choice" as const,
        question: "How likely are you to still be working here six months from now?",
        description: "SATISFIED PATH: Retention indicator question.",
        options: [
          "Very unlikely",
          "Unlikely",
          "Unsure",
          "Likely",
          "Very likely"
        ],
        required: true,
        scoringCategory: "Retention",
        scorable: true,
        scoreWeight: 2,
        optionScores: {
          "Very unlikely": 1,
          "Unlikely": 2,
          "Unsure": 3,
          "Likely": 4,
          "Very likely": 5
        }
      },
      {
        id: "q8_career_growth",
        type: "likert" as const,
        question: "I can see opportunities for career growth here.",
        description: "SATISFIED PATH: Growth question.",
        required: true,
        scoringCategory: "Growth & Development",
        likertPoints: 5,
        likertType: "agreement" as const,
        scorable: true,
        scoreWeight: 1
      },
      {
        id: "q9_workload",
        type: "likert" as const,
        question: "My workload is manageable and sustainable.",
        description: "SATISFIED PATH: Wellbeing question.",
        required: true,
        scoringCategory: "Wellbeing",
        likertPoints: 5,
        likertType: "agreement" as const,
        scorable: true,
        scoreWeight: 1
      },
      {
        id: "q10_open_comment",
        type: "textarea" as const,
        question: "Is there anything else that would improve your experience or likelihood of staying?",
        description: "SATISFIED PATH: Final open-ended question.",
        required: false,
        scoringCategory: "Open Feedback",
        scorable: false
      }
    ],
    scoreConfig: {
      enabled: true,
      categories: [
        { id: "wellbeing", name: "Wellbeing" },
        { id: "engagement-drivers", name: "Engagement Drivers" },
        { id: "engagement", name: "Engagement" },
        { id: "culture", name: "Culture" },
        { id: "equity-inclusion", name: "Equity & Inclusion" },
        { id: "retention", name: "Retention" },
        { id: "growth-development", name: "Growth & Development" }
      ],
      scoreRanges: [
        { id: "low-risk", label: "Low Turnover Risk", min: 32, max: 40, color: "#22c55e", shortDescription: "Employee is highly engaged and likely to stay.", longDescription: "This respondent shows strong satisfaction, engagement, and intent to stay. Focus on recognition, growth opportunities, and maintaining current support levels." },
        { id: "moderate-risk", label: "Moderate Turnover Risk", min: 24, max: 31, color: "#f59e0b", shortDescription: "Some warning signs present - monitor closely.", longDescription: "Mixed signals on engagement and retention. Proactively address any lower-scoring areas such as recognition, career growth, or workload balance." },
        { id: "high-risk", label: "High Turnover Risk", min: 16, max: 23, color: "#f97316", shortDescription: "Elevated risk - intervention recommended.", longDescription: "Respondent shows concerning patterns across multiple dimensions. Prioritize 1:1 conversations, career path discussions, and investigate root causes of dissatisfaction." },
        { id: "critical-risk", label: "Critical Turnover Risk", min: 0, max: 15, color: "#ef4444", shortDescription: "Immediate attention required.", longDescription: "High dissatisfaction detected. Respondent completed the shortened dissatisfied path. Urgent intervention needed - consider retention conversations, stay interviews, or addressing systemic issues raised." }
      ],
      resultsSummary: "This diagnostic survey predicts turnover risk based on satisfaction, engagement, and intent-to-stay indicators. Dissatisfied employees answer additional culture and fairness questions to help diagnose root causes. Scores are weighted with key retention questions counting double."
    },
    createdAt: new Date(),
  },
];

async function seedCanadianTemplates() {
  try {
    console.log("Seeding Canadian templates...");
    
    // Insert templates, using onConflictDoUpdate to update existing templates with new question types
    for (const template of canadianTemplates) {
      await db.insert(templates).values(template)
        .onConflictDoUpdate({
          target: templates.id,
          set: {
            title: template.title,
            description: template.description,
            questions: template.questions,
            category: template.category,
            scoreConfig: template.scoreConfig,
            is_featured: (template as any).is_featured ?? false,
            tags: (template as any).tags ?? null,
          }
        });
    }
    
    console.log(`Successfully seeded/updated ${canadianTemplates.length} Canadian templates!`);
  } catch (error) {
    console.error("Error seeding templates:", error);
    throw error;
  }
}

async function seedLogicBasedTemplates() {
  try {
    console.log("Seeding logic-based adaptive templates...");
    
    for (const template of logicBasedTemplates) {
      await db.insert(templates).values(template)
        .onConflictDoUpdate({
          target: templates.id,
          set: {
            title: template.title,
            description: template.description,
            questions: template.questions,
            category: template.category,
            scoreConfig: template.scoreConfig,
            is_featured: template.is_featured ?? false,
            tags: template.tags ?? null,
          }
        });
    }
    
    console.log(`Successfully seeded/updated ${logicBasedTemplates.length} logic-based templates!`);
  } catch (error) {
    console.error("Error seeding logic-based templates:", error);
    throw error;
  }
}

async function seedAllTemplates() {
  await seedCanadianTemplates();
  await seedLogicBasedTemplates();
  console.log("All templates seeded successfully!");
}

seedAllTemplates().then(() => process.exit(0)).catch(() => process.exit(1));

