import { Suspense } from "react";
import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { TableSkeleton } from "@/components/ui/Loading";
import { EmptyState } from "@/components/ui/EmptyState";
import { getAttendance, getAttendanceStatuses } from "@/lib/queries/attendance";

interface PageProps {
  searchParams: Promise<{ startDate?: string; endDate?: string; status?: string }>;
}

async function AttendanceTable({
  startDate,
  endDate,
  status,
}: {
  startDate?: string;
  endDate?: string;
  status?: string;
}) {
  const records = await getAttendance({ startDate, endDate, status });

  if (records.length === 0) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title="No attendance records found"
        description={startDate || endDate || status ? "Try adjusting your filters." : "No attendance records yet."}
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Shift Date</TableHead>
          <TableHead>Post / Site</TableHead>
          <TableHead>Check In</TableHead>
          <TableHead>Check Out</TableHead>
          <TableHead>Face Match</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((record) => (
          <TableRow key={record.id}>
            <TableCell>
              <Link
                href={`/employees/${record.employee.id}`}
                className="font-medium text-white hover:text-blue-400 transition-colors"
              >
                {record.employee.firstName} {record.employee.lastName}
              </Link>
              <p className="text-xs text-gray-500">
                {record.employee.designation.name}
              </p>
            </TableCell>
            <TableCell>
              {record.shift
                ? new Date(record.shift.shiftDate).toLocaleDateString()
                : "-"}
            </TableCell>
            <TableCell>
              {record.shift ? (
                <div>
                  <Link
                    href={`/posts/${record.shift.post.id}`}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {record.shift.post.name}
                  </Link>
                  <p className="text-xs text-gray-500">
                    {record.shift.post.site.name}
                  </p>
                </div>
              ) : (
                "-"
              )}
            </TableCell>
            <TableCell>
              {record.checkInTime
                ? new Date(record.checkInTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "-"}
            </TableCell>
            <TableCell>
              {record.checkOutTime
                ? new Date(record.checkOutTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "-"}
            </TableCell>
            <TableCell>
              {record.faceMatchPercentage
                ? `${Number(record.faceMatchPercentage).toFixed(1)}%`
                : "-"}
            </TableCell>
            <TableCell>
              <StatusBadge status={record.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

async function FiltersSection({
  startDate,
  endDate,
  status,
}: {
  startDate?: string;
  endDate?: string;
  status?: string;
}) {
  const statuses = await getAttendanceStatuses();

  return (
    <form className="flex flex-col md:flex-row gap-4 mb-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400">From:</span>
        <Input
          type="date"
          name="startDate"
          defaultValue={startDate}
          className="md:w-40"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400">To:</span>
        <Input
          type="date"
          name="endDate"
          defaultValue={endDate}
          className="md:w-40"
        />
      </div>
      <Select
        name="status"
        defaultValue={status || ""}
        options={[
          { value: "", label: "All Status" },
          ...statuses.map((s) => ({ value: s, label: s.replace(/_/g, " ") })),
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

export default async function AttendancePage({ searchParams }: PageProps) {
  const { startDate, endDate, status } = await searchParams;

  return (
    <div>
      <PageHeader title="Attendance" description="Track employee attendance records" />

      <Card>
        <CardContent className="p-4">
          <Suspense fallback={<div className="h-12 skeleton rounded mb-4" />}>
            <FiltersSection startDate={startDate} endDate={endDate} status={status} />
          </Suspense>

          <Suspense fallback={<TableSkeleton rows={10} cols={7} />}>
            <AttendanceTable startDate={startDate} endDate={endDate} status={status} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
