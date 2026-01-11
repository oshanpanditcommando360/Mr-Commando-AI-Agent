import { Suspense } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { SearchInput } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { TableSkeleton } from "@/components/ui/Loading";
import { EmptyState } from "@/components/ui/EmptyState";
import { getSites, getClientsForFilter } from "@/lib/queries/sites";

interface PageProps {
  searchParams: Promise<{ search?: string; clientId?: string; status?: string }>;
}

async function SitesTable({
  search,
  clientId,
  status,
}: {
  search?: string;
  clientId?: string;
  status?: string;
}) {
  const sites = await getSites({
    search,
    clientId,
    isActive: status === "active" ? true : status === "inactive" ? false : undefined,
  });

  if (sites.length === 0) {
    return (
      <EmptyState
        icon={MapPin}
        title="No sites found"
        description={search || clientId || status ? "Try adjusting your filters." : "No sites have been added yet."}
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Region / Opzone</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Posts</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sites.map((site) => (
          <TableRow key={site.id}>
            <TableCell>
              <Link
                href={`/sites/${site.id}`}
                className="font-medium text-white hover:text-blue-400 transition-colors"
              >
                {site.name}
              </Link>
            </TableCell>
            <TableCell>{site.code || "-"}</TableCell>
            <TableCell>{site.opzone.region.client.name}</TableCell>
            <TableCell>
              <div>
                <p className="text-white">{site.opzone.region.name}</p>
                <p className="text-xs text-gray-500">{site.opzone.name}</p>
              </div>
            </TableCell>
            <TableCell>
              {site.city && site.state
                ? `${site.city}, ${site.state}`
                : site.city || site.state || "-"}
            </TableCell>
            <TableCell>{site._count.posts}</TableCell>
            <TableCell>
              <StatusBadge status={site.isActive ? "active" : "inactive"} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

async function FiltersSection({
  search,
  clientId,
  status,
}: {
  search?: string;
  clientId?: string;
  status?: string;
}) {
  const clients = await getClientsForFilter();

  return (
    <form className="flex flex-col md:flex-row gap-4 mb-4">
      <div className="flex-1">
        <SearchInput
          name="search"
          placeholder="Search sites by name, code, or city..."
          defaultValue={search}
        />
      </div>
      <Select
        name="clientId"
        defaultValue={clientId || ""}
        options={[
          { value: "", label: "All Clients" },
          ...clients.map((c) => ({ value: c.id, label: c.name })),
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

export default async function SitesPage({ searchParams }: PageProps) {
  const { search, clientId, status } = await searchParams;

  return (
    <div>
      <PageHeader title="Sites" description="Manage your site locations" />

      <Card>
        <CardContent className="p-4">
          <Suspense fallback={<div className="h-12 skeleton rounded mb-4" />}>
            <FiltersSection search={search} clientId={clientId} status={status} />
          </Suspense>

          <Suspense fallback={<TableSkeleton rows={8} cols={7} />}>
            <SitesTable search={search} clientId={clientId} status={status} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
