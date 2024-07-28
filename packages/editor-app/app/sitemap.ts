import { MetadataRoute } from "next";
import { APP_DOMAIN_URL } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  return [
    {
      url: APP_DOMAIN_URL,
      lastModified: new Date(),
    },
  ];
}
