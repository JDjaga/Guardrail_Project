# 02 — Tech Stack: Every Technology Explained

Each section: **What it is → Why this project needs it → How it's actually used here.**

---

## 1. Next.js 16.2.4 (React Framework)

**What it is:** A full-stack React framework by Vercel. Gives you two things plain React doesn't: (a) **API routes** — backend endpoints living inside the same project, and (b) **server-side execution** — code that runs on a machine you control, never shipped to the browser.

**Why here:** This project needs a backend. The OpenRouter API key must **never** reach the browser (anyone could steal it and run up your bill). Next.js API routes let us keep the key server-side (`process.env.OPENROUTER_API_KEY`) while the browser just calls `/api/chat`.

**How it's used:**
- `app/page.tsx` — the main UI page (client component)
- `app/api/chat/route.ts` — the backend endpoint. The browser POSTs to this; it calls OpenRouter, runs guardrails, returns the verdict
- `app/layout.tsx` — the HTML shell (imports global CSS)

**Real-time analogy:** Next.js is the restaurant building. The dining room (React UI) is where customers sit. The kitchen (API route) is where the secret recipes live. Customers never walk into the kitchen — they hand a ticket (fetch request) through a window.

**Note on Next.js 16:** This version has breaking changes from older Next.js (per `AGENTS.md`). Env files load normally (`Environments: .env.local` at startup), but always check `node_modules/next/dist/docs/` before assuming old APIs work.

---

## 2. React 19.2.4

**What it is:** The UI library. Builds interfaces from components that re-render when state changes.

**Why here:** The whole app is interactive — toggles, textareas, chat bubbles, modals. React manages all that state and re-renders efficiently.

**How it's used:**
- `useState` everywhere: `systemPrompt`, `guardrailStates`, `messages`, `input`, `loading`, `error`
- `useEffect` for: loading config on mount, autosaving to localStorage, scrolling chat to bottom, auto-resizing the textarea
- `useRef` for: the chat bottom marker (scroll target) and the textarea DOM node (focus control)
- Client components marked `"use client"` (the interactive ones); the API route stays server-side

**Real-time analogy:** React is the waiter's memory pad. Every time you change a toggle, React knows exactly which parts of the table setting to rearrange — it doesn't rebuild the whole restaurant.

---

## 3. TypeScript 5

**What it is:** JavaScript with type annotations. Catches mistakes at compile time instead of runtime.

**Why here:** This project passes structured objects between client and server (`ChatRequestBody`, `ChatResponseBody`, `GuardrailState`, `GuardrailResult`). Without types, a typo like `severity: "blok"` would silently break the badge logic. With types, the compiler screams.

**How it's used:** `lib/types.ts` defines the contract:

```typescript
GuardrailState  // what the sidebar edits: { id, enabled, label, phase, judgePrompt }
GuardrailResult // what the judge returns: { guardId, severity, triggered, message }
ChatRequestBody // what the browser sends: { message, history, guardrailStates, systemPrompt }
ChatResponseBody// what the server returns: { reply, inputGuardrailResults, outputGuardrailResults, blocked }
```

Both sides of the wire agree on these shapes. Change one, and every usage lights up in the editor.

**Real-time analogy:** TypeScript is the wiring diagram for the restaurant's plumbing. If a plumber tries to connect a hot-water pipe to the gas line, the diagram (compiler) stops them before water floods the kitchen.

---

## 4. Tailwind CSS 4 (+ inline styles)

**What it is:** A utility-first CSS framework (classes like `flex`, `p-4`).

**Why here (partially):** It's in `package.json` and `postcss.config.mjs`, so it's available. But this specific project mostly uses **inline `style={{}}` objects** instead of Tailwind classes — you can see this in every component (`PromptSidebar.tsx`, `ChatInterface.tsx`, etc.).

**Why inline styles?** This project uses **CSS custom properties** (variables) heavily: `var(--bg-panel)`, `var(--border)`, `var(--block-text)`. These are defined in the global stylesheet (imported via `app/layout.tsx`). Inline styles referencing these variables keep the theming centralized — change one variable, the whole app restyles.

**Real-time analogy:** Tailwind is a box of pre-mixed paint chips. This project mostly mixes custom colors on the fly (inline styles) but keeps the base palette (CSS variables) in one place so everything matches.

---

## 5. OpenRouter (openrouter.ai)

**What it is:** A unified **gateway** to 300+ LLMs from different providers (Google, OpenAI, Anthropic, Meta, etc.) behind one API and one API key.

**Why here:**
- One key, many models — swap `model: "openrouter/free"` to `model: "google/gemini-2.5-flash-lite"` with a one-line change
- The original hardcoded model (`google/gemini-2.0-flash-001`) got deprecated — OpenRouter told us via HTTP 404. With a gateway, fixing that is a config change, not a rewrite
- Free tier available (`:free` suffix models) — critical for learning without a credit card

**How it's used:** Both the main model call AND the judge call go through OpenRouter (`route.ts:72-74`, `index.ts:96-98`), sharing the same `OPENROUTER_API_KEY`.

**Real-time analogy:** OpenRouter is a food court. Instead of opening accounts with 10 restaurants (Google, OpenAI, Anthropic...), you get one meal card that works at all of them. If one restaurant closes its menu item (gemini-2.0-flash-001), you order something else from the same card.

---

## 6. OpenAI Node SDK (`openai` package)

**What it is:** The official client library for OpenAI-compatible APIs. Despite the name, it works with *any* OpenAI-compatible endpoint via the `baseURL` option.

**Why here:** OpenRouter speaks the OpenAI API format. So instead of writing raw `fetch()` calls with URL encoding and headers, we use:

```typescript
const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});
const completion = await client.chat.completions.create({ model, messages, ... });
```

That's identical to how you'd call OpenAI — the SDK handles HTTP, retries, JSON parsing.

**How it's used:** Two places:
- `app/api/chat/route.ts:71-88` — the main assistant call (with history, system prompt)
- `lib/guardrails/index.ts:96-109` — the judge call (temperature 0, short max_tokens, returns JSON)

**Real-time analogy:** The OpenAI SDK is a standardized waiter. It knows how to speak to any OpenAI-format kitchen (OpenAI, OpenRouter, local Ollama, etc.). You just change the restaurant's address (`baseURL`), same waiter, same order form.

---

## 7. Google Gemini 2.0 Flash (via OpenRouter) — now `openrouter/free`

**What it is:** A fast, cheap, capable LLM from Google. In this project it plays **two roles**:

1. **The Assistant** — responds to user travel questions (uses your system prompt)
2. **The Judge** — classifies messages against guardrail policies (temperature 0, JSON output)

**Why here:** Originally hardcoded as `google/gemini-2.0-flash-001` — which was later deprecated on OpenRouter (HTTP 404: "no provider serves this model anymore"). Fixed by swapping to `openrouter/free` (auto-routes to available free models). Alternatives: `google/gemini-2.5-flash-lite` (~$0.000001/call, more stable).

**Key detail:** The judge call uses `temperature: 0` (`index.ts:103`) — this makes the model as deterministic as possible, so the same message classified twice gives the same verdict. Critical for a classifier you're tuning.

**Real-time analogy:** Gemini is a very smart employee who plays two shifts:白天 as the travel consultant (creative, conversational), and 夜间 as the security screener (rigid, rule-following, no creativity). Same brain, two very different jobs — which is why we give the security shift a rulebook (judge prompt) and tell it to be boring (temperature 0).

---

## 8. Node.js Runtime

**What it is:** JavaScript that runs on a server (not in a browser).

**Why here:** Next.js API routes need Node APIs (file system, environment variables, HTTPS calls to OpenRouter). The route explicitly declares `export const runtime = "nodejs"` (`route.ts:6`) so Next.js doesn't try to run it on edge runtimes that lack full Node API access.

**Real-time analogy:** Node.js is the back-office computer system. Browsers are customer-facing kiosks. The kiosk can't hold secrets or make internal phone calls — the back office does that.

---

## 9. localStorage (Browser API)

**What it is:** A browser's built-in key-value store. Data persists across page refreshes and browser restarts (until you clear site data).

**Why here:** Your guardrail config (system prompt, names, phases, judge prompts, enabled flags) should survive a refresh. `lib/storage.ts` handles save/load:

- `ga_system_prompt` — the system prompt string
- `ga_guardrail_states` — JSON array of `GuardrailState`

**Why not a database?** This is a single-user teaching tool. No accounts, no server storage, no sync. localStorage keeps it zero-infrastructure.

**Real-time analogy:** localStorage is your desk drawer at work. Your config stays in the drawer overnight. But it's *your* drawer — a colleague opening the app on their laptop has their own empty drawer (until you share a config URL).

---

## 10. Base64 URL Encoding (Config Sharing)

**What it is:** A way to turn arbitrary data (JSON) into a URL-safe string of letters and numbers.

**Why here:** The share feature (`ShareModal.tsx` + `storage.ts:57-71`) packs your entire config into a URL:

```
http://localhost:3000/?config=eyJzeXN0ZW1Qcm9tcHQiOiJZb3UgYXJlIGEgdHJhdmVsIGFkdmlzb3IuLi4iLCJndWFyZHJhaWxTdGF0ZXMiOlt7ImlkIjoiZ3VhcmQxIiwiZW5hYmxlZCI6dHJ1ZSwibGFiZWwiOiJEb21haW4gR3VhcmQifV19
```

Decode that (the app does it automatically in `decodeConfig`) and you get your full system prompt + guardrail states back. No database, no account system — the URL *is* the storage.

**Why not a database?** Same reason as localStorage — zero infrastructure. The URL is self-contained; anyone can load it.

**Security note:** View-Only mode (`locked: true`) is enforced **client-side only**. A determined person could decode the URL, edit the JSON, re-encode, and share an "editable" version. Fine for a teaching tool; unacceptable for production secrets.

**Real-time analogy:** Base64 URL sharing is like writing your recipe on a postcard in code, mailing it, and the recipient decodes it. The postcard carries everything — no central filing cabinet needed.

---

## Quick reference: which tech solves which problem

| Problem | Solved by |
|---|---|
| UI must be interactive | React 19 |
| API key must stay secret | Next.js API routes (server-side) |
| Need to catch type bugs | TypeScript |
| Call LLMs without provider lock-in | OpenRouter gateway |
| Standardized LLM client | OpenAI SDK with custom `baseURL` |
| Fast, cheap inference | Gemini Flash (or free tier models) |
| Config survives refresh | localStorage |
| Share config without a backend | Base64 URL encoding |
| Server-side JS execution | Node.js runtime |
| Consistent judge verdicts | `temperature: 0` |

Next: [03-ai-llm-concepts.md](./03-ai-llm-concepts.md) — the AI ideas that make this more than just CRUD.
