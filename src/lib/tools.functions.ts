import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const RunToolInput = z.object({
  toolKey: z.string().min(1).max(64),
  system: z.string().min(1).max(4000),
  prompt: z.string().min(1).max(20000),
  save: z.boolean().optional(),
  title: z.string().max(200).optional(),
});

export const runTool = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => RunToolInput.parse(input))
  .handler(async ({ data, context }) => {
    const { complete } = await import("@/lib/ai.server");

    const output = await complete([
      { role: "system", content: data.system },
      { role: "user", content: data.prompt },
    ]);

    if (data.save !== false) {
      await context.supabase.from("tool_runs").insert({
        user_id: context.userId,
        tool_key: data.toolKey,
        title: (data.title ?? data.prompt).slice(0, 120),
        input: { prompt: data.prompt },
        output,
      });
    }

    return { output };
  });
