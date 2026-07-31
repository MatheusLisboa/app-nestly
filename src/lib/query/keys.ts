/**
 * Central query key factory.
 * Features extend with their own keys under a namespaced prefix.
 */
export const queryKeys = {
  root: ["myninho"] as const,
  workspace: {
    all: ["myninho", "workspace"] as const,
    current: () => ["myninho", "workspace", "current"] as const,
    members: (workspaceId: string) => ["myninho", "workspace", workspaceId, "members"] as const,
  },
  shopping: {
    all: (workspaceId: string) => ["myninho", "shopping", workspaceId] as const,
    list: (workspaceId: string, listId: string) =>
      ["myninho", "shopping", workspaceId, "list", listId] as const,
    items: (workspaceId: string, listId: string) =>
      ["myninho", "shopping", workspaceId, "items", listId] as const,
  },
  inventory: {
    all: (workspaceId: string) => ["myninho", "inventory", workspaceId] as const,
    items: (workspaceId: string) => ["myninho", "inventory", workspaceId, "items"] as const,
    locations: (workspaceId: string) => ["myninho", "inventory", workspaceId, "locations"] as const,
  },
  checklists: {
    all: (workspaceId: string) => ["myninho", "checklists", workspaceId] as const,
    list: (workspaceId: string) => ["myninho", "checklists", workspaceId, "list"] as const,
    detail: (workspaceId: string, checklistId: string) =>
      ["myninho", "checklists", workspaceId, "detail", checklistId] as const,
    items: (workspaceId: string, checklistId: string) =>
      ["myninho", "checklists", workspaceId, "items", checklistId] as const,
  },
  cleaning: {
    all: (workspaceId: string) => ["myninho", "cleaning", workspaceId] as const,
    tasks: (workspaceId: string) => ["myninho", "cleaning", workspaceId, "tasks"] as const,
  },
  bills: {
    all: (workspaceId: string) => ["myninho", "bills", workspaceId] as const,
    list: (workspaceId: string) => ["myninho", "bills", workspaceId, "list"] as const,
  },
  calendar: {
    all: (workspaceId: string) => ["myninho", "calendar", workspaceId] as const,
    events: (workspaceId: string) => ["myninho", "calendar", workspaceId, "events"] as const,
  },
  baby: {
    all: (workspaceId: string) => ["myninho", "baby", workspaceId] as const,
    logs: (workspaceId: string, babyId: string) =>
      ["myninho", "baby", workspaceId, "logs", babyId] as const,
  },
} as const;
