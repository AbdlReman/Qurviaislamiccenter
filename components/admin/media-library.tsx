"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MediaItem } from "@/lib/types";

export function MediaLibrary({ initial }: { initial: MediaItem[] }) {
  const [items, setItems] = useState(initial);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const visible = items.filter((item) => {
    const blob = `${item.title || ""} ${item.publicId} ${item.alt || ""}`.toLowerCase();
    return blob.includes(query.toLowerCase());
  });

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
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl text-[#0b4324]">Media</h1>
        <label className="inline-flex h-9 cursor-pointer items-center rounded-lg bg-[#0b4324] px-3 text-sm text-white">
          {uploading ? "Uploading…" : "Upload to Cloudinary"}
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
      <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter this library" />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {visible.map((item) => (
          <figure key={item.publicId} className="overflow-hidden rounded-xl bg-white shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.secureUrl} alt={item.alt || ""} className="aspect-square w-full object-cover" />
            <figcaption className="space-y-2 p-2">
              <p className="truncate text-xs">{item.title || item.publicId}</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void navigator.clipboard.writeText(item.secureUrl)}
              >
                Copy URL
              </Button>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
