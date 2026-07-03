import type { ToolSwitcherState } from "../types";
import { navigateToTool } from "./tool-navigation";

export function ToolSwitcherLinks({
  currentId,
  options,
  onNavigate,
}: ToolSwitcherState & { onNavigate?: () => void }) {
  if (options.length === 0) return null;

  return (
    <div>
      <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        Switch app
      </p>
      <ul className="space-y-1">
        {options.map((option) => {
          const selected = option.id === currentId;
          return (
            <li key={option.id}>
              <button
                type="button"
                disabled={selected}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-medium touch-manipulation ${
                  selected
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                }`}
                onClick={() => {
                  if (selected) return;
                  onNavigate?.();
                  navigateToTool(option.url);
                }}
              >
                <span className="truncate">{option.name}</span>
                {selected && <span className="ml-2 shrink-0 text-xs text-brand-700">Current</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
