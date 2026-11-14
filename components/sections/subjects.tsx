"use client";

import { useState } from "react";
import { btnGold, SmartLink } from "@/components/site/smart-link";

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
    <section className="bg-[#f5f1e3] py-14">
      <div className="mx-auto max-w-[1140px] px-4">
        {heading ? (
          <div className="mb-8 text-center">
            <h2 className="font-[family-name:var(--font-patua)] text-3xl text-[#0b4324] md:text-4xl">{heading}</h2>
            <span className="mx-auto mt-3 block h-1 w-16 rounded bg-gradient-to-r from-[#dfd274] to-[#a47f34]" />
            <p className="mx-auto mt-4 max-w-2xl text-[#4d4a42]">
              Live one-to-one tuition from Grade 1 through A-Level, taught to the board your child sits.
            </p>
          </div>
        ) : null}
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {items.map((item, index) => {
              const selected = index === active;
              return (
                <button
                  key={item.key || item.name}
                  type="button"
                  onClick={() => setActive(index)}
                  className={`min-w-40 shrink-0 rounded-xl px-4 py-3 text-left transition lg:min-w-0 ${
                    selected ? "bg-[#0b4324] text-white" : "bg-white text-[#0b4324] hover:bg-white/80"
                  }`}
                >
                  <span className="mr-2" aria-hidden>
                    {item.icon}
                  </span>
                  <span className="font-[family-name:var(--font-patua)]">{item.name}</span>
                </button>
              );
            })}
          </div>
          <article className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
            <p className="text-sm uppercase tracking-[0.14em] text-[#a47f34]">{subject.tag}</p>
            <h3 className="mt-2 font-[family-name:var(--font-patua)] text-3xl text-[#0b4324]">{subject.name}</h3>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-lg bg-[#f5f1e3] px-3 py-2">
                <dt className="text-[#7a7364]">Grades</dt>
                <dd className="font-semibold text-[#0b4324]">{subject.grades}</dd>
              </div>
              <div className="rounded-lg bg-[#f5f1e3] px-3 py-2">
                <dt className="text-[#7a7364]">Sessions</dt>
                <dd className="font-semibold text-[#0b4324]">{subject.sessions}</dd>
              </div>
              <div className="rounded-lg bg-[#f5f1e3] px-3 py-2">
                <dt className="text-[#7a7364]">Format</dt>
                <dd className="font-semibold text-[#0b4324]">{subject.type}</dd>
              </div>
            </dl>
            <div className="mt-6">
              <h4 className="font-[family-name:var(--font-patua)] text-lg text-[#0b4324]">Boards</h4>
              <ul className="mt-2 flex flex-wrap gap-2">
                {(subject.boards ?? []).map((board) => (
                  <li key={board} className="rounded-full border border-[#eadfbe] px-3 py-1 text-sm text-[#3c3c3c]">
                    {board}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="font-[family-name:var(--font-patua)] text-lg text-[#0b4324]">Topics</h4>
                <ul className="mt-2 space-y-1.5 text-sm leading-6 text-[#3c3c3c]">
                  {(subject.topics ?? []).map((topic) => (
                    <li key={topic}>• {topic}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-[family-name:var(--font-patua)] text-lg text-[#0b4324]">How lessons run</h4>
                <ul className="mt-2 space-y-1.5 text-sm leading-6 text-[#3c3c3c]">
                  {(subject.curr ?? []).map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
            {ctaText ? (
              <SmartLink href={ctaHref || "/contact-us"} className={`${btnGold} mt-8`}>
                {ctaText}
              </SmartLink>
            ) : null}
          </article>
        </div>
      </div>
    </section>
  );
}
