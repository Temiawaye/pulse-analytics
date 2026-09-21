"use client";

import chevronIcon from "@iconify-icons/solar/alt-arrow-down-linear";
import copyIcon from "@iconify-icons/solar/copy-linear";
import fileCodeIcon from "@iconify-icons/solar/file-code-linear";
import { Icon } from "@iconify/react";
import { Highlight, themes, type Language } from "prism-react-renderer";
import { useState } from "react";

type CodeVariant = {
  code: string;
  label: string;
  language: Language;
};

export function CodeBlock({
  code,
  label,
  language = "markup",
  variants,
}: {
  code?: string;
  label?: string;
  language?: Language;
  variants?: { typescript: CodeVariant; javascript: CodeVariant };
}) {
  const [copied, setCopied] = useState(false);
  const [variant, setVariant] = useState<"typescript" | "javascript">(
    "typescript",
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const active = variants?.[variant] ?? {
    code: code ?? "",
    label: label ?? "Code",
    language,
  };

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-[#090909] shadow-lg">
      <div className="flex min-h-11 items-center justify-between gap-3 border-b border-zinc-800 bg-[#0c0c0c] px-4">
        <span className="flex min-w-0 items-center gap-2 text-sm text-zinc-400">
          <Icon
            aria-hidden="true"
            className="size-4 shrink-0"
            icon={fileCodeIcon}
          />
          <span className="truncate">{active.label}</span>
        </span>
        <div className="flex items-center gap-2">
          {variants && (
            <div className="relative">
              <button
                aria-expanded={menuOpen}
                aria-haspopup="listbox"
                className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-zinc-300 hover:bg-white/10 hover:text-white"
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
              >
                {variant === "typescript" ? "TypeScript" : "JavaScript"}
                <Icon
                  aria-hidden="true"
                  className={`size-4 transition-transform ${menuOpen ? "rotate-180" : ""}`}
                  icon={chevronIcon}
                />
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 top-full z-20 mt-1 w-36 rounded-lg border border-zinc-700 bg-zinc-900 p-1 shadow-xl"
                  role="listbox"
                >
                  {(["typescript", "javascript"] as const).map((item) => (
                    <button
                      aria-selected={variant === item}
                      className={`block w-full rounded-md px-3 py-2 text-left text-sm ${variant === item ? "bg-emerald-500/15 text-emerald-300" : "text-zinc-300 hover:bg-white/10"}`}
                      key={item}
                      role="option"
                      type="button"
                      onClick={() => {
                        setVariant(item);
                        setMenuOpen(false);
                        setCopied(false);
                      }}
                    >
                      {item === "typescript" ? "TypeScript" : "JavaScript"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <button
            aria-label={`Copy ${active.label}`}
            className="rounded-md p-2 text-zinc-400 hover:bg-white/10 hover:text-white"
            title={copied ? "Copied" : "Copy code"}
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(active.code);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2000);
            }}
          >
            <Icon aria-hidden="true" className="size-4" icon={copyIcon} />
          </button>
        </div>
      </div>
      <Highlight
        code={active.code.trim()}
        language={active.language}
        theme={themes.nightOwl}
      >
        {({ tokens, getLineProps, getTokenProps }) => (
          <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-6 sm:text-sm">
            <code>
              {tokens.map((line, lineIndex) => (
                <span
                  key={lineIndex}
                  {...getLineProps({ line })}
                  className="block min-h-6"
                >
                  {line.map((token, tokenIndex) => (
                    <span key={tokenIndex} {...getTokenProps({ token })} />
                  ))}
                </span>
              ))}
            </code>
          </pre>
        )}
      </Highlight>
      <span className="sr-only" aria-live="polite">
        {copied ? `${active.label} copied` : ""}
      </span>
    </div>
  );
}
