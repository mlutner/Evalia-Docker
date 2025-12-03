/**
 * COMPREHENSIVE QUESTION TYPE CONFIGURATION
 * 
 * Maps all 31 question types from the Evalia schema to their:
 * - Display properties (icon, name, category, description)
 * - Default values
 * - Configurable parameters
 * - Preview settings
 * 
 * Based on best practices from Typeform, SurveyMonkey, Qualtrics, Google Forms
 */

import {
  Type, AlignLeft, Mail, Hash, Phone, Globe, Calendar, Clock, CalendarClock,
  CheckSquare, List, ChevronDown, Image, ToggleLeft, 
  Star, Heart, ThumbsUp, Smile, Sliders, BarChart3, Grid3x3, GripVertical,
  Calculator, Scale, Video, Mic, FileUp, PenTool,
  LayoutList, FileText, ShieldCheck, EyeOff
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

// ============================================
// TYPE DEFINITIONS
// ============================================

export type QuestionCategory = 
  | 'text_input'
  | 'selection'
  | 'rating_scale'
  | 'advanced'
  | 'date_time'
  | 'media'
  | 'structural'
  | 'special';

export interface QuestionParameterConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'options' | 'range';
  defaultValue?: any;
  description?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  showWhen?: (question: any) => boolean;
}

export interface QuestionTypeConfig {
  // Core identification
  type: string;               // Schema type (e.g., "text")
  displayName: string;        // UI display name (e.g., "Short Text")
  icon: LucideIcon;
  category: QuestionCategory;
  description: string;
  
  // Default values
  defaultQuestion: string;
  defaultOptions?: string[];
  defaultParams?: Record<string, any>;
  
  // Capabilities
  isScoreable: boolean;
  supportsOptions: boolean;
  supportsValidation: boolean;
  supportsLogic: boolean;
  
  // Configuration parameters available for this type
  parameters: QuestionParameterConfig[];
  
  // Preview settings
  previewType: 'input' | 'textarea' | 'options' | 'scale' | 'grid' | 'upload' | 'special' | 'display';
}

// ============================================
// QUESTION TYPE CONFIGURATIONS
// ============================================

export const QUESTION_TYPES: Record<string, QuestionTypeConfig> = {
  // ============================================
  // TEXT INPUT TYPES
  // ============================================
  text: {
    type: 'text',
    displayName: 'Short Text',
    icon: Type,
    category: 'text_input',
    description: 'Single-line text input for short answers',
    defaultQuestion: 'What is your name?',
    isScoreable: false,
    supportsOptions: false,
    supportsValidation: true,
    supportsLogic: true,
    parameters: [
      { key: 'placeholder', label: 'Placeholder', type: 'text', description: 'Hint text shown when empty' },
      { key: 'minLength', label: 'Min Length', type: 'number', min: 0, max: 1000 },
      { key: 'maxLength', label: 'Max Length', type: 'number', min: 1, max: 1000, defaultValue: 255 },
      { key: 'validationPattern', label: 'Validation Pattern', type: 'text', description: 'Regex pattern for validation' },
    ],
    previewType: 'input',
  },

  textarea: {
    type: 'textarea',
    displayName: 'Long Text',
    icon: AlignLeft,
    category: 'text_input',
    description: 'Multi-line text area for detailed responses',
    defaultQuestion: 'Please describe your experience',
    isScoreable: false, // Can be AI-scored
    supportsOptions: false,
    supportsValidation: true,
    supportsLogic: true,
    parameters: [
      { key: 'placeholder', label: 'Placeholder', type: 'text' },
      { key: 'rows', label: 'Height (rows)', type: 'number', min: 2, max: 20, defaultValue: 4 },
      { key: 'minLength', label: 'Min Length', type: 'number', min: 0 },
      { key: 'maxLength', label: 'Max Length', type: 'number', defaultValue: 2000 },
    ],
    previewType: 'textarea',
  },

  email: {
    type: 'email',
    displayName: 'Email',
    icon: Mail,
    category: 'text_input',
    description: 'Email input with automatic validation',
    defaultQuestion: 'What is your email address?',
    isScoreable: false,
    supportsOptions: false,
    supportsValidation: true,
    supportsLogic: true,
    parameters: [
      { key: 'placeholder', label: 'Placeholder', type: 'text', defaultValue: 'name@example.com' },
    ],
    previewType: 'input',
  },

  phone: {
    type: 'phone',
    displayName: 'Phone Number',
    icon: Phone,
    category: 'text_input',
    description: 'Phone number input with formatting',
    defaultQuestion: 'What is your phone number?',
    isScoreable: false,
    supportsOptions: false,
    supportsValidation: true,
    supportsLogic: true,
    parameters: [
      { key: 'placeholder', label: 'Placeholder', type: 'text', defaultValue: '(555) 123-4567' },
    ],
    previewType: 'input',
  },

  url: {
    type: 'url',
    displayName: 'Website URL',
    icon: Globe,
    category: 'text_input',
    description: 'URL input with validation',
    defaultQuestion: 'What is your website URL?',
    isScoreable: false,
    supportsOptions: false,
    supportsValidation: true,
    supportsLogic: true,
    parameters: [
      { key: 'placeholder', label: 'Placeholder', type: 'text', defaultValue: 'https://example.com' },
    ],
    previewType: 'input',
  },

  number: {
    type: 'number',
    displayName: 'Number',
    icon: Hash,
    category: 'text_input',
    description: 'Numeric input with optional range',
    defaultQuestion: 'Enter a number',
    isScoreable: true,
    supportsOptions: false,
    supportsValidation: true,
    supportsLogic: true,
    parameters: [
      { key: 'placeholder', label: 'Placeholder', type: 'text' },
      { key: 'min', label: 'Minimum Value', type: 'number' },
      { key: 'max', label: 'Maximum Value', type: 'number' },
      { key: 'step', label: 'Step', type: 'number', defaultValue: 1 },
      { key: 'unit', label: 'Unit', type: 'text', description: 'e.g., $, %, years' },
    ],
    previewType: 'input',
  },

  // ============================================
  // SELECTION TYPES
  // ============================================
  multiple_choice: {
    type: 'multiple_choice',
    displayName: 'Multiple Choice',
    icon: CheckSquare,
    category: 'selection',
    description: 'Single selection from options',
    defaultQuestion: 'Select an option',
    defaultOptions: ['Option 1', 'Option 2', 'Option 3'],
    isScoreable: true,
    supportsOptions: true,
    supportsValidation: false,
    supportsLogic: true,
    parameters: [
      { 
        key: 'displayStyle', 
        label: 'Display Style', 
        type: 'select',
        defaultValue: 'cards',
        options: [
          { value: 'radio', label: 'Radio Buttons' },
          { value: 'cards', label: 'Cards' },
          { value: 'dropdown', label: 'Dropdown' },
        ]
      },
      { key: 'allowOther', label: 'Allow "Other" option', type: 'boolean', defaultValue: false },
      { key: 'randomizeOptions', label: 'Randomize order', type: 'boolean', defaultValue: false },
    ],
    previewType: 'options',
  },

  checkbox: {
    type: 'checkbox',
    displayName: 'Checkboxes',
    icon: CheckSquare,
    category: 'selection',
    description: 'Multiple selections from options',
    defaultQuestion: 'Select all that apply',
    defaultOptions: ['Option 1', 'Option 2', 'Option 3'],
    isScoreable: true,
    supportsOptions: true,
    supportsValidation: true,
    supportsLogic: true,
    parameters: [
      { 
        key: 'displayStyle', 
        label: 'Display Style', 
        type: 'select',
        defaultValue: 'checkbox',
        options: [
          { value: 'checkbox', label: 'Checkboxes' },
          { value: 'cards', label: 'Cards' },
        ]
      },
      { key: 'minSelections', label: 'Min Selections', type: 'number', min: 0 },
      { key: 'maxSelections', label: 'Max Selections', type: 'number', min: 1 },
      { key: 'allowOther', label: 'Allow "Other"', type: 'boolean' },
      { key: 'randomizeOptions', label: 'Randomize order', type: 'boolean' },
    ],
    previewType: 'options',
  },

  dropdown: {
    type: 'dropdown',
    displayName: 'Dropdown',
    icon: ChevronDown,
    category: 'selection',
    description: 'Single selection from a dropdown menu',
    defaultQuestion: 'Select from the list',
    defaultOptions: ['Option 1', 'Option 2', 'Option 3'],
    isScoreable: true,
    supportsOptions: true,
    supportsValidation: false,
    supportsLogic: true,
    parameters: [
      { key: 'placeholder', label: 'Placeholder', type: 'text', defaultValue: 'Select an option...' },
      { key: 'allowOther', label: 'Allow "Other"', type: 'boolean' },
      { key: 'randomizeOptions', label: 'Randomize order', type: 'boolean' },
    ],
    previewType: 'options',
  },

  image_choice: {
    type: 'image_choice',
    displayName: 'Image Choice',
    icon: Image,
    category: 'selection',
    description: 'Selection from images',
    defaultQuestion: 'Select your preferred option',
    isScoreable: true,
    supportsOptions: true,
    supportsValidation: false,
    supportsLogic: true,
    parameters: [
      { 
        key: 'selectionType', 
        label: 'Selection Type', 
        type: 'select',
        defaultValue: 'single',
        options: [
          { value: 'single', label: 'Single selection' },
          { value: 'multiple', label: 'Multiple selections' },
        ]
      },
      { 
        key: 'imageSize', 
        label: 'Image Size', 
        type: 'select',
        defaultValue: 'medium',
        options: [
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' },
        ]
      },
      { key: 'columns', label: 'Columns', type: 'number', min: 2, max: 4, defaultValue: 2 },
      { key: 'showLabels', label: 'Show Labels', type: 'boolean', defaultValue: true },
    ],
    previewType: 'special',
  },

  yes_no: {
    type: 'yes_no',
    displayName: 'Yes/No',
    icon: ToggleLeft,
    category: 'selection',
    description: 'Simple binary choice',
    defaultQuestion: 'Do you agree?',
    isScoreable: true,
    supportsOptions: false,
    supportsValidation: false,
    supportsLogic: true,
    parameters: [
      { 
        key: 'displayStyle', 
        label: 'Display Style', 
        type: 'select',
        defaultValue: 'buttons',
        options: [
          { value: 'buttons', label: 'Buttons' },
          { value: 'toggle', label: 'Toggle Switch' },
          { value: 'icons', label: 'Thumbs Up/Down' },
        ]
      },
      { key: 'yesLabel', label: 'Yes Label', type: 'text', defaultValue: 'Yes' },
      { key: 'noLabel', label: 'No Label', type: 'text', defaultValue: 'No' },
    ],
    previewType: 'special',
  },

  // ============================================
  // RATING & SCALE TYPES
  // ============================================
  rating: {
    type: 'rating',
    displayName: 'Rating Scale',
    icon: BarChart3,
    category: 'rating_scale',
    description: 'Numeric rating scale (1-N)',
    defaultQuestion: 'How would you rate your experience?',
    defaultParams: { ratingScale: 5, ratingStyle: 'number' },
    isScoreable: true,
    supportsOptions: false,
    supportsValidation: false,
    supportsLogic: true,
    parameters: [
      { 
        key: 'ratingScale', 
        label: 'Scale Points', 
        type: 'select',
        defaultValue: 5,
        options: [
          { value: '3', label: '3 points' },
          { value: '5', label: '5 points' },
          { value: '7', label: '7 points' },
          { value: '10', label: '10 points' },
        ]
      },
      { 
        key: 'ratingStyle', 
        label: 'Rating Style', 
        type: 'select',
        defaultValue: 'number',
        options: [
          { value: 'number', label: '123 Numbers' },
          { value: 'star', label: '⭐ Stars' },
          { value: 'heart', label: '❤️ Hearts' },
          { value: 'thumb', label: '👍 Thumbs' },
        ]
      },
      { key: 'ratingLabels', label: 'Show Labels', type: 'boolean', defaultValue: true },
    ],
    previewType: 'scale',
  },

  nps: {
    type: 'nps',
    displayName: 'NPS',
    icon: Heart,
    category: 'rating_scale',
    description: 'Net Promoter Score (0-10)',
    defaultQuestion: 'How likely are you to recommend us to a friend?',
    isScoreable: true,
    supportsOptions: false,
    supportsValidation: false,
    supportsLogic: true,
    parameters: [
      { key: 'leftLabel', label: 'Low Label', type: 'text', defaultValue: 'Not at all likely' },
      { key: 'rightLabel', label: 'High Label', type: 'text', defaultValue: 'Extremely likely' },
    ],
    previewType: 'scale',
  },

  likert: {
    type: 'likert',
    displayName: 'Likert Scale',
    icon: BarChart3,
    category: 'rating_scale',
    description: 'Agreement/frequency scale',
    defaultQuestion: 'I am satisfied with the service',
    defaultOptions: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    defaultParams: { likertType: 'agreement', likertPoints: 5 },
    isScoreable: true,
    supportsOptions: true,
    supportsValidation: false,
    supportsLogic: true,
    parameters: [
      { 
        key: 'likertType', 
        label: 'Scale Type', 
        type: 'select',
        defaultValue: 'agreement',
        options: [
          { value: 'agreement', label: 'Agreement (Agree/Disagree)' },
          { value: 'frequency', label: 'Frequency (Never/Always)' },
          { value: 'importance', label: 'Importance' },
          { value: 'satisfaction', label: 'Satisfaction' },
          { value: 'quality', label: 'Quality (Poor/Excellent)' },
        ]
      },
      { 
        key: 'likertPoints', 
        label: 'Number of Points', 
        type: 'select',
        defaultValue: 5,
        options: [
          { value: '5', label: '5-point scale' },
          { value: '7', label: '7-point scale' },
        ]
      },
      { 
        key: 'displayStyle', 
        label: 'Display Style', 
        type: 'select',
        defaultValue: 'horizontal',
        options: [
          { value: 'horizontal', label: 'Horizontal' },
          { value: 'vertical', label: 'Vertical' },
        ]
      },
      { key: 'showNeutral', label: 'Include Neutral', type: 'boolean', defaultValue: true },
    ],
    previewType: 'options',
  },

  opinion_scale: {
    type: 'opinion_scale',
    displayName: 'Opinion Scale',
    icon: Scale,
    category: 'rating_scale',
    description: 'Semantic differential (bipolar)',
    defaultQuestion: 'How do you feel about this?',
    defaultParams: { ratingScale: 5 },
    isScoreable: true,
    supportsOptions: false,
    supportsValidation: false,
    supportsLogic: true,
    parameters: [
      { 
        key: 'ratingScale', 
        label: 'Scale Points', 
        type: 'select',
        defaultValue: 5,
        options: [
          { value: '5', label: '5 points' },
          { value: '7', label: '7 points' },
          { value: '10', label: '10 points' },
        ]
      },
      { key: 'leftLabel', label: 'Left Label', type: 'text', defaultValue: 'Cold' },
      { key: 'rightLabel', label: 'Right Label', type: 'text', defaultValue: 'Hot' },
      { key: 'showNumbers', label: 'Show Numbers', type: 'boolean', defaultValue: true },
    ],
    previewType: 'scale',
  },

  slider: {
    type: 'slider',
    displayName: 'Slider',
    icon: Sliders,
    category: 'rating_scale',
    description: 'Continuous range slider',
    defaultQuestion: 'Slide to indicate your preference',
    defaultParams: { min: 0, max: 100, step: 1 },
    isScoreable: true,
    supportsOptions: false,
    supportsValidation: true,
    supportsLogic: true,
    parameters: [
      { key: 'min', label: 'Minimum', type: 'number', defaultValue: 0 },
      { key: 'max', label: 'Maximum', type: 'number', defaultValue: 100 },
      { key: 'step', label: 'Step', type: 'number', defaultValue: 1, min: 1 },
      { key: 'defaultValue', label: 'Default Value', type: 'number' },
      { key: 'showValue', label: 'Show Current Value', type: 'boolean', defaultValue: true },
      { key: 'unit', label: 'Unit', type: 'text', description: 'e.g., %, $, years' },
      { key: 'leftLabel', label: 'Left Label', type: 'text' },
      { key: 'rightLabel', label: 'Right Label', type: 'text' },
    ],
    previewType: 'scale',
  },

  emoji_rating: {
    type: 'emoji_rating',
    displayName: 'Emoji Rating',
    icon: Smile,
    category: 'rating_scale',
    description: 'Emoji-based satisfaction rating',
    defaultQuestion: 'How do you feel?',
    defaultParams: { ratingScale: 5 },
    isScoreable: true,
    supportsOptions: false,
    supportsValidation: false,
    supportsLogic: true,
    parameters: [
      { 
        key: 'ratingScale', 
        label: 'Number of Options', 
        type: 'select',
        defaultValue: 5,
        options: [
          { value: '3', label: '3 emojis' },
          { value: '5', label: '5 emojis' },
        ]
      },
    ],
    previewType: 'scale',
  },

  // ============================================
  // ADVANCED TYPES
  // ============================================
  matrix: {
    type: 'matrix',
    displayName: 'Matrix / Grid',
    icon: Grid3x3,
    category: 'advanced',
    description: 'Multiple questions in a grid',
    defaultQuestion: 'Rate the following aspects',
    defaultParams: {
      rowLabels: ['Quality', 'Value', 'Service'],
      colLabels: ['Poor', 'Fair', 'Good', 'Excellent'],
      matrixType: 'radio',
    },
    isScoreable: true,
    supportsOptions: false,
    supportsValidation: false,
    supportsLogic: true,
    parameters: [
      { 
        key: 'matrixType', 
        label: 'Selection Type', 
        type: 'select',
        defaultValue: 'radio',
        options: [
          { value: 'radio', label: 'Single per row (Radio)' },
          { value: 'checkbox', label: 'Multiple per row (Checkbox)' },
          { value: 'text', label: 'Text input per cell' },
        ]
      },
      { key: 'randomizeRows', label: 'Randomize Rows', type: 'boolean', defaultValue: false },
    ],
    previewType: 'grid',
  },

  ranking: {
    type: 'ranking',
    displayName: 'Ranking',
    icon: GripVertical,
    category: 'advanced',
    description: 'Drag items to rank by preference',
    defaultQuestion: 'Rank these items in order of preference',
    defaultOptions: ['First item', 'Second item', 'Third item'],
    isScoreable: true,
    supportsOptions: true,
    supportsValidation: false,
    supportsLogic: true,
    parameters: [
      { 
        key: 'displayStyle', 
        label: 'Display Style', 
        type: 'select',
        defaultValue: 'drag',
        options: [
          { value: 'drag', label: 'Drag and Drop' },
          { value: 'number', label: 'Number Inputs' },
        ]
      },
      { key: 'maxRankItems', label: 'Only rank top N', type: 'number', description: 'Leave empty to rank all' },
    ],
    previewType: 'options',
  },

  constant_sum: {
    type: 'constant_sum',
    displayName: 'Constant Sum',
    icon: Calculator,
    category: 'advanced',
    description: 'Distribute points across options',
    defaultQuestion: 'Distribute 100 points among the following',
    defaultOptions: ['Option A', 'Option B', 'Option C'],
    defaultParams: { totalPoints: 100 },
    isScoreable: true,
    supportsOptions: true,
    supportsValidation: true,
    supportsLogic: true,
    parameters: [
      { key: 'totalPoints', label: 'Total Points', type: 'number', defaultValue: 100 },
      { key: 'showPercentage', label: 'Show as Percentage', type: 'boolean', defaultValue: false },
    ],
    previewType: 'special',
  },

  calculation: {
    type: 'calculation',
    displayName: 'Calculation',
    icon: Calculator,
    category: 'advanced',
    description: 'Auto-calculate value from other answers',
    defaultQuestion: 'Calculated field',
    isScoreable: false,
    supportsOptions: false,
    supportsValidation: false,
    supportsLogic: true,
    parameters: [
      { key: 'formula', label: 'Formula', type: 'text', description: 'Use {Q1}, {Q2} to reference other questions' },
    ],
    previewType: 'display',
  },

  // ============================================
  // DATE & TIME TYPES
  // ============================================
  date: {
    type: 'date',
    displayName: 'Date',
    icon: Calendar,
    category: 'date_time',
    description: 'Date picker',
    defaultQuestion: 'Select a date',
    isScoreable: false,
    supportsOptions: false,
    supportsValidation: true,
    supportsLogic: true,
    parameters: [
      { 
        key: 'dateFormat', 
        label: 'Date Format', 
        type: 'select',
        defaultValue: 'MM/DD/YYYY',
        options: [
          { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
          { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
          { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
        ]
      },
      { key: 'minDate', label: 'Minimum Date', type: 'text', description: 'YYYY-MM-DD format' },
      { key: 'maxDate', label: 'Maximum Date', type: 'text' },
      { key: 'disablePastDates', label: 'Disable Past Dates', type: 'boolean' },
      { key: 'disableFutureDates', label: 'Disable Future Dates', type: 'boolean' },
    ],
    previewType: 'input',
  },

  time: {
    type: 'time',
    displayName: 'Time',
    icon: Clock,
    category: 'date_time',
    description: 'Time picker',
    defaultQuestion: 'Select a time',
    isScoreable: false,
    supportsOptions: false,
    supportsValidation: true,
    supportsLogic: true,
    parameters: [
      { 
        key: 'timeFormat', 
        label: 'Time Format', 
        type: 'select',
        defaultValue: '12h',
        options: [
          { value: '12h', label: '12-hour (AM/PM)' },
          { value: '24h', label: '24-hour' },
        ]
      },
      { 
        key: 'minuteStep', 
        label: 'Minute Intervals', 
        type: 'select',
        defaultValue: 15,
        options: [
          { value: '1', label: '1 minute' },
          { value: '5', label: '5 minutes' },
          { value: '10', label: '10 minutes' },
          { value: '15', label: '15 minutes' },
          { value: '30', label: '30 minutes' },
        ]
      },
    ],
    previewType: 'input',
  },

  datetime: {
    type: 'datetime',
    displayName: 'Date & Time',
    icon: CalendarClock,
    category: 'date_time',
    description: 'Combined date and time picker',
    defaultQuestion: 'Select date and time',
    isScoreable: false,
    supportsOptions: false,
    supportsValidation: true,
    supportsLogic: true,
    parameters: [
      { 
        key: 'dateFormat', 
        label: 'Date Format', 
        type: 'select',
        defaultValue: 'MM/DD/YYYY',
        options: [
          { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
          { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
          { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
        ]
      },
      { 
        key: 'timeFormat', 
        label: 'Time Format', 
        type: 'select',
        defaultValue: '12h',
        options: [
          { value: '12h', label: '12-hour' },
          { value: '24h', label: '24-hour' },
        ]
      },
    ],
    previewType: 'input',
  },

  // ============================================
  // MEDIA TYPES
  // ============================================
  file_upload: {
    type: 'file_upload',
    displayName: 'File Upload',
    icon: FileUp,
    category: 'media',
    description: 'Upload documents or files',
    defaultQuestion: 'Upload your file',
    isScoreable: false,
    supportsOptions: false,
    supportsValidation: true,
    supportsLogic: false,
    parameters: [
      { 
        key: 'allowedTypes', 
        label: 'Allowed File Types', 
        type: 'text',
        description: 'Comma-separated (e.g., pdf,doc,jpg)',
        defaultValue: 'pdf,doc,docx,jpg,png'
      },
      { key: 'maxFileSize', label: 'Max File Size (MB)', type: 'number', defaultValue: 10, min: 1, max: 100 },
      { key: 'maxFiles', label: 'Max Files', type: 'number', defaultValue: 1, min: 1, max: 10 },
    ],
    previewType: 'upload',
  },

  signature: {
    type: 'signature',
    displayName: 'Signature',
    icon: PenTool,
    category: 'media',
    description: 'Digital signature pad',
    defaultQuestion: 'Please sign below',
    isScoreable: false,
    supportsOptions: false,
    supportsValidation: false,
    supportsLogic: false,
    parameters: [],
    previewType: 'special',
  },

  video: {
    type: 'video',
    displayName: 'Video',
    icon: Video,
    category: 'media',
    description: 'Embed video content',
    defaultQuestion: 'Watch the video below',
    isScoreable: false,
    supportsOptions: false,
    supportsValidation: false,
    supportsLogic: false,
    parameters: [
      { key: 'videoUrl', label: 'Video URL', type: 'text', description: 'YouTube or Vimeo URL' },
    ],
    previewType: 'special',
  },

  audio_capture: {
    type: 'audio_capture',
    displayName: 'Audio Recording',
    icon: Mic,
    category: 'media',
    description: 'Record audio response',
    defaultQuestion: 'Record your response',
    isScoreable: false,
    supportsOptions: false,
    supportsValidation: false,
    supportsLogic: false,
    parameters: [
      { key: 'maxDuration', label: 'Max Duration (seconds)', type: 'number', defaultValue: 60, min: 10, max: 300 },
    ],
    previewType: 'special',
  },

  // ============================================
  // STRUCTURAL TYPES
  // ============================================
  section: {
    type: 'section',
    displayName: 'Section Break',
    icon: LayoutList,
    category: 'structural',
    description: 'Visual divider between question groups',
    defaultQuestion: 'Section Title',
    isScoreable: false,
    supportsOptions: false,
    supportsValidation: false,
    supportsLogic: true,
    parameters: [],
    previewType: 'display',
  },

  statement: {
    type: 'statement',
    displayName: 'Statement',
    icon: FileText,
    category: 'structural',
    description: 'Display-only text or instructions',
    defaultQuestion: 'Important information',
    isScoreable: false,
    supportsOptions: false,
    supportsValidation: false,
    supportsLogic: true,
    parameters: [],
    previewType: 'display',
  },

  legal: {
    type: 'legal',
    displayName: 'Consent/Legal',
    icon: ShieldCheck,
    category: 'structural',
    description: 'Consent checkbox with terms',
    defaultQuestion: 'I agree to the terms and conditions',
    isScoreable: false,
    supportsOptions: false,
    supportsValidation: false,
    supportsLogic: true,
    parameters: [
      { key: 'linkUrl', label: 'Link URL', type: 'text', description: 'Link to full terms' },
      { key: 'linkText', label: 'Link Text', type: 'text', defaultValue: 'Read full terms' },
    ],
    previewType: 'special',
  },

  // ============================================
  // SPECIAL TYPES
  // ============================================
  hidden: {
    type: 'hidden',
    displayName: 'Hidden Field',
    icon: EyeOff,
    category: 'special',
    description: 'Hidden data capture (not shown to respondent)',
    defaultQuestion: 'Hidden field',
    isScoreable: false,
    supportsOptions: false,
    supportsValidation: false,
    supportsLogic: false,
    parameters: [
      { key: 'defaultValue', label: 'Default Value', type: 'text' },
    ],
    previewType: 'display',
  },
};

// ============================================
// CATEGORY METADATA
// ============================================

export const QUESTION_CATEGORIES_META: Record<QuestionCategory, { name: string; description: string; color: string }> = {
  text_input: {
    name: 'Text Input',
    description: 'Collect text responses',
    color: 'blue',
  },
  selection: {
    name: 'Selection',
    description: 'Choose from options',
    color: 'purple',
  },
  rating_scale: {
    name: 'Rating & Scales',
    description: 'Rate or scale responses',
    color: 'green',
  },
  advanced: {
    name: 'Advanced',
    description: 'Complex question types',
    color: 'orange',
  },
  date_time: {
    name: 'Date & Time',
    description: 'Date/time selection',
    color: 'cyan',
  },
  media: {
    name: 'Media',
    description: 'File uploads and media',
    color: 'pink',
  },
  structural: {
    name: 'Structure',
    description: 'Organize your survey',
    color: 'gray',
  },
  special: {
    name: 'Special',
    description: 'Advanced functionality',
    color: 'red',
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getQuestionTypeConfig(type: string): QuestionTypeConfig | undefined {
  return QUESTION_TYPES[type];
}

export function getQuestionTypesByCategory(category: QuestionCategory): QuestionTypeConfig[] {
  return Object.values(QUESTION_TYPES).filter(q => q.category === category);
}

export function getAllQuestionTypes(): QuestionTypeConfig[] {
  return Object.values(QUESTION_TYPES);
}

export function getDisplayNameForType(type: string): string {
  return QUESTION_TYPES[type]?.displayName || type;
}

export function getIconForType(type: string): LucideIcon {
  return QUESTION_TYPES[type]?.icon || Type;
}

// Likert scale presets
export const LIKERT_PRESETS: Record<string, { labels5: string[]; labels7: string[] }> = {
  agreement: {
    labels5: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    labels7: ['Strongly Disagree', 'Disagree', 'Somewhat Disagree', 'Neutral', 'Somewhat Agree', 'Agree', 'Strongly Agree'],
  },
  frequency: {
    labels5: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    labels7: ['Never', 'Very Rarely', 'Rarely', 'Sometimes', 'Often', 'Very Often', 'Always'],
  },
  importance: {
    labels5: ['Not Important', 'Slightly Important', 'Moderately Important', 'Very Important', 'Extremely Important'],
    labels7: ['Not Important', 'Slightly Important', 'Somewhat Important', 'Moderately Important', 'Important', 'Very Important', 'Extremely Important'],
  },
  satisfaction: {
    labels5: ['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'],
    labels7: ['Very Dissatisfied', 'Dissatisfied', 'Somewhat Dissatisfied', 'Neutral', 'Somewhat Satisfied', 'Satisfied', 'Very Satisfied'],
  },
  quality: {
    labels5: ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'],
    labels7: ['Very Poor', 'Poor', 'Below Average', 'Average', 'Above Average', 'Good', 'Excellent'],
  },
};

// Get Likert labels for a specific type and number of points
export function getLikertLabels(likertType: string, points: number): string[] {
  const preset = LIKERT_PRESETS[likertType];
  if (!preset) return LIKERT_PRESETS.agreement[points === 7 ? 'labels7' : 'labels5'];
  return points === 7 ? preset.labels7 : preset.labels5;
}

