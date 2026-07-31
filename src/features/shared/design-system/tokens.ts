/**
 * MyNinho Design Language — token source of truth (JS).
 * CSS mirrors these values in `src/styles/globals.css`.
 *
 * Inspiration: Apple · Linear · Arc · Notion · Things 3
 * Direction: calm density, soft materials, precise hierarchy — never Bootstrap.
 */
export const designTokens = {
  fonts: {
    sans: "var(--font-geist-sans)",
    mono: "var(--font-geist-mono)",
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.8125rem",
    md: "0.9375rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
  },
  lineHeight: {
    tight: "1.2",
    snug: "1.35",
    normal: "1.5",
    relaxed: "1.65",
  },
  letterSpacing: {
    tighter: "-0.04em",
    tight: "-0.02em",
    normal: "0",
    wide: "0.02em",
  },
  space: {
    0: "0",
    px: "1px",
    0.5: "0.125rem",
    1: "0.25rem",
    1.5: "0.375rem",
    2: "0.5rem",
    2.5: "0.625rem",
    3: "0.75rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    8: "2rem",
    10: "2.5rem",
    12: "3rem",
    16: "4rem",
  },
  radius: {
    none: "0",
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    full: "9999px",
  },
  shadow: {
    xs: "0 1px 1px rgb(16 18 16 / 0.04)",
    sm: "0 1px 2px rgb(16 18 16 / 0.05), 0 2px 8px rgb(16 18 16 / 0.04)",
    md: "0 2px 4px rgb(16 18 16 / 0.04), 0 12px 28px rgb(16 18 16 / 0.08)",
    lg: "0 8px 16px rgb(16 18 16 / 0.06), 0 24px 48px rgb(16 18 16 / 0.1)",
    glow: "0 0 0 1px color-mix(in oklab, var(--primary) 18%, transparent), 0 8px 24px color-mix(in oklab, var(--primary) 12%, transparent)",
  },
  motion: {
    duration: {
      instant: 100,
      fast: 160,
      normal: 220,
      slow: 320,
      slower: 480,
    },
    easing: {
      /** Apple-like soft settle */
      soft: "cubic-bezier(0.22, 1, 0.36, 1)",
      /** Linear-like snappy */
      snappy: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      /** Emphasized enter */
      emphasize: "cubic-bezier(0.16, 1, 0.3, 1)",
      out: "cubic-bezier(0.4, 0, 1, 1)",
    },
  },
  zIndex: {
    base: 0,
    sticky: 20,
    dropdown: 40,
    overlay: 50,
    modal: 60,
    toast: 70,
  },
} as const;

export type DesignTokens = typeof designTokens;
