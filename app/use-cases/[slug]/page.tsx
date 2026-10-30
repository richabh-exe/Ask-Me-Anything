import { contentRoute } from "@/components/content/route";

const route = contentRoute("use-cases");

export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;
