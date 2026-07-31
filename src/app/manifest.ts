import type { MetadataRoute } from "next";
import { brand } from "@/config/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: brand.name,
    short_name: brand.name,
    description: brand.description,
    start_url: "/",
    scope: "/",
    id: "/",
    display: "standalone",
    background_color: brand.themeColor.light,
    theme_color: brand.colors.primary,
    lang: "pt-BR",
    dir: "ltr",
    orientation: "portrait-primary",
    categories: ["lifestyle", "productivity"],
    icons: [
      {
        src: brand.assets.icon192,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: brand.assets.icon512,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: brand.assets.iconMaskable512,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: brand.assets.logoMark,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
