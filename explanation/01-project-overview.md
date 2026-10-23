# 01 — Project Overview: What This Is and Why It Exists

## In one sentence

An interactive web app where you design, test, and share **LLM guardrails** — safety policies that check both what users say to an AI and what the AI says back, blocking violations before they cause damage.

## The problem, in your POV

Imagine your company just launched a travel-advisor chatbot powered by Gemini. Day 1, it works great. Day 2, three things go wrong simultaneously:

1. **A competitor** figures out they can use your bot as a free general-purpose assistant: "Write me a Python script." You're paying for their compute.
2. **A teenager** discovers "Ignore your previous instructions" makes your carefully-tuned travel bot explain how to hotwire cars. Screenshot goes viral. Your brand takes the hit.
3. **A legitimate customer** lands in Bangkok with a fever and asks your bot what medicine to take. Your helpful bot answers. Now your company is on the hook for medical advice from a travel app.

None of these are "the model is dumb" problems. They're **policy enforcement** problems. And you can't fix them by tweaking the system prompt, because:

- The system prompt is a *suggestion* to the same brain being manipulated
- You can't retrain Gemini (you don't own it)
- Keyword filters ("block the word 'hotwire'") die to leetspeak, French, and synonyms

## The solution this project demonstrates

**LLM-as-a-Judge guardrails.** Instead of hoping the main model behaves, you add a *second, independent* LLM call whose only job is classification:

> "Here's a policy in plain English. Here's the message. Reply PASS, BLOCK: reason, or WARN: reason."

Run that check **before** the main model sees the user's message (input guard), and **again** after the main model writes its reply (output guard). Any BLOCK kills the message at that checkpoint.

This is not theoretical — it's the pattern behind Guardrails AI, NeMo Guardrails, Llama Guard, AWS Bedrock Guardrails, and every "AI safety layer" startup right now. This project is a from-scratch, hand-built version you can actually open and read.

## What the user (you) does in the app

1. **Writes a system prompt** — defines the AI's identity (e.g. travel advisor)
2. **Configures up to 5 guardrails** — each gets a name, a phase (INPUT/OUTPUT/both), and a judge prompt written in plain English
3. **Toggles them on** — sidebar shows "X/5 active"
4. **Tests live** — types real messages, or loads pre-built attack prompts (injection, jailbreak, edge cases)
5. **Reads verdicts** — blocked messages show a red `BLOCKED` badge with the judge's reason in the tooltip
6. **Shares the config** — a URL encodes the whole setup (system prompt + guardrail states) so teammates can load it, editable or view-only

## What makes this different from "just put rules in the system prompt"

| Approach | Weakness |
|---|---|
| Rules in system prompt | Same model is player AND referee — attackers manipulate the player |
| Keyword/regex filters | Semantic attacks (grandma exploit, multilingual, leetspeak) slip through |
| **LLM-as-judge (this project)** | Independent referee that reads *intent*, not keywords. Costs one extra API call. |

The referee never plays the game. That's the entire insight.

## Scope: what this project is NOT

- Not a production safety product (fails open on judge errors, no audit logging UI, no metrics)
- Not an ML training project (no models trained, no embeddings, no fine-tuning)
- Not an agent framework (linear pipeline, no tool-calling loops)

It **is** a teaching instrument for the guardrail pattern — minimal code, maximum concept density. Every file exists to illustrate one idea clearly.

## The tech in one line each

- **Next.js 16** — the web framework (UI + API routes in one project)
- **React 19 + TypeScript** — the UI layer, typed for safety
- **OpenRouter** — a gateway to many LLMs (we use it to reach Gemini)
- **OpenAI SDK** — the client library for calling LLM APIs (works with OpenRouter too)
- **Google Gemini (via OpenRouter)** — plays TWO roles: the main assistant AND the judge
- **Tailwind CSS** — styling (mostly overridden by inline styles in this repo)
- **localStorage** — saves your config in the browser so it survives refreshes
- **Base64 URL encoding** — lets you share your entire config as a URL parameter

Jump to [02-tech-stack-explained.md](./02-tech-stack-explained.md) for the deep dive on each.
