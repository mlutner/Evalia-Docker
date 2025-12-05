import type { Question } from "@shared/schema";

// Comprehensive fixture list covering every question type with realistic parameters.
export const allQuestionFixtures: Question[] = [
  // Text inputs
  {
    id: "text-1",
    type: "text",
    question: "What is your name?",
    placeholder: "Jane Doe",
    required: true,
  },
  {
    id: "textarea-1",
    type: "textarea",
    question: "Tell us about your experience.",
    rows: 4,
    maxLength: 500,
  },
  {
    id: "email-1",
    type: "email",
    question: "What is your email?",
    required: true,
  },
  {
    id: "phone-1",
    type: "phone",
    question: "Phone number",
    placeholder: "(555) 123-4567",
  },
  {
    id: "url-1",
    type: "url",
    question: "Company website",
    placeholder: "https://example.com",
  },
  {
    id: "number-1",
    type: "number",
    question: "How many team members?",
    min: 1,
    max: 1000,
  },

  // Selection
  {
    id: "mc-1",
    type: "multiple_choice",
    question: "Favorite color?",
    options: ["Red", "Green", "Blue"],
    displayStyle: "radio",
    allowOther: true,
    required: true,
  },
  {
    id: "checkbox-1",
    type: "checkbox",
    question: "Select tools you use",
    options: ["Slack", "Teams", "Zoom"],
    minSelections: 1,
    maxSelections: 3,
  },
  {
    id: "dropdown-1",
    type: "dropdown",
    question: "Select country",
    options: ["USA", "Canada", "UK"],
    placeholder: "Choose a country",
  },
  {
    id: "image-choice-1",
    type: "image_choice",
    question: "Pick your hero image",
    selectionType: "multiple",
    imageSize: "medium",
    columns: 3,
    showLabels: true,
    imageOptions: [
      { imageUrl: "https://example.com/a.jpg", label: "Option A", value: "a" },
      { imageUrl: "https://example.com/b.jpg", label: "Option B", value: "b" },
      { imageUrl: "https://example.com/c.jpg", label: "Option C", value: "c" },
    ],
  },
  {
    id: "yesno-1",
    type: "yes_no",
    question: "Do you agree?",
    displayStyle: "buttons",
    yesLabel: "Yes",
    noLabel: "No",
  },

  // Rating & scales
  {
    id: "rating-1",
    type: "rating",
    question: "Rate the session",
    ratingScale: 5,
    ratingStyle: "star",
    ratingLabels: { low: "Poor", high: "Great" },
  },
  {
    id: "nps-1",
    type: "nps",
    question: "How likely to recommend?",
    npsLabels: { detractor: "Not likely", promoter: "Extremely likely" },
  },
  {
    id: "likert-1",
    type: "likert",
    question: "Agree with the statement",
    likertType: "agreement",
    likertPoints: 5,
    showNeutral: true,
  },
  {
    id: "opinion-1",
    type: "opinion_scale",
    question: "Position on this scale",
    ratingScale: 7,
    leftLabel: "Cold",
    rightLabel: "Hot",
    showNumbers: true,
  },
  {
    id: "slider-1",
    type: "slider",
    question: "How confident are you?",
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 50,
    showValue: true,
    unit: "%",
  },
  {
    id: "emoji-1",
    type: "emoji_rating",
    question: "Emoji mood",
    ratingScale: 5,
    ratingStyle: "emoji",
  },

  // Advanced
  {
    id: "matrix-1",
    type: "matrix",
    question: "Rate each item",
    rowLabels: ["Speed", "Quality"],
    colLabels: ["Poor", "OK", "Great"],
    matrixType: "radio",
  },
  {
    id: "ranking-1",
    type: "ranking",
    question: "Rank priorities",
    options: ["Cost", "Speed", "Quality"],
    maxRankItems: 3,
  },
  {
    id: "constant-sum-1",
    type: "constant_sum",
    question: "Allocate budget",
    options: ["Marketing", "Engineering", "Sales"],
    totalPoints: 100,
    showPercentage: true,
  },
  {
    id: "calculation-1",
    type: "calculation",
    question: "Calculated field",
    required: false,
  },

  // Date & time
  {
    id: "date-1",
    type: "date",
    question: "Choose a date",
    dateFormat: "YYYY-MM-DD",
  },
  {
    id: "time-1",
    type: "time",
    question: "Choose a time",
    timeFormat: "24h",
  },
  {
    id: "datetime-1",
    type: "datetime",
    question: "Choose date & time",
    timeFormat: "24h",
    minuteStep: 5,
  },

  // Media
  {
    id: "file-upload-1",
    type: "file_upload",
    question: "Upload a document",
    allowedTypes: ["pdf", "docx", "png"],
    maxFileSize: 25,
    maxFiles: 2,
  },
  {
    id: "signature-1",
    type: "signature",
    question: "Sign here",
    required: true,
  },
  {
    id: "video-1",
    type: "video",
    question: "Watch this video",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    posterImageUrl: "https://example.com/poster.png",
    autoplay: false,
  },
  {
    id: "audio-1",
    type: "audio_capture",
    question: "Record an answer",
    maxDuration: 120,
  },

  // Structural
  {
    id: "section-1",
    type: "section",
    question: "Section Header",
    description: "This section covers basics.",
  },
  {
    id: "statement-1",
    type: "statement",
    question: "Important note",
    description: "Please read carefully.",
  },
  {
    id: "legal-1",
    type: "legal",
    question: "I agree to the terms",
    description: "Terms and conditions apply.",
    linkUrl: "https://example.com/terms",
    linkText: "Read terms",
    required: true,
  },
  {
    id: "hidden-1",
    type: "hidden",
    question: "Hidden field",
    required: false,
  },
];
