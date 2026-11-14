import { revalidatePath, updateTag } from "next/cache";

export function revalidateContent(paths: string[]): void {
  updateTag("pages");
  updateTag("posts");
  updateTag("settings");
  updateTag("menus");
  updateTag("media");
  const unique = new Set(paths.filter(Boolean));
  unique.add("/");
  for (const path of unique) {
    updateTag(`path:${path}`);
    revalidatePath(path);
  }
  revalidatePath("/sitemap.xml");
}
