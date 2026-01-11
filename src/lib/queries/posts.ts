import { prisma } from "@/lib/prisma";

export async function getPosts(filters?: {
  search?: string;
  siteId?: string;
  isActive?: boolean;
}) {
  return prisma.post.findMany({
    where: {
      AND: [
        filters?.search
          ? {
              OR: [
                { name: { contains: filters.search, mode: "insensitive" } },
                { code: { contains: filters.search, mode: "insensitive" } },
              ],
            }
          : {},
        filters?.siteId ? { siteId: filters.siteId } : {},
        filters?.isActive !== undefined ? { isActive: filters.isActive } : {},
      ],
    },
    include: {
      site: {
        include: {
          opzone: {
            include: {
              region: {
                include: {
                  client: true,
                },
              },
            },
          },
        },
      },
      _count: {
        select: {
          shifts: true,
          incidents: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function getPostById(id: string) {
  return prisma.post.findUnique({
    where: { id },
    include: {
      site: {
        include: {
          opzone: {
            include: {
              region: {
                include: {
                  client: true,
                },
              },
            },
          },
        },
      },
      shifts: {
        include: {
          employee: {
            include: {
              designation: true,
            },
          },
        },
        orderBy: {
          shiftDate: "desc",
        },
        take: 20,
      },
      incidents: {
        include: {
          reporter: true,
        },
        orderBy: {
          occurredAt: "desc",
        },
        take: 10,
      },
    },
  });
}

export async function getSitesForFilter() {
  return prisma.site.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
