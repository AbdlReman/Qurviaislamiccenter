import { Suspense } from "react";
import { CategoriesEditor } from "@/components/admin/categories-editor";
import { listCategories } from "@/lib/admin-data";

async function Categories() {
  const categories = await listCategories();
  return <CategoriesEditor initial={categories} />;
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={<p>Loading categories…</p>}>
      <Categories />
    </Suspense>
  );
}
