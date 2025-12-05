import React from "react";
import type { BuilderMode } from "@/types/builderModes";

interface BuilderModeToggleProps {
  mode: BuilderMode;
  onChange: (mode: BuilderMode) => void;
}

const MODES: { id: BuilderMode; label: string }[] = [
  { id: "build", label: "Build" },
  { id: "logic", label: "Logic" },
  { id: "scoring", label: "Scoring" },
];

export function BuilderModeToggle({ mode, onChange }: BuilderModeToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      {MODES.map((item, idx) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={`px-3 py-2 text-sm font-semibold transition-colors ${
            mode === item.id
              ? "bg-purple-50 text-purple-600"
              : "text-gray-600 hover:bg-gray-50"
          } ${idx > 0 ? "border-l border-gray-200" : ""}`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
