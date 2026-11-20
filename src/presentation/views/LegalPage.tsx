import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** Simple readable layout for the Privacy Policy and Terms of Service. */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full px-4 py-8 sm:py-12">
      <article className="mx-auto max-w-[720px] liquid-glass-strong rounded-[32px] p-6 sm:p-10 space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--accent-cyan)] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Synseafy
        </Link>
        <header className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            {title}
          </h1>
          <p className="text-xs text-[var(--text-muted)]">Last updated {updated}</p>
        </header>
        <div className="space-y-5 text-sm leading-relaxed text-[var(--text-secondary)] [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-[var(--text-primary)] [&_h2]:pt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:text-[var(--accent-cyan)] [&_a]:underline">
          {children}
        </div>
      </article>
    </div>
  );
}
