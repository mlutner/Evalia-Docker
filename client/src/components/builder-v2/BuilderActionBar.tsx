import React, { useState } from 'react';
import { Save, Eye, Settings, Loader2 } from 'lucide-react';
import { useSurveyBuilder } from '@/contexts/SurveyBuilderContext';
import { Button } from '@/components/ui/button';
import { ValidationIssuesModal } from './ValidationIssuesModal';
import type { SurveyValidationResult } from '@/utils/surveyValidator';

interface BuilderActionBarProps {
  onPreview?: () => void;
  onSettings?: () => void;
}

export function BuilderActionBar({ onPreview, onSettings }: BuilderActionBarProps) {
  const { survey, questions, isDirty, isSaving, saveSurvey } = useSurveyBuilder();
  const [validationResult, setValidationResult] = useState<SurveyValidationResult | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);

  const handleSave = async () => {
    const result = await saveSurvey();
    if (result.validation && (result.validation.errors.length > 0 || result.validation.warnings.length > 0)) {
      setValidationResult(result.validation);
      // Only show modal if save was blocked (errors) or there are warnings to acknowledge
      if (result.id === null || result.validation.warnings.length > 0) {
        setShowValidationModal(true);
      }
    }
  };

  const handleSaveAnyway = async () => {
    setShowValidationModal(false);
    await saveSurvey({ skipValidation: true });
  };

  return (
    <div className="w-full bg-white border-t border-gray-200 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Survey Info */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <h3 className="text-sm font-bold text-gray-900 truncate max-w-[200px] lg:max-w-[300px]">
              {survey.title || 'Untitled Survey'}
            </h3>
            <p className="text-xs text-gray-500">
              {questions.length} question{questions.length !== 1 ? 's' : ''}
              {isDirty && <span className="text-orange-500 ml-2">• Unsaved changes</span>}
            </p>
          </div>
        </div>

        {/* Center: Quick Stats - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-6">
          <QuickStat label="Questions" value={questions.length} />
          <QuickStat label="Required" value={questions.filter((q) => q.required).length} />
          <QuickStat
            label="Est. Time"
            value={`${Math.ceil(questions.length * 0.5)}m`}
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onSettings}
            className="hidden sm:flex"
          >
            <Settings size={14} className="mr-2" />
            Settings
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onPreview}
            disabled={questions.length === 0}
          >
            <Eye size={14} className="mr-2" />
            <span className="hidden sm:inline">Preview</span>
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className="bg-[#2F8FA5] hover:bg-[#267a8d]"
          >
            {isSaving ? (
              <>
                <Loader2 size={14} className="mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={14} className="mr-2" />
                <span className="hidden sm:inline">Save Draft</span>
                <span className="sm:hidden">Save</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* [LOGIC-001] Validation Issues Modal */}
      {validationResult && (
        <ValidationIssuesModal
          open={showValidationModal}
          onClose={() => setShowValidationModal(false)}
          validation={validationResult}
          onSaveAnyway={validationResult.errors.length === 0 ? handleSaveAnyway : undefined}
        />
      )}
    </div>
  );
}

function QuickStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="text-center">
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

