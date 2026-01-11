import { Suspense } from "react";
import {
  Building2,
  MapPin,
  Users,
  AlertTriangle,
  Shield,
  Clock,
} from "lucide-react";
import { StatsCard } from "@/components/ui/StatsCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { PageHeader } from "@/components/ui/PageHeader";
import { CardSkeleton, TableSkeleton } from "@/components/ui/Loading";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  getDashboardStats,
  getTodayShifts,
  getRecentIncidents,
  getSitesOverview,
} from "@/lib/queries/dashboard";
import Link from "next/link";

async function DashboardStats() {
  const stats = await getDashboardStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Total Clients"
        value={stats.totalClients}
        subtitle={`${stats.activeClients} active`}
        icon={Building2}
        iconColor="text-blue-400"
      />
      <StatsCard
        title="Total Sites"
        value={stats.totalSites}
        subtitle={`${stats.activeSites} active`}
        icon={MapPin}
        iconColor="text-green-400"
      />
      <StatsCard
        title="Employees"
        value={stats.totalEmployees}
        subtitle={`${stats.activeEmployees} active`}
        icon={Users}
        iconColor="text-purple-400"
      />
      <StatsCard
        title="Open Incidents"
        value={stats.openIncidents}
        subtitle="Requires attention"
        icon={AlertTriangle}
        iconColor="text-red-400"
      />
    </div>
  );
}

async function TodayShifts() {
  const shifts = await getTodayShifts();

  if (shifts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Shifts</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Clock}
            title="No shifts today"
            description="There are no shifts scheduled for today."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Today&apos;s Shifts</CardTitle>
        <Link href="/shifts" className="text-sm text-blue-400 hover:text-blue-300">
          View all
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Post</TableHead>
              <TableHead>Site</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shifts.map((shift) => (
              <TableRow key={shift.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-white">
                      {shift.employee.firstName} {shift.employee.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {shift.employee.designation.name}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{shift.post.name}</TableCell>
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
      </CardContent>
    </Card>
  );
}

async function RecentIncidents() {
  const incidents = await getRecentIncidents();

  if (incidents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={AlertTriangle}
            title="No incidents"
            description="No incidents have been reported."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Incidents</CardTitle>
        <Link href="/incidents" className="text-sm text-blue-400 hover:text-blue-300">
          View all
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-[#334155]">
          {incidents.map((incident) => (
            <Link
              key={incident.id}
              href={`/incidents/${incident.id}`}
              className="block p-4 hover:bg-[#334155]/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">
                    {incident.title}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {incident.post.site.name} - {incident.post.name}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={incident.severity} />
                  <span className="text-xs text-gray-500">
                    {new Date(incident.occurredAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

async function SitesOverview() {
  const sites = await getSitesOverview();

  if (sites.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sites Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={MapPin}
            title="No sites"
            description="No sites have been added yet."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Sites Overview</CardTitle>
        <Link href="/sites" className="text-sm text-blue-400 hover:text-blue-300">
          View all
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#334155]">
          {sites.slice(0, 6).map((site) => (
            <Link
              key={site.id}
              href={`/sites/${site.id}`}
              className="p-4 hover:bg-[#334155]/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-white">{site.name}</p>
                  <p className="text-sm text-gray-400">
                    {site.opzone.region.client.name}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">{site.posts.length}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your security operations"
      />

      <div className="space-y-6">
        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <DashboardStats />
        </Suspense>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Suspense fallback={<TableSkeleton rows={5} cols={5} />}>
            <TodayShifts />
          </Suspense>

          <Suspense fallback={<TableSkeleton rows={5} cols={2} />}>
            <RecentIncidents />
          </Suspense>
        </div>

        <Suspense fallback={<TableSkeleton rows={3} cols={2} />}>
          <SitesOverview />
        </Suspense>
      </div>
    </div>
  );
}
