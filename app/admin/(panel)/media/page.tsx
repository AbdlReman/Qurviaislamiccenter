import { Suspense } from "react";
import { MediaLibrary } from "@/components/admin/media-library";
import { listMedia } from "@/lib/admin-data";

async function Media() {
  const items = await listMedia();
  return <MediaLibrary initial={items} />;
}

export default function MediaPage() {
  return (
    <Suspense fallback={<p>Loading media…</p>}>
      <Media />
    </Suspense>
  );
}
