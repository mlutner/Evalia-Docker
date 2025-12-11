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
        className="w-12 flex-shrink-0 bg-[var(--panel-left)] border-r border-[var(--border-default)]
                   flex items-center justify-center hover:bg-[var(--hover-tint)] transition-colors group"
        title="Open Question Library"
      >
        <ChevronRight size={20} className="text-[var(--text-muted)] group-hover:text-[var(--color-primary)] transition-colors" />
      </button>
    );
  }

  return (
    <aside className="w-[280px] lg:w-[320px] flex-shrink-0 bg-[var(--panel-left)] border-r border-[var(--border-default)] overflow-hidden flex flex-col">
      {/* Header with Collapse Button */}
      <div className="p-4 border-b border-[var(--border-default)] flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[13px] font-medium text-[var(--text-secondary)]">Library</h2>
          <button
            onClick={toggleLeftPanel}
            className="p-1 hover:bg-[var(--neutral-100)] rounded transition-colors"
            title="Collapse Panel"
          >
            <ChevronLeft size={16} className="text-[var(--text-subtle)]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[var(--neutral-100)] p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('types')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'types'
                ? 'bg-[var(--panel-center)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Sparkles size={14} />
            <span>Question Types</span>
          </button>
          <button
            onClick={() => setActiveTab('bank')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'bank'
                ? 'bg-[var(--panel-center)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Database size={14} />
            <span>Question Bank</span>
          </button>
        </div>

        {/* Layout Toggle & AI Quick Add */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1 bg-[var(--neutral-100)] p-0.5 rounded-md">
            <button
              onClick={() => setLayout('list')}
              className={`p-1.5 rounded ${layout === 'list' ? 'bg-[var(--panel-center)] shadow-sm' : 'hover:bg-[var(--neutral-100)]'}`}
              title="List view"
            >
              <List size={14} className={layout === 'list' ? 'text-[var(--color-primary)]' : 'text-[var(--text-muted)]'} />
            </button>
            <button
              onClick={() => setLayout('grid')}
              className={`p-1.5 rounded ${layout === 'grid' ? 'bg-[var(--panel-center)] shadow-sm' : 'hover:bg-[var(--neutral-100)]'}`}
              title="Grid view (2 columns)"
            >
              <LayoutGrid size={14} className={layout === 'grid' ? 'text-[var(--color-primary)]' : 'text-[var(--text-muted)]'} />
            </button>
          </div>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'ai'
                ? 'bg-[var(--forest-100)] text-[var(--forest-700)] border border-[var(--forest-200)]'
                : 'text-[var(--color-primary)] hover:bg-[var(--forest-50)] border border-transparent'
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
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-subtle)]" />
            <input
              type="text"
              placeholder={activeTab === 'types' ? 'Search question types...' : 'Search question bank...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-[var(--border-default)] rounded-md
                       focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20
                       outline-none transition-all"
            />
          </div>
        </div>

        {/* Survey Structure (Collapsible) */}
        <div className="mb-6">
          <button
            onClick={() => setStructureOpen(!structureOpen)}
            className="w-full flex items-center justify-between px-2 py-2 text-xs font-semibold
                     text-[var(--text-primary)] uppercase tracking-wider hover:bg-[var(--hover-tint)] rounded transition-colors"
          >
            <span>Survey Structure ({questions.length})</span>
            {structureOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {structureOpen && (
            <div className="mt-2 space-y-1">
              {questions.length === 0 ? (
                <div className="px-2 py-3 text-xs text-[var(--text-muted)] text-center bg-[var(--neutral-50)] rounded border border-dashed border-[var(--border-default)]">
                  No questions yet
                </div>
              ) : (
                questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="flex items-center gap-2 px-2 py-1.5 text-xs rounded
                             hover:bg-[var(--forest-50)] cursor-pointer transition-colors group"
                  >
                    <span
                      className="w-5 h-5 rounded-full bg-[var(--neutral-100)] flex items-center justify-center
                                 text-[10px] font-bold text-[var(--text-primary)] group-hover:bg-[var(--forest-100)]
                                 group-hover:text-[var(--color-primary)] transition-colors"
                    >
                      {index + 1}
                    </span>
                    <span className="flex-1 truncate text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
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
      <div className="bg-[var(--panel-center)] rounded-xl p-4 border border-[var(--border-default)] shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-md bg-[var(--text-primary)] flex items-center justify-center">
            <Wand2 size={14} className="text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-[var(--text-primary)]">Quick Add</span>
            <p className="text-[11px] text-[var(--text-subtle)]">Click to add common types</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {quickActions.map((action) => (
            <button
              key={action.type}
              onClick={() => onAddQuestion(action.type)}
              className="p-2.5 bg-[var(--neutral-50)] rounded-lg border border-[var(--neutral-100)]
                       hover:bg-[var(--neutral-100)] hover:border-[var(--border-default)]
                       transition-all text-left group"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--text-subtle)] w-5 text-center">{action.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] truncate">
                    {action.label}
                  </div>
                  <div className="text-[10px] text-[var(--text-subtle)] truncate">
                    {action.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="text-center">
        <button className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] font-medium transition-colors">
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
                 text-[var(--text-subtle)] uppercase tracking-wider hover:text-[var(--text-secondary)] hover:bg-[var(--hover-tint)] rounded transition-colors"
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
                  bg-[var(--panel-center)] border border-[var(--border-default)] border-l-2 ${accentColor}
                  rounded-lg cursor-grab active:cursor-grabbing
                  transition-all duration-150
                  hover:shadow-md hover:border-[var(--border-default)] hover:-translate-y-0.5
                  group
                `}
              >
                <div className={`flex ${layout === 'grid' ? 'flex-col items-center text-center gap-1.5' : 'items-start gap-3'}`}>
                  {/* Icon */}
                  <div className={`
                    ${layout === 'grid' ? 'w-8 h-8' : 'w-7 h-7'}
                    rounded-md bg-[var(--neutral-50)] border border-[var(--neutral-100)]
                    flex items-center justify-center shrink-0
                    group-hover:bg-[var(--neutral-100)] transition-colors
                  `}>
                    <Icon size={layout === 'grid' ? 16 : 14} className="text-[var(--text-secondary)]" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className={`text-[13px] font-semibold text-[var(--text-primary)] ${layout === 'grid' ? 'truncate' : ''}`}>
                      {type.displayName}
                    </div>
                    {layout === 'list' && (
                      <div className="text-[11px] text-[var(--text-subtle)] truncate mt-0.5">{type.description}</div>
                    )}

                    {/* Capability indicators - inline with description in list view */}
                    {hasCapabilities && (
                      <div className={`flex items-center gap-1.5 ${layout === 'grid' ? 'justify-center mt-1.5' : 'mt-1.5'}`}>
                        {type.supportsLogic && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-[var(--text-muted)]" title="Supports conditional logic">
                            <GitBranch size={10} className="text-[var(--text-subtle)]" />
                            <span>Logic</span>
                          </span>
                        )}
                        {type.isScoreable && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-[var(--text-muted)]" title="Can be scored">
                            <Calculator size={10} className="text-[var(--text-subtle)]" />
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
        <label className="text-[11px] font-semibold text-[var(--text-subtle)] uppercase tracking-wider mb-2 block">
          Filter by Category
        </label>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
              !selectedCategory
                ? 'bg-[var(--text-primary)] text-white'
                : 'bg-[var(--neutral-100)] text-[var(--text-secondary)] hover:bg-[var(--border-default)]'
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
                  ? 'bg-[var(--text-primary)] text-white'
                  : 'bg-[var(--neutral-100)] text-[var(--text-secondary)] hover:bg-[var(--border-default)]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-semibold text-[var(--text-subtle)] uppercase tracking-wider">
          {searchQuery ? 'Search Results' : selectedCategory ? QUESTION_CATEGORIES.find((c: any) => c.id === selectedCategory)?.name : 'Popular'}
        </h3>
        <span className="text-[11px] text-[var(--text-subtle)]">{filteredQuestions.length}</span>
      </div>

      {/* Question List */}
      <div className="space-y-1.5">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-subtle)] text-sm">
            No questions found
          </div>
        ) : (
          filteredQuestions.map((q: any) => (
            <div
              key={q.id}
              draggable
              onDragStart={(e) => handleDragStart(e, q)}
              onClick={() => handleAddBankQuestion(q)}
              className="p-3 bg-[var(--panel-center)] border border-[var(--border-default)] rounded-lg
                       hover:border-[var(--border-default)] hover:shadow-md hover:-translate-y-0.5
                       cursor-grab active:cursor-grabbing transition-all duration-150 group"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-semibold text-[var(--text-muted)] bg-[var(--neutral-100)] px-2 py-0.5 rounded">
                  {QUESTION_TYPES[q.questionType]?.displayName || q.questionType}
                </span>
                <div className="flex items-center gap-1.5">
                  {q.effectivenessScore >= 0.9 && (
                    <span className="text-[10px] text-emerald-600 font-semibold" title="High effectiveness">
                      ↑{Math.round(q.effectivenessScore * 100)}%
                    </span>
                  )}
                  <span className="text-[10px] text-[var(--text-subtle)]">{q.useCount.toLocaleString()}</span>
                </div>
              </div>
              <p className="text-[13px] text-[var(--text-primary)] font-medium leading-snug line-clamp-2">{q.text}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <p className="text-[10px] text-[var(--text-subtle)] capitalize">{q.category.replace('_', ' ')}</p>
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
