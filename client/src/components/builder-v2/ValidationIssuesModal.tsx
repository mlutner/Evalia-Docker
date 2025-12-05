/**
 * ValidationIssuesModal - Shows validation issues before publish
 * Groups issues by domain (Logic/Scoring) with jump-to links
 */
import React from 'react';
import { X, AlertCircle, AlertTriangle, ChevronRight, GitBranch, BarChart3 } from 'lucide-react';
import type { SurveyValidationResult, ValidationIssue } from '@/utils/surveyValidator';

interface ValidationIssuesModalProps {
  open?: boolean;  // Alias for isOpen
  isOpen?: boolean;
  onClose: () => void;
  validation?: SurveyValidationResult;  // Alias for validationResult
  validationResult?: SurveyValidationResult;
  onJumpToIssue?: (issue: ValidationIssue) => void;
  onSaveAnyway?: () => void;  // [LOGIC-001] Callback for "Save Anyway" button
}

export function ValidationIssuesModal({
  open,
  isOpen,
  onClose,
  validation,
  validationResult,
  onJumpToIssue,
  onSaveAnyway,
}: ValidationIssuesModalProps) {
  const actualIsOpen = open ?? isOpen ?? false;
  const actualValidationResult = validation ?? validationResult;
  
  if (!actualIsOpen || !actualValidationResult) return null;

  const { issues, summary } = actualValidationResult;
  const logicIssues = issues.filter(i => i.domain === 'logic');
  const scoringIssues = issues.filter(i => i.domain === 'scoring');
  const generalIssues = issues.filter(i => i.domain === 'general');

  const hasErrors = summary.total.errorCount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {hasErrors ? (
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {hasErrors ? 'Cannot Publish' : 'Review Before Publishing'}
              </h2>
              <p className="text-sm text-gray-500">
                {summary.total.errorCount} error{summary.total.errorCount !== 1 ? 's' : ''}
                {summary.total.warningCount > 0 && (
                  <>, {summary.total.warningCount} warning{summary.total.warningCount !== 1 ? 's' : ''}</>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Logic Issues */}
          {logicIssues.length > 0 && (
            <IssueGroup
              title="Logic Issues"
              icon={<GitBranch size={16} />}
              issues={logicIssues}
              onJumpToIssue={onJumpToIssue}
            />
          )}

          {/* Scoring Issues */}
          {scoringIssues.length > 0 && (
            <IssueGroup
              title="Scoring Issues"
              icon={<BarChart3 size={16} />}
              issues={scoringIssues}
              onJumpToIssue={onJumpToIssue}
            />
          )}

          {/* General Issues */}
          {generalIssues.length > 0 && (
            <IssueGroup
              title="General Issues"
              icon={<AlertCircle size={16} />}
              issues={generalIssues}
              onJumpToIssue={onJumpToIssue}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {hasErrors ? 'Fix Issues' : 'Close'}
          </button>
          {!hasErrors && onSaveAnyway && (
            <button
              onClick={onSaveAnyway}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              Save Anyway
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function IssueGroup({
  title,
  icon,
  issues,
  onJumpToIssue,
}: {
  title: string;
  icon: React.ReactNode;
  issues: ValidationIssue[];
  onJumpToIssue?: (issue: ValidationIssue) => void;
}) {
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-200">
        <span className="text-gray-500">{icon}</span>
        <span className="text-sm font-medium text-gray-900">{title}</span>
        <span className="text-xs text-gray-500">
          {errors.length > 0 && `${errors.length} error${errors.length !== 1 ? 's' : ''}`}
          {errors.length > 0 && warnings.length > 0 && ', '}
          {warnings.length > 0 && `${warnings.length} warning${warnings.length !== 1 ? 's' : ''}`}
        </span>
      </div>
      <div className="divide-y divide-gray-100">
        {issues.map((issue, idx) => (
          <IssueRow
            key={`${issue.code}-${idx}`}
            issue={issue}
            onJump={onJumpToIssue ? () => onJumpToIssue(issue) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

function IssueRow({
  issue,
  onJump,
}: {
  issue: ValidationIssue;
  onJump?: () => void;
}) {
  const isError = issue.severity === 'error';

  return (
    <div
      className={`px-4 py-3 flex items-start gap-3 ${
        onJump ? 'hover:bg-gray-50 cursor-pointer' : ''
      }`}
      onClick={onJump}
    >
      {isError ? (
        <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
      ) : (
        <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${isError ? 'text-red-700' : 'text-amber-700'}`}>
          {issue.message}
        </p>
        {issue.questionId && (
          <p className="text-xs text-gray-500 mt-0.5">
            Question: {issue.questionId}
          </p>
        )}
      </div>
      {onJump && (
        <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
      )}
    </div>
  );
}

