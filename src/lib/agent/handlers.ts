import { prisma } from "@/lib/prisma";

export async function handleFunctionCall(
  functionName: string,
  args: Record<string, unknown>
): Promise<string> {
  try {
    switch (functionName) {
      case "get_dashboard_stats":
        return JSON.stringify(await getDashboardStats());

      case "get_all_clients":
        return JSON.stringify(await getAllClients());

      case "get_all_sites":
        return JSON.stringify(await getAllSites());

      case "get_all_employees":
        return JSON.stringify(await getAllEmployees());

      case "get_site_details":
        return JSON.stringify(await getSiteDetails(args.site_name as string));

      case "get_posts_for_site":
        return JSON.stringify(await getPostsForSite(args.site_name as string));

      case "get_employee_details":
        return JSON.stringify(await getEmployeeDetails(args.name_or_code as string));

      case "get_todays_shifts":
        return JSON.stringify(await getTodaysShifts(args.site_name as string | undefined));

      case "get_current_shifts":
        return JSON.stringify(await getCurrentShifts(args.site_name as string | undefined));

      case "get_recent_incidents":
        return JSON.stringify(
          await getRecentIncidents(
            args.days as number | undefined,
            args.site_name as string | undefined
          )
        );

      default:
        return JSON.stringify({ error: `Unknown function: ${functionName}` });
    }
  } catch (error) {
    console.error(`Error in ${functionName}:`, error);
    return JSON.stringify({ error: `Failed to execute ${functionName}` });
  }
}

async function getDashboardStats() {
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

async function getAllClients() {
  const clients = await prisma.client.findMany({
    select: {
      id: true,
      name: true,
      code: true,
      industry: true,
      city: true,
      state: true,
      isActive: true,
      _count: {
        select: { regions: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return clients.map((c) => ({
    name: c.name,
    code: c.code,
    industry: c.industry,
    location: [c.city, c.state].filter(Boolean).join(", ") || null,
    isActive: c.isActive,
    regionsCount: c._count.regions,
  }));
}

async function getAllSites() {
  const sites = await prisma.site.findMany({
    select: {
      id: true,
      name: true,
      code: true,
      city: true,
      state: true,
      isActive: true,
      opzone: {
        select: {
          name: true,
          region: {
            select: {
              name: true,
              client: {
                select: { name: true },
              },
            },
          },
        },
      },
      _count: {
        select: { posts: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return sites.map((s) => ({
    name: s.name,
    code: s.code,
    location: [s.city, s.state].filter(Boolean).join(", ") || null,
    client: s.opzone.region.client.name,
    region: s.opzone.region.name,
    opzone: s.opzone.name,
    postsCount: s._count.posts,
    isActive: s.isActive,
  }));
}

async function getAllEmployees() {
  const employees = await prisma.employee.findMany({
    select: {
      employeeCode: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      isActive: true,
      designation: {
        select: { name: true },
      },
    },
    orderBy: { firstName: "asc" },
  });

  return employees.map((e) => ({
    name: `${e.firstName} ${e.lastName}`,
    code: e.employeeCode,
    designation: e.designation.name,
    phone: e.phone,
    email: e.email,
    isActive: e.isActive,
  }));
}

async function getSiteDetails(siteName: string) {
  const site = await prisma.site.findFirst({
    where: {
      name: { contains: siteName, mode: "insensitive" },
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
      posts: {
        where: { isActive: true },
        select: {
          name: true,
          code: true,
          postType: true,
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

  if (!site) {
    return { error: `No site found matching "${siteName}"` };
  }

  return {
    name: site.name,
    code: site.code,
    address: site.address,
    city: site.city,
    state: site.state,
    pincode: site.pincode,
    siteIncharge: site.siteInchargeName,
    siteInchargePhone: site.siteInchargePhone,
    client: site.opzone.region.client.name,
    region: site.opzone.region.name,
    opzone: site.opzone.name,
    isActive: site.isActive,
    posts: site.posts,
    assignedEmployees: site.employeeSiteAssignments.map((a) => ({
      name: `${a.employee.firstName} ${a.employee.lastName}`,
      designation: a.employee.designation.name,
      isPrimary: a.isPrimary,
    })),
  };
}

async function getPostsForSite(siteName: string) {
  const site = await prisma.site.findFirst({
    where: {
      name: { contains: siteName, mode: "insensitive" },
    },
    include: {
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
    },
  });

  if (!site) {
    return { error: `No site found matching "${siteName}"` };
  }

  return {
    siteName: site.name,
    posts: site.posts.map((p) => ({
      name: p.name,
      code: p.code,
      type: p.postType,
      description: p.description,
      isActive: p.isActive,
      totalShifts: p._count.shifts,
      totalIncidents: p._count.incidents,
    })),
  };
}

async function getEmployeeDetails(nameOrCode: string) {
  const employee = await prisma.employee.findFirst({
    where: {
      OR: [
        { employeeCode: { contains: nameOrCode, mode: "insensitive" } },
        { firstName: { contains: nameOrCode, mode: "insensitive" } },
        { lastName: { contains: nameOrCode, mode: "insensitive" } },
      ],
    },
    include: {
      designation: true,
      employeeSiteAssignments: {
        include: {
          site: {
            include: {
              opzone: {
                include: {
                  region: {
                    include: { client: true },
                  },
                },
              },
            },
          },
        },
      },
      shifts: {
        take: 5,
        orderBy: { shiftDate: "desc" },
        include: {
          post: {
            include: { site: true },
          },
        },
      },
    },
  });

  if (!employee) {
    return { error: `No employee found matching "${nameOrCode}"` };
  }

  return {
    name: `${employee.firstName} ${employee.lastName}`,
    code: employee.employeeCode,
    designation: employee.designation.name,
    phone: employee.phone,
    email: employee.email,
    city: employee.city,
    state: employee.state,
    isActive: employee.isActive,
    assignedSites: employee.employeeSiteAssignments.map((a) => ({
      site: a.site.name,
      client: a.site.opzone.region.client.name,
      isPrimary: a.isPrimary,
    })),
    recentShifts: employee.shifts.map((s) => ({
      date: s.shiftDate.toISOString().split("T")[0],
      site: s.post.site.name,
      post: s.post.name,
      time: `${formatTime(s.startTime)} - ${formatTime(s.endTime)}`,
      status: s.status,
    })),
  };
}

async function getTodaysShifts(siteName?: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const shifts = await prisma.shift.findMany({
    where: {
      shiftDate: {
        gte: today,
        lt: tomorrow,
      },
      ...(siteName && {
        post: {
          site: {
            name: { contains: siteName, mode: "insensitive" },
          },
        },
      }),
    },
    include: {
      employee: {
        include: { designation: true },
      },
      post: {
        include: { site: true },
      },
    },
    orderBy: { startTime: "asc" },
  });

  return {
    date: today.toISOString().split("T")[0],
    totalShifts: shifts.length,
    shifts: shifts.map((s) => ({
      employee: `${s.employee.firstName} ${s.employee.lastName}`,
      designation: s.employee.designation.name,
      site: s.post.site.name,
      post: s.post.name,
      time: `${formatTime(s.startTime)} - ${formatTime(s.endTime)}`,
      status: s.status,
    })),
  };
}

async function getCurrentShifts(siteName?: string) {
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const shifts = await prisma.shift.findMany({
    where: {
      shiftDate: {
        gte: today,
        lt: tomorrow,
      },
      status: { in: ["scheduled", "in_progress"] },
      ...(siteName && {
        post: {
          site: {
            name: { contains: siteName, mode: "insensitive" },
          },
        },
      }),
    },
    include: {
      employee: {
        include: { designation: true },
      },
      post: {
        include: { site: true },
      },
    },
    orderBy: { startTime: "asc" },
  });

  // Filter shifts that are currently active based on time
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const currentShifts = shifts.filter((s) => {
    const startMinutes = s.startTime.getHours() * 60 + s.startTime.getMinutes();
    const endMinutes = s.endTime.getHours() * 60 + s.endTime.getMinutes();

    // Handle overnight shifts
    if (endMinutes < startMinutes) {
      return currentTime >= startMinutes || currentTime <= endMinutes;
    }
    return currentTime >= startMinutes && currentTime <= endMinutes;
  });

  return {
    currentTime: formatTime(now),
    onDutyCount: currentShifts.length,
    shifts: currentShifts.map((s) => ({
      employee: `${s.employee.firstName} ${s.employee.lastName}`,
      designation: s.employee.designation.name,
      site: s.post.site.name,
      post: s.post.name,
      time: `${formatTime(s.startTime)} - ${formatTime(s.endTime)}`,
      status: s.status,
    })),
  };
}

async function getRecentIncidents(days: number = 7, siteName?: string) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const incidents = await prisma.incident.findMany({
    where: {
      occurredAt: { gte: startDate },
      ...(siteName && {
        post: {
          site: {
            name: { contains: siteName, mode: "insensitive" },
          },
        },
      }),
    },
    include: {
      post: {
        include: { site: true },
      },
      reporter: true,
    },
    orderBy: { occurredAt: "desc" },
  });

  return {
    period: `Last ${days} days`,
    totalIncidents: incidents.length,
    incidents: incidents.map((i) => ({
      title: i.title,
      type: i.incidentType,
      severity: i.severity,
      status: i.status,
      site: i.post.site.name,
      post: i.post.name,
      reportedBy: `${i.reporter.firstName} ${i.reporter.lastName}`,
      occurredAt: i.occurredAt.toISOString(),
      description: i.description,
    })),
  };
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
