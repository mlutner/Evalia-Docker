/**
 * ManagerComparisonTable - Displays manager-level index analytics
 * 
 * [ANAL-007] Manager Comparison (Index + Band Segmentation)
 * 
 * Shows per-manager:
 * - Respondent count
 * - Average index score
 * - Band distribution (mini visualization)
 * - Trend placeholder
 * 
 * Includes sorting, loading/error states, and empty state handling.
 */

import React, { useState, useMemo, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  AlertTriangle, 
  ArrowUpDown, 
  Users, 
  User,
  Minus
} from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { AnalyticsSectionShell } from "./AnalyticsSectionShell";
import type { 
  ManagerIndexSummaryData, 
  ManagerSummaryItem, 
  ManagerBandDistribution 
} from "@shared/analytics";

interface ManagerComparisonTableProps {
  data: ManagerIndexSummaryData | undefined;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
}

type SortKey = "managerId" | "respondentCount" | "avgIndexScore" | "completionRate";
type SortDirection = "asc" | "desc";

/**
 * Mini band distribution visualization
 * Shows colored bars representing each band's percentage
 */
const BandDistributionBar: React.FC<{
  distribution: ManagerBandDistribution[];
  respondentCount: number
}> = ({ distribution, respondentCount }) => {
  if (!distribution || distribution.length === 0 || respondentCount === 0) {
    return <span className="text-[var(--text-subtle)] text-sm">No data</span>;
  }

  // Filter to only bands with counts > 0 for display
  const nonEmptyBands = distribution.filter(b => b.count > 0);

  if (nonEmptyBands.length === 0) {
    return <span className="text-[var(--text-subtle)] text-sm">No scores</span>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center h-5 w-full min-w-[100px] max-w-[200px] cursor-help rounded overflow-hidden border border-[var(--border-default)]">
            {distribution.map((band) => (
              band.percentage > 0 && (
                <div
                  key={band.bandId}
                  className="h-full"
                  style={{ 
                    width: `${band.percentage}%`,
                    backgroundColor: band.color,
                    minWidth: band.percentage > 0 ? '4px' : '0px'
                  }}
                />
              )
            ))}
          </div>
        </TooltipTrigger>
        <TooltipContent
          className="bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-default)] shadow-lg p-3 rounded-md min-w-[180px]"
        >
          <p className="font-semibold mb-2 text-sm">Band Distribution</p>
          <div className="space-y-1">
            {distribution.map((band) => (
              <div
                key={band.bandId}
                className="flex items-center justify-between text-xs gap-3"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: band.color }}
                  />
                  <span className="text-[var(--text-secondary)]">{band.bandLabel}</span>
                </div>
                <span className="font-medium">
                  {band.count} ({band.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/**
 * Score badge with color coding based on score value
 */
const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  // Color based on score bands
  let bgColor = "bg-[var(--neutral-100)]";
  let textColor = "text-[var(--text-secondary)]";

  if (score >= 85) {
    bgColor = "bg-[var(--status-success-bg)]";
    textColor = "text-[var(--status-success)]";
  } else if (score >= 70) {
    bgColor = "bg-[var(--sage-100)]";
    textColor = "text-[var(--forest-500)]";
  } else if (score >= 55) {
    bgColor = "bg-[var(--status-warning-bg)]";
    textColor = "text-[var(--status-warning)]";
  } else if (score >= 40) {
    bgColor = "bg-[var(--status-warning-bg)]";
    textColor = "text-[var(--status-warning)]";
  } else {
    bgColor = "bg-[var(--status-error-bg)]";
    textColor = "text-[var(--status-error)]";
  }

  return (
    <span className={`px-2 py-0.5 rounded-md font-medium text-sm ${bgColor} ${textColor}`}>
      {score.toFixed(1)}
    </span>
  );
};

export const ManagerComparisonTable: React.FC<ManagerComparisonTableProps> = ({
  data,
  isLoading,
  error,
  onRetry,
}) => {
  const [sortKey, setSortKey] = useState<SortKey>("respondentCount");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = useCallback((key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("desc"); // Default to descending for new column
    }
  }, [sortKey]);

  const sortedManagers = useMemo(() => {
    if (!data?.managers) return [];

    return [...data.managers].sort((a, b) => {
      let valA: string | number;
      let valB: string | number;

      switch (sortKey) {
        case "managerId":
          valA = a.managerName || a.managerId;
          valB = b.managerName || b.managerId;
          break;
        case "respondentCount":
          valA = a.respondentCount;
          valB = b.respondentCount;
          break;
        case "avgIndexScore":
          valA = a.avgIndexScore;
          valB = b.avgIndexScore;
          break;
        case "completionRate":
          valA = a.completionRate;
          valB = b.completionRate;
          break;
        default:
          valA = a.respondentCount;
          valB = b.respondentCount;
      }

      if (typeof valA === "string" && typeof valB === "string") {
        return sortDirection === "asc" 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [data?.managers, sortKey, sortDirection]);

  // Loading state
  if (isLoading) {
    return (
      <AnalyticsSectionShell
        title="Manager Comparison"
        description="Loading manager-level analytics..."
      >
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
        </div>
      </AnalyticsSectionShell>
    );
  }

  // Error state
  if (error) {
    return (
      <AnalyticsSectionShell
        title="Manager Comparison"
        description="Failed to load manager analytics."
      >
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <AlertTriangle className="w-10 h-10 mb-3 text-[var(--status-error)]" />
          <p className="text-lg font-semibold text-[var(--status-error)]">Error loading data</p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{error.message}</p>
          <Button onClick={onRetry} className="mt-4" variant="outline">
            Retry
          </Button>
        </div>
      </AnalyticsSectionShell>
    );
  }

  // Empty state - no managers found
  if (!data || data.managers.length === 0) {
    return (
      <AnalyticsSectionShell
        title="Manager Comparison"
        description="No manager data available for this survey."
      >
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <Users className="w-10 h-10 mb-3 text-[var(--text-subtle)]" />
          <p className="text-lg font-semibold text-[var(--text-secondary)]">No Manager Data</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Survey responses need manager assignments to display comparisons.
          </p>
          <p className="text-xs text-[var(--text-subtle)] mt-2">
            Managers are identified via response metadata (managerId field).
          </p>
        </div>
      </AnalyticsSectionShell>
    );
  }

  // Render table
  return (
    <AnalyticsSectionShell
      title="Manager Comparison"
      description={`Comparing ${data.totalManagers} manager${data.totalManagers !== 1 ? 's' : ''} across ${data.totalResponses} responses.`}
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer select-none hover:bg-[var(--hover-tint)]"
                onClick={() => handleSort("managerId")}
              >
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Manager
                  {sortKey === "managerId" && (
                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hover:bg-[var(--hover-tint)] text-center"
                onClick={() => handleSort("respondentCount")}
              >
                <div className="flex items-center justify-center gap-1">
                  Respondents
                  {sortKey === "respondentCount" && (
                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hover:bg-[var(--hover-tint)] text-center"
                onClick={() => handleSort("completionRate")}
              >
                <div className="flex items-center justify-center gap-1">
                  Completion
                  {sortKey === "completionRate" && (
                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hover:bg-[var(--hover-tint)] text-center"
                onClick={() => handleSort("avgIndexScore")}
              >
                <div className="flex items-center justify-center gap-1">
                  Avg Score
                  {sortKey === "avgIndexScore" && (
                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                  )}
                </div>
              </TableHead>
              <TableHead className="min-w-[150px]">
                Band Distribution
              </TableHead>
              <TableHead className="text-center">
                Trend
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedManagers.map((manager) => (
              <TableRow key={manager.managerId}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{manager.managerName || manager.managerId}</span>
                    {manager.managerName && (
                      <span className="text-xs text-[var(--text-subtle)]">{manager.managerId}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className="font-medium">{manager.respondentCount}</span>
                </TableCell>
                <TableCell className="text-center">
                  <span className={`${manager.completionRate >= 80 ? 'text-[var(--status-success)]' : manager.completionRate >= 50 ? 'text-[var(--status-warning)]' : 'text-[var(--status-error)]'}`}>
                    {manager.completionRate}%
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <ScoreBadge score={manager.avgIndexScore} />
                </TableCell>
                <TableCell>
                  <BandDistributionBar 
                    distribution={manager.bandDistribution} 
                    respondentCount={manager.respondentCount}
                  />
                </TableCell>
                <TableCell className="text-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-[var(--text-subtle)] cursor-help">
                          <Minus className="w-4 h-4 inline" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Trend data coming in future update</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AnalyticsSectionShell>
  );
};

