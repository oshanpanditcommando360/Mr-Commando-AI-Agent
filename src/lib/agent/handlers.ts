import { prisma } from "@/lib/prisma";

export async function handleFunctionCall(
  functionName: string,
  args: Record<string, unknown>
): Promise<string> {
  try {
    switch (functionName) {
      // DASHBOARD
      case "get_dashboard_stats":
        return JSON.stringify(await getDashboardStats());

      // CLIENT QUERIES
      case "get_all_clients":
        return JSON.stringify(await getAllClients());
      case "get_client_details":
        return JSON.stringify(await getClientDetails(args.client_name as string));
      case "get_client_hierarchy":
        return JSON.stringify(await getClientHierarchy(args.client_name as string));
      case "get_client_stats":
        return JSON.stringify(await getClientStats(args.client_name as string));

      // SITE QUERIES
      case "get_all_sites":
        return JSON.stringify(await getAllSites());
      case "get_site_details":
        return JSON.stringify(await getSiteDetails(args.site_name as string));
      case "get_employees_at_site":
        return JSON.stringify(await getEmployeesAtSite(args.site_name as string));
      case "get_site_shifts":
        return JSON.stringify(
          await getSiteShifts(
            args.site_name as string,
            args.start_date as string | undefined,
            args.end_date as string | undefined
          )
        );
      case "get_site_incidents":
        return JSON.stringify(
          await getSiteIncidents(
            args.site_name as string,
            args.status as string | undefined,
            args.days as number | undefined
          )
        );

      // POST QUERIES
      case "get_posts_for_site":
        return JSON.stringify(await getPostsForSite(args.site_name as string));
      case "get_post_details":
        return JSON.stringify(
          await getPostDetails(args.site_name as string, args.post_name as string)
        );
      case "get_post_shift_history":
        return JSON.stringify(
          await getPostShiftHistory(
            args.site_name as string,
            args.post_name as string,
            args.days as number | undefined
          )
        );

      // EMPLOYEE QUERIES
      case "get_all_employees":
        return JSON.stringify(await getAllEmployees());
      case "search_employee":
        return JSON.stringify(await searchEmployee(args.search_term as string));
      case "get_employee_details":
        return JSON.stringify(await getEmployeeDetails(args.name_or_code as string));
      case "get_employee_shifts":
        return JSON.stringify(
          await getEmployeeShifts(
            args.employee_identifier as string,
            args.date_filter as string | undefined
          )
        );
      case "get_employee_attendance":
        return JSON.stringify(
          await getEmployeeAttendance(
            args.employee_identifier as string,
            args.days as number | undefined
          )
        );
      case "get_all_designations":
        return JSON.stringify(await getAllDesignations());
      case "get_employees_by_designation":
        return JSON.stringify(await getEmployeesByDesignation(args.designation as string));

      // SHIFT QUERIES
      case "get_todays_shifts":
        return JSON.stringify(
          await getTodaysShifts(
            args.site_name as string | undefined,
            args.employee_name as string | undefined
          )
        );
      case "get_current_shifts":
        return JSON.stringify(await getCurrentShifts(args.site_name as string | undefined));
      case "get_shifts_by_date":
        return JSON.stringify(
          await getShiftsByDate(args.date as string, args.site_name as string | undefined)
        );
      case "get_shift_details":
        return JSON.stringify(await getShiftDetails(args.shift_id as string));

      // INCIDENT QUERIES
      case "get_recent_incidents":
        return JSON.stringify(
          await getRecentIncidents(
            args.days as number | undefined,
            args.site_name as string | undefined
          )
        );
      case "get_incident_details":
        return JSON.stringify(await getIncidentDetails(args.incident_id as string));
      case "get_incidents_by_type":
        return JSON.stringify(
          await getIncidentsByType(args.incident_type as string, args.days as number | undefined)
        );

      // SEARCH
      case "search_all":
        return JSON.stringify(await searchAll(args.keyword as string));

      default:
        return JSON.stringify({ error: `Unknown function: ${functionName}` });
    }
  } catch (error) {
    console.error(`Error in ${functionName}:`, error);
    return JSON.stringify({ error: `Failed to execute ${functionName}` });
  }
}

// ============ DASHBOARD ============
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

// ============ CLIENT QUERIES ============
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
      _count: { select: { regions: true } },
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

async function getClientDetails(clientName: string) {
  const client = await prisma.client.findFirst({
    where: { name: { contains: clientName, mode: "insensitive" } },
    include: {
      regions: {
        include: {
          opzones: {
            include: {
              sites: {
                select: {
                  name: true,
                  code: true,
                  city: true,
                  isActive: true,
                  _count: { select: { posts: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!client) {
    return { error: `No client found matching "${clientName}"` };
  }

  const totalSites = client.regions.reduce(
    (acc, r) => acc + r.opzones.reduce((a, o) => a + o.sites.length, 0),
    0
  );

  return {
    name: client.name,
    code: client.code,
    industry: client.industry,
    contactPerson: client.contactPerson,
    contactEmail: client.contactEmail,
    contactPhone: client.contactPhone,
    location: [client.city, client.state].filter(Boolean).join(", ") || null,
    isActive: client.isActive,
    totalRegions: client.regions.length,
    totalSites,
    regions: client.regions.map((r) => ({
      name: r.name,
      code: r.code,
      opzones: r.opzones.map((o) => ({
        name: o.name,
        sites: o.sites.map((s) => ({
          name: s.name,
          code: s.code,
          city: s.city,
          postsCount: s._count.posts,
          isActive: s.isActive,
        })),
      })),
    })),
  };
}

async function getClientHierarchy(clientName: string) {
  const client = await prisma.client.findFirst({
    where: { name: { contains: clientName, mode: "insensitive" } },
    include: {
      regions: {
        include: {
          opzones: {
            include: {
              sites: {
                include: {
                  posts: { select: { id: true, name: true, code: true, postType: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!client) {
    return { error: `No client found matching "${clientName}"` };
  }

  return {
    client: client.name,
    code: client.code,
    hierarchy: client.regions.map((r) => ({
      region: r.name,
      opzones: r.opzones.map((o) => ({
        opzone: o.name,
        sites: o.sites.map((s) => ({
          site: s.name,
          code: s.code,
          city: s.city,
          posts: s.posts,
        })),
      })),
    })),
  };
}

async function getClientStats(clientName: string) {
  const client = await prisma.client.findFirst({
    where: { name: { contains: clientName, mode: "insensitive" } },
    include: {
      regions: {
        include: {
          opzones: {
            include: {
              sites: {
                include: {
                  posts: { select: { id: true } },
                  employeeSiteAssignments: { select: { id: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!client) {
    return { error: `No client found matching "${clientName}"` };
  }

  let regionCount = 0,
    opzoneCount = 0,
    siteCount = 0,
    postCount = 0,
    employeeAssignments = 0;

  client.regions.forEach((r) => {
    regionCount++;
    r.opzones.forEach((o) => {
      opzoneCount++;
      o.sites.forEach((s) => {
        siteCount++;
        postCount += s.posts.length;
        employeeAssignments += s.employeeSiteAssignments.length;
      });
    });
  });

  return {
    client: client.name,
    regions: regionCount,
    opzones: opzoneCount,
    sites: siteCount,
    posts: postCount,
    employeeAssignments,
  };
}

// ============ SITE QUERIES ============
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
              client: { select: { name: true } },
            },
          },
        },
      },
      _count: { select: { posts: true } },
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

async function getSiteDetails(siteName: string) {
  const site = await prisma.site.findFirst({
    where: { name: { contains: siteName, mode: "insensitive" } },
    include: {
      opzone: {
        include: {
          region: { include: { client: true } },
        },
      },
      posts: {
        where: { isActive: true },
        select: { id: true, name: true, code: true, postType: true },
      },
      employeeSiteAssignments: {
        include: {
          employee: { include: { designation: true } },
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
    totalPosts: site.posts.length,
    posts: site.posts,
    totalAssignedEmployees: site.employeeSiteAssignments.length,
    assignedEmployees: site.employeeSiteAssignments.map((a) => ({
      name: `${a.employee.firstName} ${a.employee.lastName}`,
      employeeCode: a.employee.employeeCode,
      designation: a.employee.designation.name,
      phone: a.employee.phone,
      isPrimary: a.isPrimary,
    })),
  };
}

async function getEmployeesAtSite(siteName: string) {
  const site = await prisma.site.findFirst({
    where: { name: { contains: siteName, mode: "insensitive" } },
    include: {
      employeeSiteAssignments: {
        include: {
          employee: {
            include: {
              designation: true,
              _count: { select: { shifts: true } },
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
    site: site.name,
    totalEmployees: site.employeeSiteAssignments.length,
    employees: site.employeeSiteAssignments.map((a) => ({
      employeeCode: a.employee.employeeCode,
      name: `${a.employee.firstName} ${a.employee.lastName}`,
      designation: a.employee.designation.name,
      phone: a.employee.phone,
      email: a.employee.email,
      isPrimary: a.isPrimary,
      totalShifts: a.employee._count.shifts,
      isActive: a.employee.isActive,
    })),
  };
}

async function getSiteShifts(siteName: string, startDate?: string, endDate?: string) {
  const start = startDate ? new Date(startDate) : new Date();
  start.setHours(0, 0, 0, 0);

  const end = endDate ? new Date(endDate) : new Date(start);
  if (!endDate) {
    end.setDate(end.getDate() + 7);
  }
  end.setHours(23, 59, 59, 999);

  const site = await prisma.site.findFirst({
    where: { name: { contains: siteName, mode: "insensitive" } },
    select: { id: true, name: true },
  });

  if (!site) {
    return { error: `No site found matching "${siteName}"` };
  }

  const shifts = await prisma.shift.findMany({
    where: {
      post: { siteId: site.id },
      shiftDate: { gte: start, lte: end },
    },
    include: {
      employee: { include: { designation: true } },
      post: true,
    },
    orderBy: [{ shiftDate: "asc" }, { startTime: "asc" }],
  });

  return {
    site: site.name,
    period: `${start.toISOString().split("T")[0]} to ${end.toISOString().split("T")[0]}`,
    totalShifts: shifts.length,
    shifts: shifts.map((s) => ({
      date: s.shiftDate.toISOString().split("T")[0],
      post: s.post.name,
      employee: `${s.employee.firstName} ${s.employee.lastName}`,
      employeeCode: s.employee.employeeCode,
      designation: s.employee.designation.name,
      time: `${formatTime(s.startTime)} - ${formatTime(s.endTime)}`,
      status: s.status,
    })),
  };
}

async function getSiteIncidents(siteName: string, status?: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const site = await prisma.site.findFirst({
    where: { name: { contains: siteName, mode: "insensitive" } },
    select: { id: true, name: true },
  });

  if (!site) {
    return { error: `No site found matching "${siteName}"` };
  }

  const incidents = await prisma.incident.findMany({
    where: {
      post: { siteId: site.id },
      occurredAt: { gte: startDate },
      ...(status && { status }),
    },
    include: {
      post: true,
      reporter: true,
    },
    orderBy: { occurredAt: "desc" },
  });

  return {
    site: site.name,
    period: `Last ${days} days`,
    totalIncidents: incidents.length,
    incidents: incidents.map((i) => ({
      id: i.id,
      title: i.title,
      type: i.incidentType,
      severity: i.severity,
      status: i.status,
      post: i.post.name,
      reportedBy: `${i.reporter.firstName} ${i.reporter.lastName}`,
      occurredAt: i.occurredAt.toISOString(),
      description: i.description,
    })),
  };
}

// ============ POST QUERIES ============
async function getPostsForSite(siteName: string) {
  const site = await prisma.site.findFirst({
    where: { name: { contains: siteName, mode: "insensitive" } },
    include: {
      posts: {
        include: {
          _count: { select: { shifts: true, incidents: true } },
        },
      },
    },
  });

  if (!site) {
    return { error: `No site found matching "${siteName}"` };
  }

  return {
    siteName: site.name,
    totalPosts: site.posts.length,
    posts: site.posts.map((p) => ({
      id: p.id,
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

async function getPostDetails(siteName: string, postName: string) {
  const site = await prisma.site.findFirst({
    where: { name: { contains: siteName, mode: "insensitive" } },
    include: {
      posts: {
        where: { name: { contains: postName, mode: "insensitive" } },
        include: {
          _count: { select: { shifts: true, incidents: true } },
        },
      },
    },
  });

  if (!site) {
    return { error: `No site found matching "${siteName}"` };
  }

  const post = site.posts[0];
  if (!post) {
    return { error: `No post found matching "${postName}" at ${site.name}` };
  }

  // Get current shift
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const currentShift = await prisma.shift.findFirst({
    where: {
      postId: post.id,
      shiftDate: { gte: today, lt: tomorrow },
      status: { in: ["scheduled", "in_progress"] },
    },
    include: {
      employee: { include: { designation: true } },
    },
    orderBy: { startTime: "asc" },
  });

  return {
    site: site.name,
    post: {
      id: post.id,
      name: post.name,
      code: post.code,
      type: post.postType,
      description: post.description,
      isActive: post.isActive,
      totalShifts: post._count.shifts,
      totalIncidents: post._count.incidents,
    },
    currentShift: currentShift
      ? {
          employee: `${currentShift.employee.firstName} ${currentShift.employee.lastName}`,
          employeeCode: currentShift.employee.employeeCode,
          designation: currentShift.employee.designation.name,
          time: `${formatTime(currentShift.startTime)} - ${formatTime(currentShift.endTime)}`,
          status: currentShift.status,
        }
      : "No active shift",
  };
}

async function getPostShiftHistory(siteName: string, postName: string, days: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const site = await prisma.site.findFirst({
    where: { name: { contains: siteName, mode: "insensitive" } },
    include: {
      posts: {
        where: { name: { contains: postName, mode: "insensitive" } },
      },
    },
  });

  if (!site) {
    return { error: `No site found matching "${siteName}"` };
  }

  const post = site.posts[0];
  if (!post) {
    return { error: `No post found matching "${postName}" at ${site.name}` };
  }

  const shifts = await prisma.shift.findMany({
    where: {
      postId: post.id,
      shiftDate: { gte: startDate },
    },
    include: {
      employee: { include: { designation: true } },
    },
    orderBy: { shiftDate: "desc" },
  });

  return {
    site: site.name,
    post: post.name,
    period: `Last ${days} days`,
    totalShifts: shifts.length,
    shifts: shifts.map((s) => ({
      date: s.shiftDate.toISOString().split("T")[0],
      employee: `${s.employee.firstName} ${s.employee.lastName}`,
      employeeCode: s.employee.employeeCode,
      time: `${formatTime(s.startTime)} - ${formatTime(s.endTime)}`,
      status: s.status,
    })),
  };
}

// ============ EMPLOYEE QUERIES ============
async function getAllEmployees() {
  const employees = await prisma.employee.findMany({
    select: {
      id: true,
      employeeCode: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      city: true,
      state: true,
      isActive: true,
      designation: { select: { name: true } },
      _count: { select: { shifts: true, attendance: true } },
    },
    orderBy: { firstName: "asc" },
  });

  return employees.map((e) => ({
    id: e.id,
    employeeCode: e.employeeCode,
    name: `${e.firstName} ${e.lastName}`,
    designation: e.designation.name,
    phone: e.phone,
    email: e.email,
    location: [e.city, e.state].filter(Boolean).join(", ") || null,
    isActive: e.isActive,
    totalShifts: e._count.shifts,
  }));
}

async function searchEmployee(searchTerm: string) {
  const employees = await prisma.employee.findMany({
    where: {
      OR: [
        { employeeCode: { contains: searchTerm, mode: "insensitive" } },
        { firstName: { contains: searchTerm, mode: "insensitive" } },
        { lastName: { contains: searchTerm, mode: "insensitive" } },
        { phone: { contains: searchTerm, mode: "insensitive" } },
      ],
    },
    include: {
      designation: true,
      _count: { select: { shifts: true, attendance: true } },
    },
  });

  if (employees.length === 0) {
    return { found: 0, message: `No employees found matching "${searchTerm}"` };
  }

  return {
    found: employees.length,
    employees: employees.map((emp) => ({
      id: emp.id,
      employeeCode: emp.employeeCode,
      fullName: `${emp.firstName} ${emp.lastName}`,
      firstName: emp.firstName,
      lastName: emp.lastName,
      designation: emp.designation.name,
      designationLevel: emp.designation.level,
      phone: emp.phone,
      email: emp.email,
      city: emp.city,
      state: emp.state,
      isActive: emp.isActive,
      totalShifts: emp._count.shifts,
      totalAttendanceRecords: emp._count.attendance,
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
                  region: { include: { client: true } },
                },
              },
            },
          },
        },
      },
      shifts: {
        orderBy: { shiftDate: "desc" },
        take: 10,
        include: {
          post: { include: { site: true } },
        },
      },
      attendance: true,
    },
  });

  if (!employee) {
    return { error: `No employee found matching "${nameOrCode}"` };
  }

  const presentDays = employee.attendance.filter((a) => a.status === "present").length;
  const totalShifts = await prisma.shift.count({ where: { employeeId: employee.id } });

  return {
    id: employee.id,
    employeeCode: employee.employeeCode,
    name: `${employee.firstName} ${employee.lastName}`,
    firstName: employee.firstName,
    lastName: employee.lastName,
    designation: employee.designation.name,
    phone: employee.phone,
    email: employee.email,
    city: employee.city,
    state: employee.state,
    isActive: employee.isActive,
    totalShifts,
    completedShifts: employee.shifts.filter((s) => s.status === "completed").length,
    totalAttendanceRecords: employee.attendance.length,
    presentDays,
    attendanceRate:
      employee.attendance.length > 0
        ? `${Math.round((presentDays / employee.attendance.length) * 100)}%`
        : "N/A",
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

async function getEmployeeShifts(employeeIdentifier: string, dateFilter?: string) {
  const employee = await prisma.employee.findFirst({
    where: {
      OR: [
        { employeeCode: { contains: employeeIdentifier, mode: "insensitive" } },
        { firstName: { contains: employeeIdentifier, mode: "insensitive" } },
        { lastName: { contains: employeeIdentifier, mode: "insensitive" } },
      ],
    },
  });

  if (!employee) {
    return { error: `Employee "${employeeIdentifier}" not found` };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  let dateCondition = {};
  if (dateFilter === "past") {
    dateCondition = { shiftDate: { lt: today } };
  } else if (dateFilter === "today") {
    dateCondition = { shiftDate: { gte: today, lt: tomorrow } };
  } else if (dateFilter === "upcoming") {
    dateCondition = { shiftDate: { gte: tomorrow } };
  }

  const shifts = await prisma.shift.findMany({
    where: {
      employeeId: employee.id,
      ...dateCondition,
    },
    include: {
      post: { include: { site: true } },
    },
    orderBy: { shiftDate: "desc" },
  });

  return {
    employee: `${employee.firstName} ${employee.lastName}`,
    employeeCode: employee.employeeCode,
    filter: dateFilter || "all",
    totalShifts: shifts.length,
    shifts: shifts.map((s) => ({
      id: s.id,
      date: s.shiftDate.toISOString().split("T")[0],
      site: s.post.site.name,
      post: s.post.name,
      time: `${formatTime(s.startTime)} - ${formatTime(s.endTime)}`,
      status: s.status,
    })),
  };
}

async function getEmployeeAttendance(employeeIdentifier: string, days: number = 30) {
  const employee = await prisma.employee.findFirst({
    where: {
      OR: [
        { employeeCode: { contains: employeeIdentifier, mode: "insensitive" } },
        { firstName: { contains: employeeIdentifier, mode: "insensitive" } },
        { lastName: { contains: employeeIdentifier, mode: "insensitive" } },
      ],
    },
  });

  if (!employee) {
    return { error: `Employee "${employeeIdentifier}" not found` };
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const attendance = await prisma.attendance.findMany({
    where: {
      employeeId: employee.id,
      createdAt: { gte: startDate },
    },
    include: {
      shift: {
        include: {
          post: { include: { site: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const presentDays = attendance.filter((a) => a.status === "present").length;
  const absentDays = attendance.filter((a) => a.status === "absent").length;
  const lateDays = attendance.filter((a) => a.status === "late").length;

  return {
    employee: `${employee.firstName} ${employee.lastName}`,
    employeeCode: employee.employeeCode,
    period: `Last ${days} days`,
    totalRecords: attendance.length,
    presentDays,
    absentDays,
    lateDays,
    attendanceRate:
      attendance.length > 0
        ? `${Math.round((presentDays / attendance.length) * 100)}%`
        : "N/A",
    records: attendance.map((a) => ({
      date: a.createdAt.toISOString().split("T")[0],
      site: a.shift.post.site.name,
      post: a.shift.post.name,
      checkIn: a.checkInTime ? formatTime(a.checkInTime) : null,
      checkOut: a.checkOutTime ? formatTime(a.checkOutTime) : null,
      status: a.status,
      faceMatch: a.faceMatchPercentage ? `${a.faceMatchPercentage}%` : null,
    })),
  };
}

async function getAllDesignations() {
  const designations = await prisma.designation.findMany({
    include: {
      _count: { select: { employees: true } },
    },
    orderBy: { level: "asc" },
  });

  return designations.map((d) => ({
    name: d.name,
    level: d.level,
    description: d.description,
    employeeCount: d._count.employees,
  }));
}

async function getEmployeesByDesignation(designationName: string) {
  const employees = await prisma.employee.findMany({
    where: {
      designation: { name: { contains: designationName, mode: "insensitive" } },
    },
    include: {
      designation: true,
      _count: { select: { shifts: true } },
    },
    orderBy: { firstName: "asc" },
  });

  if (employees.length === 0) {
    return { message: `No employees found with designation "${designationName}"`, employees: [] };
  }

  return {
    designation: employees[0]?.designation.name || designationName,
    totalEmployees: employees.length,
    employees: employees.map((e) => ({
      employeeCode: e.employeeCode,
      name: `${e.firstName} ${e.lastName}`,
      phone: e.phone,
      email: e.email,
      location: [e.city, e.state].filter(Boolean).join(", ") || null,
      isActive: e.isActive,
      totalShifts: e._count.shifts,
    })),
  };
}

// ============ SHIFT QUERIES ============
async function getTodaysShifts(siteName?: string, employeeName?: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const shifts = await prisma.shift.findMany({
    where: {
      shiftDate: { gte: today, lt: tomorrow },
      ...(siteName && {
        post: { site: { name: { contains: siteName, mode: "insensitive" } } },
      }),
      ...(employeeName && {
        employee: {
          OR: [
            { firstName: { contains: employeeName, mode: "insensitive" } },
            { lastName: { contains: employeeName, mode: "insensitive" } },
          ],
        },
      }),
    },
    include: {
      employee: { include: { designation: true } },
      post: { include: { site: true } },
    },
    orderBy: { startTime: "asc" },
  });

  return {
    date: today.toISOString().split("T")[0],
    totalShifts: shifts.length,
    shifts: shifts.map((s) => ({
      id: s.id,
      employee: `${s.employee.firstName} ${s.employee.lastName}`,
      employeeCode: s.employee.employeeCode,
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
      shiftDate: { gte: today, lt: tomorrow },
      status: { in: ["scheduled", "in_progress"] },
      ...(siteName && {
        post: { site: { name: { contains: siteName, mode: "insensitive" } } },
      }),
    },
    include: {
      employee: { include: { designation: true } },
      post: { include: { site: true } },
    },
    orderBy: { startTime: "asc" },
  });

  const currentTime = now.getHours() * 60 + now.getMinutes();
  const currentShifts = shifts.filter((s) => {
    const startMinutes = s.startTime.getHours() * 60 + s.startTime.getMinutes();
    const endMinutes = s.endTime.getHours() * 60 + s.endTime.getMinutes();

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
      employeeCode: s.employee.employeeCode,
      designation: s.employee.designation.name,
      site: s.post.site.name,
      post: s.post.name,
      time: `${formatTime(s.startTime)} - ${formatTime(s.endTime)}`,
      status: s.status,
    })),
  };
}

async function getShiftsByDate(dateStr: string, siteName?: string) {
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);

  const shifts = await prisma.shift.findMany({
    where: {
      shiftDate: { gte: date, lt: nextDay },
      ...(siteName && {
        post: { site: { name: { contains: siteName, mode: "insensitive" } } },
      }),
    },
    include: {
      employee: { include: { designation: true } },
      post: { include: { site: true } },
    },
    orderBy: { startTime: "asc" },
  });

  return {
    date: dateStr,
    totalShifts: shifts.length,
    shifts: shifts.map((s) => ({
      id: s.id,
      employee: `${s.employee.firstName} ${s.employee.lastName}`,
      employeeCode: s.employee.employeeCode,
      designation: s.employee.designation.name,
      site: s.post.site.name,
      post: s.post.name,
      time: `${formatTime(s.startTime)} - ${formatTime(s.endTime)}`,
      status: s.status,
    })),
  };
}

async function getShiftDetails(shiftId: string) {
  const shift = await prisma.shift.findUnique({
    where: { id: shiftId },
    include: {
      employee: { include: { designation: true } },
      post: { include: { site: true } },
      attendance: true,
    },
  });

  if (!shift) {
    return { error: `Shift with ID "${shiftId}" not found` };
  }

  return {
    id: shift.id,
    date: shift.shiftDate.toISOString().split("T")[0],
    time: `${formatTime(shift.startTime)} - ${formatTime(shift.endTime)}`,
    status: shift.status,
    site: shift.post.site.name,
    post: shift.post.name,
    employee: {
      name: `${shift.employee.firstName} ${shift.employee.lastName}`,
      employeeCode: shift.employee.employeeCode,
      designation: shift.employee.designation.name,
      phone: shift.employee.phone,
    },
    attendance: shift.attendance.length > 0
      ? shift.attendance.map((a) => ({
          checkIn: a.checkInTime ? formatTime(a.checkInTime) : null,
          checkOut: a.checkOutTime ? formatTime(a.checkOutTime) : null,
          status: a.status,
          faceMatch: a.faceMatchPercentage ? `${a.faceMatchPercentage}%` : null,
        }))
      : "No attendance records",
    notes: shift.notes,
  };
}

// ============ INCIDENT QUERIES ============
async function getRecentIncidents(days: number = 7, siteName?: string) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const incidents = await prisma.incident.findMany({
    where: {
      occurredAt: { gte: startDate },
      ...(siteName && {
        post: { site: { name: { contains: siteName, mode: "insensitive" } } },
      }),
    },
    include: {
      post: { include: { site: true } },
      reporter: true,
    },
    orderBy: { occurredAt: "desc" },
  });

  return {
    period: `Last ${days} days`,
    totalIncidents: incidents.length,
    incidents: incidents.map((i) => ({
      id: i.id,
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

async function getIncidentDetails(incidentId: string) {
  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
    include: {
      post: { include: { site: true } },
      reporter: { include: { designation: true } },
    },
  });

  if (!incident) {
    return { error: `Incident with ID "${incidentId}" not found` };
  }

  return {
    id: incident.id,
    title: incident.title,
    type: incident.incidentType,
    severity: incident.severity,
    status: incident.status,
    description: incident.description,
    site: incident.post.site.name,
    post: incident.post.name,
    reporter: {
      name: `${incident.reporter.firstName} ${incident.reporter.lastName}`,
      employeeCode: incident.reporter.employeeCode,
      designation: incident.reporter.designation.name,
    },
    occurredAt: incident.occurredAt.toISOString(),
    resolvedAt: incident.resolvedAt?.toISOString() || null,
    createdAt: incident.createdAt.toISOString(),
  };
}

async function getIncidentsByType(incidentType: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const incidents = await prisma.incident.findMany({
    where: {
      incidentType: { contains: incidentType, mode: "insensitive" },
      occurredAt: { gte: startDate },
    },
    include: {
      post: { include: { site: true } },
      reporter: true,
    },
    orderBy: { occurredAt: "desc" },
  });

  return {
    type: incidentType,
    period: `Last ${days} days`,
    totalIncidents: incidents.length,
    incidents: incidents.map((i) => ({
      id: i.id,
      title: i.title,
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

// ============ SEARCH ============
async function searchAll(keyword: string) {
  const [clients, sites, employees, incidents] = await Promise.all([
    prisma.client.findMany({
      where: { name: { contains: keyword, mode: "insensitive" } },
      select: { id: true, name: true, code: true },
      take: 5,
    }),
    prisma.site.findMany({
      where: { name: { contains: keyword, mode: "insensitive" } },
      select: { id: true, name: true, code: true, city: true },
      take: 5,
    }),
    prisma.employee.findMany({
      where: {
        OR: [
          { firstName: { contains: keyword, mode: "insensitive" } },
          { lastName: { contains: keyword, mode: "insensitive" } },
          { employeeCode: { contains: keyword, mode: "insensitive" } },
        ],
      },
      select: { id: true, employeeCode: true, firstName: true, lastName: true },
      take: 5,
    }),
    prisma.incident.findMany({
      where: { title: { contains: keyword, mode: "insensitive" } },
      select: { id: true, title: true, severity: true, status: true },
      take: 5,
    }),
  ]);

  return {
    keyword,
    clients,
    sites,
    employees: employees.map((e) => ({
      ...e,
      fullName: `${e.firstName} ${e.lastName}`,
    })),
    incidents,
  };
}

// ============ UTILITIES ============
function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
