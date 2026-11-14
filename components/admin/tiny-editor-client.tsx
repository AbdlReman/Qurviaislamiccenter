"use client";

import { Editor } from "@tinymce/tinymce-react";

export function TinyEditorClient({
  value,
  onChange,
  height = 320,
}: {
  value: string;
  onChange: (value: string) => void;
  height?: number;
}) {
  const cloudKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY;
  return (
    <Editor
      apiKey={cloudKey || "no-api-key"}
      {...(cloudKey ? {} : { tinymceScriptSrc: "/tinymce/tinymce.min.js" })}
      licenseKey="gpl"
      value={value}
      onEditorChange={(content) => onChange(content)}
      init={{
        height,
        menubar: false,
        plugins: "link lists code table autoresize",
        toolbar: "undo redo | blocks | bold italic underline | bullist numlist | link removeformat | code",
        branding: false,
        promotion: false,
        content_style: "body { font-family: Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.6; }",
      }}
    />
  );
}
