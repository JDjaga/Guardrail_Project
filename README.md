<div align="center">

# 🛡️ AegisLLM

### An interactive LLM-as-judge guardrails playground

**Design, test, and share AI safety policies — defend your LLM against prompt injection, jailbreaks, and adversarial attacks.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Node](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![OpenRouter](https://img.shields.io/badge/Models-via%20OpenRouter-6366F1)](https://openrouter.ai)

**Built by [S.D.Jagadiish](https://github.com/sd-jagadiish)**

</div>

---

## 📖 What is AegisLLM?

AegisLLM is a hands-on teaching tool for building **LLM guardrails** — the safety layer that sits around an AI model and checks every message going *in* and every response going *out*.

Instead of writing keyword filters or hoping the model "behaves," AegisLLM demonstrates the **LLM-as-a-Judge** pattern: a second, independent LLM call evaluates each message against plain-English policies and returns a structured verdict — `PASS`, `BLOCK: reason`, or `WARN: reason`.

It ships with a built-in **adversarial test library** (prompt injection, jailbreaks, domain bypass, edge cases) so you can pressure-test your policies the way real attackers would.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎛️ **5 configurable guardrail slots** | Name each guard, pick its phase (INPUT / OUTPUT / both), write a plain-English judge prompt |
| 🚪 **Dual-phase interception** | INPUT guards screen user messages before they reach the model; OUTPUT guards screen the model's reply before the user sees it |
| ⚡ **Batched policy evaluation** | All active guards in a phase are evaluated in a **single** LLM call — fewer API calls, lower latency |
| 🧪 **19-prompt adversarial library** | Curated attacks across 4 categories × 3 difficulties, each with an educational tip |
| 🔗 **Shareable config URLs** | Encode your entire guardrail setup into a URL — editable or view-only, no backend needed |
| 💾 **Browser persistence** | Your config survives page refreshes via localStorage |
| 🎯 **Deterministic judging** | Judge calls run at `temperature: 0` for consistent verdicts |
| 🎨 **Dark, keyboard-friendly UI** | Built with Next.js 16 + React 19, styled with CSS custom properties |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+**
- A free **OpenRouter API key** → [get one here](https://openrouter.ai) (no credit card required)

### 1. Clone & install

```bash
git clone https://github.com/sd-jagadiish/aegis-llm.git
cd aegis-llm
npm install
```

### 2. Configure your API key

Create a `.env.local` file in the project root:

```bash
OPENROUTER_API_KEY=your_key_here
```

> ⚠️ **Windows + PowerShell users:** make sure the file is saved as **UTF-8 or ASCII** (not UTF-16). PowerShell's `>` operator defaults to UTF-16, which silently breaks dotenv parsing. Use:
> ```powershell
> Set-Content -Path .env.local -Value "OPENROUTER_API_KEY=your_key_here" -Encoding Ascii -NoNewline
> ```

### 3. Run the dev server

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)**.

---

## 🕹️ How to Use

1. **Write a system prompt** — define your AI assistant's identity (e.g., travel advisor)
2. **Configure a guardrail** — click ▼ on any slot, give it a name, set the phase, write a judge prompt
3. **Toggle it ON** — the sidebar shows "X/5 active"
4. **Test live** — type messages in the chat, or load pre-built attack prompts from the red **Attack Prompts** button
5. **Read verdicts** — blocked messages show a red `BLOCKED` badge with the judge's reason on hover
6. **Share** — click the share icon to generate a config URL (editable or view-only)

---

## 🏗️ How It Works

```
User message
   ↓
[INPUT guardrails]  → BLOCK? → stop, model never called
   ↓
LLM generates reply (uses your system prompt)
   ↓
[OUTPUT guardrails] → BLOCK? → reply replaced with "[Response blocked]"
   ↓
Reply shown to user
```

Each guardrail is an **LLM classification call**. All active guards in the same phase are combined into a single prompt that returns a JSON verdict per guard:

```json
{
  "guard1": { "verdict": "PASS", "reason": "" },
  "guard2": { "verdict": "BLOCK", "reason": "Attempts to override system instructions" }
}
```

If any guard returns `BLOCK`, the message is stopped at that checkpoint. This is the **LLM-as-a-Judge** pattern — the same architecture behind Guardrails AI, NeMo Guardrails, Llama Guard, and AWS Bedrock Guardrails.

---

## 📂 Project Structure

```
aegis-llm/
├── app/                          # Next.js App Router: pages + API routes
│   ├── api/chat/route.ts         # Backend endpoint — runs guardrails + LLM
│   ├── layout.tsx                # HTML shell + metadata
│   └── page.tsx                  # Main UI — state owner, wires components
├── components/                   # Reusable React UI
│   ├── AttackPromptsPanel.tsx    # Adversarial prompt library drawer
│   ├── ChatInterface.tsx         # Chat window + send logic
│   ├── GuardrailToggle.tsx       # One guardrail row (name/phase/prompt/switch)
│   ├── MessageBubble.tsx         # Chat bubble + BLOCKED/WARN badges
│   ├── PromptSidebar.tsx         # Left panel: system prompt + guardrail list
│   └── ShareModal.tsx            # Share-as-URL dialog
├── lib/                          # Pure logic (no UI)
│   ├── guardrails/
│   │   ├── aiGuardrails.ts       # 5 slot definitions
│   │   └── index.ts              # Judge engine: build prompt, call LLM, parse verdicts
│   ├── attackPrompts.ts          # 19 attack prompts + categories + difficulty
│   ├── storage.ts                # localStorage + Base64 URL encode/decode
│   └── types.ts                  # Shared TypeScript contracts
├── explanation/                  # 📚 Detailed concept explanations (7 docs)
├── public/                       # Static assets
├── .env.local                    # Your API key (git-ignored)
├── LICENSE                       # MIT — © S.D.Jagadiish
└── README.md
```

---

## 📚 Deep-Dive Explanations

New to LLM guardrails? The [`explanation/`](./explanation/) folder contains 7 detailed documents walking through every concept, technology, and design decision:

| Doc | Topic |
|---|---|
| [01 — Project Overview](./explanation/01-project-overview.md) | What it is, the problem it solves, scope |
| [02 — Tech Stack](./explanation/02-tech-stack-explained.md) | Every technology: what, why, how it's used |
| [03 — AI/LLM Concepts](./explanation/03-ai-llm-concepts.md) | LLM-as-judge, injection, jailbreaks, structured output, determinism |
| [04 — Project Structure](./explanation/04-project-structure.md) | Why folders are arranged this way + dependency graph |
| [05 — How It All Connects](./explanation/05-how-it-all-connects.md) | One message's full journey through the pipeline |
| [06 — Real-Time Scenarios](./explanation/06-realtime-scenarios.md) | 8 attack/defense walkthroughs you can run live |

---

## 🧠 Concepts Demonstrated

- **LLM-as-a-Judge** — a second LLM classifies text against natural-language policies
- **Guardrails (input + output)** — dual-phase interception the model can't argue with
- **Prompt injection defense** — catching instruction-override and system-prompt-theft attempts
- **Jailbreak resistance** — evaluating intent through fiction, emotion, and roleplay framing
- **Structured LLM output** — strict JSON verdicts as an API contract
- **Deterministic classification** — `temperature: 0` for consistent guardrail verdicts
- **Batched multi-policy evaluation** — multiple guards in one API call
- **Model routing** — OpenRouter gateway, swappable models
- **Adversarial testing / red-teaming** — systematic attack evaluation
- **Defense in depth** — layered independent checks

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + TypeScript 5 |
| Styling | CSS custom properties + Tailwind |
| LLM Gateway | OpenRouter |
| Models | Gemini Flash / free tier models (swappable) |
| LLM Client | OpenAI SDK |
| Persistence | localStorage + Base64 URL encoding |
| Runtime | Node.js |

---

## 🤝 Contributing

Contributions are welcome! Ideas:

- Add more attack prompts to `lib/attackPrompts.ts`
- Add evaluation metrics (precision/recall on the attack suite)
- Add an audit log panel for past verdicts
- Add streaming responses
- Add ensemble judging (multiple judge models)

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

**Copyright © 2026 [S.D.Jagadiish](https://github.com/sd-jagadiish)**

---

<div align="center">

**Built with ❤️ by [S.D.Jagadiish](https://github.com/sd-jagadiish)**

⭐ Star this repo if it helped you learn about LLM guardrails!

</div>
