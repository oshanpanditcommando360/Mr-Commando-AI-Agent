import { prisma } from "@/lib/prisma";

export async function getAttendance(filters?: {
  startDate?: string;
  endDate?: string;
  status?: string;
  employeeId?: string;
}) {
  const startDateFilter = filters?.startDate ? new Date(filters.startDate) : undefined;
  const endDateFilter = filters?.endDate ? new Date(filters.endDate) : undefined;

  return prisma.attendance.findMany({
    where: {
      AND: [
        startDateFilter && endDateFilter
          ? {
              shift: {
                shiftDate: {
                  gte: startDateFilter,
                  lte: endDateFilter,
                },
              },
            }
          : {},
        filters?.status ? { status: filters.status } : {},
        filters?.employeeId ? { employeeId: filters.employeeId } : {},
      ],
    },
    include: {
      employee: {
        include: {
          designation: true,
        },
      },
      shift: {
        include: {
          post: {
            include: {
              site: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getAttendanceStatuses() {
  return ["present", "absent", "late", "half_day"];
}
