export type MeavoAppKey =
  | "gateway"
  | "hols"
  | "assembly"
  | "sales"
  | "mrp"
  | "factory"
  | "rp"
  | "clock"
  | "tasks";

export type NavLink = {
  href: string;
  label: string;
};

export type ToolSwitcherOption = {
  id: string;
  name: string;
  url: string;
  linkedAppKey?: string | null;
};

export type ToolSwitcherState = {
  currentId: string;
  options: ToolSwitcherOption[];
};
