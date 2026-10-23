"use client";

import { useState, useEffect } from "react";
import type { GuardrailState } from "@/lib/types";
import { encodeConfig } from "@/lib/storage";

interface Props {
  systemPrompt: string;
  guardrailStates: GuardrailState[];
  onClose: () => void;
}

export function ShareModal({ systemPrompt, guardrailStates, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const encoded = encodeConfig({ systemPrompt, guardrailStates, locked });
    const url = `${window.location.origin}${window.location.pathname}?config=${encoded}`;
    setShareUrl(url);
  }, [systemPrompt, guardrailStates, locked]);

  function handleCopy() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const qrUrl = shareUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(shareUrl)}&color=d0d6e0&bgcolor=0f1011&qzone=1`
    : null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 40,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 50,
          width: "440px",
          maxWidth: "calc(100vw - 32px)",
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            height: "52px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: 590, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            Share configuration
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              fontSize: "18px",
              lineHeight: 1,
              padding: "4px",
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px" }}>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "14px", lineHeight: 1.5 }}>
            This URL encodes your system prompt and guardrail configuration. Anyone with the link loads the same setup.
          </p>

          {/* Editable / Locked toggle */}
          <div style={{ marginBottom: "14px" }}>
            <p style={{ fontSize: "10px", fontWeight: 510, letterSpacing: "0.08em", color: "var(--text-subtle)", textTransform: "uppercase", marginBottom: "8px" }}>
              Recipient permissions
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              {([
                { value: false, label: "Editable", desc: "Recipients can modify config" },
                { value: true, label: "View Only", desc: "Config is locked, read-only" },
              ] as { value: boolean; label: string; desc: string }[]).map(({ value, label, desc }) => (
                <button
                  key={label}
                  onClick={() => setLocked(value)}
                  style={{
                    flex: 1,
                    padding: "10px 10px",
                    background: locked === value ? "rgba(94,106,210,0.1)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${locked === value ? "rgba(94,106,210,0.5)" : "var(--border)"}`,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ fontSize: "12px", fontWeight: 510, color: locked === value ? "var(--accent)" : "var(--text-secondary)", marginBottom: "2px" }}>
                    {label}
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--text-subtle)" }}>{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* URL row */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "20px" }}>
            <input
              readOnly
              value={shareUrl}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
                fontSize: "11px",
                padding: "8px 10px",
                outline: "none",
                fontFamily: "var(--font-mono)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              onClick={(e) => (e.currentTarget as HTMLInputElement).select()}
            />
            <button
              onClick={handleCopy}
              style={{
                padding: "8px 14px",
                background: copied ? "rgba(16, 185, 129, 0.15)" : "var(--brand)",
                border: copied ? "1px solid rgba(16, 185, 129, 0.4)" : "none",
                color: copied ? "#10b981" : "#fff",
                fontSize: "12px",
                fontWeight: 510,
                letterSpacing: "0.04em",
                cursor: "pointer",
                flexShrink: 0,
                transition: "background 0.2s",
              }}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          {/* QR code */}
          {qrUrl && (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div
                style={{
                  padding: "12px",
                  background: "var(--bg-panel)",
                  border: "1px solid var(--border)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrUrl}
                  alt="QR code"
                  width={160}
                  height={160}
                  style={{ display: "block" }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)" }}>
          <button
            onClick={onClose}
            style={{
              width: "100%",
              padding: "9px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              fontSize: "13px",
              fontWeight: 510,
              cursor: "pointer",
              letterSpacing: "0.02em",
            }}
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
}
