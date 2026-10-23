"use client";

import ReactMarkdown from "react-markdown";
import type { ChatMessage, GuardrailResult } from "@/lib/types";

interface Props {
  message: ChatMessage;
}

const GUARD_LABELS: Record<string, string> = {
  domainGuard: "Domain Guard",
  safetyGuard: "Safety Guard",
  injectionGuard: "Prompt Injection",
  qualityGuard: "Quality Guard",
  toneGuard: "Tone Guard",
};

function GuardrailBadge({ result }: { result: GuardrailResult }) {
  const isBlock = result.severity === "block";
  return (
    <span
      title={result.message}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        fontSize: "10px",
        fontWeight: 510,
        letterSpacing: "0.07em",
        padding: "2px 7px",
        border: `1px solid ${isBlock ? "var(--block-border)" : "var(--warn-border)"}`,
        background: isBlock ? "var(--block-bg)" : "var(--warn-bg)",
        color: isBlock ? "var(--block-text)" : "var(--warn-text)",
        fontFamily: "var(--font-mono)",
        cursor: "help",
      }}
    >
      {isBlock ? "BLOCKED" : "WARN"} · {GUARD_LABELS[result.guardId] ?? result.guardId}
    </span>
  );
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";
  const firedGuardrails = [
    ...message.triggeredGuardrails,
  ].filter((r) => r.severity === "block" || r.severity === "warn");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        gap: "6px",
        maxWidth: "76%",
        marginLeft: isUser ? "auto" : 0,
      }}
    >
      {/* Bubble */}
      <div
        style={{
          padding: "10px 14px",
          background: isUser
            ? "rgba(255,255,255,0.05)"
            : "rgba(255,255,255,0.02)",
          border: `1px solid ${
            message.blocked ? "var(--block-border)" : "var(--border)"
          }`,
          color: message.blocked ? "var(--block-text)" : "var(--text-secondary)",
          fontSize: "14px",
          lineHeight: "1.65",
          wordBreak: "break-word",
        }}
      >
        {isUser ? (
          <span style={{ whiteSpace: "pre-wrap" }}>{message.content}</span>
        ) : (
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <p style={{ margin: "0 0 10px 0", lineHeight: "1.7" }}>{children}</p>
              ),
              ul: ({ children }) => (
                <ul style={{ margin: "6px 0 10px 0", paddingLeft: "18px", listStyleType: "disc" }}>{children}</ul>
              ),
              ol: ({ children }) => (
                <ol style={{ margin: "6px 0 10px 0", paddingLeft: "18px" }}>{children}</ol>
              ),
              li: ({ children }) => (
                <li style={{ margin: "3px 0", lineHeight: "1.65", color: "var(--text-secondary)" }}>{children}</li>
              ),
              strong: ({ children }) => (
                <strong style={{ fontWeight: 590, color: "var(--text-primary)" }}>{children}</strong>
              ),
              em: ({ children }) => (
                <em style={{ fontStyle: "italic", color: "var(--text-secondary)" }}>{children}</em>
              ),
              h1: ({ children }) => (
                <h1 style={{ fontSize: "16px", fontWeight: 590, color: "var(--text-primary)", margin: "14px 0 6px", letterSpacing: "-0.01em" }}>{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 style={{ fontSize: "15px", fontWeight: 590, color: "var(--text-primary)", margin: "12px 0 5px", letterSpacing: "-0.01em" }}>{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 style={{ fontSize: "14px", fontWeight: 510, color: "var(--text-primary)", margin: "10px 0 4px" }}>{children}</h3>
              ),
              code: ({ children, className }) => {
                const isBlock = !!className;
                return isBlock ? (
                  <code style={{
                    display: "block",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--border)",
                    padding: "10px 12px",
                    fontSize: "12px",
                    fontFamily: "var(--font-mono)",
                    color: "var(--text-secondary)",
                    overflowX: "auto",
                    margin: "6px 0",
                    lineHeight: "1.6",
                  }}>{children}</code>
                ) : (
                  <code style={{
                    background: "rgba(255,255,255,0.07)",
                    padding: "1px 5px",
                    fontSize: "12px",
                    fontFamily: "var(--font-mono)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border)",
                  }}>{children}</code>
                );
              },
              blockquote: ({ children }) => (
                <blockquote style={{
                  borderLeft: "2px solid var(--brand)",
                  paddingLeft: "12px",
                  margin: "8px 0",
                  color: "var(--text-muted)",
                  fontStyle: "italic",
                }}>{children}</blockquote>
              ),
              hr: () => (
                <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "12px 0" }} />
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>

      {/* Guardrail badges */}
      {firedGuardrails.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
          {firedGuardrails.map((r) => (
            <GuardrailBadge key={r.guardId} result={r} />
          ))}
        </div>
      )}
    </div>
  );
}
