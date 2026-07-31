/**
 * Central query key factory.
 * Features extend with their own keys under a namespaced prefix.
 */
export const queryKeys = {
  root: ["nestly"] as const,
  workspace: {
    all: ["nestly", "workspace"] as const,
    current: () => ["nestly", "workspace", "current"] as const,
    members: (workspaceId: string) => ["nestly", "workspace", workspaceId, "members"] as const,
  },
  shopping: {
    all: (workspaceId: string) => ["nestly", "shopping", workspaceId] as const,
    list: (workspaceId: string, listId: string) =>
      ["nestly", "shopping", workspaceId, "list", listId] as const,
    items: (workspaceId: string, listId: string) =>
      ["nestly", "shopping", workspaceId, "items", listId] as const,
  },
  inventory: {
    all: (workspaceId: string) => ["nestly", "inventory", workspaceId] as const,
    items: (workspaceId: string) => ["nestly", "inventory", workspaceId, "items"] as const,
    locations: (workspaceId: string) => ["nestly", "inventory", workspaceId, "locations"] as const,
  },
  checklists: {
    all: (workspaceId: string) => ["nestly", "checklists", workspaceId] as const,
    list: (workspaceId: string) => ["nestly", "checklists", workspaceId, "list"] as const,
    detail: (workspaceId: string, checklistId: string) =>
      ["nestly", "checklists", workspaceId, "detail", checklistId] as const,
    items: (workspaceId: string, checklistId: string) =>
      ["nestly", "checklists", workspaceId, "items", checklistId] as const,
  },
  cleaning: {
    all: (workspaceId: string) => ["nestly", "cleaning", workspaceId] as const,
    tasks: (workspaceId: string) => ["nestly", "cleaning", workspaceId, "tasks"] as const,
  },
  bills: {
    all: (workspaceId: string) => ["nestly", "bills", workspaceId] as const,
    list: (workspaceId: string) => ["nestly", "bills", workspaceId, "list"] as const,
  },
  calendar: {
    all: (workspaceId: string) => ["nestly", "calendar", workspaceId] as const,
    events: (workspaceId: string) => ["nestly", "calendar", workspaceId, "events"] as const,
  },
  baby: {
    all: (workspaceId: string) => ["nestly", "baby", workspaceId] as const,
    logs: (workspaceId: string, babyId: string) =>
      ["nestly", "baby", workspaceId, "logs", babyId] as const,
  },
} as const;
