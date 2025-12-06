/**
 * AnalyticsSectionShell - Wrapper for analytics sections
 * 
 * [BUILD-020] Analytics Component Library
 * 
 * Provides a consistent Card structure with header + description + content.
 * Supports optional right-aligned header content (e.g., dropdowns, toggles).
 */

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface AnalyticsSectionShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  rightHeaderContent?: React.ReactNode; // e.g. dropdown, toggle
  className?: string;
}

export function AnalyticsSectionShell({
  title,
  description,
  children,
  rightHeaderContent,
  className = "",
}: AnalyticsSectionShellProps) {
  return (
    <Card className={`bg-white border border-gray-200 ${className}`}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold text-gray-900">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-sm text-gray-500">
              {description}
            </CardDescription>
          )}
        </div>
        {rightHeaderContent && (
          <div className="flex items-center">
            {rightHeaderContent}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

export default AnalyticsSectionShell;

