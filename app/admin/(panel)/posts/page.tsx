import { Suspense } from "react";
import { ContentList } from "@/app/admin/(panel)/pages/page";
import { listContent } from "@/lib/admin-data";

async function Posts() {
  const rows = await listContent("post");
  return <ContentList kind="post" rows={rows} />;
}

export default function PostsIndex() {
  return (
    <Suspense fallback={<p>Loading posts…</p>}>
      <Posts />
    </Suspense>
  );
}
