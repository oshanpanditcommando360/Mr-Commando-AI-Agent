import { ReactNode } from "react";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "secondary";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-600 text-gray-100",
  success: "bg-green-600/20 text-green-400 border border-green-600/30",
  warning: "bg-yellow-600/20 text-yellow-400 border border-yellow-600/30",
  error: "bg-red-600/20 text-red-400 border border-red-600/30",
  info: "bg-blue-600/20 text-blue-400 border border-blue-600/30",
  secondary: "bg-[#334155] text-gray-300",
};

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

// Helper functions for common status badges
export function getStatusBadgeVariant(status: string): BadgeVariant {
  const statusMap: Record<string, BadgeVariant> = {
    // Active/Inactive
    active: "success",
    inactive: "secondary",
    // Shift status
    scheduled: "info",
    in_progress: "warning",
    completed: "success",
    cancelled: "error",
    // Attendance status
    present: "success",
    absent: "error",
    late: "warning",
    half_day: "warning",
    // Incident status
    open: "error",
    investigating: "warning",
    resolved: "success",
    closed: "secondary",
    // Severity
    low: "info",
    medium: "warning",
    high: "error",
    critical: "error",
  };

  return statusMap[status.toLowerCase()] || "default";
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={getStatusBadgeVariant(status)}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
