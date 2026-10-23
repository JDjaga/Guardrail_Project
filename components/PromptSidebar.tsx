"use client";

import { useState } from "react";
import type { GuardrailState } from "@/lib/types";
import { BUILT_IN_GUARDRAILS } from "@/lib/guardrails/aiGuardrails";
import { DEFAULT_SYSTEM_PROMPT } from "@/lib/storage";
import { GuardrailToggle } from "./GuardrailToggle";

interface Props {
  systemPrompt: string;
  onSystemPromptChange: (v: string) => void;
  guardrailStates: GuardrailState[];
  onUpdateState: (updated: GuardrailState) => void;
  onShare: () => void;
  locked?: boolean;
}

function ShareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

const iconBtn: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid var(--border)",
  color: "var(--text-muted)",
  width: "26px",
  height: "26px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  padding: 0,
  borderRadius: "6px",
  transition: "border-color 0.15s, color 0.15s, background 0.15s",
};

const sectionLabel: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: 510,
  letterSpacing: "0.1em",
  color: "var(--text-subtle)",
  textTransform: "uppercase",
  margin: "0 0 8px 0",
};

export function PromptSidebar({
  systemPrompt,
  onSystemPromptChange,
  guardrailStates,
  onUpdateState,
  onShare,
  locked = false,
}: Props) {
  const [promptFocused, setPromptFocused] = useState(false);
  const enabledCount = guardrailStates.filter((s) => s.enabled).length;

  return (
    <aside
      style={{
        width: "268px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--bg-panel)",
        borderRight: "1px solid var(--border)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          height: "52px",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <div>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 590,
              letterSpacing: "0.04em",
              color: "var(--text-primary)",
              lineHeight: 1,
            }}
          >
            AegisLLM
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-subtle)", marginTop: "3px", lineHeight: 1 }}>
            {enabledCount}/{BUILT_IN_GUARDRAILS.length} active
          </div>
        </div>

        <button
          onClick={onShare}
          title="Share configuration"
          style={iconBtn}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
            (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
            (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
          }}
        >
          <ShareIcon />
        </button>
      </div>

      {/* Locked banner */}
      {locked && (
        <div style={{
          padding: "8px 16px",
          background: "rgba(250,189,47,0.08)",
          borderBottom: "1px solid rgba(250,189,47,0.25)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: "10px", fontWeight: 510, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--warn-text)" }}>
            View Only
          </span>
          <span style={{ fontSize: "10px", color: "var(--text-subtle)", flex: 1 }}>
            Configuration is locked
          </span>
        </div>
      )}

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>

        {/* System Prompt */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <p style={sectionLabel}>System Prompt</p>
            {!locked && systemPrompt !== DEFAULT_SYSTEM_PROMPT && (
              <button
                onClick={() => onSystemPromptChange(DEFAULT_SYSTEM_PROMPT)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-subtle)",
                  fontSize: "10px",
                  padding: 0,
                  textDecoration: "underline",
                  fontWeight: 400,
                }}
              >
                Reset
              </button>
            )}
          </div>
          <textarea
            value={systemPrompt}
            onChange={(e) => !locked && onSystemPromptChange(e.target.value)}
            rows={7}
            onFocus={() => !locked && setPromptFocused(true)}
            onBlur={() => setPromptFocused(false)}
            placeholder="Describe the assistant's role and constraints..."
            readOnly={locked}
            style={{
              width: "100%",
              background: locked ? "rgba(255,255,255,0.01)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${promptFocused && !locked ? "var(--accent)" : "var(--border)"}`,
              color: locked ? "var(--text-subtle)" : "var(--text-secondary)",
              fontSize: "12px",
              lineHeight: "1.6",
              padding: "9px 10px",
              outline: "none",
              resize: locked ? "none" : "vertical",
              minHeight: "100px",
              transition: "border-color 0.15s",
              cursor: locked ? "default" : "text",
            }}
          />
          <p style={{ fontSize: "10px", color: "var(--text-subtle)", marginTop: "5px", lineHeight: 1.4 }}>
            This becomes the AI model&apos;s system message. Edit it to change the domain.
          </p>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid var(--border-subtle)", marginBottom: "16px" }} />

        {/* Guardrails */}
        <p style={sectionLabel}>AI Guardrails</p>
        <p style={{ fontSize: "10px", color: "var(--text-subtle)", marginBottom: "10px", lineHeight: 1.5 }}>
          Each guardrail makes a separate LLM call to judge the message. Toggle to enable/disable. Expand to edit the judge prompt.
        </p>

        {BUILT_IN_GUARDRAILS.map((g) => {
          const s = guardrailStates.find((x) => x.id === g.id) ?? {
            id: g.id,
            enabled: g.defaultEnabled,
          };
          return <GuardrailToggle key={g.id} guardrail={g} state={s} onChange={onUpdateState} locked={locked} />;
        })}

        <div style={{ height: "16px" }} />
      </div>
    </aside>
  );
}
