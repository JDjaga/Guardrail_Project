"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { GuardrailState } from "@/lib/types";
import {
  decodeConfig,
  defaultGuardrailStates,
  loadGuardrailStates,
  loadSystemPrompt,
  saveGuardrailStates,
  saveSystemPrompt,
} from "@/lib/storage";
import { PromptSidebar } from "@/components/PromptSidebar";
import { ChatInterface } from "@/components/ChatInterface";
import { ShareModal } from "@/components/ShareModal";

function AppContent() {
  const searchParams = useSearchParams();
  const [systemPrompt, setSystemPrompt] = useState("");
  const [guardrailStates, setGuardrailStates] = useState<GuardrailState[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [locked, setLocked] = useState(false);

  // Load config on mount (from URL or localStorage)
  useEffect(() => {
    const configParam = searchParams.get("config");
    if (configParam) {
      const decoded = decodeConfig(configParam);
      if (decoded) {
        setSystemPrompt(decoded.systemPrompt);
        setGuardrailStates(decoded.guardrailStates);
        setLocked(decoded.locked ?? false);
        setMounted(true);
        return;
      }
    }
    setSystemPrompt(loadSystemPrompt());
    setGuardrailStates(loadGuardrailStates());
    setMounted(true);
  }, [searchParams]);

  // Persist changes
  useEffect(() => {
    if (!mounted) return;
    saveSystemPrompt(systemPrompt);
  }, [systemPrompt, mounted]);

  useEffect(() => {
    if (!mounted) return;
    saveGuardrailStates(guardrailStates);
  }, [guardrailStates, mounted]);

  function handleUpdateState(updated: GuardrailState) {
    setGuardrailStates((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  }

  if (!mounted) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "var(--bg-page)",
        }}
      >
        <span style={{ fontSize: "13px", color: "var(--text-subtle)" }}>Loading…</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <PromptSidebar
        systemPrompt={systemPrompt}
        onSystemPromptChange={setSystemPrompt}
        guardrailStates={guardrailStates.length ? guardrailStates : defaultGuardrailStates()}
        onUpdateState={handleUpdateState}
        onShare={() => setShowShare(true)}
        locked={locked}
      />

      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100%", overflow: "hidden" }}>
        <ChatInterface
          systemPrompt={systemPrompt}
          guardrailStates={guardrailStates.length ? guardrailStates : defaultGuardrailStates()}
        />
      </main>

      {showShare && (
        <ShareModal
          systemPrompt={systemPrompt}
          guardrailStates={guardrailStates}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            background: "var(--bg-page)",
          }}
        >
          <span style={{ fontSize: "13px", color: "var(--text-subtle)" }}>Loading…</span>
        </div>
      }
    >
      <AppContent />
    </Suspense>
  );
}
