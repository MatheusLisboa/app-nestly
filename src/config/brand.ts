/**
 * Centralized product branding for MyNinho.
 * Change name, colors, assets and institutional copy here — never hardcode in features.
 */
export const brand = {
  name: "MyNinho",
  legalName: "MyNinho",
  tagline: "O ninho da sua família",
  description:
    "Organize a rotina em casa com carinho: compras, bebê, contas, limpeza e o que importa no dia a dia.",
  url:
    process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.length > 0
      ? process.env.NEXT_PUBLIC_APP_URL
      : "http://localhost:3000",
  supportEmail: "suporte@myninho.app",
  assets: {
    logo: "/brand/logo.svg",
    logoMark: "/brand/logo-mark.svg",
    logoMarkMaskable: "/brand/logo-mark-maskable.svg",
    favicon: "/brand/favicon.ico",
    appleTouchIcon: "/brand/apple-touch-icon.png",
    icon192: "/brand/icon-192.png",
    icon512: "/brand/icon-512.png",
    iconMaskable512: "/brand/icon-maskable-512.png",
    ogImage: "/brand/og.png",
  },
  colors: {
    /** Nest sage — primary actions & identity */
    primary: "#2F6F5E",
    primaryForeground: "#F4FBF7",
    /** Soft coral — warmth, family, highlights */
    accent: "#D4846A",
    accentForeground: "#FFF8F5",
  },
  themeColor: {
    light: "#F3F6F4",
    dark: "#0F1412",
  },
  designLanguage: "Ninho",
} as const;

export type Brand = typeof brand;
