/**
 * ScoringMisconfiguredState - Displayed when scoring is broken
 * 
 * [ANAL-QA-050] Clear message when scoring is enabled but config is invalid.
 * This prevents charts from quietly rendering zeros.
 */

import React from "react";
import { AlertTriangle, Settings, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ScoringMisconfiguredStateProps {
  surveyId: string;
  issue: 'no-categories' | 'no-mappings' | 'no-score-ranges';
  onGoToBuilder?: () => void;
}

const ISSUE_DETAILS = {
  'no-categories': {
    title: 'No Scoring Categories Defined',
    description: 'Scoring is enabled for this survey, but no categories have been configured. Without categories, scores cannot be calculated.',
    action: 'Add scoring categories in the Survey Builder to enable analytics.',
  },
  'no-mappings': {
    title: 'Questions Not Mapped to Categories',
    description: 'Scoring categories exist, but no questions are mapped to them. Each scorable question needs to be assigned to a category.',
    action: 'Map questions to scoring categories in the Survey Builder.',
  },
  'no-score-ranges': {
    title: 'No Score Ranges Defined',
    description: 'Categories exist but no score ranges (bands) are configured. Score ranges determine how raw scores are interpreted.',
    action: 'Define score ranges for your categories in the Survey Builder.',
  },
};

export function ScoringMisconfiguredState({ 
  surveyId, 
  issue, 
  onGoToBuilder 
}: ScoringMisconfiguredStateProps) {
  const details = ISSUE_DETAILS[issue];
  
  return (
    <Card className="bg-red-50 border-red-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-red-800 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {details.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-red-700 mb-4">
          {details.description}
        </p>
        <div className="bg-white/50 rounded-lg p-3 border border-red-200">
          <p className="text-sm text-red-800 font-medium flex items-center gap-2">
            <Settings className="w-4 h-4" />
            How to fix:
          </p>
          <p className="text-sm text-red-700 mt-1">
            {details.action}
          </p>
        </div>
        {onGoToBuilder && (
          <Button 
            variant="outline" 
            className="mt-4 border-red-300 text-red-700 hover:bg-red-100"
            onClick={onGoToBuilder}
          >
            Open Survey Builder
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Inline version for use within cards.
 */
export function InlineScoringMisconfigured({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-red-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">
        Scoring Misconfigured
      </h3>
      <p className="text-sm text-gray-500 max-w-md">
        {message}
      </p>
    </div>
  );
}

