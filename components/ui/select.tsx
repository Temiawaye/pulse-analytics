"use client";

import checkIcon from "@iconify-icons/solar/check-circle-bold";
import chevronIcon from "@iconify-icons/solar/alt-arrow-down-linear";
import { Icon } from "@iconify/react";
import { useEffect, useId, useRef, useState } from "react";

export type SelectOption = {
  value: string;
  label: string;
  marker?: string;
};

export function Select({
  label,
  options,
  value,
  defaultValue = "",
  name,
  disabled = false,
  onValueChange,
  className = "",
}: {
  label: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  name?: string;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
  className?: string;
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selectedValue = value ?? internalValue;
  const selected = options.find((option) => option.value === selectedValue);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  function choose(nextValue: string) {
    if (value === undefined) setInternalValue(nextValue);
    onValueChange?.(nextValue);
    setOpen(false);
  }

  return (
    <div className={`relative ${className}`} ref={root}>
      {name && <input name={name} type="hidden" value={selectedValue} />}
      <span className="sr-only" id={`${id}-label`}>
        {label}
      </span>
      <button
        aria-controls={`${id}-listbox`}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-labelledby={`${id}-label ${id}-value`}
        className="flex min-h-10 w-full items-center justify-between gap-3 rounded-xl bg-white px-3.5 py-2.5 text-left text-sm font-medium text-slate-800 shadow-sm transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        disabled={disabled}
        id={`${id}-value`}
        type="button"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="truncate">{selected?.label ?? label}</span>
        </span>
        <Icon
          aria-hidden="true"
          className={`size-4 shrink-0 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
          icon={chevronIcon}
        />
      </button>
      {open && (
        <div
          className="absolute left-0 top-full z-40 mt-2 min-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.18)]"
          id={`${id}-listbox`}
          role="listbox"
          aria-labelledby={`${id}-label`}
        >
          {options.map((option) => {
            const active = option.value === selectedValue;
            return (
              <button
                aria-selected={active}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${active ? "bg-emerald-50 font-semibold text-emerald-900" : "text-slate-800 hover:bg-slate-100"}`}
                key={option.value}
                role="option"
                type="button"
                onClick={() => choose(option.value)}
              >
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {active && (
                  <Icon
                    aria-hidden="true"
                    className="size-4 shrink-0 text-emerald-700"
                    icon={checkIcon}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
