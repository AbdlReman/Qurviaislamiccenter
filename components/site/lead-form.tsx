"use client";

import { useState, useTransition } from "react";
import { submitLead } from "@/app/actions/leads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  const [pending, startTransition] = useTransition();
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
      className="grid gap-4"
      method="post"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setError("");
        startTransition(async () => {
          const result = await submitLead(data);
          if (!result.ok) {
            setError(result.error);
            return;
          }
          setDone(true);
        });
      }}
    >
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="pagePath" value={pagePath || ""} />
      <input
        name="company_website"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        aria-hidden
      />
      {fields.map((field, index) => {
        const key = fieldKey(field);
        const id = `${source}-${key}-${index}`;
        const label = field.label || field.placeholder || key;
        const options = (field.options || []).filter(Boolean);
        return (
          <div key={id} className="grid gap-1.5">
            <Label htmlFor={id} className={field.label ? "text-ink" : "sr-only"}>
              {label}
            </Label>
            {field.type === "textarea" ? (
              <Textarea id={id} name={key} required={field.required} placeholder={field.placeholder || ""} rows={4} />
            ) : field.type === "select" ? (
              <select
                id={id}
                name={key}
                required={field.required}
                defaultValue=""
                className="h-10 w-full rounded-lg border border-input bg-white px-2.5 text-sm"
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
              <Input
                id={id}
                name={key}
                type={field.type === "email" ? "email" : "text"}
                required={field.required}
                placeholder={field.placeholder || ""}
                autoComplete={key === "email" ? "email" : key === "name" ? "name" : key === "phone" ? "tel" : "on"}
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
      <Button type="submit" disabled={pending} className="h-11 rounded-sm bg-pine text-white hover:bg-ink">
        {pending ? "Sending…" : submitText || "Get Trial"}
      </Button>
    </form>
  );
}
