"use client";

import dynamic from "next/dynamic";

const TinyEditorClient = dynamic(
  () => import("@/components/admin/tiny-editor-client").then((mod) => mod.TinyEditorClient),
  {
    ssr: false,
    loading: () => <div className="h-48 animate-pulse rounded-lg bg-[#f5f1e3]" aria-hidden />,
  },
);

export function TinyEditor(props: { value: string; onChange: (value: string) => void; height?: number }) {
  return <TinyEditorClient {...props} />;
}
