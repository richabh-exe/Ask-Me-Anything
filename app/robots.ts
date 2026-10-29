import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

/* Host screens and the API are private; everything else may be crawled. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/inbox", "/settings", "/start", "/sign-in", "/admin", "/api/"] },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
