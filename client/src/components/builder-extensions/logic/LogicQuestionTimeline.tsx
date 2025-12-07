/**
 * @design-locked Magic Patterns golden spec
 * LogicQuestionTimeline - Shows a linear list of questions with logic annotations
 * Inspired by Alchemer-style survey builders
 */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ArrowRight, Eye, EyeOff, XCircle, ChevronDown, Zap } from 'lucide-react';
import type { BuilderQuestion, BuilderLogicRule } from '../INTEGRATION_GUIDE';

interface LogicQuestionTimelineProps {
  questions: BuilderQuestion[];
  rulesByQuestion: Record<string, BuilderLogicRule[]>;
  selectedRule?: BuilderLogicRule;
  onSelectQuestion?: (questionId: string) => void;
  onSelectRule?: (ruleId: string) => void;
}

interface ConnectorLine {
  id: string;
  startY: number;
  endY: number;
  isSelected: boolean;
}

/**
 * Strip markdown formatting from text for clean display
 */
function cleanText(text: string): string {
  if (!text) return '';
  return text
    // Remove bold/italic markers
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    // Remove inline code
    .replace(/`(.+?)`/g, '$1')
    // Remove links but keep text
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove blockquotes
    .replace(/^>\s+/gm, '')
    // Remove list markers
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Format a question ID for display (shorten if too long)
 */
function formatQuestionId(id: string): string {
  if (!id) return '?';
  // If it looks like a UUID, show first segment
  if (id.includes('-') && id.length > 20) {
    return id.split('-')[0];
  }
  // If it's a readable ID like "q1_role_type", make it friendlier
  if (id.startsWith('q') && id.includes('_')) {
    const match = id.match(/^q(\d+)/);
    return match ? `Q${match[1]}` : id;
  }
  return id;
}

/**
 * Get a human-readable action label
 */
function formatAction(action: string): string {
  const actionLower = action.toLowerCase();
  if (actionLower === 'skip' || actionLower.includes('skip')) return 'Skip';
  if (actionLower === 'show' || actionLower.includes('show')) return 'Show';
  if (actionLower === 'hide' || actionLower.includes('hide')) return 'Hide';
  if (actionLower === 'end' || actionLower.includes('end')) return 'End';
  return action;
}

export function LogicQuestionTimeline({
  questions,
  rulesByQuestion,
  selectedRule,
  onSelectQuestion,
  onSelectRule,
}: LogicQuestionTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [connectorLines, setConnectorLines] = useState<ConnectorLine[]>([]);

  // Find all questions that are targets of any rule
  const targetQuestionIds = new Set<string>();
  Object.values(rulesByQuestion).flat().forEach(rule => {
    if (rule.targetQuestionId) {
      targetQuestionIds.add(rule.targetQuestionId);
    }
  });

  // Calculate connector lines when rules or selection changes
  const calculateConnectors = useCallback(() => {
    if (!containerRef.current) return;
    
    const lines: ConnectorLine[] = [];
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Draw lines for all rules (dimmed unless selected)
    Object.values(rulesByQuestion).flat().forEach(rule => {
      if (!rule.targetQuestionId) return;
      
      const sourceEl = questionRefs.current[rule.questionId];
      const targetEl = questionRefs.current[rule.targetQuestionId];
      
      if (sourceEl && targetEl) {
        const sourceRect = sourceEl.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();
        
        lines.push({
          id: rule.id,
          startY: sourceRect.top - containerRect.top + sourceRect.height / 2,
          endY: targetRect.top - containerRect.top + targetRect.height / 2,
          isSelected: selectedRule?.id === rule.id,
        });
      }
    });
    
    setConnectorLines(lines);
  }, [rulesByQuestion, selectedRule]);

  useEffect(() => {
    calculateConnectors();
    // Recalculate on resize
    window.addEventListener('resize', calculateConnectors);
    return () => window.removeEventListener('resize', calculateConnectors);
  }, [calculateConnectors]);

  // Recalculate after render to get accurate positions
  useEffect(() => {
    const timer = setTimeout(calculateConnectors, 100);
    return () => clearTimeout(timer);
  }, [questions, calculateConnectors]);

  const getActionIcon = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower === 'skip' || actionLower.includes('skip')) {
      return <ArrowRight size={12} className="text-blue-600" />;
    }
    if (actionLower === 'show' || actionLower.includes('show')) {
      return <Eye size={12} className="text-green-600" />;
    }
    if (actionLower === 'hide' || actionLower.includes('hide')) {
      return <EyeOff size={12} className="text-orange-600" />;
    }
    if (actionLower === 'end' || actionLower.includes('end')) {
      return <XCircle size={12} className="text-red-600" />;
    }
    return <ArrowRight size={12} className="text-gray-500" />;
  };

  const getActionBadgeClass = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower === 'skip' || actionLower.includes('skip')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (actionLower === 'show' || actionLower.includes('show')) {
      return 'bg-green-50 text-green-700 border-green-200';
    }
    if (actionLower === 'hide' || actionLower.includes('hide')) {
      return 'bg-orange-50 text-orange-700 border-orange-200';
    }
    if (actionLower === 'end' || actionLower.includes('end')) {
      return 'bg-red-50 text-red-700 border-red-200';
    }
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <div ref={containerRef} className="relative">
      {/* SVG Connector Lines Overlay */}
      <svg 
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Gradient for selected line */}
          <linearGradient id="selectedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          {/* Arrow marker */}
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="6"
            refX="7"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#8b5cf6" />
          </marker>
          <marker
            id="arrowhead-dim"
            markerWidth="6"
            markerHeight="5"
            refX="5"
            refY="2.5"
            orient="auto"
          >
            <polygon points="0 0, 6 2.5, 0 5" fill="#d1d5db" />
          </marker>
        </defs>
        
        {connectorLines.map((line) => {
          const isGoingDown = line.endY > line.startY;
          const curveOffset = 40;
          const xStart = -8;
          const xEnd = -16;
          
          // Create a curved path
          const path = isGoingDown
            ? `M ${xStart} ${line.startY} 
               C ${xStart - curveOffset} ${line.startY}, 
                 ${xEnd - curveOffset} ${line.endY}, 
                 ${xEnd} ${line.endY}`
            : `M ${xStart} ${line.startY} 
               C ${xStart - curveOffset} ${line.startY}, 
                 ${xEnd - curveOffset} ${line.endY}, 
                 ${xEnd} ${line.endY}`;
          
          return (
            <g key={line.id}>
              {/* Shadow/glow for selected */}
              {line.isSelected && (
                <path
                  d={path}
                  fill="none"
                  stroke="url(#selectedGradient)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  opacity="0.3"
                  className="transition-all duration-300"
                />
              )}
              {/* Main line */}
              <path
                d={path}
                fill="none"
                stroke={line.isSelected ? 'url(#selectedGradient)' : '#e5e7eb'}
                strokeWidth={line.isSelected ? 3 : 2}
                strokeLinecap="round"
                strokeDasharray={line.isSelected ? 'none' : '4 4'}
                markerEnd={line.isSelected ? 'url(#arrowhead)' : 'url(#arrowhead-dim)'}
                className="transition-all duration-300"
              />
            </g>
          );
        })}
      </svg>

      {/* Questions List - consistent spacing with Scoring view */}
      <div className="space-y-3 relative z-0">
        {questions.map((question, idx) => {
          const rules = rulesByQuestion[question.id] || [];
          const isTrigger = selectedRule?.questionId === question.id;
          const isTarget = selectedRule?.targetQuestionId === question.id;
          const hasIncomingJumps = targetQuestionIds.has(question.id);
          const hasRules = rules.length > 0;

          return (
            <div 
              key={question.id} 
              className="relative"
              ref={(el) => { questionRefs.current[question.id] = el; }}
            >
              {/* Incoming jump indicator */}
              {hasIncomingJumps && (
                <div className="absolute -left-2 top-4 flex items-center z-10">
                  <div className={`
                    w-5 h-5 rounded-full flex items-center justify-center transition-all
                    ${isTarget 
                      ? 'bg-blue-500 shadow-lg shadow-blue-200' 
                      : 'bg-purple-100 border border-purple-200'
                    }
                  `}>
                    <Zap size={10} className={isTarget ? 'text-white' : 'text-purple-500'} />
                  </div>
                </div>
              )}

            {/* Question card - unified style with Scoring view */}
            <div
              onClick={() => {
                if (rules.length > 0 && onSelectRule) {
                  onSelectRule(rules[0].id);
                } else if (onSelectQuestion) {
                  onSelectQuestion(question.id);
                }
              }}
              className={`
                group relative rounded-xl border p-4 transition-all duration-200 cursor-pointer ml-4 bg-white
                ${isTrigger 
                  ? 'border-purple-400 bg-purple-50/50 shadow-lg shadow-purple-100/50 ring-1 ring-purple-200' 
                  : isTarget 
                    ? 'border-blue-400 bg-blue-50/50 shadow-lg shadow-blue-100/50 ring-1 ring-blue-200' 
                    : 'border-gray-200 hover:border-purple-200 hover:shadow-md hover:bg-gray-50/50'
                }
              `}
            >
              <div className="flex items-start gap-4">
                {/* Question number - pill style matching Scoring */}
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 transition-colors
                  ${isTrigger 
                    ? 'bg-purple-600 text-white' 
                    : isTarget 
                      ? 'bg-blue-600 text-white' 
                      : hasRules 
                        ? 'bg-gray-700 text-white' 
                        : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                  }
                `}>
                  {idx + 1}
                </div>

                {/* Question content */}
                <div className="flex-1 min-w-0">
                  {/* Question type badge */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      {question.displayType || question.type}
                    </span>
                    {question.required && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded-full font-semibold border border-rose-100">
                        Required
                      </span>
                    )}
                  </div>

                  {/* Question text - cleaned of markdown */}
                  <p className="text-sm text-gray-800 leading-relaxed line-clamp-2">
                    {cleanText(question.text)}
                  </p>

                  {/* Logic rules badges */}
                  {hasRules && (
                    <div className="flex flex-wrap gap-2 mt-2.5">
                      {rules.map((rule) => {
                        const isSelectedRule = selectedRule?.id === rule.id;
                        const targetLabel = rule.targetQuestionId 
                          ? formatQuestionId(rule.targetQuestionId)
                          : null;
                        const tooltipText = rule.targetQuestionId
                          ? `${formatAction(rule.action)} to Question ${targetLabel} when condition is met`
                          : `${formatAction(rule.action)} survey when condition is met`;
                        
                        return (
                          <button
                            key={rule.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectRule?.(rule.id);
                            }}
                            title={tooltipText}
                            className={`
                              inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-[11px] font-semibold transition-all
                              ${isSelectedRule 
                                ? 'ring-2 ring-purple-300 shadow-sm scale-105' 
                                : 'hover:scale-105'
                              }
                              ${getActionBadgeClass(rule.action)}
                            `}
                          >
                            {getActionIcon(rule.action)}
                            <span>{formatAction(rule.action)}</span>
                            {targetLabel && (
                              <>
                                <ArrowRight size={10} className="opacity-50" />
                                <span className="font-bold">Q{targetLabel}</span>
                              </>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Target indicator - subtle style */}
                  {isTarget && !isTrigger && (
                    <div className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] text-blue-600 font-medium">
                      <ChevronDown size={12} />
                      <span>Jump destination</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Connection line to next question */}
            {idx < questions.length - 1 && (
              <div className="flex justify-center py-1">
                <div className="w-0.5 h-4 bg-gray-200" />
              </div>
            )}
          </div>
        );
      })}

        {/* End of survey indicator */}
        <div 
          ref={(el) => { questionRefs.current['__end__'] = el; }}
          className="flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 ml-4"
        >
          <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
            <XCircle size={14} className="text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">End of Survey</p>
            <p className="text-[11px] text-gray-400">Thank You screen or Results</p>
          </div>
        </div>
      </div>
    </div>
  );
}


