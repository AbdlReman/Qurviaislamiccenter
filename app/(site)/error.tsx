"use client";

export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-[family-name:var(--font-patua)] text-3xl text-[#0b4324]">We could not open this page</h1>
      <p className="mt-3 text-[#4d4a42]">
        If you are running the site locally, confirm MongoDB is seeded and MONGODB_URI is set, then try again.
      </p>
      <button type="button" onClick={reset} className="mt-6 rounded-md bg-[#0b4324] px-5 py-3 text-white">
        Try again
      </button>
    </div>
  );
}
