import { prisma } from "@/lib/prisma";

export async function getIncidents(filters?: {
  severity?: string;
  status?: string;
  siteId?: string;
}) {
  return prisma.incident.findMany({
    where: {
      AND: [
        filters?.severity ? { severity: filters.severity } : {},
        filters?.status ? { status: filters.status } : {},
        filters?.siteId
          ? {
              post: {
                siteId: filters.siteId,
              },
            }
          : {},
      ],
    },
    include: {
      post: {
        include: {
          site: true,
        },
      },
      reporter: true,
    },
    orderBy: {
      occurredAt: "desc",
    },
  });
}

export async function getIncidentById(id: string) {
  return prisma.incident.findUnique({
    where: { id },
    include: {
      post: {
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
        },
      },
      reporter: {
        include: {
          designation: true,
        },
      },
    },
  });
}

export async function getIncidentSeverities() {
  return ["low", "medium", "high", "critical"];
}

export async function getIncidentStatuses() {
  return ["open", "investigating", "resolved", "closed"];
}
