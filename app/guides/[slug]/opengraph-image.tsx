import { contentRoute } from "@/components/content/route";
import { OG_SIZE } from "@/lib/og/render";

export const alt = "A Poocho guide: anonymous questions, done honestly";
export const size = OG_SIZE;
export const contentType = "image/png";

const route = contentRoute("guides");

export const generateStaticParams = route.generateStaticParams;
export default route.Image;
