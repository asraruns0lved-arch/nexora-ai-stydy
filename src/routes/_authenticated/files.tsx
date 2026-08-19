import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Download, FileText, Loader2, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

const BUCKET = "nexora-uploads";
const MAX_BYTES = 20 * 1024 * 1024;

export const Route = createFileRoute("/_authenticated/files")({
  head: () => ({
    meta: [
      { title: "Files — Nexora" },
      { name: "description", content: "Upload and manage your lecture notes, PDFs and study material securely in Nexora." },
      { property: "og:title", content: "Nexora Files" },
      { property: "og:description", content: "Your private study library." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FilesPage,
});

function FilesPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const queryClient = useQueryClient();

  const files = useQuery({
    queryKey: ["uploads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("uploads")
        .select("id, name, path, size, mime_type, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const upload = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;
    if (file.size > MAX_BYTES) {
      toast.error("Files must be under 20MB.");
      return;
    }
    setBusy(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) throw new Error("Session expired");

      const path = `${userId}/${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file);
      if (uploadError) throw uploadError;

      const { error } = await supabase.from("uploads").insert({
        user_id: userId,
        name: file.name,
        path,
        size: file.size,
        mime_type: file.type,
      });
      if (error) throw error;

      toast.success("File uploaded");
      void queryClient.invalidateQueries({ queryKey: ["uploads"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const download = async (path: string) => {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60);
    if (error || !data) {
      toast.error("Could not open file");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener");
  };

  const remove = async (id: string, path: string) => {
    await supabase.storage.from(BUCKET).remove([path]);
    await supabase.from("uploads").delete().eq("id", id);
    void queryClient.invalidateQueries({ queryKey: ["uploads"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
  };

  return (
    <div className="space-y-8">
      <header className="animate-rise">
        <h1 className="text-3xl font-semibold sm:text-4xl">
          Your <span className="text-gradient">Files</span>
        </h1>
        <p className="mt-2 text-muted-foreground">Private storage for notes, slides and readings.</p>
      </header>

      <button
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void upload(e.dataTransfer.files);
        }}
        className="glass glass-hover flex w-full flex-col items-center justify-center gap-3 rounded-3xl border-dashed py-14 text-sm text-muted-foreground"
      >
        {busy ? <Loader2 className="size-6 animate-spin text-primary" /> : <UploadCloud className="size-6 text-primary" />}
        <span>{busy ? "Uploading…" : "Drop a file here, or click to browse"}</span>
        <span className="text-xs text-muted-foreground/70">Up to 20MB per file</span>
      </button>
      <input ref={inputRef} type="file" className="hidden" onChange={(e) => void upload(e.target.files)} />

      {files.data && files.data.length > 0 ? (
        <ul className="glass divide-y divide-border overflow-hidden rounded-2xl">
          {files.data.map((f) => (
            <li key={f.id} className="flex items-center gap-4 px-5 py-4">
              <FileText className="size-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{f.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(Number(f.size) / 1024).toFixed(0)} KB · {new Date(f.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                aria-label="Download"
                onClick={() => void download(f.path)}
                className="rounded-lg p-2 text-muted-foreground hover:text-foreground"
              >
                <Download className="size-4" />
              </button>
              <button
                aria-label="Delete"
                onClick={() => void remove(f.id, f.path)}
                className="rounded-lg p-2 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="glass rounded-2xl px-5 py-10 text-center text-sm text-muted-foreground">
          No files yet.
        </div>
      )}
    </div>
  );
}
