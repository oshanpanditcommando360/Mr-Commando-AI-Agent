import { Suspense } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { SearchInput } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { TableSkeleton } from "@/components/ui/Loading";
import { EmptyState } from "@/components/ui/EmptyState";
import { getEmployees, getDesignationsForFilter } from "@/lib/queries/employees";

interface PageProps {
  searchParams: Promise<{ search?: string; designationId?: string; status?: string }>;
}

async function EmployeesTable({
  search,
  designationId,
  status,
}: {
  search?: string;
  designationId?: string;
  status?: string;
}) {
  const employees = await getEmployees({
    search,
    designationId,
    isActive: status === "active" ? true : status === "inactive" ? false : undefined,
  });

  if (employees.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No employees found"
        description={search || designationId || status ? "Try adjusting your filters." : "No employees have been added yet."}
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Designation</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Shifts</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => (
          <TableRow key={employee.id}>
            <TableCell>
              <Link
                href={`/employees/${employee.id}`}
                className="font-medium text-white hover:text-blue-400 transition-colors"
              >
                {employee.firstName} {employee.lastName}
              </Link>
            </TableCell>
            <TableCell>{employee.employeeCode}</TableCell>
            <TableCell>{employee.designation.name}</TableCell>
            <TableCell>
              {employee.phone || employee.email ? (
                <div>
                  {employee.phone && <p className="text-white">{employee.phone}</p>}
                  {employee.email && (
                    <p className="text-xs text-gray-500">{employee.email}</p>
                  )}
                </div>
              ) : (
                "-"
              )}
            </TableCell>
            <TableCell>
              {employee.city && employee.state
                ? `${employee.city}, ${employee.state}`
                : employee.city || employee.state || "-"}
            </TableCell>
            <TableCell>{employee._count.shifts}</TableCell>
            <TableCell>
              <StatusBadge status={employee.isActive ? "active" : "inactive"} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

async function FiltersSection({
  search,
  designationId,
  status,
}: {
  search?: string;
  designationId?: string;
  status?: string;
}) {
  const designations = await getDesignationsForFilter();

  return (
    <form className="flex flex-col md:flex-row gap-4 mb-4">
      <div className="flex-1">
        <SearchInput
          name="search"
          placeholder="Search by name, code, or email..."
          defaultValue={search}
        />
      </div>
      <Select
        name="designationId"
        defaultValue={designationId || ""}
        options={[
          { value: "", label: "All Designations" },
          ...designations.map((d) => ({ value: d.id, label: d.name })),
        ]}
      />
      <Select
        name="status"
        defaultValue={status || ""}
        options={[
          { value: "", label: "All Status" },
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
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

export default async function EmployeesPage({ searchParams }: PageProps) {
  const { search, designationId, status } = await searchParams;

  return (
    <div>
      <PageHeader title="Employees" description="Manage security personnel" />

      <Card>
        <CardContent className="p-4">
          <Suspense fallback={<div className="h-12 skeleton rounded mb-4" />}>
            <FiltersSection search={search} designationId={designationId} status={status} />
          </Suspense>

          <Suspense fallback={<TableSkeleton rows={8} cols={7} />}>
            <EmployeesTable search={search} designationId={designationId} status={status} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
