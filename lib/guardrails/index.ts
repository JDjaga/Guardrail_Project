import OpenAI from "openai";
import type { Guardrail, GuardrailResult, GuardrailState } from "@/lib/types";
import { BUILT_IN_GUARDRAILS } from "./aiGuardrails";

export { BUILT_IN_GUARDRAILS };

export interface RunGuardrailsResult {
  results: GuardrailResult[];
  blocked: boolean;
  blockedBy?: string;
}

function buildCombinedPrompt(
  active: { guardrail: Guardrail; state: GuardrailState }[],
  systemPrompt: string
): string {
  const checks = active
    .map(({ guardrail: g, state }) => {
      const policy = (state.judgePrompt ?? g.defaultJudgePrompt)
        .replace("{{SYSTEM_PROMPT}}", systemPrompt || "(none)");
      return `[${g.id}]\n${policy}`;
    })
    .join("\n\n");

  const ids = active.map(({ guardrail: g }) => `"${g.id}"`).join(", ");

  return `You are a content safety evaluator. Evaluate the message below against each named guardrail.

${checks}

For each guardrail, respond with:
- "PASS" — if the content is fine
- "BLOCK: reason" — if it should be blocked
- "WARN: reason" — if it should be flagged but not blocked

Respond ONLY with a valid JSON object. No explanation, no markdown, no code fences.
Keys must be exactly: ${ids}

Example format:
{
  "guardId1": { "verdict": "PASS", "reason": "" },
  "guardId2": { "verdict": "BLOCK", "reason": "Brief reason here" }
}`;
}

function parseVerdicts(
  raw: string,
  active: { guardrail: Guardrail; state: GuardrailState }[]
): GuardrailResult[] {
  const cleaned = raw.replace(/^```(?:json)?\n?|\n?```$/gm, "").trim();
  let parsed: Record<string, { verdict: string; reason: string }> = {};
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error("Guardrail JSON parse failed:", raw);
    return active.map(({ guardrail: g }) => ({
      guardId: g.id,
      severity: "pass" as const,
      triggered: false,
      message: "Parse error — guardrail skipped.",
    }));
  }

  return active.map(({ guardrail: g }) => {
    const entry = parsed[g.id];
    if (!entry) return { guardId: g.id, severity: "pass" as const, triggered: false, message: "" };
    const verdict = (entry.verdict ?? "PASS").toUpperCase();
    const severity =
      verdict.startsWith("BLOCK") ? "block" as const
      : verdict.startsWith("WARN") ? "warn" as const
      : "pass" as const;
    return { guardId: g.id, severity, triggered: severity !== "pass", message: entry.reason ?? "" };
  });
}

export async function runGuardrails(
  text: string,
  phase: "input" | "output",
  states: GuardrailState[],
  systemPrompt: string
): Promise<RunGuardrailsResult> {
  const active = BUILT_IN_GUARDRAILS
    .map((g) => ({ guardrail: g, state: states.find((s) => s.id === g.id) ?? { id: g.id, enabled: false } }))
    .filter(({ guardrail: g, state }) => {
      if (!state.enabled) return false;
      const effectivePhase = state.phase ?? g.phase;
      if (effectivePhase !== phase && effectivePhase !== "both") return false;
      // Skip guardrails with no judge prompt — they haven't been configured
      const prompt = state.judgePrompt ?? g.defaultJudgePrompt;
      return prompt.trim().length > 0;
    });

  if (active.length === 0) return { results: [], blocked: false };

  try {
    const client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const res = await client.chat.completions.create({
      model: "openrouter/free",
      max_tokens: 300,
      temperature: 0,
      messages: [
        { role: "system", content: buildCombinedPrompt(active, systemPrompt) },
        { role: "user", content: text },
      ],
    });

    const results = parseVerdicts(res.choices[0]?.message?.content ?? "{}", active);
    const blocked = results.find((r) => r.severity === "block" && r.triggered);
    return { results, blocked: !!blocked, blockedBy: blocked?.guardId };
  } catch (err) {
    console.error("Guardrail call failed:", err);
    return { results: [], blocked: false };
  }
}
