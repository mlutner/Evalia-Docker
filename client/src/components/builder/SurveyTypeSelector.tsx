import { motion } from "framer-motion";
import type { SurveyType } from "@shared/schema";

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
      className="mb-6 sm:mb-8 md:mb-12"
    >
      <div className="bg-white rounded-lg border-2 border-border p-3 sm:p-4 md:p-6 lg:p-8">
        <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold mb-3 sm:mb-4 md:mb-5 lg:mb-6" style={{ color: '#1C2635' }}>
          What are you creating?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
          {SURVEY_TYPES.map((type) => (
            <motion.button
              key={type.id}
              onClick={() => onChange(type.id)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className={`p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg border-2 transition-all text-left ${
                value === type.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-white hover:border-primary/50"
              }`}
              data-testid={`button-select-${type.id}-type`}
            >
              <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-1 sm:mb-2" style={{ color: '#1C2635' }}>
                {type.title}
              </h3>
              <p className="text-xs sm:text-xs md:text-sm text-muted-foreground leading-snug line-clamp-3">
                {type.description}
              </p>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
