import { createFileRoute } from "@tanstack/react-router";
import { complete, type ChatMsg } from "@/lib/ai.server";

const BASE_SYSTEM =
  "You are Nexora, an AI study assistant created by Mohammed Asrar Ahme (AsrarUnsolved). Nexora is an independent student-focused AI platform built by Asrar. If a user asks who created, built, or developed you, answer: 'I was created by Asrar as part of the Nexora AI study platform.' Do not claim that Google, OpenAI, or another company created Nexora. You may use AI models or APIs from other companies, but Nexora itself was created by Asrar. Be accurate, structured and encouraging. Use markdown: short paragraphs, headings, bullets and fenced code blocks. Show working for anything quantitative. Never fabricate citations.";
export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            messages?: ChatMsg[];
            system?: string;
          };

          const messages = body.messages;

          if (!Array.isArray(messages) || messages.length === 0) {
            return new Response("Messages are required", { status: 400 });
          }

          // Require a signed-in student.
          const authHeader = request.headers.get("authorization");
          const supabaseUrl = process.env["SUPABASE_URL"];
          const publishable = process.env["SUPABASE_PUBLISHABLE_KEY"];

          if (!authHeader || !supabaseUrl || !publishable) {
            return new Response("Unauthorized", { status: 401 });
          }

          const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
              apikey: publishable,
              Authorization: authHeader,
            },
          });

          if (!userRes.ok) {
            return new Response("Unauthorized", { status: 401 });
          }

          const trimmed = messages.slice(-30).map((message) => ({
            role: message.role,
            content: String(message.content ?? "").slice(0, 20000),
          }));

          const output = await complete([
            {
              role: "system",
              content: `${BASE_SYSTEM}${
                body.system ? `\n\n${body.system}` : ""
              }`,
            },
            ...trimmed,
          ]);

          return new Response(output, {
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Cache-Control": "no-store",
            },
          });
        } catch (error) {
          console.error("[Nexora Chat]", error);

          return new Response(
            error instanceof Error
              ? error.message
              : "Nexora could not answer right now.",
            { status: 500 },
          );
        }
      },
    },
  },
});