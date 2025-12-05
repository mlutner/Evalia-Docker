import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ChevronLeft, Search, Database, Sparkles, LayoutGrid, List, Wand2, Calculator, GitBranch } from 'lucide-react';
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
    <aside className="w-[280px] lg:w-[320px] flex-shrink-0 bg-white border-r border-gray-200 overflow-hidden flex flex-col">
      {/* Header with Collapse Button */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[13px] font-medium text-gray-700">Library</h2>
          <button
            onClick={toggleLeftPanel}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Collapse Panel"
          >
            <ChevronLeft size={16} className="text-gray-400" />
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
    { label: 'Text Question', type: 'text', description: 'Open-ended response', icon: '✎' },
    { label: 'Multiple Choice', type: 'multiple_choice', description: 'Select one option', icon: '○' },
    { label: 'Checkboxes', type: 'checkbox', description: 'Select multiple', icon: '☐' },
    { label: 'Rating Scale', type: 'rating', description: '1-5 star rating', icon: '★' },
    { label: 'NPS Score', type: 'nps', description: '0-10 scale', icon: '№' },
    { label: 'Likert Scale', type: 'likert', description: 'Agreement scale', icon: '≡' },
    { label: 'Yes/No', type: 'yes_no', description: 'Binary choice', icon: '◐' },
    { label: 'Date Picker', type: 'date', description: 'Select a date', icon: '📅' },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-md bg-gray-900 flex items-center justify-center">
            <Wand2 size={14} className="text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-gray-900">Quick Add</span>
            <p className="text-[11px] text-gray-400">Click to add common types</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-1.5">
          {quickActions.map((action) => (
            <button
              key={action.type}
              onClick={() => onAddQuestion(action.type)}
              className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 
                       hover:bg-gray-100 hover:border-gray-200
                       transition-all text-left group"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 w-5 text-center">{action.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-gray-700 group-hover:text-gray-900 truncate">
                    {action.label}
                  </div>
                  <div className="text-[10px] text-gray-400 truncate">
                    {action.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="text-center">
        <button className="text-[11px] text-gray-500 hover:text-gray-700 font-medium transition-colors">
          Suggest questions based on goal →
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

  // Accent colors for the left border indicator
  const accentColors: Record<string, string> = {
    blue: 'border-l-blue-500',
    purple: 'border-l-purple-500',
    green: 'border-l-emerald-500',
    orange: 'border-l-orange-500',
    cyan: 'border-l-cyan-500',
    pink: 'border-l-pink-500',
    gray: 'border-l-gray-400',
    red: 'border-l-rose-500',
  };

  const accentColor = accentColors[categoryMeta.color] || accentColors.gray;

  const handleAddQuestion = (type: QuestionTypeConfig) => {
    addQuestion(type.type);
  };

  const handleDragStart = (e: React.DragEvent, type: QuestionTypeConfig) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('questionType', type.type);
    e.dataTransfer.setData('questionDisplayName', type.displayName);
  };

  return (
    <div className="mb-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-2 py-1.5 text-[11px] font-semibold 
                 text-gray-400 uppercase tracking-wider hover:text-gray-600 hover:bg-gray-50 rounded transition-colors"
      >
        <span>{categoryMeta.name}</span>
        {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      </button>

      {isOpen && (
        <div className={`mt-1.5 ${layout === 'grid' ? 'grid grid-cols-2 gap-1.5' : 'space-y-1'}`}>
          {filteredTypes.map((type) => {
            const Icon = type.icon;
            const hasCapabilities = type.isScoreable || type.supportsLogic;
            
            return (
              <div
                key={type.type}
                draggable
                onDragStart={(e) => handleDragStart(e, type)}
                onClick={() => handleAddQuestion(type)}
                className={`
                  ${layout === 'grid' ? 'p-2.5' : 'p-3'} 
                  bg-white border border-gray-200 border-l-2 ${accentColor}
                  rounded-lg cursor-grab active:cursor-grabbing 
                  transition-all duration-150 
                  hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5
                  group
                `}
              >
                <div className={`flex ${layout === 'grid' ? 'flex-col items-center text-center gap-1.5' : 'items-start gap-3'}`}>
                  {/* Icon */}
                  <div className={`
                    ${layout === 'grid' ? 'w-8 h-8' : 'w-7 h-7'} 
                    rounded-md bg-gray-50 border border-gray-100
                    flex items-center justify-center shrink-0
                    group-hover:bg-gray-100 transition-colors
                  `}>
                    <Icon size={layout === 'grid' ? 16 : 14} className="text-gray-600" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className={`text-[13px] font-semibold text-gray-800 ${layout === 'grid' ? 'truncate' : ''}`}>
                      {type.displayName}
                    </div>
                    {layout === 'list' && (
                      <div className="text-[11px] text-gray-400 truncate mt-0.5">{type.description}</div>
                    )}
                    
                    {/* Capability indicators - inline with description in list view */}
                    {hasCapabilities && (
                      <div className={`flex items-center gap-1.5 ${layout === 'grid' ? 'justify-center mt-1.5' : 'mt-1.5'}`}>
                        {type.supportsLogic && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-gray-500" title="Supports conditional logic">
                            <GitBranch size={10} className="text-gray-400" />
                            <span>Logic</span>
                          </span>
                        )}
                        {type.isScoreable && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-gray-500" title="Can be scored">
                            <Calculator size={10} className="text-gray-400" />
                            <span>Score</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
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

  const handleAddBankQuestion = (bankQ: any) => {
    addQuestion(bankQ.questionType, {
      text: bankQ.text,
      options: bankQ.options,
      description: bankQ.description,
    });
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
        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
          Filter by Category
        </label>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
              !selectedCategory
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {QUESTION_CATEGORIES.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          {searchQuery ? 'Search Results' : selectedCategory ? QUESTION_CATEGORIES.find((c: any) => c.id === selectedCategory)?.name : 'Popular'}
        </h3>
        <span className="text-[11px] text-gray-400">{filteredQuestions.length}</span>
      </div>

      {/* Question List */}
      <div className="space-y-1.5">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            No questions found
          </div>
        ) : (
          filteredQuestions.map((q: any) => (
            <div
              key={q.id}
              draggable
              onDragStart={(e) => handleDragStart(e, q)}
              onClick={() => handleAddBankQuestion(q)}
              className="p-3 bg-white border border-gray-200 rounded-lg 
                       hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5
                       cursor-grab active:cursor-grabbing transition-all duration-150 group"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {QUESTION_TYPES[q.questionType]?.displayName || q.questionType}
                </span>
                <div className="flex items-center gap-1.5">
                  {q.effectivenessScore >= 0.9 && (
                    <span className="text-[10px] text-emerald-600 font-semibold" title="High effectiveness">
                      ↑{Math.round(q.effectivenessScore * 100)}%
                    </span>
                  )}
                  <span className="text-[10px] text-gray-400">{q.useCount.toLocaleString()}</span>
                </div>
              </div>
              <p className="text-[13px] text-gray-800 font-medium leading-snug line-clamp-2">{q.text}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <p className="text-[10px] text-gray-400 capitalize">{q.category.replace('_', ' ')}</p>
                {q.sensitivityLevel === 'high' && (
                  <span className="text-[10px] text-amber-600" title="Sensitive">●</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
