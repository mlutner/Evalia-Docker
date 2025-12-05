import React from "react";
import type { BuilderMode } from "@/types/builderModes";
import { ValidationIssueBadge } from "./ValidationIssueBadge";

interface ModeIssueCounts {
  errorCount: number;
  warningCount: number;
}

interface BuilderModeToggleProps {
  mode: BuilderMode;
  onChange: (mode: BuilderMode) => void;
  issueCounts?: {
    logic?: ModeIssueCounts;
    scoring?: ModeIssueCounts;
  };
}

const MODES: { id: BuilderMode; label: string }[] = [
  { id: "build", label: "Build" },
  { id: "logic", label: "Logic" },
  { id: "scoring", label: "Scoring" },
];

export function BuilderModeToggle({ mode, onChange, issueCounts }: BuilderModeToggleProps) {
  const getIssueCounts = (modeId: BuilderMode): ModeIssueCounts | undefined => {
    if (modeId === "logic") return issueCounts?.logic;
    if (modeId === "scoring") return issueCounts?.scoring;
    return undefined;
  };

  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      {MODES.map((item, idx) => {
        const counts = getIssueCounts(item.id);
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`px-3 py-2 text-sm font-semibold transition-colors flex items-center gap-1.5 ${
              mode === item.id
                ? "bg-purple-50 text-purple-600"
                : "text-gray-600 hover:bg-gray-50"
            } ${idx > 0 ? "border-l border-gray-200" : ""}`}
          >
            {item.label}
            {counts && (
              <ValidationIssueBadge
                errorCount={counts.errorCount}
                warningCount={counts.warningCount}
                size="sm"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
