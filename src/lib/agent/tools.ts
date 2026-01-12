import { Type, FunctionDeclaration } from "@google/genai";

export const agentTools: FunctionDeclaration[] = [
  // DASHBOARD & OVERVIEW
  {
    name: "get_dashboard_stats",
    description: "Get overall statistics including total clients, sites, employees, posts, and open incidents",
  },

  // CLIENT QUERIES
  {
    name: "get_all_clients",
    description: "Get a list of all clients with their basic information",
  },
  {
    name: "get_client_details",
    description: "Get detailed information about a specific client including their regions, opzones, and sites",
    parameters: {
      type: Type.OBJECT,
      properties: {
        client_name: {
          type: Type.STRING,
          description: "The name of the client to search for (partial match supported)",
        },
      },
      required: ["client_name"],
    },
  },
  {
    name: "get_client_hierarchy",
    description: "Get complete hierarchy for a client: regions, opzones, sites, and posts",
    parameters: {
      type: Type.OBJECT,
      properties: {
        client_name: {
          type: Type.STRING,
          description: "Name of the client",
        },
      },
      required: ["client_name"],
    },
  },
  {
    name: "get_client_stats",
    description: "Get statistics for a specific client: site count, post count, employee count, active shifts",
    parameters: {
      type: Type.OBJECT,
      properties: {
        client_name: {
          type: Type.STRING,
          description: "Name of the client",
        },
      },
      required: ["client_name"],
    },
  },

  // SITE QUERIES
  {
    name: "get_all_sites",
    description: "Get a list of all sites with their location and client information",
  },
  {
    name: "get_site_details",
    description: "Get detailed information about a specific site by name including posts and assigned employees",
    parameters: {
      type: Type.OBJECT,
      properties: {
        site_name: {
          type: Type.STRING,
          description: "The name of the site to search for (partial match supported)",
        },
      },
      required: ["site_name"],
    },
  },
  {
    name: "get_employees_at_site",
    description: "Get all employees assigned to a specific site",
    parameters: {
      type: Type.OBJECT,
      properties: {
        site_name: {
          type: Type.STRING,
          description: "Name of the site",
        },
      },
      required: ["site_name"],
    },
  },
  {
    name: "get_site_shifts",
    description: "Get all shifts at a specific site for a date range",
    parameters: {
      type: Type.OBJECT,
      properties: {
        site_name: {
          type: Type.STRING,
          description: "Name of the site",
        },
        start_date: {
          type: Type.STRING,
          description: "Start date (YYYY-MM-DD), default: today",
        },
        end_date: {
          type: Type.STRING,
          description: "End date (YYYY-MM-DD), default: 7 days from start",
        },
      },
      required: ["site_name"],
    },
  },
  {
    name: "get_site_incidents",
    description: "Get all incidents at a specific site",
    parameters: {
      type: Type.OBJECT,
      properties: {
        site_name: {
          type: Type.STRING,
          description: "Name of the site",
        },
        status: {
          type: Type.STRING,
          description: "Optional: Filter by status (open, investigating, resolved, closed)",
        },
        days: {
          type: Type.NUMBER,
          description: "Number of days to look back (default: 30)",
        },
      },
      required: ["site_name"],
    },
  },

  // POST QUERIES
  {
    name: "get_posts_for_site",
    description: "Get all security posts at a specific site",
    parameters: {
      type: Type.OBJECT,
      properties: {
        site_name: {
          type: Type.STRING,
          description: "The name of the site to get posts for (partial match supported)",
        },
      },
      required: ["site_name"],
    },
  },
  {
    name: "get_post_details",
    description: "Get details about a specific post including current shift and assigned employee",
    parameters: {
      type: Type.OBJECT,
      properties: {
        site_name: {
          type: Type.STRING,
          description: "Name of the site",
        },
        post_name: {
          type: Type.STRING,
          description: "Name of the post",
        },
      },
      required: ["site_name", "post_name"],
    },
  },
  {
    name: "get_post_shift_history",
    description: "Get shift history for a specific post",
    parameters: {
      type: Type.OBJECT,
      properties: {
        site_name: {
          type: Type.STRING,
          description: "Name of the site",
        },
        post_name: {
          type: Type.STRING,
          description: "Name of the post",
        },
        days: {
          type: Type.NUMBER,
          description: "Number of days to look back (default: 7)",
        },
      },
      required: ["site_name", "post_name"],
    },
  },

  // EMPLOYEE QUERIES
  {
    name: "get_all_employees",
    description: "Get a list of all employees with their designation, contact info, and employee codes",
  },
  {
    name: "search_employee",
    description: "Search for an employee by name, employee code, or phone number and get all their details including ID, designation, contact info. Use this when asked about a specific person.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        search_term: {
          type: Type.STRING,
          description: "Employee name (first or last), employee code (EMP001), or phone number",
        },
      },
      required: ["search_term"],
    },
  },
  {
    name: "get_employee_details",
    description: "Get comprehensive details about an employee including their employee code/ID, designation, contact info, assigned sites, total shifts, attendance record",
    parameters: {
      type: Type.OBJECT,
      properties: {
        name_or_code: {
          type: Type.STRING,
          description: "The employee name (first or last) or employee code to search for",
        },
      },
      required: ["name_or_code"],
    },
  },
  {
    name: "get_employee_shifts",
    description: "Get all shifts assigned to a specific employee - past, current, and upcoming",
    parameters: {
      type: Type.OBJECT,
      properties: {
        employee_identifier: {
          type: Type.STRING,
          description: "Employee name or employee code",
        },
        date_filter: {
          type: Type.STRING,
          description: "Optional: 'past', 'today', 'upcoming', 'all' (default: all)",
        },
      },
      required: ["employee_identifier"],
    },
  },
  {
    name: "get_employee_attendance",
    description: "Get attendance records for a specific employee",
    parameters: {
      type: Type.OBJECT,
      properties: {
        employee_identifier: {
          type: Type.STRING,
          description: "Employee name or employee code",
        },
        days: {
          type: Type.NUMBER,
          description: "Number of days to look back (default: 30)",
        },
      },
      required: ["employee_identifier"],
    },
  },
  {
    name: "get_all_designations",
    description: "Get a list of all employee designations/roles",
  },
  {
    name: "get_employees_by_designation",
    description: "Get all employees with a specific designation/role",
    parameters: {
      type: Type.OBJECT,
      properties: {
        designation: {
          type: Type.STRING,
          description: "The designation name to filter by (e.g., 'Security Guard', 'Supervisor')",
        },
      },
      required: ["designation"],
    },
  },

  // SHIFT QUERIES
  {
    name: "get_todays_shifts",
    description: "Get all shifts scheduled for today, optionally filtered by site or employee",
    parameters: {
      type: Type.OBJECT,
      properties: {
        site_name: {
          type: Type.STRING,
          description: "Optional site name to filter shifts (partial match supported)",
        },
        employee_name: {
          type: Type.STRING,
          description: "Optional employee name to filter shifts",
        },
      },
      required: [],
    },
  },
  {
    name: "get_current_shifts",
    description: "Get shifts that are currently in progress right now",
    parameters: {
      type: Type.OBJECT,
      properties: {
        site_name: {
          type: Type.STRING,
          description: "Optional site name to filter shifts (partial match supported)",
        },
      },
      required: [],
    },
  },
  {
    name: "get_shifts_by_date",
    description: "Get all shifts for a specific date",
    parameters: {
      type: Type.OBJECT,
      properties: {
        date: {
          type: Type.STRING,
          description: "Date in YYYY-MM-DD format",
        },
        site_name: {
          type: Type.STRING,
          description: "Optional site name to filter shifts",
        },
      },
      required: ["date"],
    },
  },
  {
    name: "get_shift_details",
    description: "Get complete details of a specific shift including attendance",
    parameters: {
      type: Type.OBJECT,
      properties: {
        shift_id: {
          type: Type.STRING,
          description: "UUID of the shift",
        },
      },
      required: ["shift_id"],
    },
  },

  // INCIDENT QUERIES
  {
    name: "get_recent_incidents",
    description: "Get recent security incidents, optionally filtered by number of days and site",
    parameters: {
      type: Type.OBJECT,
      properties: {
        days: {
          type: Type.NUMBER,
          description: "Number of days to look back (default: 7)",
        },
        site_name: {
          type: Type.STRING,
          description: "Optional site name to filter incidents (partial match supported)",
        },
      },
      required: [],
    },
  },
  {
    name: "get_incident_details",
    description: "Get full details of a specific incident",
    parameters: {
      type: Type.OBJECT,
      properties: {
        incident_id: {
          type: Type.STRING,
          description: "UUID of the incident",
        },
      },
      required: ["incident_id"],
    },
  },
  {
    name: "get_incidents_by_type",
    description: "Get incidents filtered by type",
    parameters: {
      type: Type.OBJECT,
      properties: {
        incident_type: {
          type: Type.STRING,
          description: "Type of incident (Unauthorized Entry, Theft, Safety Hazard, Suspicious Activity, etc.)",
        },
        days: {
          type: Type.NUMBER,
          description: "Days to look back (default: 30)",
        },
      },
      required: ["incident_type"],
    },
  },

  // SEARCH
  {
    name: "search_all",
    description: "Search across all entities (clients, sites, employees, incidents) by keyword",
    parameters: {
      type: Type.OBJECT,
      properties: {
        keyword: {
          type: Type.STRING,
          description: "Search keyword",
        },
      },
      required: ["keyword"],
    },
  },
];

export const SYSTEM_PROMPT = `You are Mr. Commando, an AI assistant for Commando360 security management platform.

You can answer ANY question about:
- Clients: names, codes, industries, contact info, hierarchy
- Sites: locations, addresses, incharge details, post counts
- Posts: checkpoints at sites, types, current assignments
- Employees: names, IDs (employee_code), designations, phone numbers, assignments, shifts
- Shifts: schedules, assignments, status, history
- Attendance: check-in/out times, face match percentages
- Incidents: types, severity, status, descriptions

IMPORTANT - When asked about a specific person (like "Amit Singh"):
1. Use search_employee with their name to find their details including employee_code/ID
2. Use get_employee_shifts to see their shift assignments
3. Use get_employee_attendance to see their attendance records

IMPORTANT - When asked about a specific site:
1. Use get_site_details for basic info and posts
2. Use get_employees_at_site to see assigned staff
3. Use get_site_shifts for shift schedules
4. Use get_site_incidents for incident history

Common Questions:
- "What is [name]'s employee ID?" → Use search_employee with the name
- "How many shifts does [name] have?" → Use get_employee_shifts with the name
- "Who works at [site]?" → Use get_employees_at_site
- "Show incidents at [site]" → Use get_site_incidents
- "Tell me about [client]" → Use get_client_details or get_client_hierarchy

Guidelines:
- Always provide specific details like IDs, codes, and counts
- Be precise with numbers and dates
- Use 24-hour time format
- If you can't find something, say so clearly
- NEVER make up information - always use the tools

Current date: ${new Date().toISOString().split('T')[0]}
`;
