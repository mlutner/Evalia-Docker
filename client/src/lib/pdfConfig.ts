// PDF formatting configuration for consistent styling across all survey types
export const PDF_CONFIG = {
  // Margins (in mm, ~0.5 inches)
  margins: {
    top: 13,
    bottom: 14,
    left: 13,
    right: 13,
  },

  // Column layout (two-column for answers)
  layout: {
    leftColumnPercentage: 0.55, // 55% for question text
    rightColumnPercentage: 0.45, // 45% for answers
    gapBetweenColumns: 4, // mm
  },

  // Typography - font sizes
  fonts: {
    title: 20,
    sectionHeader: 12,
    questionNumber: 10,
    questionText: 10,
    answerOption: 9,
    answerLabel: 8,
    footer: 8,
    description: 10,
    bodyText: 10,
  },

  // Spacing (in mm)
  spacing: {
    titleBottom: 4,
    descriptionBottom: 6,
    sectionHeaderBottom: 6,
    betweenQuestions: 8, // Extra space after each question
    betweenOptions: 2, // Between checkbox/radio options
    beforeAnswerArea: 2,
    lineHeight: 1.3, // Multiplier for line spacing
  },

  // Answer elements (checkbox, rating boxes, lines)
  elements: {
    checkboxSize: 3.5, // mm
    ratingBoxSize: 3.5, // mm
    ratingBoxGapFactor: 1.0, // Distribute evenly
    textLineHeight: 5, // mm between lines
    textLinesDefault: 2, // Default lines for text input
    textLinesTextarea: 4, // Lines for textarea
    matrixCellSize: 3.5,
  },

  // Colors (RGB)
  colors: {
    title: [0, 0, 0],
    headings: [0, 0, 0],
    questionText: [0, 0, 0],
    required: [200, 20, 20],
    answerText: [20, 20, 20],
    answerLabels: [100, 100, 100],
    description: [60, 60, 60],
    bodyText: [50, 50, 50],
    borders: [100, 100, 100],
    footer: [150, 150, 150],
  },

  // Line weights (mm)
  lineWeights: {
    checkbox: 0.3,
    textLine: 0.2,
  },

  // Page calculations
  page: {
    width: 210, // A4 width mm
    height: 297, // A4 height mm
  },
};

// Survey type-specific overrides
export const SURVEY_TYPE_CONFIGS: Record<string, Partial<typeof PDF_CONFIG>> = {
  training_feedback: {
    spacing: {
      titleBottom: 4,
      descriptionBottom: 6,
      sectionHeaderBottom: 6,
      betweenQuestions: 9,
      betweenOptions: 2.5,
      beforeAnswerArea: 2,
      lineHeight: 1.35,
    },
  },
  customer_satisfaction: {
    spacing: {
      titleBottom: 4,
      descriptionBottom: 6,
      sectionHeaderBottom: 6,
      betweenQuestions: 8,
      betweenOptions: 2,
      beforeAnswerArea: 2,
      lineHeight: 1.3,
    },
  },
  employee_survey: {
    spacing: {
      titleBottom: 5,
      descriptionBottom: 7,
      sectionHeaderBottom: 7,
      betweenQuestions: 10,
      betweenOptions: 2.5,
      beforeAnswerArea: 2,
      lineHeight: 1.4,
    },
  },
  assessment: {
    spacing: {
      titleBottom: 4,
      descriptionBottom: 6,
      sectionHeaderBottom: 6,
      betweenQuestions: 10,
      betweenOptions: 3,
      beforeAnswerArea: 2,
      lineHeight: 1.4,
    },
  },
  nps: {
    spacing: {
      titleBottom: 4,
      descriptionBottom: 6,
      sectionHeaderBottom: 6,
      betweenQuestions: 12,
      betweenOptions: 2,
      beforeAnswerArea: 2,
      lineHeight: 1.3,
    },
  },
};

// Get effective config by merging base config with survey type overrides
export function getMergedConfig(surveyType?: string) {
  const typeConfig = surveyType ? SURVEY_TYPE_CONFIGS[surveyType] : {};
  return {
    ...PDF_CONFIG,
    spacing: {
      ...PDF_CONFIG.spacing,
      ...(typeConfig.spacing || {}),
    },
    fonts: {
      ...PDF_CONFIG.fonts,
      ...(typeConfig.fonts || {}),
    },
    colors: {
      ...PDF_CONFIG.colors,
      ...(typeConfig.colors || {}),
    },
    elements: {
      ...PDF_CONFIG.elements,
      ...(typeConfig.elements || {}),
    },
  };
}
