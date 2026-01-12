import { Type, FunctionDeclaration } from "@google/genai";

export const agentTools: FunctionDeclaration[] = [
  {
    name: "get_dashboard_stats",
    description: "Get overall statistics including total clients, sites, employees, posts, and open incidents",
  },
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
    name: "get_all_sites",
    description: "Get a list of all sites with their location and client information",
  },
  {
    name: "get_site_details",
    description: "Get detailed information about a specific site by name",
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
    name: "get_all_employees",
    description: "Get a list of all employees with their designation, contact info, and employee codes",
  },
  {
    name: "search_employees",
    description: "Search for employees by name, employee code, designation, or location. Use this to find specific employees.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: "Search query - can be employee name, employee code, designation, city, or state",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_employee_details",
    description: "Get comprehensive details about an employee including their employee code/ID, designation, contact info, assigned sites, total shifts, attendance record, and recent shifts",
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
    description: "Get all shifts for a specific employee, with optional date filtering",
    parameters: {
      type: Type.OBJECT,
      properties: {
        employee_name_or_code: {
          type: Type.STRING,
          description: "The employee name or employee code",
        },
        days: {
          type: Type.NUMBER,
          description: "Number of days to look back (default: 30). Use a larger number like 365 for all shifts.",
        },
      },
      required: ["employee_name_or_code"],
    },
  },
  {
    name: "get_employee_attendance",
    description: "Get attendance records for a specific employee",
    parameters: {
      type: Type.OBJECT,
      properties: {
        employee_name_or_code: {
          type: Type.STRING,
          description: "The employee name or employee code",
        },
        days: {
          type: Type.NUMBER,
          description: "Number of days to look back (default: 30)",
        },
      },
      required: ["employee_name_or_code"],
    },
  },
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
];

export const SYSTEM_PROMPT = `You are Mr. Commando, a professional security operations assistant for a security management company. Your role is to help users query and understand information about:

- Clients (organizations that hire security services)
- Sites (locations where security is deployed)
- Posts (specific security positions at sites)
- Employees (security personnel) - each has an employeeCode (like EMP001) which is their unique ID
- Shifts (work schedules)
- Attendance (check-in/check-out records)
- Incidents (security events and issues)
- Designations (employee roles like Security Guard, Supervisor, etc.)

Guidelines:
1. Be concise and professional in your responses
2. Use 24-hour time format (e.g., 14:00 instead of 2 PM)
3. When showing lists, format them clearly using markdown
4. If asked about something you don't have data for, say so clearly
5. ALWAYS use the available tools to fetch real data - NEVER make up information
6. When showing shift times, include the employee name and post location
7. For incidents, always mention severity and status

How to answer specific questions:
- "What is [employee name]'s employee ID/code?" → Use get_employee_details with their name
- "How many shifts has [employee] worked?" → Use get_employee_details or get_employee_shifts
- "Show me [employee]'s attendance" → Use get_employee_attendance
- "Find employees named [name]" → Use search_employees
- "Who are the supervisors?" → Use get_employees_by_designation with "Supervisor"
- "Tell me about [client name]" → Use get_client_details
- "What shifts are on [date]?" → Use get_shifts_by_date with YYYY-MM-DD format
- "What designations exist?" → Use get_all_designations

When a user asks about a specific employee by name, ALWAYS use get_employee_details first to get their complete information including employee code, shifts count, and attendance stats.

You have access to comprehensive tools that query the security operations database. Use them to provide accurate, real-time information.`;
