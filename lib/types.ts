export interface GuardrailResult {
  guardId: string;
  severity: "block" | "warn" | "pass";
  triggered: boolean;
  message: string;
}

export interface GuardrailState {
  id: string;
  enabled: boolean;
  label?: string;                        // user-defined name
  phase?: "input" | "output" | "both";  // user-defined phase
  judgePrompt?: string;
}

export interface Guardrail {
  id: string;
  label: string;
  description: string;
  phase: "input" | "output" | "both";
  defaultEnabled: boolean;
  defaultJudgePrompt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  triggeredGuardrails: GuardrailResult[];
  blocked: boolean;
}

export interface ChatRequestBody {
  message: string;
  history: { role: "user" | "assistant"; content: string }[];
  guardrailStates: GuardrailState[];
  systemPrompt: string;
}

export interface ChatResponseBody {
  reply: string | null;
  inputGuardrailResults: GuardrailResult[];
  outputGuardrailResults: GuardrailResult[];
  blocked: boolean;
  blockedBy?: string;
  error?: string;
}
