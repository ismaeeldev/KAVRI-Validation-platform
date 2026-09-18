// Single source of truth for the development-loop copy. Edit this array to
// change stage titles/descriptions — the desktop track, the mobile rail,
// and the derived loop-back captions all render from it.
export interface ProcessStage {
  title: string;
  description: string;
}

export const PROCESS_STAGES: ProcessStage[] = [
  {
    title: "Source",
    description:
      "Evaluate manufacturing partners, materials, capabilities, communication, and consistency.",
  },
  {
    title: "Build",
    description: "Create identifiable prototypes around specific development questions.",
  },
  {
    title: "Measure",
    description:
      "Inspect each testable sample and record its physical characteristics and condition.",
  },
  {
    title: "Play",
    description:
      "Place selected samples with players and collect structured feedback from real sessions.",
  },
  {
    title: "Compare",
    description:
      "Review measurements, player observations, preferences, and reported issues together.",
  },
  {
    title: "Decide",
    description: "Advance, modify, retest, or stop—and document the reasoning behind that decision.",
  },
];

export function pad(n: number): string {
  return n < 10 ? "0" + n : String(n);
}
