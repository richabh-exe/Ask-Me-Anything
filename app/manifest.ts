import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Poocho",
    short_name: "Poocho",
    description: "Anonymous questions from real people, filtered before you see them.",
    start_url: "/inbox",
    display: "standalone",
    background_color: "#F5F7FD",
    theme_color: "#2940D9",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
