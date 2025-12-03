/**
 * Script to convert question bank data to the BankQuestion format
 * Run with: npx tsx scripts/convertQuestionBank.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface InputQuestion {
  id: number;
  text: string;
  question_type: string;
  category: string;
  subcategory: string;
  options: string[] | null;
  scale_type: string | null;
  difficulty: string;
  tags: string[];
  description: string;
  sensitivity_level: string;
  featured: boolean;
  use_count?: number;
  avg_response_time_seconds?: number | null;
  effectiveness_score?: string | number | null;
}

interface BankQuestion {
  id: number;
  text: string;
  questionType: string;
  displayType: string;
  category: string;
  subcategory: string;
  scaleType?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  sensitivityLevel: 'low' | 'medium' | 'high';
  tags: string[];
  description: string;
  options?: string[];
  languageCode: string;
  source: 'system' | 'custom';
  isPublished: boolean;
  useCount: number;
  avgResponseTimeSeconds: number;
  effectivenessScore: number;
}

// Map question types to Evalia schema types
function mapQuestionType(questionType: string, scaleType: string | null): { questionType: string; displayType: string } {
  if (questionType === 'rating') {
    if (scaleType === 'nps') {
      return { questionType: 'nps', displayType: 'NPS' };
    }
    if (scaleType === 'emoji') {
      return { questionType: 'emoji_rating', displayType: 'Emoji Rating' };
    }
    if (scaleType === 'thumbs') {
      return { questionType: 'rating', displayType: 'Thumbs Rating' };
    }
    // likert_5 or default
    return { questionType: 'likert', displayType: 'Likert Scale' };
  }
  if (questionType === 'open_ended') {
    return { questionType: 'textarea', displayType: 'Long Text' };
  }
  if (questionType === 'multiple_choice') {
    return { questionType: 'multiple_choice', displayType: 'Multiple Choice' };
  }
  // Default
  return { questionType: 'rating', displayType: 'Star Rating' };
}

// Get default options for likert scales
function getLikertOptions(): string[] {
  return ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"];
}

function convertQuestion(q: InputQuestion): BankQuestion {
  const typeInfo = mapQuestionType(q.question_type, q.scale_type);
  
  const result: BankQuestion = {
    id: q.id,
    text: q.text,
    questionType: typeInfo.questionType,
    displayType: typeInfo.displayType,
    category: q.category,
    subcategory: q.subcategory,
    difficulty: (q.difficulty as 'easy' | 'medium' | 'hard') || 'medium',
    sensitivityLevel: (q.sensitivity_level as 'low' | 'medium' | 'high') || 'low',
    tags: q.tags || [],
    description: q.description || '',
    languageCode: 'en',
    source: 'system',
    isPublished: true,
    useCount: q.use_count || 0,
    avgResponseTimeSeconds: q.avg_response_time_seconds || 15,
    effectivenessScore: typeof q.effectiveness_score === 'string' 
      ? parseFloat(q.effectiveness_score) || 0.75 
      : q.effectiveness_score || 0.75,
  };

  // Add scale type
  if (q.scale_type) {
    result.scaleType = q.scale_type;
  } else if (typeInfo.questionType === 'likert') {
    result.scaleType = 'likert_5';
  }

  // Add options
  if (q.options && q.options.length > 0) {
    result.options = q.options;
  } else if (typeInfo.questionType === 'likert') {
    result.options = getLikertOptions();
  }

  return result;
}

// Generate the TypeScript file content
function generateTsFile(questions: BankQuestion[]): string {
  // Extract unique categories
  const categories = new Map<string, Set<string>>();
  questions.forEach(q => {
    if (!categories.has(q.category)) {
      categories.set(q.category, new Set());
    }
    categories.get(q.category)!.add(q.subcategory);
  });

  let content = `/**
 * Question Bank - Pre-built questions for common survey use cases
 * 
 * Generated with ${questions.length} questions
 * 
 * Categories:
${Array.from(categories.keys()).map(cat => ` * - ${cat}`).join('\n')}
 */

export interface BankQuestion {
  id: number;
  text: string;
  questionType: string; // Maps to Evalia question types
  displayType: string; // Display name for UI
  category: string;
  subcategory: string;
  scaleType?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  sensitivityLevel: 'low' | 'medium' | 'high';
  tags: string[];
  description: string;
  options?: string[];
  languageCode: string;
  source: 'system' | 'custom';
  isPublished: boolean;
  useCount: number;
  avgResponseTimeSeconds: number;
  effectivenessScore: number;
}

export const QUESTION_BANK: BankQuestion[] = [\n`;

  // Group questions by category for organization
  const byCategory = new Map<string, BankQuestion[]>();
  questions.forEach(q => {
    if (!byCategory.has(q.category)) {
      byCategory.set(q.category, []);
    }
    byCategory.get(q.category)!.push(q);
  });

  for (const [category, categoryQuestions] of byCategory) {
    content += `  // ============================================\n`;
    content += `  // ${category.toUpperCase()}\n`;
    content += `  // ============================================\n`;
    
    for (const q of categoryQuestions) {
      content += `  {\n`;
      content += `    id: ${q.id},\n`;
      content += `    text: ${JSON.stringify(q.text)},\n`;
      content += `    questionType: "${q.questionType}",\n`;
      content += `    displayType: "${q.displayType}",\n`;
      content += `    category: "${q.category}",\n`;
      content += `    subcategory: "${q.subcategory}",\n`;
      if (q.scaleType) {
        content += `    scaleType: "${q.scaleType}",\n`;
      }
      content += `    difficulty: "${q.difficulty}",\n`;
      content += `    sensitivityLevel: "${q.sensitivityLevel}",\n`;
      content += `    tags: ${JSON.stringify(q.tags)},\n`;
      content += `    description: ${JSON.stringify(q.description)},\n`;
      if (q.options) {
        content += `    options: ${JSON.stringify(q.options)},\n`;
      }
      content += `    languageCode: "${q.languageCode}",\n`;
      content += `    source: "${q.source}",\n`;
      content += `    isPublished: ${q.isPublished},\n`;
      content += `    useCount: ${q.useCount},\n`;
      content += `    avgResponseTimeSeconds: ${q.avgResponseTimeSeconds},\n`;
      content += `    effectivenessScore: ${q.effectivenessScore}\n`;
      content += `  },\n`;
    }
  }

  content += `];

// Helper functions
export const getQuestionsByCategory = (category: string): BankQuestion[] => {
  return QUESTION_BANK.filter(q => q.category === category && q.isPublished);
};

export const getQuestionsBySubcategory = (subcategory: string): BankQuestion[] => {
  return QUESTION_BANK.filter(q => q.subcategory === subcategory && q.isPublished);
};

export const getQuestionsByTags = (tags: string[]): BankQuestion[] => {
  return QUESTION_BANK.filter(q => 
    q.isPublished && tags.some(tag => q.tags.includes(tag))
  );
};

export const getPopularQuestions = (limit: number = 10): BankQuestion[] => {
  return [...QUESTION_BANK]
    .filter(q => q.isPublished)
    .sort((a, b) => b.useCount - a.useCount)
    .slice(0, limit);
};

export const getHighEffectivenessQuestions = (minScore: number = 0.9): BankQuestion[] => {
  return QUESTION_BANK.filter(q => 
    q.isPublished && q.effectivenessScore >= minScore
  );
};

export const searchQuestions = (query: string): BankQuestion[] => {
  const lowerQuery = query.toLowerCase();
  return QUESTION_BANK.filter(q =>
    q.isPublished && (
      q.text.toLowerCase().includes(lowerQuery) ||
      q.category.toLowerCase().includes(lowerQuery) ||
      q.subcategory.toLowerCase().includes(lowerQuery) ||
      q.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      q.description.toLowerCase().includes(lowerQuery)
    )
  );
};

// Category metadata
export const QUESTION_CATEGORIES = [
${Array.from(categories.keys()).map(cat => {
  const icon = getCategoryIcon(cat);
  const desc = getCategoryDescription(cat);
  return `  { id: '${cat}', name: '${formatCategoryName(cat)}', icon: '${icon}', description: '${desc}' },`;
}).join('\n')}
];

export const QUESTION_SUBCATEGORIES: Record<string, { id: string; name: string }[]> = {
${Array.from(categories.entries()).map(([cat, subs]) => {
  const subsArray = Array.from(subs).map(sub => 
    `    { id: '${sub}', name: '${formatSubcategoryName(sub)}' }`
  ).join(',\n');
  return `  ${cat}: [\n${subsArray}\n  ],`;
}).join('\n')}
};
`;

  return content;
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    engagement: '💼',
    management: '👔',
    training: '📚',
    workload: '⚖️',
    culture: '🏢',
    onboarding: '🚀',
    pulse: '💓',
    satisfaction: '⭐',
    feedback: '💬',
    wellbeing: '🧘',
    belonging: '🤝',
    compensation: '💰',
    career: '📈',
    mission: '🎯',
    innovation: '💡',
    agility: '⚡',
    communication: '📣',
    leadership: '👑',
    challenges: '🏔️',
    advocacy: '📢',
    improvement: '🔧',
    relationships: '🤝',
    diversity: '🌈',
  };
  return icons[category] || '📋';
}

function getCategoryDescription(category: string): string {
  const descriptions: Record<string, string> = {
    engagement: 'Employee engagement and satisfaction',
    management: 'Manager effectiveness and support',
    training: 'Training and development feedback',
    workload: 'Workload and stress management',
    culture: 'Organizational culture and values',
    onboarding: 'New employee experience',
    pulse: 'Quick check-in surveys',
    satisfaction: 'Customer satisfaction',
    feedback: 'General feedback collection',
    wellbeing: 'Employee wellbeing and mental health',
    belonging: 'Inclusion and belonging',
    compensation: 'Pay and benefits',
    career: 'Career development',
    mission: 'Mission alignment',
    innovation: 'Innovation culture',
    agility: 'Organizational agility',
    communication: 'Communication effectiveness',
    leadership: 'Leadership effectiveness',
    challenges: 'Work challenges',
    advocacy: 'Employee advocacy',
    improvement: 'Improvement suggestions',
    relationships: 'Workplace relationships',
    diversity: 'Diversity and inclusion',
  };
  return descriptions[category] || 'Survey questions';
}

function formatCategoryName(category: string): string {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatSubcategoryName(subcategory: string): string {
  return subcategory
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Main execution
async function main() {
  // Read input JSON file
  const inputPath = path.join(__dirname, 'questionBankInput.json');
  
  if (!fs.existsSync(inputPath)) {
    console.error(`Error: Input file not found at ${inputPath}`);
    console.log('Please create scripts/questionBankInput.json with the 161 questions');
    process.exit(1);
  }

  const inputData = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  console.log(`Read ${inputData.length} questions from input file`);

  // Convert questions
  const convertedQuestions = inputData.map(convertQuestion);
  console.log(`Converted ${convertedQuestions.length} questions`);

  // Generate TypeScript file
  const tsContent = generateTsFile(convertedQuestions);

  // Write output
  const outputPath = path.join(__dirname, '../client/src/data/questionBank.ts');
  fs.writeFileSync(outputPath, tsContent);
  console.log(`Generated ${outputPath}`);
  console.log('Done!');
}

main().catch(console.error);

