import React, { useState, useRef, useEffect, useCallback, Fragment } from 'react';
import {
  PlusCircle, Trash2, MoreVertical, GripVertical, Wand2,
  Star, ThumbsUp, ThumbsDown, Check, Sparkles, Heart, Upload, Calendar, Clock,
  ZoomIn, ZoomOut, Maximize, Move, Hand
} from 'lucide-react';
import { useSurveyBuilder, BuilderQuestion, ValidQuestionType } from '@/contexts/SurveyBuilderContext';
import { Input } from '@/components/ui/input';
import { QUESTION_TYPES, getIconForType, getLikertLabels } from '@/data/questionTypeConfig';

// ============================================
// ZOOM & PAN CONTROLS
// ============================================
const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.25;

export function BuilderCanvas() {
  const {
    survey,
    questions,
    addQuestion,
    removeQuestion,
    reorderQuestions,
    updateQuestion,
    selectedQuestionId,
    setSelectedQuestionId,
    selectedSection,
    setSelectedSection,
  } = useSurveyBuilder();

  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggedQuestionIndex, setDraggedQuestionIndex] = useState<number | null>(null);
  
  // Zoom & Pan state - default to 85% for better overview
  const [zoom, setZoom] = useState(0.85);
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  // Keyboard shortcuts for zoom and pan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Spacebar for panning
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setIsSpacePressed(true);
      }
      // Cmd/Ctrl + Plus for zoom in
      if ((e.metaKey || e.ctrlKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        handleZoomIn();
      }
      // Cmd/Ctrl + Minus for zoom out
      if ((e.metaKey || e.ctrlKey) && e.key === '-') {
        e.preventDefault();
        handleZoomOut();
      }
      // Cmd/Ctrl + 0 for reset zoom
      if ((e.metaKey || e.ctrlKey) && e.key === '0') {
        e.preventDefault();
        handleZoomReset();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleZoomIn, handleZoomOut, handleZoomReset]);

  // Mouse wheel zoom (with Ctrl/Cmd)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        setZoom(prev => Math.max(MIN_ZOOM, Math.min(prev + delta, MAX_ZOOM)));
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // Pan handlers
  const handlePanStart = useCallback((e: React.MouseEvent) => {
    if (!isSpacePressed) return;
    e.preventDefault();
    setIsPanning(true);
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  }, [isSpacePressed, panOffset]);

  const handlePanMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning || !isSpacePressed) return;
    const newOffset = {
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y,
    };
    setPanOffset(newOffset);
  }, [isPanning, isSpacePressed, panStart]);

  const handlePanEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const questionType = e.dataTransfer.getData('questionType');

    if (questionType) {
      addQuestion(questionType);
    } else if (draggedQuestionIndex !== null) {
      reorderQuestions(draggedQuestionIndex, index);
    }

    setDragOverIndex(null);
    setDraggedQuestionIndex(null);
  };

  const handleQuestionDragStart = (index: number) => {
    setDraggedQuestionIndex(index);
  };

  const handleQuestionDragEnd = () => {
    setDraggedQuestionIndex(null);
    setDragOverIndex(null);
  };

  return (
    <main className="flex-1 bg-gray-50 relative overflow-hidden flex flex-col">
      {/* Zoom Controls - Fixed position */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-1.5 shadow-lg">
        <button
          onClick={handleZoomOut}
          disabled={zoom <= MIN_ZOOM}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Zoom out (Ctrl+-)"
        >
          <ZoomOut size={18} className="text-gray-600" />
        </button>
        <button
          onClick={handleZoomReset}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors min-w-[60px]"
          title="Reset zoom (Ctrl+0)"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={handleZoomIn}
          disabled={zoom >= MAX_ZOOM}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Zoom in (Ctrl++)"
        >
          <ZoomIn size={18} className="text-gray-600" />
        </button>
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <button
          onClick={handleZoomReset}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Fit to screen"
        >
          <Maximize size={18} className="text-gray-600" />
        </button>
        <div 
          className={`p-2 rounded-lg transition-colors ${isSpacePressed ? 'bg-purple-100 text-purple-600' : 'text-gray-400'}`}
          title="Hold Space + drag to pan"
        >
          <Hand size={18} />
        </div>
      </div>

      {/* Mini-map indicator */}
      {questions.length > 5 && (
        <div className="absolute bottom-20 right-4 z-20 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-2 shadow-lg">
          <div className="text-xs text-gray-500 mb-1 font-medium">Survey Overview</div>
          <div className="w-16 h-20 bg-gray-100 rounded relative">
            {questions.slice(0, 10).map((_, idx) => (
              <div
                key={idx}
                className={`absolute left-1 right-1 h-1.5 rounded-sm transition-colors ${
                  selectedQuestionId === questions[idx]?.id ? 'bg-purple-500' : 'bg-gray-300'
                }`}
                style={{ top: `${(idx * 100) / Math.min(questions.length, 10)}%` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Scrollable Canvas Area */}
      <div
        ref={scrollContainerRef}
        onMouseDown={handlePanStart}
        onMouseMove={handlePanMove}
        onMouseUp={handlePanEnd}
        onMouseLeave={handlePanEnd}
        className={`flex-1 overflow-auto p-4 lg:p-6 ${
          isSpacePressed ? 'cursor-grab' : ''
        } ${isPanning ? 'cursor-grabbing select-none' : ''}`}
        style={{
          scrollBehavior: isPanning ? 'auto' : 'smooth',
        }}
      >
        {/* Canvas Content with Zoom Transform */}
        <div
          ref={canvasRef}
          className="w-full transition-transform duration-150 ease-out"
          style={{
            transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
            transformOrigin: 'top center',
          }}
        >
          <div className="max-w-3xl mx-auto space-y-6">
        {/* Welcome Screen Section */}
        {survey.welcomeScreen.enabled && (
          <SectionCard
            title="Welcome Screen"
            description="First impression for your survey"
            isSelected={selectedSection === 'welcome'}
            onClick={() => setSelectedSection('welcome')}
          >
            <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {survey.welcomeScreen.title}
              </h2>
              <p className="text-gray-500 mb-6">{survey.welcomeScreen.description}</p>
              <button className="px-6 py-3 bg-purple-500 text-white rounded-lg font-semibold">
                {survey.welcomeScreen.buttonText}
              </button>
            </div>
          </SectionCard>
        )}

        {/* Questions Section */}
        {questions.length === 0 ? (
          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center 
                     justify-center text-center bg-white/50 min-h-[400px]"
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'copy';
            }}
            onDrop={(e) => {
              e.preventDefault();
              const questionType = e.dataTransfer.getData('questionType');
              if (questionType) {
                addQuestion(questionType);
              }
            }}
          >
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center mb-6 bg-white">
              <PlusCircle size={32} className="text-gray-400" />
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-2">Start Building Your Survey</h2>

            <p className="text-gray-500 max-w-md mb-6">
              Click "Question Library" to browse question types, then drag or click to add them to your survey.
            </p>

            <p className="text-xs text-gray-400">
              Maximum 200 questions per survey • {questions.length}/200 used
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                Questions ({questions.length}/200)
              </h3>
            </div>

            {questions.map((question, index) => (
              <Fragment key={question.id}>
                {dragOverIndex === index && (
                  <div className="h-2 bg-purple-400/30 border-2 border-dashed border-purple-400 rounded" />
                )}

                <QuestionCard
                  question={question}
                  index={index}
                  isDragging={draggedQuestionIndex === index}
                  isSelected={selectedQuestionId === question.id}
                  onDragStart={() => handleQuestionDragStart(index)}
                  onDragEnd={handleQuestionDragEnd}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onSelect={() => {
                    setSelectedQuestionId(question.id);
                    setSelectedSection('questions');
                  }}
                  onDelete={() => removeQuestion(question.id)}
                  onUpdate={(updates) => updateQuestion(question.id, updates)}
                />
              </Fragment>
            ))}

            <div
              onDragOver={(e) => handleDragOver(e, questions.length)}
              onDrop={(e) => handleDrop(e, questions.length)}
              className="h-20 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center
                       text-gray-500 hover:border-purple-400 hover:text-purple-500 
                       hover:bg-purple-50/20 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <PlusCircle size={20} className="group-hover:scale-110 transition-transform" />
                <span className="font-medium">Drop question here or click to add</span>
              </div>
            </div>
          </>
        )}

        {/* Thank You Screen Section */}
        {survey.thankYouScreen.enabled && (
          <SectionCard
            title="Thank You Screen"
            description="Final message for respondents"
            isSelected={selectedSection === 'thankYou'}
            onClick={() => setSelectedSection('thankYou')}
          >
            <div className="text-center p-8 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {survey.thankYouScreen.title}
              </h2>
              <p className="text-gray-500">{survey.thankYouScreen.message}</p>
            </div>
          </SectionCard>
        )}

            {/* Scoring Section */}
            {survey.scoringSettings.enabled && (
              <SectionCard
                title="Scoring & Results"
                description="Configure scoring parameters"
                isSelected={selectedSection === 'scoring'}
                onClick={() => setSelectedSection('scoring')}
              >
                <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <p className="text-sm text-gray-500">
                    Scoring enabled: {survey.scoringSettings.type}
                  </p>
                </div>
              </SectionCard>
            )}
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="absolute bottom-4 left-4 z-20 text-xs text-gray-400 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-200">
        <span className="font-medium">Tips:</span> Hold <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 mx-0.5">Space</kbd> + drag to pan • 
        <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 mx-0.5">⌘/Ctrl</kbd> + scroll to zoom
      </div>
    </main>
  );
}

function SectionCard({
  title,
  description,
  isSelected,
  onClick,
  children,
}: {
  title: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl shadow-sm p-6 cursor-pointer transition-all border-2
        ${isSelected ? 'border-purple-400 ring-4 ring-purple-100' : 'border-transparent hover:border-gray-200'}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{title}</h3>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
        <Sparkles size={20} className="text-purple-500" />
      </div>
      {children}
    </div>
  );
}

interface QuestionCardProps {
  question: BuilderQuestion;
  index: number;
  isDragging: boolean;
  isSelected: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onSelect: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<BuilderQuestion>) => void;
}

function QuestionCard({
  question,
  index,
  isDragging,
  isSelected,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onSelect,
  onDelete,
  onUpdate,
}: QuestionCardProps) {
  const Icon = getIconForType(question.type);
  const typeConfig = QUESTION_TYPES[question.type];
  
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onSelect}
      className={`
        bg-white rounded-xl shadow-sm p-6 cursor-move transition-all border-2
        ${isSelected ? 'border-purple-400 ring-4 ring-purple-100' : 'border-transparent hover:border-gray-200'}
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <GripVertical size={20} className="text-gray-400 cursor-grab active:cursor-grabbing" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center">
              <span className="text-sm font-bold text-purple-600">{index + 1}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-100 px-3 py-1.5 rounded-full">
              <Icon size={12} />
              <span>{question.displayType || typeConfig?.displayName || question.type}</span>
            </div>
            {question.required && (
              <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded border border-red-200">
                Required
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              // TODO: AI enhancement
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-purple-600 
                     bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 
                     hover:border-purple-300 transition-all group"
            title="Enhance with AI"
          >
            <Wand2 size={14} className="group-hover:rotate-12 transition-transform" />
            <span>Enhance</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
            title="Delete Question"
          >
            <Trash2 size={16} className="text-gray-400 group-hover:text-red-500" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical size={16} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Question Text with AI Optimize */}
      <div className="mb-6">
        <div className="relative">
          <Input
            type="text"
            value={question.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            className="w-full text-lg font-bold text-gray-900 pr-12 h-auto py-3
                     border-2 border-gray-200 rounded-lg focus:border-purple-400 
                     focus:ring-4 focus:ring-purple-100 transition-all
                     hover:border-gray-300"
            placeholder="Enter your question..."
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              // TODO: AI optimize question text
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2
                     text-purple-500 hover:bg-purple-50 rounded-lg transition-all group"
            title="AI Optimize Question Text"
          >
            <Wand2 size={18} className="group-hover:rotate-12 transition-transform" />
          </button>
        </div>
        {question.description && (
          <p className="text-sm text-gray-500 mt-2 px-1">{question.description}</p>
        )}
      </div>

      {/* Question Type Preview */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <QuestionPreview question={question} onUpdate={onUpdate} />
      </div>
    </div>
  );
}

// ============================================
// QUESTION PREVIEW - Renders all 31 types
// ============================================
function QuestionPreview({
  question,
  onUpdate,
}: {
  question: BuilderQuestion;
  onUpdate: (updates: Partial<BuilderQuestion>) => void;
}) {
  const type = question.type as ValidQuestionType;

  // ========== TEXT INPUT TYPES ==========
  if (type === 'text' || type === 'email' || type === 'phone' || type === 'url') {
    return (
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Answer Field</p>
        <div className="border-2 border-gray-200 rounded-xl p-4 bg-white">
          <input
            type="text"
            placeholder={question.placeholder || `Type your ${type} here...`}
            className="w-full text-base text-gray-400 bg-transparent border-none outline-none"
            disabled
          />
        </div>
      </div>
    );
  }

  if (type === 'textarea') {
    return (
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Answer Field</p>
        <div className="border-2 border-gray-200 rounded-xl p-4 bg-white">
          <textarea
            placeholder={question.placeholder || "Type your detailed answer here..."}
            className="w-full text-base text-gray-400 bg-transparent border-none outline-none resize-none"
            rows={question.rows || 4}
            disabled
          />
        </div>
      </div>
    );
  }

  if (type === 'number') {
    return (
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Numeric Input</p>
        <div className="border-2 border-gray-200 rounded-xl p-4 bg-white flex items-center gap-2">
          <input
            type="number"
            placeholder={question.placeholder || "Enter a number..."}
            className="w-full text-base text-gray-400 bg-transparent border-none outline-none"
            disabled
          />
          {question.unit && <span className="text-gray-400">{question.unit}</span>}
        </div>
        {(question.min !== undefined || question.max !== undefined) && (
          <p className="text-xs text-gray-400 mt-2">
            Range: {question.min ?? '—'} to {question.max ?? '—'}
          </p>
        )}
      </div>
    );
  }

  // ========== SELECTION TYPES ==========
  if (type === 'multiple_choice' || type === 'checkbox' || type === 'dropdown') {
    const isCheckbox = type === 'checkbox';
    const isDropdown = type === 'dropdown' || question.displayStyle === 'dropdown';
    
    if (isDropdown) {
      return (
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Dropdown Selection</p>
          <div className="border-2 border-gray-200 rounded-xl p-4 bg-white flex items-center justify-between">
            <span className="text-gray-400">{question.placeholder || 'Select an option...'}</span>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {question.options && (
            <div className="mt-2 space-y-1">
              {question.options.map((option, idx) => (
                <div key={idx} className="text-xs text-gray-400 px-2">• {option}</div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
          {isCheckbox ? 'Select All That Apply' : 'Answer Options'}
        </p>
        {question.options?.map((option, optIndex) => (
          <label
            key={optIndex}
            className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl 
                     bg-white hover:border-purple-400 hover:bg-purple-50/30 transition-all 
                     cursor-pointer group"
          >
            <div
              className={`w-5 h-5 ${isCheckbox ? 'rounded' : 'rounded-full'} border-2 border-gray-400 
                        group-hover:border-purple-500 flex items-center justify-center transition-colors`}
            >
              {isCheckbox ? (
                <Check size={12} className="text-transparent group-hover:text-purple-500 transition-colors" />
              ) : (
              <div className="w-2.5 h-2.5 rounded-full bg-transparent group-hover:bg-purple-500 transition-colors" />
              )}
            </div>
            <input
              type="text"
              value={option}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                const newOptions = [...(question.options || [])];
                newOptions[optIndex] = e.target.value;
                onUpdate({ options: newOptions });
              }}
              className="flex-1 text-base font-medium text-gray-900 bg-transparent border-none outline-none"
              placeholder={`Option ${optIndex + 1}`}
            />
          </label>
        ))}
        <button
          onClick={(e) => {
            e.stopPropagation();
            const newOptions = [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`];
            onUpdate({ options: newOptions });
          }}
          className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 
                   font-bold mt-2 px-4 py-2 hover:bg-purple-50 rounded-xl transition-all"
        >
          <PlusCircle size={16} />
          <span>Add Option</span>
        </button>
      </div>
    );
  }

  if (type === 'yes_no') {
    const yesLabel = question.yesLabel || 'Yes';
    const noLabel = question.noLabel || 'No';
    
    return (
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Binary Choice</p>
        <div className="grid grid-cols-2 gap-4">
          <button
            className="p-6 border-2 border-green-200 rounded-xl bg-green-50 
                     hover:bg-green-100 hover:border-green-300 transition-all 
                     flex flex-col items-center gap-3 group"
          >
            <ThumbsUp size={32} className="text-green-500 group-hover:scale-110 transition-transform" />
            <span className="text-lg font-bold text-green-500">{yesLabel}</span>
          </button>
          <button
            className="p-6 border-2 border-red-200 rounded-xl bg-red-50 
                     hover:bg-red-100 hover:border-red-300 transition-all 
                     flex flex-col items-center gap-3 group"
          >
            <ThumbsDown size={32} className="text-red-500 group-hover:scale-110 transition-transform" />
            <span className="text-lg font-bold text-red-500">{noLabel}</span>
          </button>
        </div>
      </div>
    );
  }

  if (type === 'image_choice') {
    const cols = question.columns || 2;
    return (
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Select Image</p>
        <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {[1, 2, 3, 4].slice(0, cols * 2).map((idx) => (
            <div
              key={idx}
              className="aspect-square bg-gray-100 border-2 border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/30 transition-all"
            >
              <div className="text-gray-400 text-center">
                <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs">Option {idx}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ========== RATING & SCALE TYPES ==========
  if (type === 'rating') {
    const scale = question.ratingScale || 5;
    const style = question.ratingStyle || 'star';
    
    return (
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Rating Scale</p>
        <div className="flex gap-3 justify-center p-4">
          {Array.from({ length: scale }, (_, i) => {
            if (style === 'heart') {
              return (
                <button key={i} className="hover:scale-110 transition-transform">
                  <Heart size={32} className="text-gray-300 hover:text-red-400 hover:fill-red-400 transition-colors" />
                </button>
              );
            }
            if (style === 'number') {
              return (
                <button
                  key={i}
                  className="w-10 h-10 border-2 border-gray-200 rounded-lg flex items-center justify-center 
                           text-base font-bold text-gray-900 bg-white hover:border-purple-400 
                           hover:bg-purple-50 hover:text-purple-600 transition-all"
                >
                  {i + 1}
                </button>
              );
            }
            return (
              <button key={i} className="hover:scale-110 transition-transform">
              <Star size={32} className="text-gray-300 hover:text-yellow-400 hover:fill-yellow-400 transition-colors" />
            </button>
            );
          })}
        </div>
        {question.ratingLabels && (
        <div className="flex justify-between text-xs text-gray-500 mt-3 px-2">
            <span>{question.ratingLabels.low || 'Poor'}</span>
            <span>{question.ratingLabels.high || 'Excellent'}</span>
        </div>
        )}
      </div>
    );
  }

  if (type === 'nps') {
    return (
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Net Promoter Score</p>
        <div className="grid grid-cols-11 gap-2">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <button
              key={num}
              className={`aspect-square border-2 rounded-lg flex items-center justify-center 
                       text-base font-bold bg-white hover:text-white transition-all
                       ${num <= 6 ? 'border-red-200 text-red-500 hover:bg-red-500 hover:border-red-500' : 
                         num <= 8 ? 'border-yellow-200 text-yellow-600 hover:bg-yellow-500 hover:border-yellow-500' : 
                         'border-green-200 text-green-500 hover:bg-green-500 hover:border-green-500'}`}
            >
              {num}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-4 px-1">
          <span className="font-medium">{question.leftLabel || 'Not at all likely'}</span>
          <span className="font-medium">{question.rightLabel || 'Extremely likely'}</span>
        </div>
      </div>
    );
  }

  if (type === 'likert') {
    const likertType = question.likertType || 'agreement';
    const points = question.likertPoints || 5;
    const labels = question.customLabels || getLikertLabels(likertType, points);
    
    return (
      <div className="space-y-3">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
          {likertType.charAt(0).toUpperCase() + likertType.slice(1)} Scale
        </p>
        {labels.map((label, idx) => (
          <label
            key={idx}
            className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl 
                     bg-white hover:border-purple-400 hover:bg-purple-50/30 transition-all 
                     cursor-pointer group"
          >
            <div
              className="w-5 h-5 rounded-full border-2 border-gray-400 group-hover:border-purple-500 
                        flex items-center justify-center transition-colors"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-transparent group-hover:bg-purple-500 transition-colors" />
            </div>
            <span className="text-base font-medium text-gray-900">{label}</span>
          </label>
        ))}
      </div>
    );
  }

  if (type === 'opinion_scale') {
    const scale = question.ratingScale || 5;
    return (
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Opinion Scale</p>
        <div className="flex gap-2 justify-center p-4">
          {Array.from({ length: scale }, (_, i) => (
          <button
              key={i}
              className="w-12 h-12 border-2 border-gray-200 rounded-lg flex items-center justify-center 
                       text-base font-bold text-gray-900 bg-white hover:border-purple-400 
                       hover:bg-purple-50 hover:text-purple-600 transition-all"
            >
              {question.showNumbers !== false && i + 1}
          </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-3 px-2">
          <span>{question.leftLabel || 'Low'}</span>
          <span>{question.rightLabel || 'High'}</span>
        </div>
      </div>
    );
  }

  if (type === 'slider') {
    const min = question.min ?? 0;
    const max = question.max ?? 100;
    const defaultVal = question.defaultValue ?? Math.round((min + max) / 2);
    
    return (
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Slider Scale</p>
        <div className="p-6">
          <input
            type="range"
            min={min}
            max={max}
            defaultValue={defaultVal}
            step={question.step || 1}
            className="w-full h-3 bg-gray-200 rounded-xl appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-6
                     [&::-webkit-slider-thumb]:h-6
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-purple-500
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:border-2
                     [&::-webkit-slider-thumb]:border-white
                     [&::-webkit-slider-thumb]:shadow-md"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-3">
            <span>{min}{question.unit || ''}</span>
            {question.showValue !== false && (
              <span className="font-bold text-purple-600">{defaultVal}{question.unit || ''}</span>
            )}
            <span>{max}{question.unit || ''}</span>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'emoji_rating') {
    const scale = question.ratingScale || 5;
    const emojis = scale === 3 ? ['😞', '😐', '😄'] : ['😞', '😟', '😐', '🙂', '😄'];
    
    return (
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Emoji Rating</p>
        <div className="flex gap-4 justify-center p-4">
          {emojis.map((emoji, idx) => (
            <button
              key={idx}
              className="text-4xl hover:scale-125 transition-transform cursor-pointer opacity-50 hover:opacity-100"
            >
              {emoji}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-3 px-2">
          <span>Very Unhappy</span>
          <span>Very Happy</span>
        </div>
      </div>
    );
  }

  // ========== ADVANCED TYPES ==========
  if (type === 'matrix') {
    const rows = question.rowLabels || ['Row 1', 'Row 2', 'Row 3'];
    const cols = question.colLabels || ['Poor', 'Fair', 'Good', 'Excellent'];
    
    return (
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Rating Matrix</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="p-2 text-left"></th>
                {cols.map((col, idx) => (
                  <th key={idx} className="p-2 text-center text-xs font-medium text-gray-500">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => (
                <tr key={rowIdx} className="border-t border-gray-200">
                  <td className="p-2 text-sm font-medium text-gray-700">{row}</td>
                  {cols.map((_, colIdx) => (
                    <td key={colIdx} className="p-2 text-center">
                      <div className={`w-5 h-5 ${question.matrixType === 'checkbox' ? 'rounded' : 'rounded-full'} border-2 border-gray-300 mx-auto hover:border-purple-400 cursor-pointer`} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (type === 'ranking') {
    const items = question.options || ['First item', 'Second item', 'Third item'];
    
    return (
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Drag to Rank</p>
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 rounded-lg cursor-grab hover:border-purple-400 hover:bg-purple-50/30 transition-all"
            >
              <div className="flex items-center gap-2">
                <GripVertical size={16} className="text-gray-400" />
                <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
              </div>
              <span className="text-sm text-gray-700">{item}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">Drag items to reorder</p>
      </div>
    );
  }

  if (type === 'constant_sum') {
    const items = question.options || ['Option A', 'Option B', 'Option C'];
    const total = question.totalPoints || 100;
    
    return (
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
          Distribute {total} Points
        </p>
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="flex-1 text-sm text-gray-700">{item}</span>
              <input
                type="number"
                defaultValue={Math.round(total / items.length)}
                min={0}
                max={total}
                className="w-20 h-9 text-center border-2 border-gray-200 rounded-lg text-sm"
                disabled
              />
              {question.showPercentage && <span className="text-xs text-gray-400 w-10">%</span>}
            </div>
          ))}
          <div className="flex justify-end pt-2 border-t border-gray-200">
            <span className="text-sm font-medium text-gray-700">Total: {total}</span>
          </div>
        </div>
      </div>
    );
  }

  // ========== DATE & TIME TYPES ==========
  if (type === 'date') {
    return (
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Select Date</p>
        <div className="border-2 border-gray-200 rounded-xl p-4 bg-white">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-gray-400 text-sm">
              Select a date ({question.dateFormat || 'MM/DD/YYYY'})...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'time') {
    return (
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Select Time</p>
        <div className="border-2 border-gray-200 rounded-xl p-4 bg-white">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <span className="text-gray-400 text-sm">
              Select a time ({question.timeFormat || '12h'})...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'datetime') {
    return (
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Select Date & Time</p>
        <div className="border-2 border-gray-200 rounded-xl p-4 bg-white">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-gray-400 text-sm">Select date and time...</span>
          </div>
        </div>
      </div>
    );
  }

  // ========== MEDIA TYPES ==========
  if (type === 'file_upload') {
    const allowedTypes = question.allowedTypes?.join(', ') || 'pdf, doc, jpg, png';
    const maxSize = question.maxFileSize || 10;
    
    return (
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">File Upload</p>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-sm text-gray-500 mb-1">Drag and drop files here</p>
          <p className="text-xs text-gray-400">or click to browse</p>
          <p className="text-xs text-gray-400 mt-2">Allowed: {allowedTypes} • Max {maxSize}MB</p>
        </div>
      </div>
    );
  }

  if (type === 'signature') {
    return (
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Digital Signature</p>
        <div className="border-2 border-gray-300 rounded-xl h-32 bg-white flex items-center justify-center">
          <p className="text-sm text-gray-400">Sign here</p>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">Draw your signature above</p>
      </div>
    );
  }

  if (type === 'video') {
    return (
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Video Content</p>
        <div className="bg-gray-100 rounded-xl aspect-video flex items-center justify-center">
          <div className="text-center text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">Video placeholder</p>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'audio_capture') {
    return (
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Audio Recording</p>
        <div className="flex flex-col items-center gap-4 p-6 bg-white border-2 border-gray-200 rounded-xl">
          <button className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center hover:bg-red-200 transition-colors">
            <div className="w-6 h-6 rounded-full bg-red-500" />
          </button>
          <p className="text-sm text-gray-500">Click to start recording</p>
          {question.maxDuration && (
            <p className="text-xs text-gray-400">Max duration: {question.maxDuration}s</p>
          )}
        </div>
      </div>
    );
  }

  // ========== STRUCTURAL TYPES ==========
  if (type === 'section') {
    return (
      <div className="text-center p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{question.text}</h3>
        {question.description && (
          <p className="text-sm text-gray-500">{question.description}</p>
        )}
        <div className="mt-4 border-t-2 border-gray-200 pt-2">
          <p className="text-xs text-gray-400">Section Divider</p>
        </div>
      </div>
    );
  }

  if (type === 'statement') {
    return (
      <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-sm text-gray-700 leading-relaxed">{question.description || question.text}</p>
        <p className="text-xs text-gray-400 mt-2">Information only - no response required</p>
      </div>
    );
  }

  if (type === 'legal') {
    return (
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Consent Statement</p>
        <label className="flex items-start gap-4 p-4 border-2 border-gray-200 rounded-xl bg-white cursor-pointer hover:border-purple-400 transition-all">
          <div className="w-5 h-5 mt-0.5 rounded border-2 border-gray-400 flex items-center justify-center flex-shrink-0">
            <Check size={12} className="text-transparent" />
          </div>
          <div className="flex-1">
            <span className="text-sm text-gray-600 leading-relaxed">{question.text}</span>
            {question.linkUrl && (
              <a href={question.linkUrl} className="text-sm text-purple-600 hover:underline ml-1">
                {question.linkText || 'Read full terms'}
              </a>
            )}
          </div>
        </label>
      </div>
    );
  }

  if (type === 'hidden') {
    return (
      <div className="p-6 bg-gray-100 border border-gray-300 rounded-xl text-center">
        <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
        <p className="text-sm text-gray-500">Hidden Field</p>
        <p className="text-xs text-gray-400 mt-1">Not visible to respondents</p>
        {question.defaultValue && (
          <p className="text-xs text-gray-400 mt-2">Default: {question.defaultValue}</p>
        )}
      </div>
    );
  }

  if (type === 'calculation') {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
        <svg className="w-8 h-8 mx-auto text-yellow-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <p className="text-sm text-gray-700">Calculated Value</p>
        <p className="text-xs text-gray-400 mt-1">Auto-calculated from other answers</p>
      </div>
    );
  }

  // Default fallback
  return (
    <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-xl">
      <span className="text-sm font-medium text-gray-500">Preview for {type}</span>
    </div>
  );
}

