import { Suspense } from "react";
import { SettingsEditor } from "@/components/admin/settings-editor";
import { getRawSettings } from "@/lib/admin-data";
import { normalizeSettings } from "@/lib/defaults";

async function Settings() {
  const raw = await getRawSettings();
  return <SettingsEditor initial={normalizeSettings(raw)} />;
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<p>Loading settings…</p>}>
      <Settings />
    </Suspense>
  );
}
