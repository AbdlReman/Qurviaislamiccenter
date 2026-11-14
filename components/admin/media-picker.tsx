"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { CloudImage, MediaItem } from "@/lib/types";

function toImage(item: MediaItem): CloudImage {
  return {
    url: item.secureUrl,
    publicId: item.publicId,
    width: item.width,
    height: item.height,
    alt: item.alt || item.title || "",
  };
}

export function MediaPicker({
  value,
  onChange,
  label = "Image",
}: {
  value?: CloudImage | null;
  onChange: (image: CloudImage | null) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handle = window.setTimeout(() => {
      void fetch(`/api/admin/media?q=${encodeURIComponent(query)}`)
        .then(async (response) => {
          const body = (await response.json()) as { items?: MediaItem[]; error?: string };
          if (!response.ok) throw new Error(body.error || "Could not load media");
          setItems(body.items || []);
          setError("");
        })
        .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load media"));
    }, 200);
    return () => window.clearTimeout(handle);
  }, [open, query]);

  async function upload(file: File) {
    setUploading(true);
    setError("");
    try {
      const data = new FormData();
      data.set("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body: data });
      const body = (await response.json()) as { item?: MediaItem; error?: string };
      if (!response.ok || !body.item) throw new Error(body.error || "Upload failed");
      setItems((current) => [body.item!, ...current]);
      onChange(toImage(body.item));
      setOpen(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-3">
        {value?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value.url} alt="" className="h-16 w-16 rounded-md object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">None</div>
        )}
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => setOpen(true)}>
            Choose {label}
          </Button>
          {value?.url ? (
            <Button type="button" variant="ghost" onClick={() => onChange(null)}>
              Remove
            </Button>
          ) : null}
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Media library</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title or public id" />
            <label className="inline-flex h-8 cursor-pointer items-center rounded-lg border px-3 text-sm">
              {uploading ? "Uploading…" : "Upload"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                className="sr-only"
                disabled={uploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void upload(file);
                }}
              />
            </label>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {items.map((item) => (
              <button
                key={item.publicId}
                type="button"
                className="overflow-hidden rounded-lg border text-left hover:border-[#0b4324]"
                onClick={() => {
                  onChange(toImage(item));
                  setOpen(false);
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.secureUrl} alt={item.alt || ""} className="aspect-square w-full object-cover" />
                <span className="block truncate px-2 py-1 text-xs">{item.title || item.publicId}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
