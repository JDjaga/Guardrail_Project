# 04 — Project Structure: Why Folders Are Arranged This Way

Every folder here answers "whose job is this?" Let's walk through the whole tree, then explain *why* it's split this way instead of one giant file.

```
aegis-llm/
├── app/                          ← Next.js App Router: pages + API routes
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          ← THE BACKEND. Secret key lives here.
│   ├── layout.tsx                ← HTML shell, imports global CSS
│   └── page.tsx                  ← THE MAIN UI. Loads config, wires sidebar + chat.
├── components/                   ← Reusable UI pieces (React)
│   ├── AttackPromptsPanel.tsx    ← Right-side drawer with 19 attack prompts
│   ├── ChatInterface.tsx         ← Chat window: messages, input, send logic
│   ├── GuardrailToggle.tsx       ← One guardrail row: name, phase, judge prompt, switch
│   ├── MessageBubble.tsx         ← One chat bubble + BLOCKED/WARN badges
│   ├── PromptSidebar.tsx         ← Left panel: system prompt + list of guardrails
│   └── ShareModal.tsx            ← Share-as-URL dialog
├── lib/                          ← Pure logic, no UI
│   ├── guardrails/
│   │   ├── aiGuardrails.ts       ← The 5 slot definitions (just IDs + defaults)
│   │   └── index.ts              ← THE JUDGE ENGINE. Builds prompts, calls LLM, parses verdicts.
│   ├── attackPrompts.ts          ← The 19 attack prompts + categories + difficulty colors
│   ├── storage.ts                ← localStorage save/load + Base64 URL encode/decode
│   └── types.ts                  ← TypeScript contracts shared by client AND server
├── public/                       ← Static assets (favicon, images)
├── .env.local                    ← Your OpenRouter API key (git-ignored, never commit)
├── next.config.ts                ← Next.js config (empty here, extensible)
├── package.json                  ← Dependencies + scripts (dev/build/start)
├── tsconfig.json                 ← TypeScript compiler settings (path alias @/ → root)
└── postcss.config.mjs            ← Tailwind CSS pipeline
```

---

## The three-layer architecture

The folder structure mirrors a clean **three-layer design**:

```
┌─────────────────────────────────────────────────────┐
│  PRESENTATION LAYER (app/page.tsx + components/)    │
│  What the user sees and clicks. Never calls OpenAI  │
│  directly. Sends fetch("/api/chat").                 │
└───────────────────────┬─────────────────────────────┘
                        │ HTTP POST (JSON)
┌───────────────────────▼─────────────────────────────┐
│  ORCHESTRATION LAYER (app/api/chat/route.ts)        │
│  The traffic cop. Runs input guardrails → main model│
│  → output guardrails. Holds the API key.            │
└───────────┬─────────────────────────┬───────────────┘
            │ import                  │ import
┌───────────▼───────────┐   ┌─────────▼─────────────────┐
│  DOMAIN LOGIC (lib/)  │   │  EXTERNAL SERVICE         │
│  Pure functions:      │   │  OpenRouter → Gemini      │
│  guardrail engine,    │   │  (called from lib/ and    │
│  storage, types,      │   │   route.ts, never from    │
│  attack prompt data   │   │   components/)            │
└───────────────────────┘   └───────────────────────────┘
```

**Why this split?**
1. **Security:** The API key only exists in the orchestration + domain layers (server-side). The presentation layer never touches it.
2. **Testability:** `lib/guardrails/index.ts` is a pure function — you could unit-test it without a browser or a running server.
3. **Swappability:** Want to change the judge model? Edit `lib/guardrails/index.ts`. Want to change the UI? Edit `components/`. They don't know about each other's internals.

---

## File-by-file: why each exists

### `app/api/chat/route.ts` — the orchestrator

**What it does:** Receives `{ message, history, guardrailStates, systemPrompt }` from the browser. Runs the 3-step pipeline:
1. Input guardrails (`runGuardrails(message, "input", ...)`)
2. Main Gemini call
3. Output guardrails (`runGuardrails(reply, "output", ...)`)

**Why it's a route file:** Next.js convention — any `route.ts` inside `app/api/*/` becomes an HTTP endpoint automatically. `app/api/chat/route.ts` → `POST /api/chat`. No manual routing table.

**Why `export const runtime = "nodejs"`:** Explicitly tells Next.js to run this on Node.js, not edge runtimes (which lack some Node APIs and have different env var behavior).

### `app/page.tsx` — the composer

**What it does:** Loads config (from URL param or localStorage), holds `systemPrompt` and `guardrailStates` as React state, and renders `<PromptSidebar>` + `<ChatInterface>` + `<ShareModal>`.

**Why it's separate from the components:** It's the **state owner**. The sidebar *edits* guardrail states; the chat *consumes* them for API calls; the modal *serializes* them into a URL. `page.tsx` is the single source of truth they all share.

### `components/PromptSidebar.tsx` + `components/GuardrailToggle.tsx` — the config UI

**Split into two files because they have different jobs:**
- `PromptSidebar` = layout, header ("1/5 active" counter), share button, system prompt textarea, and it **maps over** the 5 guardrails rendering one `GuardrailToggle` each
- `GuardrailToggle` = the expandable row for ONE guardrail (name input, phase buttons, judge prompt textarea, enable switch)

**Why split?** `GuardrailToggle` manages its own local `expanded` state (open/closed arrow) — that's private to the row. The sidebar doesn't need to know whether a particular row is expanded.

### `components/ChatInterface.tsx` + `components/MessageBubble.tsx` — the conversation

- `ChatInterface` = the whole chat panel: header, message list, typing indicator, input box, error banner, and the `send()` function that POSTs to `/api/chat`
- `MessageBubble` = ONE message: the bubble itself (user vs assistant styling, markdown rendering for assistant) plus the guardrail badges underneath

**Why split?** Message rendering (especially the markdown component mapping in `MessageBubble.tsx:79-149`) is 80 lines of styling detail that has nothing to do with chat send/receive logic.

### `components/AttackPromptsPanel.tsx` — the adversarial library UI

**What it does:** Right-side sliding drawer. Category filter tabs (All / Domain Bypass / Prompt Injection / Jailbreak / Edge Cases), difficulty legend, and 19 prompt cards. Click "Use this" → pastes into chat input via callback.

**Why it's a separate component:** It's a **product feature** (the teaching tool) layered on top of the chat. It could be removed entirely and the guardrail system would still work — that's a good sign of separation.

### `components/ShareModal.tsx` — the sharing UI

**What it does:** Encodes current config to Base64, builds the share URL, shows a QR code (via external qrserver.com API), copies to clipboard, and offers "Editable" vs "View Only" (locked) mode.

### `lib/guardrails/aiGuardrails.ts` — the slot definitions

**What it does:** Exports `BUILT_IN_GUARDRAILS` — an array of 5 objects with just `{ id, label, description, phase, defaultEnabled, defaultJudgePrompt }`. All labels are placeholders ("Guardrail 1"), all prompts empty, all disabled.

**Why a separate file from `index.ts`?** Separation of **data** from **logic**. `aiGuardrails.ts` says "there are 5 slots." `index.ts` says "here's how to evaluate them." If you wanted to ship a version with pre-filled guardrails (e.g., for a non-workshop deployment), you'd only edit `aiGuardrails.ts` and `storage.ts` — the engine wouldn't change.

### `lib/guardrails/index.ts` — the judge engine (most important file)

**What it does — 3 functions:**
1. `buildCombinedPrompt(active, systemPrompt)` — concatenates all active policies into one judge system prompt with strict JSON instructions
2. `parseVerdicts(raw, active)` — strips code fences, parses JSON, maps to `GuardrailResult[]`, handles parse failures (fail-open)
3. `runGuardrails(text, phase, states, systemPrompt)` — the public API. Filters guards by phase+enabled+non-empty-prompt, batches them into one OpenAI call, returns `{ results, blocked, blockedBy }`

**Why this is the domain layer:** It has zero React, zero Next.js, zero DOM. It's a pure function from `(text, phase, states, systemPrompt)` → verdicts. That makes it the most testable and reusable piece.

### `lib/attackPrompts.ts` — the adversarial data

**What it does:** Exports `ATTACK_PROMPTS` (19 objects with id, label, prompt, category, difficulty, tip), `CATEGORIES` (display metadata + colors), `DIFFICULTY_COLOR` (green/yellow/red).

**Why it's data, not a component?** Separation of **content** from **presentation**. A designer could restyle `AttackPromptsPanel.tsx` without touching the attack content. A security researcher could add attack #20 without touching any UI code.

### `lib/storage.ts` — persistence + sharing

**What it does:**
- `saveSystemPrompt` / `loadSystemPrompt` — localStorage wrapper
- `saveGuardrailStates` / `loadGuardrailStates` — with migration logic (new slots added to `BUILT_IN_GUARDRAILS` get defaults)
- `defaultGuardrailStates()` — generates fresh disabled states for all 5 slots
- `encodeConfig` / `decodeConfig` — Base64 URL packing/unpacking with UTF-8 safety

**Why one file?** These are all "where does config live" concerns. Splitting them would scatter related logic.

### `lib/types.ts` — the shared contracts

**What it does:** Defines `GuardrailResult`, `GuardrailState`, `Guardrail`, `ChatMessage`, `ChatRequestBody`, `ChatResponseBody`.

**Why it's its own file, in `lib/` not `app/` or `components/`?** Because **both** the client (components) and server (route.ts, lib/guardrails) import these types. Putting it in `lib/` (which has no framework dependencies) keeps it framework-neutral.

---

## Why not just one big file?

Hypothetically you *could* put everything in `page.tsx` — it'd be ~1500 lines. Why didn't we?

| Concern | One file | This structure |
|---|---|---|
| API key safety | Easy to accidentally reference in client code | Physically impossible — `components/` never imports `route.ts` |
| Finding code | "Where's the judge prompt builder? *scroll scroll scroll*" | `lib/guardrails/index.ts`, obviously |
| Reuse | Copy-paste to reuse | Import the component/function |
| Team work | Merge conflicts on one file | Two people edit different files |
| Testing | Must render whole app to test guardrail logic | Import `runGuardrails` directly in a unit test |
| Deleting features | Delete 200 lines carefully | Delete a component file, fix imports |

---

## The dependency graph (who imports whom)

```
app/page.tsx
  ├── lib/storage.ts (load/save config)
  ├── lib/types.ts (GuardrailState)
  ├── components/PromptSidebar.tsx
  │     ├── lib/guardrails/aiGuardrails.ts (slot list for rendering)
  │     ├── lib/storage.ts (DEFAULT_SYSTEM_PROMPT for Reset button)
  │     └── components/GuardrailToggle.tsx (rendered 5×)
  │           └── lib/types.ts
  ├── components/ChatInterface.tsx
  │     ├── components/MessageBubble.tsx (rendered per message)
  │     │     └── lib/types.ts
  │     ├── components/AttackPromptsPanel.tsx
  │     │     └── lib/attackPrompts.ts
  │     └── lib/types.ts (ChatRequestBody/Response)
  └── components/ShareModal.tsx
        └── lib/storage.ts (encodeConfig)

app/api/chat/route.ts          ← server-side only
  ├── lib/guardrails/index.ts (runGuardrails)
  │     ├── lib/guardrails/aiGuardrails.ts (BUILT_IN_GUARDRAILS)
  │     ├── lib/types.ts
  │     └── openai SDK → OpenRouter
  ├── lib/types.ts
  └── openai SDK → OpenRouter (main model call)
```

**Key observation:** `components/` never imports from `app/api/`. The client only talks to the server via `fetch("/api/chat")` — an HTTP boundary. That boundary is what keeps the API key secret.

---

## Why `lib/guardrails/` is a folder, not a single file

Could `index.ts` and `aiGuardrails.ts` be merged? Yes. Why keep them separate?

1. **Data vs logic** — `aiGuardrails.ts` is pure data (the 5 slots). `index.ts` is pure behavior (evaluation). Different reasons to change.
2. **Pre-fill scenario** — imagine a "production mode" where guardrails ship pre-configured for a healthcare bot. You'd replace `aiGuardrails.ts` with real policies; `index.ts` wouldn't change.
3. **Scaling signal** — if the project grew (per-tenant guardrail templates, guardrail versioning, import/export), this folder is where that code naturally lands.

---

## Why the root-level files are minimal

- `next.config.ts` — empty config, ready for future additions (headers, redirects, image domains)
- `tsconfig.json` — notable for the `@/*` path alias (so imports look like `@/lib/types` instead of `../../../lib/types`)
- `postcss.config.mjs` — enables Tailwind's build step
- `.env.local` — git-ignored secrets (your OpenRouter key). The `.gitignore` has `.env*` so this never gets committed

**The pattern:** root files configure the *build toolchain*. Folder files implement the *application*. Clean line between "how it compiles" and "what it does."

---

## If you were adding a feature, where would it go?

| Feature | Files touched |
|---|---|
| New guardrail slot #6 | `lib/guardrails/aiGuardrails.ts` (add slot) — done, UI auto-renders |
| Audit log panel (see all past verdicts) | New `components/AuditLog.tsx`, maybe new `lib/auditLog.ts`, wire into `page.tsx` |
| Evaluation metrics (run attack suite, compute detection rate) | New `lib/evaluate.ts` importing `attackPrompts.ts` + `guardrails/index.ts`, plus a results UI component |
| Streaming replies (tokens appear live) | `route.ts` (switch to streaming response), `ChatInterface.tsx` (read stream) |
| Second judge model (ensemble voting) | `lib/guardrails/index.ts` (add a second `client.chat.completions.create` call + merge verdicts) |

Notice: almost never does a feature require touching *all* layers. That's the payoff of the structure.

Next: [05-how-it-all-connects.md](./05-how-it-all-connects.md) — watch one message travel the full pipeline.
