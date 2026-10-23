# Project Explanation — AegisLLM (from a learner's POV)

This folder breaks down **every technology, AI concept, and design decision** in **AegisLLM** — explained the way you'd explain it to yourself while building it, with real-time examples from the travel-advisor setup we tested live.

**Author:** S.D.Jagadiish · **License:** MIT

## Read in this order

| File | What it answers |
|---|---|
| [01-project-overview.md](./01-project-overview.md) | What is this project, what problem does it solve, who cares? |
| [02-tech-stack-explained.md](./02-tech-stack-explained.md) | Every technology used — what it is, why it's here, how this project uses it |
| [03-ai-llm-concepts.md](./03-ai-llm-concepts.md) | The AI/ML/LLM concepts — LLM-as-judge, guardrails, prompt injection, structured output, etc. |
| [04-project-structure.md](./04-project-structure.md) | Why the folders and files are arranged this way — and how they depend on each other |
| [05-how-it-all-connects.md](./05-how-it-all-connects.md) | The full journey of one message through the system, and how every concept links together |
| [06-realtime-scenarios.md](./06-realtime-scenarios.md) | Detailed real-world walkthroughs — attacks, defenses, and tradeoffs, in your POV |

## The one-paragraph summary

You're building a travel-advisor chatbot. Anyone can type a message. Your job is to make sure only *travel questions* reach the AI model, and only *safe, on-policy answers* reach the human. You do this not by hardcoding keywords, but by giving a **second AI (the "judge")** a plain-English policy and letting it classify every message as PASS / BLOCK / WARN. That's the whole trick — everything else in the repo exists to support, test, or deliver that trick.
