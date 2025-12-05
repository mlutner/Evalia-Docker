import React from "react";
import { ChevronRight } from "lucide-react";

interface RightPanelLayoutProps {
  title: string;
  badge?: string;
  onClose: () => void;
  children: React.ReactNode;
  contentClassName?: string;
}

export function RightPanelLayout({ title, badge, onClose, children, contentClassName }: RightPanelLayoutProps) {
  return (
    <aside className="w-[280px] lg:w-[320px] flex-shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0 bg-white">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-gray-700">{title}</span>
          {badge && (
            <span className="text-[11px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
              {badge}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          aria-label="Close configuration panel"
        >
          <ChevronRight size={14} className="text-gray-400" />
        </button>
      </div>
      <div className={`flex-1 overflow-y-auto min-h-0 ${contentClassName || ""}`}>{children}</div>
    </aside>
  );
}
