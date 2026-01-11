import { notFound } from "next/navigation";
import Link from "next/link";
import { User, Mail, Phone, MapPin, Calendar, ClipboardCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getEmployeeById } from "@/lib/queries/employees";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EmployeeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const employee = await getEmployeeById(id);

  if (!employee) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title={`${employee.firstName} ${employee.lastName}`}
        description={employee.designation.name}
        breadcrumbs={[
          { label: "Employees", href: "/employees" },
          { label: `${employee.firstName} ${employee.lastName}` },
        ]}
        actions={
          <StatusBadge status={employee.isActive ? "active" : "inactive"} />
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Info */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Employee Code</p>
                <p className="text-white">{employee.employeeCode}</p>
              </div>
            </div>
            {employee.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-white">{employee.email}</p>
                </div>
              </div>
            )}
            {employee.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-white">{employee.phone}</p>
                </div>
              </div>
            )}
            {(employee.city || employee.state) && (
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-white">
                    {[employee.city, employee.state].filter(Boolean).join(", ")}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Joined</p>
                <p className="text-white">
                  {new Date(employee.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#0f172a] rounded-lg">
                <p className="text-2xl font-bold text-white">{employee.shifts.length}</p>
                <p className="text-sm text-gray-400">Total Shifts</p>
              </div>
              <div className="p-4 bg-[#0f172a] rounded-lg">
                <p className="text-2xl font-bold text-white">
                  {employee.shifts.filter((s) => s.status === "completed").length}
                </p>
                <p className="text-sm text-gray-400">Completed</p>
              </div>
              <div className="p-4 bg-[#0f172a] rounded-lg">
                <p className="text-2xl font-bold text-white">{employee.attendance.length}</p>
                <p className="text-sm text-gray-400">Attendance Records</p>
              </div>
              <div className="p-4 bg-[#0f172a] rounded-lg">
                <p className="text-2xl font-bold text-white">
                  {employee.attendance.filter((a) => a.status === "present").length}
                </p>
                <p className="text-sm text-gray-400">Present Days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Site Assignments */}
        <Card>
          <CardHeader>
            <CardTitle>Site Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {employee.employeeSiteAssignments.length === 0 ? (
              <p className="text-gray-400 text-sm">No site assignments</p>
            ) : (
              <div className="space-y-2">
                {employee.employeeSiteAssignments.map((assignment) => (
                  <Link
                    key={assignment.id}
                    href={`/sites/${assignment.site.id}`}
                    className="flex items-center justify-between p-3 bg-[#0f172a] rounded hover:bg-[#334155] transition-colors"
                  >
                    <div>
                      <p className="text-sm text-white">{assignment.site.name}</p>
                      <p className="text-xs text-gray-500">
                        {assignment.site.opzone.region.client.name}
                      </p>
                    </div>
                    {assignment.isPrimary && (
                      <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded">
                        Primary
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Shifts */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Shifts</CardTitle>
            <Link href="/shifts" className="text-sm text-blue-400 hover:text-blue-300">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {employee.shifts.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No shifts"
                description="No shifts assigned to this employee."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Post</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employee.shifts.slice(0, 10).map((shift) => (
                    <TableRow key={shift.id}>
                      <TableCell>
                        {new Date(shift.shiftDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/posts/${shift.post.id}`}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          {shift.post.name}
                        </Link>
                      </TableCell>
                      <TableCell>{shift.post.site.name}</TableCell>
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
                        <StatusBadge status={shift.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Recent Attendance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Attendance</CardTitle>
            <Link href="/attendance" className="text-sm text-blue-400 hover:text-blue-300">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {employee.attendance.length === 0 ? (
              <EmptyState
                icon={ClipboardCheck}
                title="No attendance"
                description="No attendance records found."
              />
            ) : (
              <div className="space-y-2">
                {employee.attendance.slice(0, 5).map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 bg-[#0f172a] rounded"
                  >
                    <div>
                      <p className="text-sm text-white">
                        {record.shift?.post.site.name || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {record.checkInTime
                          ? new Date(record.checkInTime).toLocaleString()
                          : "No check-in"}
                      </p>
                    </div>
                    <StatusBadge status={record.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
