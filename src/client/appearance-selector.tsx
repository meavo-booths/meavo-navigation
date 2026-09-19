import { useEffect, useId, useRef, useState } from "react";
import type { ThemePreference } from "../theme";
import { useMeavoTheme } from "./theme-provider";

const options: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

function AppearanceIcon({ preference }: { preference: ThemePreference }) {
  return (
    <svg aria-hidden="true" className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {preference === "light" ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5" /></> : preference === "dark" ? <path d="M20.5 13a8.5 8.5 0 0 1-9.5-9.5A8.5 8.5 0 1 0 20.5 13Z" /> : <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8m-4-4v4" /></>}
    </svg>
  );
}

export function AppearanceSelector({ inline = false }: { inline?: boolean }) {
  const theme = useMeavoTheme();
  const id = useId();
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLFieldSetElement>(null);

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLInputElement>("input:checked")?.focus();
    const outside = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  // Older consumers remain unchanged until they install the preset and provider.
  if (!theme) return null;

  const choices = (
    <fieldset ref={panel} id={id} className="min-w-0">
      <legend className="mb-2 text-sm font-semibold text-foreground">Appearance</legend>
      <div className="grid grid-cols-3 gap-1">
        {options.map(({ value, label }) => (
          <label key={value} className="relative min-w-0 cursor-pointer">
            <input className="peer sr-only" type="radio" name={`${id}-appearance`} value={value} checked={theme.preference === value} onChange={() => theme.setPreference(value)} />
            <span className="flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg border border-line px-2 py-2 text-xs font-medium text-secondary hover:bg-surface-hover peer-checked:border-line-brand-500 peer-checked:bg-surface-brand-50 peer-checked:text-ink-brand-700 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-line-brand-500">
              <AppearanceIcon preference={value} />{label}
              {theme.preference === value && <span aria-hidden="true" className="absolute right-1 top-0.5 text-[10px] font-bold">✓</span>}
            </span>
          </label>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted">System follows your device.{theme.saved ? " Your choice is remembered in this browser." : ""}</p>
      {!theme.saved && <p role="status" className="mt-2 text-xs text-ink-amber-800">Not saved in this browser. Applied for this page only.</p>}
    </fieldset>
  );

  return (
    <div ref={container} className={inline ? "min-w-0" : "relative shrink-0"} onBlur={(event) => {
      // A label click briefly blurs the selected radio before focusing its target.
      // Only dismiss when focus moves to a known element outside the control.
      if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
    }}>
      {inline ? choices : <>
        <button ref={trigger} type="button" aria-label={`Appearance: ${theme.preference}`} title="Appearance" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => setOpen(!open)} className="inline-flex h-11 w-11 touch-manipulation items-center justify-center rounded-lg text-secondary hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-brand-500">
          <AppearanceIcon preference={theme.preference} />
        </button>
        {open && <div className="absolute right-0 top-full z-[120] mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-line bg-surface p-3 shadow-lg">{choices}</div>}
      </>}
    </div>
  );
}
