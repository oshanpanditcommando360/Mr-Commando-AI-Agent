import { FunctionDeclaration, SchemaType } from "@google/generative-ai";

export const agentTools: FunctionDeclaration[] = [
  {
    name: "get_dashboard_stats",
    description: "Get overall statistics including total clients, sites, employees, posts, and open incidents",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {},
      required: [],
    },
  },
  {
    name: "get_all_clients",
    description: "Get a list of all clients with their basic information",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {},
      required: [],
    },
  },
  {
    name: "get_all_sites",
    description: "Get a list of all sites with their location and client information",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {},
      required: [],
    },
  },
  {
    name: "get_all_employees",
    description: "Get a list of all employees with their designation and contact information",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {},
      required: [],
    },
  },
  {
    name: "get_site_details",
    description: "Get detailed information about a specific site by name",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        site_name: {
          type: SchemaType.STRING,
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
      type: SchemaType.OBJECT,
      properties: {
        site_name: {
          type: SchemaType.STRING,
          description: "The name of the site to get posts for (partial match supported)",
        },
      },
      required: ["site_name"],
    },
  },
  {
    name: "get_employee_details",
    description: "Get detailed information about an employee by name or employee code",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        name_or_code: {
          type: SchemaType.STRING,
          description: "The employee name or employee code to search for",
        },
      },
      required: ["name_or_code"],
    },
  },
  {
    name: "get_todays_shifts",
    description: "Get all shifts scheduled for today, optionally filtered by site",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        site_name: {
          type: SchemaType.STRING,
          description: "Optional site name to filter shifts (partial match supported)",
        },
      },
      required: [],
    },
  },
  {
    name: "get_current_shifts",
    description: "Get shifts that are currently in progress right now",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        site_name: {
          type: SchemaType.STRING,
          description: "Optional site name to filter shifts (partial match supported)",
        },
      },
      required: [],
    },
  },
  {
    name: "get_recent_incidents",
    description: "Get recent security incidents, optionally filtered by number of days and site",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        days: {
          type: SchemaType.NUMBER,
          description: "Number of days to look back (default: 7)",
        },
        site_name: {
          type: SchemaType.STRING,
          description: "Optional site name to filter incidents (partial match supported)",
        },
      },
      required: [],
    },
  },
];

export const SYSTEM_PROMPT = `You are Mr. Commando, a professional security operations assistant for a security management company. Your role is to help users query and understand information about:

- Clients (organizations that hire security services)
- Sites (locations where security is deployed)
- Posts (specific security positions at sites)
- Employees (security personnel)
- Shifts (work schedules)
- Attendance (check-in/check-out records)
- Incidents (security events and issues)

Guidelines:
1. Be concise and professional in your responses
2. Use 24-hour time format (e.g., 14:00 instead of 2 PM)
3. When showing lists, format them clearly
4. If asked about something you don't have data for, say so clearly
5. Always use the available tools to fetch real data - never make up information
6. When showing shift times, include the employee name and post location
7. For incidents, always mention severity and status

You have access to tools that query the security operations database. Use them to provide accurate, real-time information.`;
