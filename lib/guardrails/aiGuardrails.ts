import type { Guardrail } from "@/lib/types";

// Activity version — all slots start empty.
// Teams name each guardrail and write the judge prompt themselves.
// Slots 1-3 default to input phase, 4-5 to output phase (teams can change this).

export const BUILT_IN_GUARDRAILS: Guardrail[] = [
  { id: "guard1", label: "Guardrail 1", description: "", phase: "input",  defaultEnabled: false, defaultJudgePrompt: "" },
  { id: "guard2", label: "Guardrail 2", description: "", phase: "input",  defaultEnabled: false, defaultJudgePrompt: "" },
  { id: "guard3", label: "Guardrail 3", description: "", phase: "input",  defaultEnabled: false, defaultJudgePrompt: "" },
  { id: "guard4", label: "Guardrail 4", description: "", phase: "output", defaultEnabled: false, defaultJudgePrompt: "" },
  { id: "guard5", label: "Guardrail 5", description: "", phase: "output", defaultEnabled: false, defaultJudgePrompt: "" },
];
