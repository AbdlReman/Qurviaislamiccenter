import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-xs tracking-[0.16em] text-moss uppercase">404</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight text-ink">
        This page is not on the shelf
      </h1>
      <p className="mt-4 text-ink/65">
        The address may have changed. The courses, blog, and trial form are still a click away.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-sm bg-pine px-5 py-3 text-sm text-white transition hover:bg-ink">
          Back home
        </Link>
        <Link
          href="/contact-us"
          className="rounded-sm border border-pine/25 px-5 py-3 text-sm text-pine transition hover:border-pine hover:bg-pine hover:text-white"
        >
          Book a trial
        </Link>
      </div>
    </div>
  );
}
