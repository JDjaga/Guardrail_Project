import { NextRequest } from "next/server";
import OpenAI from "openai";
import { runGuardrails } from "@/lib/guardrails";
import type { ChatRequestBody, ChatResponseBody } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<Response> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    const body: ChatResponseBody = {
      reply: null,
      inputGuardrailResults: [],
      outputGuardrailResults: [],
      blocked: false,
      error: "OPENROUTER_API_KEY is not configured.",
    };
    return Response.json(body, { status: 500 });
  }

  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    const res: ChatResponseBody = {
      reply: null,
      inputGuardrailResults: [],
      outputGuardrailResults: [],
      blocked: false,
      error: "Invalid request body.",
    };
    return Response.json(res, { status: 400 });
  }

  const { message, history, guardrailStates, systemPrompt } = body;

  if (!message || typeof message !== "string") {
    const res: ChatResponseBody = {
      reply: null,
      inputGuardrailResults: [],
      outputGuardrailResults: [],
      blocked: false,
      error: "Message is required.",
    };
    return Response.json(res, { status: 400 });
  }

  // 1. Run input guardrails in parallel
  const inputCheck = await runGuardrails(
    message,
    "input",
    guardrailStates ?? [],
    systemPrompt ?? ""
  );

  if (inputCheck.blocked) {
    const res: ChatResponseBody = {
      reply: null,
      inputGuardrailResults: inputCheck.results,
      outputGuardrailResults: [],
      blocked: true,
      blockedBy: inputCheck.blockedBy,
    };
    return Response.json(res);
  }

  // 2. Call main model via OpenRouter
  let reply: string;
  try {
    const client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey,
    });

    const trimmedHistory = (history ?? []).slice(-20);

    const completion = await client.chat.completions.create({
      model: "openrouter/free",
      max_tokens: 1024,
      messages: [
        { role: "system", content: systemPrompt || "You are a helpful assistant." },
        ...trimmedHistory,
        { role: "user", content: message },
      ],
    });

    reply = completion.choices[0]?.message?.content ?? "No response from model.";
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    const res: ChatResponseBody = {
      reply: null,
      inputGuardrailResults: inputCheck.results,
      outputGuardrailResults: [],
      blocked: false,
      error: `Model error: ${msg}`,
    };
    return Response.json(res, { status: 502 });
  }

  // 3. Run output guardrails in parallel
  const outputCheck = await runGuardrails(
    reply,
    "output",
    guardrailStates ?? [],
    systemPrompt ?? ""
  );

  if (outputCheck.blocked) {
    const res: ChatResponseBody = {
      reply: "[Response blocked by output guardrail]",
      inputGuardrailResults: inputCheck.results,
      outputGuardrailResults: outputCheck.results,
      blocked: true,
      blockedBy: outputCheck.blockedBy,
    };
    return Response.json(res);
  }

  const res: ChatResponseBody = {
    reply,
    inputGuardrailResults: inputCheck.results,
    outputGuardrailResults: outputCheck.results,
    blocked: false,
  };
  return Response.json(res);
}
