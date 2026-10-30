import { contentImage, OG_SIZE } from "@/lib/og/render";
import { displayHost, serverOrigin } from "@/lib/site";

export const alt = "Poocho: The Real Questions Pledge";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return contentImage({ eyebrow: "Our pledge", title: "The Real Questions Pledge", host: displayHost(serverOrigin()) });
}
