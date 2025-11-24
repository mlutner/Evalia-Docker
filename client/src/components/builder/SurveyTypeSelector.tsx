import { motion } from "framer-motion";

const SURVEY_TYPES = [
  {
    id: "survey" as const,
    title: "Survey",
    description: "Collect feedback & reactions. Focus on opinions, experiences, and satisfaction across any topic.",
  },
  {
    id: "assessment" as const,
    title: "Assessment",
    description: "Measure knowledge, skills & behavior change with scoring. Evaluate performance and provide feedback.",
  },
] as const;

import type { SurveyType } from "@shared/schema";

interface SurveyTypeSelectorProps {
  value: SurveyType;
  onChange: (type: SurveyType) => void;
}

export function SurveyTypeSelector({ value, onChange }: SurveyTypeSelectorProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 md:mb-12"
    >
      <div className="bg-white rounded-lg border-2 border-border p-4 sm:p-6 md:p-8">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-4 md:mb-6" style={{ color: '#1C2635' }}>
          What are you creating?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {SURVEY_TYPES.map((type) => (
            <motion.button
              key={type.id}
              onClick={() => onChange(type.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 sm:p-5 md:p-6 rounded-lg border-2 transition-all text-left ${
                value === type.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-white hover:border-primary/50"
              }`}
              data-testid={`button-select-${type.id}-type`}
            >
              <h3 className="font-semibold text-base sm:text-lg mb-2" style={{ color: '#1C2635' }}>
                {type.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {type.description}
              </p>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
