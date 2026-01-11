import { Suspense } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { TableSkeleton } from "@/components/ui/Loading";
import { EmptyState } from "@/components/ui/EmptyState";
import { getIncidents, getIncidentSeverities, getIncidentStatuses } from "@/lib/queries/incidents";
import { getSitesForFilter } from "@/lib/queries/posts";

interface PageProps {
  searchParams: Promise<{ severity?: string; status?: string; siteId?: string }>;
}

async function IncidentsTable({
  severity,
  status,
  siteId,
}: {
  severity?: string;
  status?: string;
  siteId?: string;
}) {
  const incidents = await getIncidents({ severity, status, siteId });

  if (incidents.length === 0) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="No incidents found"
        description={severity || status || siteId ? "Try adjusting your filters." : "No incidents have been reported."}
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Post / Site</TableHead>
          <TableHead>Reported By</TableHead>
          <TableHead>Occurred</TableHead>
          <TableHead>Severity</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {incidents.map((incident) => (
          <TableRow key={incident.id}>
            <TableCell>
              <Link
                href={`/incidents/${incident.id}`}
                className="font-medium text-white hover:text-blue-400 transition-colors"
              >
                {incident.title}
              </Link>
            </TableCell>
            <TableCell>{incident.incidentType || "-"}</TableCell>
            <TableCell>
              <div>
                <Link
                  href={`/posts/${incident.post.id}`}
                  className="text-blue-400 hover:text-blue-300"
                >
                  {incident.post.name}
                </Link>
                <p className="text-xs text-gray-500">{incident.post.site.name}</p>
              </div>
            </TableCell>
            <TableCell>
              <Link
                href={`/employees/${incident.reporter.id}`}
                className="text-blue-400 hover:text-blue-300"
              >
                {incident.reporter.firstName} {incident.reporter.lastName}
              </Link>
            </TableCell>
            <TableCell>
              {new Date(incident.occurredAt).toLocaleString()}
            </TableCell>
            <TableCell>
              <StatusBadge status={incident.severity} />
            </TableCell>
            <TableCell>
              <StatusBadge status={incident.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

async function FiltersSection({
  severity,
  status,
  siteId,
}: {
  severity?: string;
  status?: string;
  siteId?: string;
}) {
  const [severities, statuses, sites] = await Promise.all([
    getIncidentSeverities(),
    getIncidentStatuses(),
    getSitesForFilter(),
  ]);

  return (
    <form className="flex flex-col md:flex-row gap-4 mb-4">
      <Select
        name="severity"
        defaultValue={severity || ""}
        options={[
          { value: "", label: "All Severities" },
          ...severities.map((s) => ({ value: s, label: s })),
        ]}
      />
      <Select
        name="status"
        defaultValue={status || ""}
        options={[
          { value: "", label: "All Status" },
          ...statuses.map((s) => ({ value: s, label: s })),
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

export default async function IncidentsPage({ searchParams }: PageProps) {
  const { severity, status, siteId } = await searchParams;

  return (
    <div>
      <PageHeader title="Incidents" description="Track and manage security incidents" />

      <Card>
        <CardContent className="p-4">
          <Suspense fallback={<div className="h-12 skeleton rounded mb-4" />}>
            <FiltersSection severity={severity} status={status} siteId={siteId} />
          </Suspense>

          <Suspense fallback={<TableSkeleton rows={10} cols={7} />}>
            <IncidentsTable severity={severity} status={status} siteId={siteId} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
