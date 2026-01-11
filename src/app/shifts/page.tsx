import { Suspense } from "react";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { TableSkeleton } from "@/components/ui/Loading";
import { EmptyState } from "@/components/ui/EmptyState";
import { getShifts, getShiftStatuses } from "@/lib/queries/shifts";
import { getSitesForFilter } from "@/lib/queries/posts";

interface PageProps {
  searchParams: Promise<{ date?: string; status?: string; siteId?: string }>;
}

async function ShiftsTable({
  date,
  status,
  siteId,
}: {
  date?: string;
  status?: string;
  siteId?: string;
}) {
  const shifts = await getShifts({ date, status, siteId });

  if (shifts.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="No shifts found"
        description={date || status || siteId ? "Try adjusting your filters." : "No shifts have been scheduled yet."}
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Employee</TableHead>
          <TableHead>Post</TableHead>
          <TableHead>Site</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Template</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {shifts.map((shift) => (
          <TableRow key={shift.id}>
            <TableCell>
              {new Date(shift.shiftDate).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <Link
                href={`/employees/${shift.employee.id}`}
                className="font-medium text-white hover:text-blue-400 transition-colors"
              >
                {shift.employee.firstName} {shift.employee.lastName}
              </Link>
              <p className="text-xs text-gray-500">
                {shift.employee.designation.name}
              </p>
            </TableCell>
            <TableCell>
              <Link
                href={`/posts/${shift.post.id}`}
                className="text-blue-400 hover:text-blue-300"
              >
                {shift.post.name}
              </Link>
            </TableCell>
            <TableCell>
              <Link
                href={`/sites/${shift.post.site.id}`}
                className="text-blue-400 hover:text-blue-300"
              >
                {shift.post.site.name}
              </Link>
            </TableCell>
            <TableCell>
              {new Date(shift.startTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              -{" "}
              {new Date(shift.endTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </TableCell>
            <TableCell>
              {shift.shiftTemplate?.name || "-"}
            </TableCell>
            <TableCell>
              <StatusBadge status={shift.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

async function FiltersSection({
  date,
  status,
  siteId,
}: {
  date?: string;
  status?: string;
  siteId?: string;
}) {
  const [statuses, sites] = await Promise.all([
    getShiftStatuses(),
    getSitesForFilter(),
  ]);

  return (
    <form className="flex flex-col md:flex-row gap-4 mb-4">
      <Input
        type="date"
        name="date"
        defaultValue={date}
        className="md:w-48"
      />
      <Select
        name="status"
        defaultValue={status || ""}
        options={[
          { value: "", label: "All Status" },
          ...statuses.map((s) => ({ value: s, label: s.replace(/_/g, " ") })),
        ]}
      />
      <Select
        name="siteId"
        defaultValue={siteId || ""}
        options={[
          { value: "", label: "All Sites" },
          ...sites.map((s) => ({ value: s.id, label: s.name })),
        ]}
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Filter
      </button>
    </form>
  );
}

export default async function ShiftsPage({ searchParams }: PageProps) {
  const { date, status, siteId } = await searchParams;

  return (
    <div>
      <PageHeader title="Shifts" description="View and manage shift schedules" />

      <Card>
        <CardContent className="p-4">
          <Suspense fallback={<div className="h-12 skeleton rounded mb-4" />}>
            <FiltersSection date={date} status={status} siteId={siteId} />
          </Suspense>

          <Suspense fallback={<TableSkeleton rows={10} cols={7} />}>
            <ShiftsTable date={date} status={status} siteId={siteId} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
