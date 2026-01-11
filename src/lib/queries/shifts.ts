import { prisma } from "@/lib/prisma";

export async function getShifts(filters?: {
  date?: string;
  status?: string;
  siteId?: string;
}) {
  const dateFilter = filters?.date ? new Date(filters.date) : undefined;

  return prisma.shift.findMany({
    where: {
      AND: [
        dateFilter
          ? {
              shiftDate: dateFilter,
            }
          : {},
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
      employee: {
        include: {
          designation: true,
        },
      },
      post: {
        include: {
          site: true,
        },
      },
      shiftTemplate: true,
      _count: {
        select: {
          attendance: true,
        },
      },
    },
    orderBy: [{ shiftDate: "desc" }, { startTime: "asc" }],
  });
}

export async function getShiftStatuses() {
  return ["scheduled", "in_progress", "completed", "cancelled"];
}
