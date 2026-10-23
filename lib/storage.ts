"use client";

import type { GuardrailState } from "@/lib/types";
import { BUILT_IN_GUARDRAILS } from "@/lib/guardrails/aiGuardrails";

// Activity version — starts completely empty so teams build from scratch
export const DEFAULT_SYSTEM_PROMPT = "";

const KEYS = {
  systemPrompt: "ga_system_prompt",
  guardrailStates: "ga_guardrail_states",
};

export function saveSystemPrompt(prompt: string): void {
  try { localStorage.setItem(KEYS.systemPrompt, prompt); } catch {}
}

export function loadSystemPrompt(): string {
  try { return localStorage.getItem(KEYS.systemPrompt) ?? DEFAULT_SYSTEM_PROMPT; }
  catch { return DEFAULT_SYSTEM_PROMPT; }
}

export function defaultGuardrailStates(): GuardrailState[] {
  return BUILT_IN_GUARDRAILS.map((g) => ({
    id: g.id,
    enabled: false,
    label: undefined,
    phase: undefined,
    judgePrompt: undefined,
  }));
}

export function saveGuardrailStates(states: GuardrailState[]): void {
  try { localStorage.setItem(KEYS.guardrailStates, JSON.stringify(states)); } catch {}
}

export function loadGuardrailStates(): GuardrailState[] {
  try {
    const raw = localStorage.getItem(KEYS.guardrailStates);
    if (!raw) return defaultGuardrailStates();
    const parsed = JSON.parse(raw) as GuardrailState[];
    return BUILT_IN_GUARDRAILS.map((g) => {
      const saved = parsed.find((s) => s.id === g.id);
      return saved ?? { id: g.id, enabled: false };
    });
  } catch {
    return defaultGuardrailStates();
  }
}

export interface ShareConfig {
  systemPrompt: string;
  guardrailStates: GuardrailState[];
  locked: boolean;
}

export function encodeConfig(config: ShareConfig): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(config))));
}

export function decodeConfig(param: string): ShareConfig | null {
  try {
    const decoded = JSON.parse(decodeURIComponent(escape(atob(param))));
    if (typeof decoded.systemPrompt === "string" && Array.isArray(decoded.guardrailStates)) {
      return { ...decoded, locked: decoded.locked ?? false } as ShareConfig;
    }
    return null;
  } catch {
    return null;
  }
}
