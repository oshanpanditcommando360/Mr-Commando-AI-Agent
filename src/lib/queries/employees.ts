import { prisma } from "@/lib/prisma";

export async function getEmployees(filters?: {
  search?: string;
  designationId?: string;
  isActive?: boolean;
}) {
  return prisma.employee.findMany({
    where: {
      AND: [
        filters?.search
          ? {
              OR: [
                { firstName: { contains: filters.search, mode: "insensitive" } },
                { lastName: { contains: filters.search, mode: "insensitive" } },
                { employeeCode: { contains: filters.search, mode: "insensitive" } },
                { email: { contains: filters.search, mode: "insensitive" } },
              ],
            }
          : {},
        filters?.designationId ? { designationId: filters.designationId } : {},
        filters?.isActive !== undefined ? { isActive: filters.isActive } : {},
      ],
    },
    include: {
      designation: true,
      _count: {
        select: {
          shifts: true,
          attendance: true,
        },
      },
    },
    orderBy: {
      firstName: "asc",
    },
  });
}

export async function getEmployeeById(id: string) {
  return prisma.employee.findUnique({
    where: { id },
    include: {
      designation: true,
      employeeSiteAssignments: {
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
      shifts: {
        include: {
          post: {
            include: {
              site: true,
            },
          },
        },
        orderBy: {
          shiftDate: "desc",
        },
        take: 20,
      },
      attendance: {
        include: {
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
        take: 20,
      },
    },
  });
}

export async function getDesignationsForFilter() {
  return prisma.designation.findMany({
    select: { id: true, name: true },
    orderBy: { level: "asc" },
  });
}
