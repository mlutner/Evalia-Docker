/**
 * QuestionSummaryTable - Table showing per-question analytics
 * 
 * [ANAL-006] Question-Level Summary Table
 * 
 * Displays completion rate, average value (if numeric), and response
 * distribution (if scaled) for each question in the survey.
 */

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Loader2, 
  AlertCircle, 
  RotateCcw, 
  ChevronUp, 
  ChevronDown,
  FileText,
  BarChart3,
  Hash,
  CheckCircle2,
} from "lucide-react";
import type { QuestionSummaryData, QuestionSummaryItem, OptionDistribution } from "@shared/analytics";

// ============================================================================
// Types
// ============================================================================

interface QuestionSummaryTableProps {
  data: QuestionSummaryData | null;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  title?: string;
  description?: string;
}

type SortKey = "questionNumber" | "completionRate" | "avgValue" | "totalAnswers";
type SortDirection = "asc" | "desc";

// ============================================================================
// Constants
// ============================================================================

const QUESTION_TYPE_LABELS: Record<string, string> = {
  text: "Text",
  textarea: "Long Text",
  email: "Email",
  phone: "Phone",
  url: "URL",
  number: "Number",
  multiple_choice: "Multiple Choice",
  checkbox: "Checkbox",
  dropdown: "Dropdown",
  image_choice: "Image Choice",
  yes_no: "Yes/No",
  rating: "Rating",
  nps: "NPS",
  likert: "Likert",
  opinion_scale: "Opinion Scale",
  slider: "Slider",
  emoji_rating: "Emoji Rating",
  matrix: "Matrix",
  ranking: "Ranking",
  constant_sum: "Constant Sum",
  calculation: "Calculation",
  date: "Date",
  time: "Time",
  datetime: "Date & Time",
  file_upload: "File Upload",
  signature: "Signature",
  video: "Video",
  audio_capture: "Audio",
};

const ALL_TYPES = "all";

// ============================================================================
// Component
// ============================================================================

export function QuestionSummaryTable({
  data,
  isLoading = false,
  error = null,
  onRetry,
  title = "Question Summary",
  description = "Per-question completion rates and response statistics",
}: QuestionSummaryTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("questionNumber");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [typeFilter, setTypeFilter] = useState<string>(ALL_TYPES);

  // Get unique question types for filter
  const questionTypes = useMemo(() => {
    if (!data?.questions) return [];
    const types = new Set(data.questions.map(q => q.questionType));
    return Array.from(types).sort();
  }, [data?.questions]);

  // Filter and sort questions
  const filteredQuestions = useMemo(() => {
    if (!data?.questions) return [];
    
    let questions = [...data.questions];
    
    // Apply type filter
    if (typeFilter !== ALL_TYPES) {
      questions = questions.filter(q => q.questionType === typeFilter);
    }
    
    // Apply sort
    questions.sort((a, b) => {
      let aVal: number | null = null;
      let bVal: number | null = null;
      
      switch (sortKey) {
        case "questionNumber":
          aVal = a.questionNumber;
          bVal = b.questionNumber;
          break;
        case "completionRate":
          aVal = a.completionRate;
          bVal = b.completionRate;
          break;
        case "avgValue":
          aVal = a.avgValue;
          bVal = b.avgValue;
          break;
        case "totalAnswers":
          aVal = a.totalAnswers;
          bVal = b.totalAnswers;
          break;
      }
      
      // Handle nulls - push to end
      if (aVal === null && bVal === null) return 0;
      if (aVal === null) return 1;
      if (bVal === null) return -1;
      
      const diff = aVal - bVal;
      return sortDirection === "asc" ? diff : -diff;
    });
    
    return questions;
  }, [data?.questions, typeFilter, sortKey, sortDirection]);

  // Toggle sort
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  // Render sort indicator
  const SortIndicator = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) return null;
    return sortDirection === "asc" 
      ? <ChevronUp className="w-4 h-4 ml-1 inline" />
      : <ChevronDown className="w-4 h-4 ml-1 inline" />;
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
            <p className="text-sm text-gray-600 mb-2">Failed to load question summary</p>
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!data || data.questions.length === 0) {
    return (
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">No question data available</p>
            <p className="text-xs text-gray-400 mt-1">
              Data will appear once responses are collected
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-sm text-gray-500">
              <span className="font-medium text-gray-900">{data.totalResponses}</span> total responses
            </div>
            {questionTypes.length > 1 && (
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_TYPES}>All Types</SelectItem>
                  {questionTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {QUESTION_TYPE_LABELS[type] || type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead 
                  className="w-[60px] cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("questionNumber")}
                >
                  <div className="flex items-center">
                    <Hash className="w-4 h-4 mr-1" />
                    <SortIndicator columnKey="questionNumber" />
                  </div>
                </TableHead>
                <TableHead className="min-w-[200px]">Question</TableHead>
                <TableHead className="w-[100px]">Type</TableHead>
                <TableHead 
                  className="w-[120px] cursor-pointer hover:bg-gray-100 text-right"
                  onClick={() => handleSort("completionRate")}
                >
                  <div className="flex items-center justify-end">
                    Completion
                    <SortIndicator columnKey="completionRate" />
                  </div>
                </TableHead>
                <TableHead 
                  className="w-[100px] cursor-pointer hover:bg-gray-100 text-right"
                  onClick={() => handleSort("avgValue")}
                >
                  <div className="flex items-center justify-end">
                    Avg Value
                    <SortIndicator columnKey="avgValue" />
                  </div>
                </TableHead>
                <TableHead className="w-[180px]">Distribution</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuestions.map((question) => (
                <QuestionRow key={question.questionId} question={question} />
              ))}
            </TableBody>
          </Table>
        </div>
        
        {filteredQuestions.length === 0 && typeFilter !== ALL_TYPES && (
          <div className="text-center py-8 text-gray-500">
            No questions match the selected filter.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Question Row Component
// ============================================================================

function QuestionRow({ question }: { question: QuestionSummaryItem }) {
  const completionColor = getCompletionColor(question.completionRate);
  
  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell className="font-medium text-gray-500">
        {question.questionNumber}
      </TableCell>
      <TableCell>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="line-clamp-2 text-sm text-gray-900">
                {question.questionText}
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-[300px]">
              <p>{question.questionText}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs">
          {QUESTION_TYPE_LABELS[question.questionType] || question.questionType}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <span className={`font-medium ${completionColor}`}>
            {question.completionRate}%
          </span>
          <span className="text-xs text-gray-400">
            ({question.totalAnswers})
          </span>
        </div>
      </TableCell>
      <TableCell className="text-right font-medium">
        {question.avgValue !== null ? (
          <span className="text-gray-900">{question.avgValue}</span>
        ) : (
          <span className="text-gray-400">—</span>
        )}
        {question.minValue !== null && question.maxValue !== null && (
          <span className="text-xs text-gray-400 ml-1">
            ({question.minValue}-{question.maxValue})
          </span>
        )}
      </TableCell>
      <TableCell>
        {question.distribution && question.distribution.length > 0 ? (
          <MiniDistribution distribution={question.distribution} />
        ) : (
          <span className="text-gray-400 text-sm">—</span>
        )}
      </TableCell>
    </TableRow>
  );
}

// ============================================================================
// Mini Distribution Component
// ============================================================================

function MiniDistribution({ distribution }: { distribution: OptionDistribution[] }) {
  // Show top 3 options
  const topOptions = distribution
    .filter(d => d.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  if (topOptions.length === 0) {
    return <span className="text-gray-400 text-sm">No responses</span>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1">
            {topOptions.map((opt, i) => (
              <div 
                key={opt.value}
                className="flex items-center gap-1 text-xs"
              >
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getBarColor(i) }}
                />
                <span className="text-gray-600">{opt.percentage}%</span>
              </div>
            ))}
            {distribution.filter(d => d.count > 0).length > 3 && (
              <span className="text-gray-400 text-xs">+{distribution.filter(d => d.count > 0).length - 3}</span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-[250px]">
          <div className="space-y-1">
            {distribution.filter(d => d.count > 0).map((opt, i) => (
              <div key={opt.value} className="flex items-center justify-between gap-4 text-xs">
                <span className="truncate max-w-[150px]">{opt.label}</span>
                <span className="font-medium">{opt.percentage}%</span>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function getCompletionColor(rate: number): string {
  if (rate >= 90) return "text-green-600";
  if (rate >= 70) return "text-lime-600";
  if (rate >= 50) return "text-amber-600";
  return "text-red-600";
}

function getBarColor(index: number): string {
  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
  return colors[index % colors.length];
}

export default QuestionSummaryTable;

