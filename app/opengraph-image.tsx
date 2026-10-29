import { homeImage, OG_SIZE } from "@/lib/og/render";
import { displayHost, serverOrigin } from "@/lib/site";

export const alt = "Poocho: get asked anything, only by real people";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return homeImage(displayHost(serverOrigin()));
}
