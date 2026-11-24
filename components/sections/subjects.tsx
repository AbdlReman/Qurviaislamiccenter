"use client";

import { useState } from "react";
import { btnGreen, SmartLink } from "@/components/site/smart-link";

type Subject = {
  key?: string;
  icon?: string;
  name?: string;
  tag?: string;
  grades?: string;
  sessions?: string;
  type?: string;
  boards?: string[];
  topics?: string[];
  curr?: string[];
};

export function SubjectsExplorer({
  heading,
  items,
  ctaText,
  ctaHref,
}: {
  heading?: string;
  items: Subject[];
  ctaText?: string;
  ctaHref?: string;
}) {
  const [active, setActive] = useState(0);
  const subject = items[active];
  if (!subject) return null;

  return (
    <section className="bg-white/60 py-20 md:py-24">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
        {heading ? (
          <div className="mb-10 max-w-2xl">
            <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-ink md:text-4xl">
              {heading}
            </h2>
            <span className="mt-4 block h-px w-12 bg-moss/50" />
            <p className="mt-5 leading-7 text-ink/70">
              Live one-to-one tuition from Grade 1 through A-Level, taught to the board your child sits.
            </p>
          </div>
        ) : null}
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {items.map((item, index) => {
              const selected = index === active;
              return (
                <button
                  key={item.key || item.name}
                  type="button"
                  onClick={() => setActive(index)}
                  className={`min-w-40 shrink-0 border px-4 py-3 text-left text-sm transition lg:min-w-0 ${
                    selected
                      ? "border-pine bg-pine text-white"
                      : "border-sand bg-transparent text-ink hover:border-pine/40"
                  }`}
                >
                  <span className="mr-2" aria-hidden>
                    {item.icon}
                  </span>
                  <span className="font-[family-name:var(--font-display)] text-base tracking-tight">
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>
          <article className="border border-sand bg-mist p-6 md:p-8">
            <p className="text-xs tracking-[0.14em] text-moss uppercase">{subject.tag}</p>
            <h3 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight text-ink">
              {subject.name}
            </h3>
            <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs tracking-[0.1em] text-ink/45 uppercase">Grades</dt>
                <dd className="mt-1 font-medium text-ink">{subject.grades}</dd>
              </div>
              <div>
                <dt className="text-xs tracking-[0.1em] text-ink/45 uppercase">Sessions</dt>
                <dd className="mt-1 font-medium text-ink">{subject.sessions}</dd>
              </div>
              <div>
                <dt className="text-xs tracking-[0.1em] text-ink/45 uppercase">Format</dt>
                <dd className="mt-1 font-medium text-ink">{subject.type}</dd>
              </div>
            </dl>
            <div className="mt-8">
              <h4 className="font-[family-name:var(--font-display)] text-lg tracking-tight text-ink">Boards</h4>
              <ul className="mt-3 flex flex-wrap gap-2">
                {(subject.boards ?? []).map((board) => (
                  <li key={board} className="border border-sand px-3 py-1 text-sm text-ink/70">
                    {board}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8 grid gap-8 md:grid-cols-2">
              <div>
                <h4 className="font-[family-name:var(--font-display)] text-lg tracking-tight text-ink">Topics</h4>
                <ul className="mt-3 space-y-1.5 text-sm leading-7 text-ink/70">
                  {(subject.topics ?? []).map((topic) => (
                    <li key={topic}>{topic}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-[family-name:var(--font-display)] text-lg tracking-tight text-ink">
                  How lessons run
                </h4>
                <ul className="mt-3 space-y-1.5 text-sm leading-7 text-ink/70">
                  {(subject.curr ?? []).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            {ctaText ? (
              <SmartLink href={ctaHref || "/contact-us"} className={`${btnGreen} mt-8`}>
                {ctaText}
              </SmartLink>
            ) : null}
          </article>
        </div>
      </div>
    </section>
  );
}
