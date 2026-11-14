import { EditorPage } from "@/components/admin/editor-page";

export default function EditPage({ params }: { params: Promise<{ id: string }> }) {
  return <EditorPage kind="page" params={params} />;
}
