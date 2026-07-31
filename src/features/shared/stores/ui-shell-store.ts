import { create } from "zustand";

interface UiShellState {
  mobileNavOpen: boolean;
  commandPaletteOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
}

/**
 * Ephemeral UI state only — never store server/domain data here.
 */
export const useUiShellStore = create<UiShellState>((set) => ({
  mobileNavOpen: false,
  commandPaletteOpen: false,
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
}));
