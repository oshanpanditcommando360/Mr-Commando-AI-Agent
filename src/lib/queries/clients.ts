import { prisma } from "@/lib/prisma";

export async function getClients(search?: string) {
  return prisma.client.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { code: { contains: search, mode: "insensitive" } },
            { city: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: {
      _count: {
        select: {
          regions: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function getClientById(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: {
      regions: {
        include: {
          opzones: {
            include: {
              sites: {
                include: {
                  _count: {
                    select: { posts: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}
