import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ChevronLeft, Search, Database, Sparkles, LayoutGrid, List, Wand2 } from 'lucide-react';
import { useSurveyBuilder } from '@/contexts/SurveyBuilderContext';
import { 
  QUESTION_TYPES, 
  QUESTION_CATEGORIES_META, 
  getQuestionTypesByCategory,
  type QuestionCategory,
  type QuestionTypeConfig 
} from '@/data/questionTypeConfig';
import { QUESTION_BANK, QUESTION_CATEGORIES, searchQuestions, getQuestionsByCategory as getBankByCategory, getPopularQuestions } from '@/data/questionBank';

type TabType = 'types' | 'bank' | 'ai';
type LayoutType = 'list' | 'grid';

export function QuestionLibrary() {
  const { leftPanelOpen, toggleLeftPanel, questions, addQuestion } = useSurveyBuilder();
  const [activeTab, setActiveTab] = useState<TabType>('types');
  const [searchQuery, setSearchQuery] = useState('');
  const [structureOpen, setStructureOpen] = useState(false);
  const [layout, setLayout] = useState<LayoutType>('list');

  if (!leftPanelOpen) {
    return (
      <button
        onClick={toggleLeftPanel}
        className="w-12 flex-shrink-0 bg-white border-r border-gray-200 
                   flex items-center justify-center hover:bg-gray-50 transition-colors group"
        title="Open Question Library"
      >
        <ChevronRight size={20} className="text-gray-500 group-hover:text-purple-500 transition-colors" />
      </button>
    );
  }

  return (
    <aside className="w-[280px] lg:w-[340px] flex-shrink-0 bg-white border-r border-gray-200 overflow-hidden flex flex-col">
      {/* Header with Collapse Button */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-900">Question Library</h2>
          <button
            onClick={toggleLeftPanel}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Collapse Panel"
          >
            <ChevronLeft size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('types')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'types'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Sparkles size={14} />
            <span>Question Types</span>
          </button>
          <button
            onClick={() => setActiveTab('bank')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'bank'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Database size={14} />
            <span>Question Bank</span>
          </button>
        </div>
        
        {/* Layout Toggle & AI Quick Add */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-md">
            <button
              onClick={() => setLayout('list')}
              className={`p-1.5 rounded ${layout === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              title="List view"
            >
              <List size={14} className={layout === 'list' ? 'text-purple-600' : 'text-gray-500'} />
            </button>
            <button
              onClick={() => setLayout('grid')}
              className={`p-1.5 rounded ${layout === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              title="Grid view (2 columns)"
            >
              <LayoutGrid size={14} className={layout === 'grid' ? 'text-purple-600' : 'text-gray-500'} />
            </button>
          </div>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'ai'
                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                : 'text-purple-600 hover:bg-purple-50 border border-transparent'
            }`}
          >
            <Wand2 size={12} />
            <span>AI Quick</span>
          </button>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={activeTab === 'types' ? 'Search question types...' : 'Search question bank...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md
                       focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 
                       outline-none transition-all"
            />
          </div>
        </div>

        {/* Survey Structure (Collapsible) */}
        <div className="mb-6">
          <button
            onClick={() => setStructureOpen(!structureOpen)}
            className="w-full flex items-center justify-between px-2 py-2 text-xs font-semibold 
                     text-gray-900 uppercase tracking-wider hover:bg-gray-50 rounded transition-colors"
          >
            <span>Survey Structure ({questions.length})</span>
            {structureOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {structureOpen && (
            <div className="mt-2 space-y-1">
              {questions.length === 0 ? (
                <div className="px-2 py-3 text-xs text-gray-500 text-center bg-gray-50 rounded border border-dashed border-gray-300">
                  No questions yet
                </div>
              ) : (
                questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="flex items-center gap-2 px-2 py-1.5 text-xs rounded
                             hover:bg-purple-50 cursor-pointer transition-colors group"
                  >
                    <span
                      className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center
                                 text-[10px] font-bold text-gray-900 group-hover:bg-purple-100 
                                 group-hover:text-purple-600 transition-colors"
                    >
                      {index + 1}
                    </span>
                    <span className="flex-1 truncate text-gray-900 group-hover:text-purple-600 transition-colors">
                      {question.text}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'types' && (
          <QuestionTypesTab searchQuery={searchQuery} layout={layout} />
        )}
        {activeTab === 'bank' && (
          <QuestionBankTab searchQuery={searchQuery} layout={layout} />
        )}
        {activeTab === 'ai' && (
          <AIQuickActionsTab onAddQuestion={(type) => {
            addQuestion(type);
            setActiveTab('types');
          }} />
        )}
      </div>
    </aside>
  );
}

// ============================================
// AI QUICK ACTIONS TAB
// ============================================
function AIQuickActionsTab({ onAddQuestion }: { onAddQuestion: (type: string) => void }) {
  const quickActions = [
    { label: '📝 Text Question', type: 'text', description: 'Open-ended response' },
    { label: '✅ Multiple Choice', type: 'multiple_choice', description: 'Select one option' },
    { label: '☑️ Checkboxes', type: 'checkbox', description: 'Select multiple options' },
    { label: '⭐ Rating Scale', type: 'rating', description: '1-5 star rating' },
    { label: '📊 NPS Score', type: 'nps', description: 'Net Promoter Score (0-10)' },
    { label: '📏 Likert Scale', type: 'likert', description: 'Agreement scale' },
    { label: '👍 Yes/No', type: 'yes_no', description: 'Binary choice' },
    { label: '📅 Date Picker', type: 'date', description: 'Select a date' },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
        <div className="flex items-center gap-2 mb-2">
          <Wand2 size={16} className="text-purple-600" />
          <span className="text-sm font-bold text-gray-900">Quick Add with AI</span>
        </div>
        <p className="text-xs text-gray-600 mb-3">
          Click to instantly add common question types. AI will help configure them.
        </p>
        
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action) => (
            <button
              key={action.type}
              onClick={() => onAddQuestion(action.type)}
              className="p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 
                       hover:bg-purple-50/50 transition-all text-left group"
            >
              <div className="text-sm font-medium text-gray-900 group-hover:text-purple-600">
                {action.label}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {action.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="text-center py-4">
        <button className="text-xs text-purple-600 hover:text-purple-700 font-medium">
          🎯 Suggest questions based on survey goal
        </button>
      </div>
    </div>
  );
}

// ============================================
// QUESTION TYPES TAB - Uses database types
// ============================================
function QuestionTypesTab({ searchQuery, layout }: { searchQuery: string; layout: LayoutType }) {
  const categories: QuestionCategory[] = [
    'text_input',
    'selection', 
    'rating_scale',
    'advanced',
    'date_time',
    'media',
    'structural',
    'special',
  ];

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <QuestionCategory 
          key={category} 
          category={category} 
          searchQuery={searchQuery}
          layout={layout}
        />
      ))}
    </div>
  );
}

// ============================================
// QUESTION CATEGORY COMPONENT
// ============================================
interface QuestionCategoryProps {
  category: QuestionCategory;
  searchQuery: string;
  layout: LayoutType;
}

function QuestionCategory({ category, searchQuery, layout }: QuestionCategoryProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { addQuestion } = useSurveyBuilder();
  
  const categoryMeta = QUESTION_CATEGORIES_META[category];
  const questionTypes = getQuestionTypesByCategory(category);
  
  // Filter by search query
  const filteredTypes = questionTypes.filter((type) =>
    type.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    type.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filteredTypes.length === 0 && searchQuery) {
    return null;
  }

  const colorClasses: Record<string, { bg: string; border: string; text: string; hover: string }> = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', hover: 'hover:bg-blue-100 hover:border-blue-300' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', hover: 'hover:bg-purple-100 hover:border-purple-300' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', hover: 'hover:bg-green-100 hover:border-green-300' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', hover: 'hover:bg-orange-100 hover:border-orange-300' },
    cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-600', hover: 'hover:bg-cyan-100 hover:border-cyan-300' },
    pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-600', hover: 'hover:bg-pink-100 hover:border-pink-300' },
    gray: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', hover: 'hover:bg-gray-100 hover:border-gray-300' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', hover: 'hover:bg-red-100 hover:border-red-300' },
  };

  const colors = colorClasses[categoryMeta.color] || colorClasses.gray;

  const handleAddQuestion = (type: QuestionTypeConfig) => {
    // Pass the schema type directly - context will handle conversion
    addQuestion(type.type);
  };

  const handleDragStart = (e: React.DragEvent, type: QuestionTypeConfig) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('questionType', type.type);
    e.dataTransfer.setData('questionDisplayName', type.displayName);
  };

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-medium 
                 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
      >
        <span>{categoryMeta.name}</span>
        {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      </button>

      {isOpen && (
        <div className={`mt-2 ${layout === 'grid' ? 'grid grid-cols-2 gap-2' : 'space-y-2'}`}>
          {filteredTypes.map((type) => {
            const Icon = type.icon;
            return (
              <div
                key={type.type}
                draggable
                onDragStart={(e) => handleDragStart(e, type)}
                onClick={() => handleAddQuestion(type)}
                className={`
                  ${layout === 'grid' ? 'p-2' : 'p-3'} rounded-lg cursor-grab active:cursor-grabbing transition-all
                  border ${colors.bg} ${colors.border} ${colors.hover} group
                `}
              >
                <div className={`flex items-center gap-2 ${layout === 'grid' ? 'flex-col text-center' : ''}`}>
                  <div className={`${colors.text} transition-colors ${layout === 'grid' ? 'mb-1' : ''}`}>
                    <Icon size={layout === 'grid' ? 18 : 14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-semibold ${colors.text} transition-colors ${layout === 'grid' ? 'truncate' : ''}`}>
                      {type.displayName}
                    </div>
                    {layout === 'list' && (
                      <div className="text-xs text-gray-500 truncate">{type.description}</div>
                    )}
                  </div>
                </div>
                {/* Capability badges - only in list view */}
                {layout === 'list' && (
                  <div className="flex gap-1 mt-2">
                    {type.isScoreable && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded">
                        Scoreable
                      </span>
                    )}
                    {type.supportsLogic && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                        Logic
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================
// QUESTION BANK TAB
// ============================================
function QuestionBankTab({ searchQuery, layout }: { searchQuery: string; layout: LayoutType }) {
  const { addQuestion } = useSurveyBuilder();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get filtered questions
  const getFilteredQuestions = () => {
    if (searchQuery) {
      return searchQuestions(searchQuery);
    }
    if (selectedCategory) {
      return getBankByCategory(selectedCategory);
    }
    return getPopularQuestions(15);
  };

  const filteredQuestions = getFilteredQuestions();

  // Handle adding a bank question to the survey
  const handleAddBankQuestion = (bankQ: any) => {
    // Use the schema type directly
    addQuestion(bankQ.questionType);
  };

  const handleDragStart = (e: React.DragEvent, bankQ: any) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('questionType', bankQ.questionType);
    e.dataTransfer.setData('questionText', bankQ.text);
    e.dataTransfer.setData('questionOptions', JSON.stringify(bankQ.options || []));
  };

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      <div>
        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 block">
          Filter by Category
        </label>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
              !selectedCategory
                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {QUESTION_CATEGORIES.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {searchQuery ? 'Search Results' : selectedCategory ? QUESTION_CATEGORIES.find((c: any) => c.id === selectedCategory)?.name : 'Popular Questions'}
        </h3>
        <span className="text-xs text-gray-500">{filteredQuestions.length} questions</span>
      </div>

      {/* Question List */}
      <div className="space-y-2">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-sm">
            No questions found. Try a different search or category.
          </div>
        ) : (
          filteredQuestions.map((q: any) => (
            <div
              key={q.id}
              draggable
              onDragStart={(e) => handleDragStart(e, q)}
              onClick={() => handleAddBankQuestion(q)}
              className="p-3 bg-white border border-gray-200 rounded-lg hover:border-purple-400 
                       hover:bg-purple-50/30 cursor-grab active:cursor-grabbing transition-all group"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-mono text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                  {QUESTION_TYPES[q.questionType]?.displayName || q.questionType}
                </span>
                <div className="flex items-center gap-2">
                  {q.effectivenessScore >= 0.9 && (
                    <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded" title="High effectiveness">
                      ⭐ {Math.round(q.effectivenessScore * 100)}%
                    </span>
                  )}
                  <span className="text-xs text-gray-500">{q.useCount.toLocaleString()} uses</span>
                </div>
              </div>
              <p className="text-sm text-gray-900 font-medium mb-1 leading-snug">{q.text}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500 capitalize">{q.category.replace('_', ' ')} • {q.subcategory.replace('_', ' ')}</p>
                {q.sensitivityLevel === 'high' && (
                  <span className="text-xs text-orange-600" title="Sensitive question">🔒</span>
                )}
              </div>
              {q.tags && q.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {q.tags.slice(0, 3).map((tag: string, idx: number) => (
                    <span key={idx} className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
