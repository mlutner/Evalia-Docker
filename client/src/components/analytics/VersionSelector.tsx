/**
 * VersionSelector - Dropdown for selecting score config version
 * 
 * [ANAL-002] Analytics Routing + Version Selector
 * 
 * Features:
 * - Fetches available versions for survey on mount
 * - Displays version dropdown (v1, v2, Latest)
 * - Updates URL query param on selection
 * - Loading/error states
 */

import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertCircle, History } from "lucide-react";

export interface Version {
  id: string;
  versionNumber: number;
  label: string;
  createdAt: string;
  isLatest: boolean;
}

interface VersionsResponse {
  meta: {
    surveyId: string;
    generatedAt: string;
  };
  data: {
    versions: Version[];
    latestVersionId: string;
  };
}

interface VersionSelectorProps {
  surveyId: string;
  selectedVersionId?: string;
  onVersionChange: (versionId: string) => void;
}

export function VersionSelector({
  surveyId,
  selectedVersionId,
  onVersionChange,
}: VersionSelectorProps) {
  const { data, isLoading, error } = useQuery<VersionsResponse>({
    queryKey: ["/api/analytics", surveyId, "versions"],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/${surveyId}/versions`);
      if (!response.ok) {
        throw new Error("Failed to fetch versions");
      }
      return response.json();
    },
    enabled: !!surveyId,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Loading versions...</span>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="flex items-center gap-2 text-amber-600 text-sm">
        <AlertCircle className="w-4 h-4" />
        <span>Unable to load versions</span>
      </div>
    );
  }

  const { versions, latestVersionId } = data.data;

  // No versions available
  if (versions.length === 0) {
    return (
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <History className="w-4 h-4" />
        <span>No versions available</span>
      </div>
    );
  }

  // Default to latest if no selection
  const currentValue = selectedVersionId || latestVersionId;

  return (
    <div className="flex items-center gap-2">
      <History className="w-4 h-4 text-gray-500" />
      <Select value={currentValue} onValueChange={onVersionChange}>
        <SelectTrigger className="w-[140px] h-9 bg-white">
          <SelectValue placeholder="Select version" />
        </SelectTrigger>
        <SelectContent>
          {versions.map((version) => (
            <SelectItem key={version.id} value={version.id}>
              <div className="flex items-center gap-2">
                <span>{version.label}</span>
                {version.isLatest && (
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                    Latest
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default VersionSelector;

