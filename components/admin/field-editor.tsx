"use client";

import { TinyEditor } from "@/components/admin/tiny-editor";
import { MediaPicker } from "@/components/admin/media-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CloudImage } from "@/lib/types";

const IMAGE_KEYS = new Set(["image", "backgroundImage", "featuredImage", "logo", "footerLogo", "siteIcon"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isImage(value: unknown): value is CloudImage {
  return isRecord(value) && typeof value.url === "string" && ("publicId" in value || "width" in value);
}

function isHtmlKey(key: string, value: string): boolean {
  return /html$/i.test(key) || (value.includes("<") && value.includes(">"));
}

function blankLike(sample: unknown): unknown {
  if (typeof sample === "string") return "";
  if (typeof sample === "number") return 0;
  if (typeof sample === "boolean") return false;
  if (Array.isArray(sample)) return [];
  if (isImage(sample)) return null;
  if (isRecord(sample)) {
    return Object.fromEntries(
      Object.entries(sample)
        .filter(([key]) => key !== "blocks")
        .map(([key, child]) => [key, blankLike(child)]),
    );
  }
  return "";
}

function labelize(key: string): string {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}

export function FieldEditor({
  label,
  value,
  onChange,
  plainHtml = false,
  depth = 0,
}: {
  label: string;
  value: unknown;
  onChange: (value: unknown) => void;
  plainHtml?: boolean;
  depth?: number;
}) {
  if (label === "blocks") return null;
  if (depth > 6) {
    return <p className="text-xs text-muted-foreground">Nested value hidden. Use the JSON editor.</p>;
  }

  if (isImage(value) || (value == null && IMAGE_KEYS.has(label))) {
    return (
      <div className="grid gap-1.5">
        <Label>{labelize(label)}</Label>
        <MediaPicker value={isImage(value) ? value : null} onChange={onChange} label={labelize(label)} />
      </div>
    );
  }

  if (typeof value === "string" || value == null) {
    const text = typeof value === "string" ? value : "";
    const html = isHtmlKey(label, text);
    return (
      <div className="grid gap-1.5">
        <Label>{labelize(label)}</Label>
        {html && !plainHtml ? (
          <TinyEditor value={text} onChange={(next) => onChange(next)} height={label === "contentHtml" ? 460 : 240} />
        ) : html ? (
          <Textarea value={text} rows={8} onChange={(event) => onChange(event.target.value)} className="font-mono text-xs" />
        ) : text.length > 180 ? (
          <Textarea value={text} rows={4} onChange={(event) => onChange(event.target.value)} />
        ) : (
          <Input value={text} onChange={(event) => onChange(event.target.value)} />
        )}
      </div>
    );
  }

  if (typeof value === "number") {
    return (
      <div className="grid gap-1.5">
        <Label>{labelize(label)}</Label>
        <Input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} />
      </div>
    );
  }

  if (typeof value === "boolean") {
    return (
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)} />
        {labelize(label)}
      </label>
    );
  }

  if (Array.isArray(value)) {
    const strings = value.every((item) => typeof item === "string");
    return (
      <div className="grid gap-2 rounded-lg border bg-white/60 p-3">
        <div className="flex items-center justify-between gap-2">
          <Label>{labelize(label)}</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              if (strings || value.length === 0) onChange([...value, ""]);
              else onChange([...value, blankLike(value[0])]);
            }}
          >
            Add
          </Button>
        </div>
        {value.map((item, index) => (
          <div key={index} className="grid gap-2 border-t pt-2">
            <FieldEditor
              label={`${label} ${index + 1}`}
              value={item}
              depth={depth + 1}
              plainHtml={plainHtml}
              onChange={(next) => onChange(value.map((current, currentIndex) => (currentIndex === index ? next : current)))}
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onChange(value.filter((_, currentIndex) => currentIndex !== index))}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    );
  }

  if (isRecord(value)) {
    const entries = Object.entries(value).filter(([key]) => key !== "blocks");
    return (
      <div className="grid gap-3 rounded-lg border bg-[#fbfaf6] p-3">
        {label && depth > 0 ? <p className="text-sm font-medium text-[#0b4324]">{labelize(label)}</p> : null}
        {entries.map(([key, child]) => (
          <FieldEditor
            key={key}
            label={key}
            value={child}
            depth={depth + 1}
            plainHtml={plainHtml}
            onChange={(next) => onChange({ ...value, [key]: next })}
          />
        ))}
      </div>
    );
  }

  return null;
}
