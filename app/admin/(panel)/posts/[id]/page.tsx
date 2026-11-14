import { EditorPage } from "@/components/admin/editor-page";

export default function EditPost({ params }: { params: Promise<{ id: string }> }) {
  return <EditorPage kind="post" params={params} />;
}
