"use client";

import { useState } from "react";
import type { Guardrail, GuardrailState } from "@/lib/types";

interface Props {
  guardrail: Guardrail;
  state: GuardrailState;
  onChange: (updated: GuardrailState) => void;
  locked?: boolean;
}

const PHASE_OPTIONS = [
  { value: "input", label: "INPUT" },
  { value: "output", label: "OUTPUT" },
  { value: "both", label: "I/O" },
] as const;

const PHASE_LABEL: Record<string, string> = {
  input: "INPUT",
  output: "OUTPUT",
  both: "I/O",
};

export function GuardrailToggle({ guardrail, state, onChange, locked = false }: Props) {
  const [expanded, setExpanded] = useState(false);
  const judgePrompt = state.judgePrompt ?? guardrail.defaultJudgePrompt;
  const displayLabel = state.label ?? guardrail.label;
  const effectivePhase = state.phase ?? guardrail.phase;

  return (
    <div
      style={{
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      {/* Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 0",
          cursor: "default",
        }}
      >
        {/* Phase badge */}
        <span
          style={{
            fontSize: "9px",
            fontWeight: 510,
            letterSpacing: "0.1em",
            color: "var(--text-subtle)",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid var(--border-subtle)",
            padding: "2px 5px",
            flexShrink: 0,
            lineHeight: 1.4,
            fontFamily: "var(--font-mono)",
          }}
        >
          {PHASE_LABEL[effectivePhase]}
        </span>

        {/* Name */}
        <span
          style={{
            flex: 1,
            fontSize: "13px",
            fontWeight: state.enabled ? 510 : 400,
            color: state.enabled ? "var(--text-secondary)" : "var(--text-subtle)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            transition: "color 0.15s, font-weight 0.15s",
          }}
        >
          {displayLabel}
        </span>

        {/* Expand judge prompt button — hidden when locked */}
        {!locked && (
          <button
            onClick={() => setExpanded((x) => !x)}
            title="Edit guardrail"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: expanded ? "var(--accent)" : "var(--text-subtle)",
              padding: "2px 4px",
              fontSize: "11px",
              fontWeight: 510,
              letterSpacing: "0.05em",
              flexShrink: 0,
              lineHeight: 1,
              transition: "color 0.15s",
            }}
          >
            {expanded ? "▲" : "▼"}
          </button>
        )}

        {/* Toggle switch */}
        <button
          onClick={() => !locked && onChange({ ...state, enabled: !state.enabled })}
          role="switch"
          aria-checked={state.enabled}
          disabled={locked}
          style={{
            position: "relative",
            width: "28px",
            height: "15px",
            borderRadius: "8px",
            border: `1px solid ${state.enabled ? "var(--accent)" : "var(--border-strong)"}`,
            background: state.enabled ? "var(--accent)" : "transparent",
            cursor: locked ? "default" : "pointer",
            transition: "background 0.18s, border-color 0.18s",
            flexShrink: 0,
            padding: 0,
            opacity: locked ? 0.6 : 1,
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "2px",
              left: state.enabled ? "12px" : "2px",
              width: "9px",
              height: "9px",
              borderRadius: "50%",
              background: state.enabled ? "#fff" : "var(--border-strong)",
              transition: "left 0.18s",
            }}
          />
        </button>
      </div>

      {/* Expanded: name + phase + judge prompt editor */}
      {expanded && !locked && (
        <div style={{ paddingBottom: "12px" }}>

          {/* Guardrail name */}
          <p
            style={{
              fontSize: "10px",
              fontWeight: 510,
              letterSpacing: "0.08em",
              color: "var(--text-subtle)",
              textTransform: "uppercase",
              margin: "0 0 5px 0",
            }}
          >
            Name
          </p>
          <input
            type="text"
            value={displayLabel}
            onChange={(e) => onChange({ ...state, label: e.target.value })}
            placeholder="Name this guardrail..."
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              fontSize: "12px",
              padding: "7px 10px",
              outline: "none",
              fontFamily: "var(--font-sans)",
              marginBottom: "10px",
              boxSizing: "border-box",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
          />

          {/* Phase selector */}
          <p
            style={{
              fontSize: "10px",
              fontWeight: 510,
              letterSpacing: "0.08em",
              color: "var(--text-subtle)",
              textTransform: "uppercase",
              margin: "0 0 5px 0",
            }}
          >
            Phase
          </p>
          <div style={{ display: "flex", gap: "5px", marginBottom: "10px" }}>
            {PHASE_OPTIONS.map((opt) => {
              const isActive = effectivePhase === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => onChange({ ...state, phase: opt.value })}
                  style={{
                    padding: "4px 10px",
                    fontSize: "9px",
                    fontWeight: 510,
                    letterSpacing: "0.1em",
                    background: isActive ? "rgba(113,112,255,0.15)" : "transparent",
                    border: `1px solid ${isActive ? "rgba(113,112,255,0.4)" : "var(--border-subtle)"}`,
                    color: isActive ? "var(--accent)" : "var(--text-subtle)",
                    cursor: "pointer",
                    fontFamily: "var(--font-mono)",
                    transition: "all 0.15s",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Judge prompt */}
          <p
            style={{
              fontSize: "10px",
              fontWeight: 510,
              letterSpacing: "0.08em",
              color: "var(--text-subtle)",
              textTransform: "uppercase",
              margin: "0 0 6px 0",
            }}
          >
            Judge prompt
          </p>
          <p style={{ fontSize: "10px", color: "var(--text-subtle)", margin: "0 0 6px 0", lineHeight: 1.5 }}>
            This is what the LLM uses to evaluate each message. Write it as an instruction to a content safety judge.
          </p>
          <textarea
            value={judgePrompt}
            onChange={(e) => onChange({ ...state, judgePrompt: e.target.value })}
            rows={6}
            placeholder="e.g. You are a safety classifier. Does this message contain harmful content? Reply PASS or BLOCK: reason."
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              fontSize: "11px",
              lineHeight: "1.55",
              padding: "8px 10px",
              outline: "none",
              resize: "vertical",
              fontFamily: "var(--font-mono)",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
          />
          {state.judgePrompt && state.judgePrompt !== guardrail.defaultJudgePrompt && (
            <button
              onClick={() => onChange({ ...state, judgePrompt: undefined })}
              style={{
                marginTop: "6px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-subtle)",
                fontSize: "11px",
                padding: 0,
                textDecoration: "underline",
              }}
            >
              Reset to default
            </button>
          )}
        </div>
      )}
    </div>
  );
}
