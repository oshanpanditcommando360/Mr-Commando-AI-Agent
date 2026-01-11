import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  const [
    totalClients,
    activeClients,
    totalSites,
    activeSites,
    totalEmployees,
    activeEmployees,
    totalPosts,
    openIncidents,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.client.count({ where: { isActive: true } }),
    prisma.site.count(),
    prisma.site.count({ where: { isActive: true } }),
    prisma.employee.count(),
    prisma.employee.count({ where: { isActive: true } }),
    prisma.post.count(),
    prisma.incident.count({ where: { status: { in: ["open", "investigating"] } } }),
  ]);

  return {
    totalClients,
    activeClients,
    totalSites,
    activeSites,
    totalEmployees,
    activeEmployees,
    totalPosts,
    openIncidents,
  };
}

export async function getTodayShifts() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return prisma.shift.findMany({
    where: {
      shiftDate: {
        gte: today,
        lt: tomorrow,
      },
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
    },
    orderBy: {
      startTime: "asc",
    },
    take: 10,
  });
}

export async function getRecentIncidents() {
  return prisma.incident.findMany({
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
    take: 5,
  });
}

export async function getSitesOverview() {
  return prisma.site.findMany({
    where: { isActive: true },
    include: {
      posts: {
        where: { isActive: true },
      },
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
    take: 6,
  });
}
