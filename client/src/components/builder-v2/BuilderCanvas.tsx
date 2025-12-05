import React, { useState, useRef, useEffect, useCallback, Fragment } from 'react';
import {
  PlusCircle, Trash2, MoreVertical, GripVertical, Wand2,
  Check, Sparkles, ZoomIn, ZoomOut, Maximize, Hand
} from 'lucide-react';
import { useSurveyBuilder, BuilderQuestion } from '@/contexts/SurveyBuilderContext';
import { Input } from '@/components/ui/input';
import { QUESTION_TYPES, getIconForType } from '@/data/questionTypeConfig';
import { QuestionRenderer } from '@/components/surveys/QuestionRenderer';
import { toRuntimeQuestion } from '@/lib/questionAdapter';
import { FEATURES } from '@/config/features';
import { QuestionHeader } from '@/components/builder/shared/QuestionHeader';

// ============================================
// ZOOM & PAN CONTROLS
// ============================================
const DEFAULT_ZOOM = 0.85;
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
  
  // Zoom & Pan state
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
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
    setZoom(DEFAULT_ZOOM);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  // Helper to check if focus is in a text-editing context
  const isEditingText = useCallback(() => {
    const el = document.activeElement;
    if (!el) return false;
    const tagName = el.tagName.toLowerCase();
    if (tagName === 'input' || tagName === 'textarea') return true;
    if ((el as HTMLElement).isContentEditable) return true;
    return false;
  }, []);

  // Keyboard shortcuts for zoom and pan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Spacebar for panning - but only if not typing in an input
      if (e.code === 'Space' && !e.repeat && !isEditingText()) {
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
      // Guard: validate indices and skip no-op reorders
      const fromIndex = draggedQuestionIndex;
      const toIndex = index;
      if (
        fromIndex >= 0 &&
        fromIndex < questions.length &&
        toIndex >= 0 &&
        toIndex <= questions.length &&
        fromIndex !== toIndex &&
        fromIndex !== toIndex - 1 // dropping right after current position is a no-op
      ) {
        reorderQuestions(fromIndex, toIndex);
      }
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
    <div className="flex-1 bg-gray-50 relative overflow-hidden flex flex-col h-full">
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
        {/* Section Header */}
        <div className="mb-2">
          <div className="flex items-baseline gap-3">
            <h2 className="text-[15px] font-medium text-gray-900 tracking-tight">
              Build
            </h2>
            <span className="text-[13px] text-gray-400 tabular-nums">
              {questions.length} question{questions.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

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
                <span className="font-medium">Drop question here to add</span>
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
            {survey.scoreConfig && FEATURES.resultsV1 && (
              <SectionCard
                title="Results Screen"
                description="Customize what respondents see after submit"
                isSelected={selectedSection === 'results'}
                onClick={() => setSelectedSection('results')}
              >
                <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-gray-500">
                    {survey.scoreConfig.resultsScreen?.enabled ? 'Enabled' : 'Disabled'}
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
    </div>
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
        bg-white rounded-xl p-5 cursor-pointer transition-all duration-150 border
        ${isSelected 
          ? 'border-gray-300 shadow-md' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[13px] font-medium text-gray-700">{title}</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">{description}</p>
        </div>
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
        <QuestionHeader question={question} questionNumber={index + 1} />
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
            disabled
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-400 
                     bg-gray-50 border border-gray-200 rounded-lg cursor-not-allowed opacity-60"
            title="AI Enhance — Coming Soon"
          >
            <Wand2 size={14} />
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
            onClick={(e) => e.stopPropagation()}
            disabled
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2
                     text-gray-400 cursor-not-allowed opacity-60"
            title="AI Optimize — Coming Soon"
          >
            <Wand2 size={18} />
          </button>
        </div>
        {question.description && (
          <p className="text-sm text-gray-500 mt-2 px-1">{question.description}</p>
        )}
      </div>

      {/* Question Type Preview - Using unified QuestionRenderer */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <QuestionRenderer
          question={toRuntimeQuestion(question)}
          mode="builder"
          disabled
          readOnly
        />
      </div>
    </div>
  );
}
