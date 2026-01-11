import { prisma } from "@/lib/prisma";

export async function getSites(filters?: {
  search?: string;
  clientId?: string;
  isActive?: boolean;
}) {
  return prisma.site.findMany({
    where: {
      AND: [
        filters?.search
          ? {
              OR: [
                { name: { contains: filters.search, mode: "insensitive" } },
                { code: { contains: filters.search, mode: "insensitive" } },
                { city: { contains: filters.search, mode: "insensitive" } },
              ],
            }
          : {},
        filters?.clientId
          ? {
              opzone: {
                region: {
                  clientId: filters.clientId,
                },
              },
            }
          : {},
        filters?.isActive !== undefined ? { isActive: filters.isActive } : {},
      ],
    },
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
      _count: {
        select: {
          posts: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function getSiteById(id: string) {
  return prisma.site.findUnique({
    where: { id },
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
      posts: {
        include: {
          _count: {
            select: {
              shifts: true,
              incidents: true,
            },
          },
        },
      },
      employeeSiteAssignments: {
        include: {
          employee: {
            include: {
              designation: true,
            },
          },
        },
      },
    },
  });
}

export async function getClientsForFilter() {
  return prisma.client.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
