"use client";

import { useState } from "react";
import { ATTACK_PROMPTS, CATEGORIES, DIFFICULTY_COLOR, type AttackPrompt } from "@/lib/attackPrompts";

interface Props {
  open: boolean;
  onClose: () => void;
  onUse: (prompt: string) => void;
}

type Category = keyof typeof CATEGORIES;

function DifficultyDot({ level }: { level: AttackPrompt["difficulty"] }) {
  return (
    <span
      title={level}
      style={{
        display: "inline-block",
        width: "7px",
        height: "7px",
        borderRadius: "50%",
        background: DIFFICULTY_COLOR[level],
        flexShrink: 0,
      }}
    />
  );
}

export function AttackPromptsPanel({ open, onClose, onUse }: Props) {
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = activeCategory === "all"
    ? ATTACK_PROMPTS
    : ATTACK_PROMPTS.filter((p) => p.category === activeCategory);

  function handleUse(p: AttackPrompt) {
    onUse(p.prompt);
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.4)" }}
        />
      )}

      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100%",
          width: "380px",
          background: "var(--bg-panel)",
          borderLeft: "1px solid var(--border)",
          zIndex: 50,
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.24s cubic-bezier(0.16, 1, 0.3, 1)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          height: "52px",
          padding: "0 16px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 590, color: "var(--text-primary)", lineHeight: 1 }}>
              Attack Prompts
            </div>
            <div style={{ fontSize: "10px", color: "var(--text-subtle)", marginTop: "3px", lineHeight: 1 }}>
              Click any prompt to paste it into chat
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "18px", lineHeight: 1, padding: "4px" }}>
            ×
          </button>
        </div>

        {/* Difficulty legend */}
        <div style={{ padding: "10px 16px 8px", borderBottom: "1px solid var(--border-subtle)", display: "flex", gap: "12px", flexShrink: 0 }}>
          {(["easy", "medium", "hard"] as const).map((d) => (
            <span key={d} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "10px", color: "var(--text-subtle)", fontWeight: 510 }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: DIFFICULTY_COLOR[d], display: "inline-block" }} />
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </span>
          ))}
        </div>

        {/* Category tabs */}
        <div style={{ padding: "8px 16px", display: "flex", gap: "5px", flexWrap: "wrap", borderBottom: "1px solid var(--border-subtle)", flexShrink: 0 }}>
          {(["all", ...Object.keys(CATEGORIES)] as (Category | "all")[]).map((cat) => {
            const isActive = activeCategory === cat;
            const meta = cat !== "all" ? CATEGORIES[cat] : null;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "3px 9px",
                  fontSize: "10px",
                  fontWeight: 510,
                  letterSpacing: "0.05em",
                  background: isActive ? (meta?.color ?? "rgba(255,255,255,0.08)") : "transparent",
                  border: `1px solid ${isActive ? "var(--border-strong)" : "var(--border-subtle)"}`,
                  color: isActive ? (meta?.text ?? "var(--text-primary)") : "var(--text-subtle)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {cat === "all" ? "All" : CATEGORIES[cat as Category].label}
              </button>
            );
          })}
        </div>

        {/* Prompts list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {filtered.map((p) => {
            const cat = CATEGORIES[p.category];
            const isCopied = copiedId === p.id;
            return (
              <div
                key={p.id}
                style={{
                  padding: "10px 16px",
                  borderBottom: "1px solid var(--border-subtle)",
                  cursor: "pointer",
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {/* Top row */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}>
                  <DifficultyDot level={p.difficulty} />
                  <span style={{ fontSize: "12px", fontWeight: 510, color: "var(--text-primary)", flex: 1 }}>
                    {p.label}
                  </span>
                  <span style={{
                    fontSize: "9px",
                    fontWeight: 510,
                    padding: "2px 6px",
                    background: cat.color,
                    color: cat.text,
                    letterSpacing: "0.05em",
                  }}>
                    {cat.label}
                  </span>
                </div>

                {/* Prompt text */}
                <p style={{
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  margin: "0 0 6px 0",
                  lineHeight: "1.55",
                  fontFamily: "var(--font-mono)",
                  background: "rgba(255,255,255,0.03)",
                  padding: "6px 8px",
                  border: "1px solid var(--border-subtle)",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}>
                  {p.prompt.length > 120 ? p.prompt.slice(0, 120) + "…" : p.prompt}
                </p>

                {/* Tip */}
                <p style={{ fontSize: "10px", color: "var(--text-subtle)", margin: "0 0 8px 0", lineHeight: 1.5 }}>
                  {p.tip}
                </p>

                {/* Use button */}
                <button
                  onClick={() => handleUse(p)}
                  style={{
                    padding: "4px 12px",
                    fontSize: "10px",
                    fontWeight: 510,
                    letterSpacing: "0.06em",
                    background: isCopied ? "rgba(16,185,129,0.15)" : "var(--brand)",
                    border: isCopied ? "1px solid rgba(16,185,129,0.4)" : "none",
                    color: isCopied ? "#10b981" : "#fff",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    textTransform: "uppercase",
                  }}
                >
                  {isCopied ? "Pasted" : "Use this"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
