export const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
export const DEFAULT_MODEL = "google/gemini-3.6-flash";

export type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

export function gatewayHeaders(key: string) {
  return {
    "Content-Type": "application/json",
    "Lovable-API-Key": key,
  };
}

export function gatewayErrorMessage(status: number, body: string) {
  if (status === 429) return "Nexora is handling a lot of requests right now. Please retry in a moment.";
  if (status === 402) return "AI credits for this workspace are exhausted. Add credits to keep using Nexora.";
  if (status === 403) return "AI access is blocked for this workspace.";
  return `AI request failed (${status}). ${body.slice(0, 200)}`;
}

/** Non-streaming completion used by the tool runner. */
export async function complete(messages: ChatMsg[], model = DEFAULT_MODEL) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured on the server.");

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: gatewayHeaders(key),
    body: JSON.stringify({ model, messages, stream: false }),
  });

  if (!res.ok) {
    throw new Error(gatewayErrorMessage(res.status, await res.text()));
  }

  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return json.choices?.[0]?.message?.content ?? "";
}
