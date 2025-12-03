# Evalia Survey Question Types Specification

## Overview

This document defines all supported question types, their parameters, display options, and scoring behavior. Based on research of Typeform, SurveyMonkey, Qualtrics, Google Forms, JotForm, and Microsoft Forms.

---

## Question Type Categories

### 1. Text Input Questions
| Type | Description | Display | Scoring |
|------|-------------|---------|---------|
| `text` | Short single-line text | Input field | Non-scorable |
| `textarea` | Multi-line long text | Textarea | AI-scorable |
| `email` | Email with validation | Input[email] | Non-scorable |
| `phone` | Phone number | Input[tel] | Non-scorable |
| `url` | Website URL | Input[url] | Non-scorable |
| `number` | Numeric value | Input[number] | Scorable (raw value) |

### 2. Selection Questions
| Type | Description | Display Options | Scoring |
|------|-------------|-----------------|---------|
| `multiple_choice` | Single select | Radio / Cards / Dropdown | Scorable (position or value) |
| `checkbox` | Multi-select | Checkboxes / Cards | Scorable (count) |
| `dropdown` | Single from dropdown | Select menu | Scorable (position or value) |
| `image_choice` | Select from images | Image grid | Scorable (position or value) |
| `yes_no` | Binary choice | Toggle / Buttons | Scorable (1 or 0) |

### 3. Rating & Scale Questions
| Type | Description | Display Options | Scoring |
|------|-------------|-----------------|---------|
| `rating` | 1-N scale rating | Stars / Numbers / Emoji / Slider | Scorable (1-N) |
| `nps` | Net Promoter Score | 0-10 numeric grid | Scorable (0-10) |
| `likert` | Agreement scale | Radio/Cards with labels | Scorable (1-5 or 1-7) |
| `opinion_scale` | Semantic scale | Labeled endpoints | Scorable |
| `slider` | Continuous value | Range slider | Scorable |

### 4. Advanced Questions
| Type | Description | Display | Scoring |
|------|-------------|---------|---------|
| `matrix` | Grid/table rating | Table with radio per row | Scorable per row |
| `ranking` | Order by preference | Drag-and-drop list | Scorable (position weights) |
| `constant_sum` | Distribute points | Number inputs totaling 100 | Scorable per item |
| `max_diff` | Best/Worst selection | Side-by-side cards | Scorable |

### 5. Date & Time Questions
| Type | Description | Display | Scoring |
|------|-------------|---------|---------|
| `date` | Date selection | Date picker | Non-scorable |
| `time` | Time selection | Time picker | Non-scorable |
| `datetime` | Date + time | Combined picker | Non-scorable |

### 6. Media & File Questions
| Type | Description | Display | Scoring |
|------|-------------|---------|---------|
| `file_upload` | Upload documents | Dropzone | Non-scorable |
| `signature` | Digital signature | Canvas pad | Non-scorable |

### 7. Structural Elements
| Type | Description | Display | Scoring |
|------|-------------|---------|---------|
| `section` | Section divider | Heading + description | N/A |
| `statement` | Display-only text | Rich text block | N/A |
| `legal` | Consent checkbox | Checkbox + terms | Non-scorable |

---

## Detailed Type Specifications

### `text` - Short Answer
```typescript
{
  type: "text",
  question: string,
  description?: string,
  required?: boolean,
  placeholder?: string,
  minLength?: number,
  maxLength?: number,
  validationPattern?: string, // regex
}
```

### `textarea` - Long Answer
```typescript
{
  type: "textarea",
  question: string,
  description?: string,
  required?: boolean,
  placeholder?: string,
  minLength?: number,
  maxLength?: number,
  rows?: number, // display height (default: 4)
}
```

### `multiple_choice` - Single Selection
```typescript
{
  type: "multiple_choice",
  question: string,
  description?: string,
  required?: boolean,
  options: string[],
  displayStyle?: "radio" | "cards" | "dropdown", // default: "cards"
  allowOther?: boolean, // adds "Other" with text input
  randomizeOptions?: boolean,
  optionImages?: string[], // URLs for image beside each option
}
```

### `checkbox` - Multi-Selection
```typescript
{
  type: "checkbox",
  question: string,
  description?: string,
  required?: boolean,
  options: string[],
  displayStyle?: "checkbox" | "cards", // default: "checkbox"
  minSelections?: number,
  maxSelections?: number,
  allowOther?: boolean,
  randomizeOptions?: boolean,
  optionImages?: string[],
}
```

### `rating` - Rating Scale
```typescript
{
  type: "rating",
  question: string,
  description?: string,
  required?: boolean,
  ratingScale: number, // 3, 5, 7, or 10 (default: 5)
  ratingStyle: "star" | "number" | "emoji" | "heart" | "thumb", // default: "number"
  ratingLabels?: {
    low?: string,  // e.g., "Strongly Disagree"
    mid?: string,  // e.g., "Neutral" (for odd scales)
    high?: string, // e.g., "Strongly Agree"
  },
  showLabelsOnly?: boolean, // hide numbers, show only endpoint labels
}
```

### `nps` - Net Promoter Score
```typescript
{
  type: "nps",
  question: string,
  description?: string,
  required?: boolean,
  // Fixed 0-10 scale
  customLabels?: {
    detractor?: string, // default: "Not likely"
    promoter?: string,  // default: "Extremely likely"
  },
}
```

### `likert` - Likert Scale
```typescript
{
  type: "likert",
  question: string,
  description?: string,
  required?: boolean,
  likertType: "agreement" | "frequency" | "importance" | "satisfaction" | "quality",
  likertPoints: 5 | 7, // default: 5
  showNeutral?: boolean, // include neutral middle option
  customLabels?: string[], // override default labels
}
// Default labels by type:
// agreement (5): Strongly Disagree, Disagree, Neutral, Agree, Strongly Agree
// frequency (5): Never, Rarely, Sometimes, Often, Always
// importance (5): Not Important, Slightly, Moderately, Very, Extremely Important
// satisfaction (5): Very Dissatisfied, Dissatisfied, Neutral, Satisfied, Very Satisfied
// quality (5): Very Poor, Poor, Fair, Good, Excellent
```

### `slider` - Numeric Slider
```typescript
{
  type: "slider",
  question: string,
  description?: string,
  required?: boolean,
  min: number,
  max: number,
  step?: number, // default: 1
  defaultValue?: number,
  showValue?: boolean, // show current value (default: true)
  labels?: {
    low?: string,
    high?: string,
  },
  unit?: string, // e.g., "%", "$", "years"
}
```

### `matrix` - Grid/Table
```typescript
{
  type: "matrix",
  question: string,
  description?: string,
  required?: boolean,
  rowLabels: string[], // row items to rate
  colLabels: string[], // column options
  matrixType: "radio" | "checkbox" | "text", // single per row, multi per row, text input per cell
  randomizeRows?: boolean,
}
```

### `ranking` - Order by Preference
```typescript
{
  type: "ranking",
  question: string,
  description?: string,
  required?: boolean,
  options: string[], // items to rank
  maxRankItems?: number, // only rank top N (optional)
  displayStyle?: "drag" | "number", // drag-and-drop or number inputs
}
```

### `image_choice` - Image Selection
```typescript
{
  type: "image_choice",
  question: string,
  description?: string,
  required?: boolean,
  options: Array<{
    imageUrl: string,
    label?: string, // caption below image
    value?: string, // stored answer value
  }>,
  selectionType: "single" | "multiple",
  imageSize?: "small" | "medium" | "large", // display size
  showLabels?: boolean, // show captions (default: true)
  columns?: 2 | 3 | 4, // grid layout
}
```

### `yes_no` - Binary Choice
```typescript
{
  type: "yes_no",
  question: string,
  description?: string,
  required?: boolean,
  displayStyle?: "toggle" | "buttons" | "icons",
  customLabels?: {
    yes?: string, // default: "Yes"
    no?: string,  // default: "No"
  },
}
```

### `dropdown` - Dropdown Select
```typescript
{
  type: "dropdown",
  question: string,
  description?: string,
  required?: boolean,
  options: string[],
  placeholder?: string, // e.g., "Select an option..."
  searchable?: boolean, // enable search for long lists
  allowOther?: boolean,
}
```

### `date` - Date Picker
```typescript
{
  type: "date",
  question: string,
  description?: string,
  required?: boolean,
  dateFormat?: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD",
  minDate?: string,
  maxDate?: string,
  disablePastDates?: boolean,
  disableFutureDates?: boolean,
}
```

### `time` - Time Picker
```typescript
{
  type: "time",
  question: string,
  description?: string,
  required?: boolean,
  timeFormat?: "12h" | "24h",
  minuteStep?: number, // 1, 5, 10, 15, 30
}
```

### `file_upload` - File Upload
```typescript
{
  type: "file_upload",
  question: string,
  description?: string,
  required?: boolean,
  allowedTypes?: string[], // e.g., ["pdf", "doc", "docx", "jpg", "png"]
  maxFileSize?: number, // in MB
  maxFiles?: number, // default: 1
}
```

### `constant_sum` - Point Distribution
```typescript
{
  type: "constant_sum",
  question: string,
  description?: string,
  required?: boolean,
  options: string[], // items to distribute points to
  totalPoints: number, // e.g., 100
  showPercentage?: boolean,
}
```

### `opinion_scale` - Semantic Differential
```typescript
{
  type: "opinion_scale",
  question: string,
  description?: string,
  required?: boolean,
  scale: number, // 5, 7, or 10
  leftLabel: string, // e.g., "Cold"
  rightLabel: string, // e.g., "Hot"
  showNumbers?: boolean,
}
```

### `section` - Section Divider
```typescript
{
  type: "section",
  question: string, // used as section title
  description?: string, // section description
  // Not answerable - purely structural
}
```

### `statement` - Information Display
```typescript
{
  type: "statement",
  question: string, // displayed as heading
  description?: string, // displayed as body text
  // Not answerable - purely informational
}
```

### `legal` - Consent/Legal
```typescript
{
  type: "legal",
  question: string, // e.g., "I agree to the terms and conditions"
  description?: string, // full legal text or link
  required?: boolean,
  linkUrl?: string, // link to full terms
  linkText?: string, // e.g., "Read full terms"
}
```

### `signature` - Digital Signature
```typescript
{
  type: "signature",
  question: string,
  description?: string,
  required?: boolean,
  // Captures drawn signature as base64 image
}
```

---

## Display Style Matrix

| Question Type | Visual Styles Available |
|---------------|------------------------|
| `rating` | star, number, emoji, heart, thumb, slider |
| `multiple_choice` | radio, cards, dropdown |
| `checkbox` | checkbox, cards |
| `yes_no` | toggle, buttons, icons |
| `ranking` | drag, number |
| `likert` | horizontal, vertical, cards |
| `slider` | standard, range |

---

## Scoring Behavior Summary

| Type | Default Score Method | Max Points |
|------|---------------------|------------|
| `rating` | Raw value (1-N) | ratingScale |
| `nps` | Raw value (0-10) | 10 |
| `likert` | Position (1-5 or 1-7) | likertPoints |
| `slider` | Normalized (0-max) | (max - min) |
| `multiple_choice` | Position or embedded value | options.length |
| `checkbox` | Count of selections | maxSelections or 5 |
| `yes_no` | Yes=1, No=0 | 1 |
| `number` | Raw value (capped at 10) | 10 |
| `matrix` | Sum of row scores | rows × cols |
| `ranking` | Inverse position weights | options.length |
| `constant_sum` | Points per item | totalPoints |
| `opinion_scale` | Raw value | scale |

---

## Non-Scorable Types

These types are for data collection, not assessment:
- `text`
- `textarea` (can be AI-scored)
- `email`
- `phone`
- `url`
- `date`
- `time`
- `datetime`
- `file_upload`
- `signature`
- `section`
- `statement`
- `legal`

---

## Implementation Priority

### Phase 1 (Current) ✅
- text, textarea, email, number
- multiple_choice, checkbox
- rating, nps
- matrix, ranking
- date, section

### Phase 2 (Next Sprint)
- likert (with presets)
- slider
- yes_no
- dropdown
- image_choice
- opinion_scale

### Phase 3 (Future)
- file_upload
- signature
- constant_sum
- time, datetime
- phone, url
- legal, statement

---

## Template Enhancement Recommendations

1. **Add NPS questions** to satisfaction surveys
2. **Add matrix questions** for multi-attribute assessments
3. **Add slider questions** for confidence/agreement ranges
4. **Add image_choice** for visual preference surveys
5. **Add yes_no** for quick binary checks
6. **Add likert** with proper presets for consistency

---

## Migration Notes

When adding new types:
1. Update `QuestionType` enum in `shared/schema.ts`
2. Update `questionSchema` with new fields
3. Add rendering in `QuestionCard.tsx`
4. Add editor in `QuestionEditor.tsx`
5. Update scoring in `calculateSurveyScores()`
6. Update templates if applicable

