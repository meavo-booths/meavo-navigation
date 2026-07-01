import type { ToolSwitcherOption } from "../types";

type ToolCardRow = {
  id: string;
  name: string;
  url: string;
  linkedAppKey: string | null;
};

export type NavigationPrisma = {
  toolCard: {
    findMany: (args: {
      where: Record<string, unknown>;
      orderBy: Array<Record<string, "asc" | "desc">>;
      select: {
        id: true;
        name: true;
        url: true;
        linkedAppKey: true;
      };
    }) => Promise<ToolCardRow[]>;
  };
};

export async function getAccessibleTools(
  prisma: NavigationPrisma,
  options: { userId: string; isAdmin: boolean; gatewayUrl: string }
): Promise<ToolSwitcherOption[]> {
  const cards = options.isAdmin
    ? await prisma.toolCard.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: { id: true, name: true, url: true, linkedAppKey: true },
      })
    : await prisma.toolCard.findMany({
        where: {
          isActive: true,
          access: { some: { userId: options.userId } },
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: { id: true, name: true, url: true, linkedAppKey: true },
      });

  const gatewayEntry: ToolSwitcherOption = {
    id: "gateway",
    name: "Gateway",
    url: options.gatewayUrl,
  };

  return [
    gatewayEntry,
    ...cards.map((card) => ({
      id: card.id,
      name: card.name,
      url: card.url,
      linkedAppKey: card.linkedAppKey,
    })),
  ];
}
