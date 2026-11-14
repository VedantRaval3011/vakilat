"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const components: Components = {
  h1: ({ children }) => <h3 className="mt-5 font-display text-lg font-bold first:mt-0">{children}</h3>,
  h2: ({ children }) => <h3 className="mt-5 font-display text-lg font-bold first:mt-0">{children}</h3>,
  h3: ({ children }) => <h4 className="mt-4 font-display text-base font-bold first:mt-0">{children}</h4>,
  h4: ({ children }) => <h4 className="mt-4 font-semibold first:mt-0">{children}</h4>,
  p: ({ children }) => <p className="mt-3 first:mt-0">{children}</p>,
  ul: ({ children }) => <ul className="mt-3 list-disc space-y-1.5 pl-5 marker:text-accent first:mt-0">{children}</ul>,
  ol: ({ children }) => <ol className="mt-3 list-decimal space-y-1.5 pl-5 marker:text-muted first:mt-0">{children}</ol>,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer" className="text-accent underline underline-offset-2">
      {children}
    </a>
  ),
  blockquote: ({ children }) => <blockquote className="mt-3 border-l-2 border-accent/60 pl-4 text-muted">{children}</blockquote>,
  code: ({ children }) => <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[0.85em]">{children}</code>,
  pre: ({ children }) => <pre className="mt-3 overflow-x-auto rounded-lg bg-surface-2 p-3 text-sm [&_code]:bg-transparent [&_code]:p-0">{children}</pre>,
  hr: () => <hr className="my-4 border-border" />,
  table: ({ children }) => (
    <div className="mt-3 overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border-b border-border bg-surface-2 px-3 py-2 font-semibold">{children}</th>,
  td: ({ children }) => <td className="border-b border-border px-3 py-2 align-top">{children}</td>,
};

export function Markdown({ children }: { children: string }) {
  return (
    <div className="text-[15px] leading-7 text-foreground/90">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
