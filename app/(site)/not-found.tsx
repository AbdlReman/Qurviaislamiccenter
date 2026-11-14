import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-sm tracking-[0.16em] text-[#a47f34] uppercase">404</p>
      <h1 className="mt-3 font-[family-name:var(--font-patua)] text-4xl text-[#0b4324]">This page is not on the shelf</h1>
      <p className="mt-4 text-[#4d4a42]">The address may have changed. The courses, blog, and trial form are still a click away.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-md bg-[#0b4324] px-5 py-3 text-white">
          Back home
        </Link>
        <Link href="/contact-us" className="rounded-md bg-[#dab750] px-5 py-3 text-[#0b4324]">
          Book a trial
        </Link>
      </div>
    </div>
  );
}
