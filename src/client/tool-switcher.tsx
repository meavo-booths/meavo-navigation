import { useEffect, useRef, useState } from "react";
import type { ToolSwitcherState } from "../types";
import { navigateToTool } from "./tool-navigation";

export function ToolSwitcher({ currentId, options }: ToolSwitcherState) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = options.find((option) => option.id === currentId) ?? options[0];

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!current || options.length <= 1) {
    return (
      <span className="max-w-[12rem] truncate text-sm font-semibold text-slate-900">
        {current?.name ?? "Tools"}
      </span>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="inline-flex max-w-[12rem] items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 hover:bg-slate-50 touch-manipulation"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="truncate">{current.name}</span>
        <svg className="h-4 w-4 shrink-0 text-slate-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 top-full z-[100] mt-1 min-w-[12rem] max-w-[16rem] rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          {options.map((option) => {
            const selected = option.id === currentId;
            return (
              <li key={option.id} role="option" aria-selected={selected}>
                <button
                  type="button"
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm touch-manipulation ${
                    selected
                      ? "bg-brand-50 font-medium text-brand-700"
                      : "text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                  }`}
                  onClick={() => {
                    setOpen(false);
                    if (option.id === currentId) return;
                    navigateToTool(option.url);
                  }}
                >
                  <span className="truncate">{option.name}</span>
                  {selected && <span className="ml-2 text-xs text-brand-700">Current</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
