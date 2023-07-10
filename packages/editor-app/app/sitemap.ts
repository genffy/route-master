import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { APP_DOMAIN_URL } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const users = await prisma.user.findMany({
    select: {
      id: true,
    },
    take: 1,
  });

  return [
    {
      url: APP_DOMAIN_URL,
      lastModified: new Date(),
    },
    ...users.map((user: any) => ({
      url: `${APP_DOMAIN_URL}/${user.id}`,
      lastModified: new Date(),
    })),
  ];
}
