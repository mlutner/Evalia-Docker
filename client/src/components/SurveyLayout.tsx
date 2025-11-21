import React from "react";
import "@/components/styles/survey-welcome.css";

interface SurveyLayoutProps {
  children: React.ReactNode;
}

export default function SurveyLayout({ children }: SurveyLayoutProps) {
  return (
    <div className="survey-layout-wrapper">
      {children}
    </div>
  );
}
