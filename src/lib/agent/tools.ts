import { Type, FunctionDeclaration } from "@google/genai";

export const agentTools: FunctionDeclaration[] = [
  {
    name: "execute_database_query",
    description: `Execute a read-only SQL query against the Commando360 security database.

DATABASE SCHEMA:
- clients (id, name, code, industry, contact_person, contact_email, contact_phone, city, state, is_active, created_at, updated_at)
- regions (id, client_id, name, code, description, is_active, created_at, updated_at)
- opzones (id, region_id, name, code, description, zone_manager_name, zone_manager_phone, is_active, created_at, updated_at)
- sites (id, opzone_id, name, code, address, city, state, pincode, latitude, longitude, site_incharge_name, site_incharge_phone, is_active, created_at, updated_at)
- posts (id, site_id, name, code, description, post_type, is_active, created_at, updated_at)
- designations (id, name, level, description)
- employees (id, employee_code, first_name, last_name, designation_id, phone, email, city, state, is_active, created_at, updated_at)
- employee_site_assignments (id, employee_id, site_id, is_primary, assigned_from, created_at)
- shift_templates (id, name, code, start_time, end_time, duration_hours, is_overnight, created_at)
- shifts (id, post_id, employee_id, shift_template_id, shift_date, start_time, end_time, status, notes, created_at, updated_at)
- attendance (id, shift_id, employee_id, check_in_time, check_out_time, face_match_percentage, status, created_at)
- incidents (id, post_id, reported_by, incident_type, severity, title, description, occurred_at, status, resolved_at, created_at, updated_at)

RELATIONSHIPS:
- clients -> regions -> opzones -> sites -> posts (hierarchy)
- employees.designation_id -> designations.id
- employee_site_assignments links employees to sites (employee_id, site_id)
- shifts.post_id -> posts.id, shifts.employee_id -> employees.id
- attendance.shift_id -> shifts.id, attendance.employee_id -> employees.id
- incidents.post_id -> posts.id, incidents.reported_by -> employees.id

Write proper JOINs to connect tables. Use ILIKE for case-insensitive search. Only SELECT queries are allowed.`,
    parameters: {
      type: Type.OBJECT,
      properties: {
        sql_query: {
          type: Type.STRING,
          description: "PostgreSQL SELECT query to execute",
        },
        explanation: {
          type: Type.STRING,
          description: "Brief explanation of what this query does",
        },
      },
      required: ["sql_query", "explanation"],
    },
  },
];
