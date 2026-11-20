import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Synseafy — Personal Liquid Music Player",
    short_name: "Synseafy",
    description:
      "Personal Liquid Glass Music Player in the Wynnsea ecosystem with YouTube Music integration.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#03131f",
    theme_color: "#03131f",
    categories: ["music", "entertainment"],
    icons: [
      {
        src: "/brand/logo-v3.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/logo-v3.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
