import { contentImage, OG_SIZE } from "@/lib/og/render";
import { displayHost, serverOrigin } from "@/lib/site";

export const alt = "Poocho: Anonymous questions, done honestly";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return contentImage({ eyebrow: "Guides", title: "Anonymous questions, done honestly", host: displayHost(serverOrigin()) });
}
