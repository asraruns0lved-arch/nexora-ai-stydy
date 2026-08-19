import { GoogleGenAI } from "@google/genai";

export const DEFAULT_MODEL = "gemini-3.6-flash";

export type ChatMsg = {
  role: "system" | "user" | "assistant";
  content: string;
};

function getAI() {
  const key = process.env["GEMINI_API_KEY"];

  if (!key) {
    throw new Error("Gemini AI is not configured on the server.");
  }

  return new GoogleGenAI({ apiKey: key });
}

export async function complete(
  messages: ChatMsg[],
  model = DEFAULT_MODEL,
) {
  const ai = getAI();

  const systemMessage = messages.find(
    (message) => message.role === "system",
  );

  const userMessages = messages
    .filter((message) => message.role !== "system")
    .map((message) => message.content)
    .join("\n\n");

 const response = await ai.models.generateContent({
  model: model,
  contents: userMessages,
  ...(systemMessage
    ? {
        config: {
          systemInstruction: systemMessage.content,
        },
      }
    : {}),
});

  return response.text ?? "";
}