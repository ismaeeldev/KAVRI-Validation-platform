import React from "react";
import { DEVELOPMENT_STAGE, DevelopmentStage } from "@/lib/constants";

interface MetricCellProps {
  label: string;
  value: number | string;
  className?: string;
}

export function MetricCell({ label, value, className = "" }: MetricCellProps) {
  return (
    <div
      className={`flex flex-col border border-kavri-line dark:border-muted p-4 rounded-sm bg-kavri-surface dark:bg-card min-w-[120px] ${className}`}
    >
      <span className="text-[10px] font-mono uppercase tracking-widest text-kavri-muted select-none">
        {label}
      </span>
      <span className="font-mono text-2xl font-bold text-kavri-ink dark:text-foreground mt-2 tracking-tight tabular-nums">
        {value}
      </span>
    </div>
  );
}

interface ProgressRailProps {
  currentStage: DevelopmentStage;
  className?: string;
}

export function ProgressRail({ currentStage, className = "" }: ProgressRailProps) {
  const stagesList = [
    { key: DEVELOPMENT_STAGE.CONCEPT, label: "Concept" },
    { key: DEVELOPMENT_STAGE.DESIGN, label: "Design" },
    { key: DEVELOPMENT_STAGE.PROTOTYPE, label: "Prototype" },
    { key: DEVELOPMENT_STAGE.FIELD_TESTING, label: "Field Testing" },
    { key: DEVELOPMENT_STAGE.PRODUCTION, label: "Production" },
    { key: DEVELOPMENT_STAGE.LAUNCH, label: "Launch" },
  ];

  // Find index of current stage
  const currentIndex = stagesList.findIndex((stage) => stage.key === currentStage);

  return (
    <div className={`w-full ${className}`}>
      {/* Top stage titles for larger screens */}
      <div className="hidden sm:grid grid-cols-6 gap-2 mb-3">
        {stagesList.map((stage, idx) => {
          const isActive = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          return (
            <div
              key={stage.key}
              className={`text-center flex flex-col items-center ${
                isCurrent
                  ? "text-kavri-ink dark:text-foreground font-bold"
                  : isActive
                  ? "text-kavri-muted dark:text-gray-400 font-medium"
                  : "text-kavri-muted dark:text-gray-500 font-normal"
              }`}
            >
              <span className="text-[10px] font-mono uppercase tracking-wider">{stage.label}</span>
            </div>
          );
        })}
      </div>

      {/* Progress rail line */}
      <div className="relative w-full h-[6px] bg-kavri-line dark:bg-muted rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-kavri-ink dark:bg-kavri-signal transition-all duration-500 ease-out"
          style={{
            width: `${((currentIndex + 1) / stagesList.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}
