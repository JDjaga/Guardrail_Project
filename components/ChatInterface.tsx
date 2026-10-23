"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage, GuardrailState, ChatRequestBody, ChatResponseBody } from "@/lib/types";
import { MessageBubble } from "./MessageBubble";
import { AttackPromptsPanel } from "./AttackPromptsPanel";

interface Props {
  systemPrompt: string;
  guardrailStates: GuardrailState[];
}

function SendIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function TypingIndicator() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "8px",
        maxWidth: "76%",
      }}
    >
      <div
        style={{
          padding: "10px 14px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: "5px",
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: "var(--text-subtle)",
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function ChatInterface({ systemPrompt, guardrailStates }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attackPanelOpen, setAttackPanelOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  }, [input]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setError(null);

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: Date.now(),
      triggeredGuardrails: [],
      blocked: false,
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const reqBody: ChatRequestBody = {
        message: text,
        history,
        guardrailStates,
        systemPrompt,
      };

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });

      const data: ChatResponseBody = await res.json();

      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      // Collect all guardrail results
      const allResults = [
        ...(data.inputGuardrailResults ?? []),
        ...(data.outputGuardrailResults ?? []),
      ].filter((r) => r.triggered && (r.severity === "block" || r.severity === "warn"));

      if (data.blocked) {
        // Update user message with input guardrail results
        const inputBlocks = (data.inputGuardrailResults ?? []).filter(
          (r) => r.triggered && r.severity === "block"
        );
        setMessages((prev) =>
          prev.map((m) =>
            m.id === userMsg.id
              ? { ...m, triggeredGuardrails: inputBlocks, blocked: true }
              : m
          )
        );
      } else {
        // Add AI reply
        const aiMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.reply ?? "",
          timestamp: Date.now(),
          triggeredGuardrails: allResults,
          blocked: false,
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          background: "var(--bg-page)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            height: "52px",
            padding: "0 20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: "13px", fontWeight: 510, color: "var(--text-muted)", letterSpacing: "0.01em" }}>
            Gemini 2.0 Flash · OpenRouter
          </span>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 510,
              background: "rgba(94, 106, 210, 0.15)",
              color: "var(--accent)",
              border: "1px solid rgba(94, 106, 210, 0.3)",
              padding: "2px 7px",
              letterSpacing: "0.06em",
            }}
          >
            LLM-as-Judge
          </span>
          <div style={{ flex: 1 }} />
          <button
            onClick={() => setAttackPanelOpen(true)}
            style={{
              padding: "5px 12px",
              fontSize: "10px",
              fontWeight: 510,
              letterSpacing: "0.06em",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "var(--block-text)",
              cursor: "pointer",
              textTransform: "uppercase",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.15)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.5)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.3)";
            }}
          >
            Attack Prompts
          </button>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "28px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {messages.length === 0 && (
            <div
              style={{
                margin: "auto",
                textAlign: "center",
                maxWidth: "400px",
              }}
            >
              <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.7, marginBottom: "12px" }}>
                AI guardrails are active. Each message runs through an LLM-as-judge pipeline before reaching the model.
              </p>
              <p style={{ fontSize: "12px", color: "var(--text-subtle)", lineHeight: 1.6 }}>
                Try asking an off-topic question to see the Domain Guard fire, or attempt a prompt injection.
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              margin: "0 24px 8px",
              padding: "8px 12px",
              background: "var(--block-bg)",
              border: "1px solid var(--block-border)",
              color: "var(--block-text)",
              fontSize: "12px",
            }}
          >
            {error}
          </div>
        )}

        {/* Input */}
        <div
          style={{
            padding: "12px 20px 16px",
            borderTop: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "8px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--border)",
              padding: "10px 12px 10px 14px",
              transition: "border-color 0.15s",
            }}
            onFocus={() => {}}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Send a message..."
              rows={1}
              disabled={loading}
              style={{
                flex: 1,
                background: "none",
                border: "none",
                outline: "none",
                color: "var(--text-primary)",
                fontSize: "14px",
                lineHeight: "1.55",
                resize: "none",
                overflowY: "hidden",
                fontFamily: "var(--font-sans)",
              }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              style={{
                background: input.trim() && !loading ? "var(--brand)" : "rgba(255,255,255,0.05)",
                border: "none",
                cursor: input.trim() && !loading ? "pointer" : "default",
                color: input.trim() && !loading ? "#fff" : "var(--text-subtle)",
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                borderRadius: "6px",
                transition: "background 0.18s, color 0.18s",
              }}
            >
              <SendIcon />
            </button>
          </div>
          <p style={{ fontSize: "10px", color: "var(--text-subtle)", marginTop: "6px", textAlign: "center" }}>
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>

      <AttackPromptsPanel
        open={attackPanelOpen}
        onClose={() => setAttackPanelOpen(false)}
        onUse={(prompt) => {
          setInput(prompt);
          setAttackPanelOpen(false);
          setTimeout(() => textareaRef.current?.focus(), 50);
        }}
      />
    </>
  );
}
