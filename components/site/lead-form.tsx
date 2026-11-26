"use client";

import { useState } from "react";
import type { FormField } from "@/lib/types";

function fieldKey(field: FormField): string {
  const blob = `${field.name} ${field.label || ""} ${field.placeholder || ""}`.toLowerCase();
  if (field.type === "email" || blob.includes("email")) return "email";
  if (blob.includes("phone") || field.name.includes("ec3694d")) return "phone";
  if (blob.includes("hear")) return "heardFrom";
  if (field.type === "textarea" || blob.includes("message")) return "message";
  if (field.type === "select" && (blob.includes("course") || field.name.includes("1e2d594"))) return "course";
  if (blob.includes("name")) return "name";
  return field.name;
}

const fieldClass =
  "h-10 w-full rounded-lg border border-input bg-white px-2.5 text-sm text-ink outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function LeadForm({
  fields,
  submitText,
  source,
  pagePath,
}: {
  fields: FormField[];
  submitText?: string;
  source: string;
  pagePath?: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <p className="border border-sand bg-mist px-4 py-5 text-ink" role="status">
        Your trial request is with the academy. A coordinator will contact you shortly to arrange the class. No payment is taken at this step.
      </p>
    );
  }

  return (
    <form
      className="relative grid gap-4"
      method="post"
      action="/api/leads"
      noValidate={false}
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (!form.reportValidity()) return;

        const data = new FormData(form);
        setError("");
        setPending(true);
        try {
          const response = await fetch("/api/leads", {
            method: "POST",
            body: data,
            headers: { Accept: "application/json" },
          });

          let result: { ok?: boolean; error?: string } | null = null;
          const raw = await response.text();
          try {
            result = raw ? (JSON.parse(raw) as { ok?: boolean; error?: string }) : null;
          } catch {
            result = null;
          }

          if (!response.ok || !result?.ok) {
            setError(result?.error || "Could not send. Please try again.");
            return;
          }
          setDone(true);
        } catch {
          setError("Network error. Please check your connection and try again.");
        } finally {
          setPending(false);
        }
      }}
    >
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="pagePath" value={pagePath || ""} />
      <div aria-hidden className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0">
        <label>
          Leave blank
          <input name="website_url_hp" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      {fields.map((field, index) => {
        const key = fieldKey(field);
        const id = `${source}-${key}-${index}`;
        const label = field.label || field.placeholder || key;
        const options = (field.options || []).filter(Boolean);
        return (
          <div key={id} className="grid gap-1.5">
            <label htmlFor={id} className={field.label ? "text-sm font-medium text-ink" : "sr-only"}>
              {label}
            </label>
            {field.type === "textarea" ? (
              <textarea
                id={id}
                name={key}
                required={field.required}
                placeholder={field.placeholder || ""}
                rows={4}
                className={`${fieldClass} h-auto py-2`}
              />
            ) : field.type === "select" ? (
              <select
                id={id}
                name={key}
                required={field.required}
                defaultValue=""
                className={fieldClass}
              >
                <option value="" disabled>
                  {field.label || "Select"}
                </option>
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={id}
                name={key}
                type={field.type === "email" ? "email" : key === "phone" ? "tel" : "text"}
                required={field.required}
                placeholder={field.placeholder || ""}
                autoComplete={key === "email" ? "email" : key === "name" ? "name" : key === "phone" ? "tel" : "on"}
                className={fieldClass}
              />
            )}
          </div>
        );
      })}
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center justify-center rounded-sm bg-pine px-4 text-sm font-medium text-white transition hover:bg-ink disabled:pointer-events-none disabled:opacity-50"
      >
        {pending ? "Sending…" : submitText || "Get Trial"}
      </button>
    </form>
  );
}
