import { contentRoute } from "@/components/content/route";

const route = contentRoute("guides", "hi");

export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;
