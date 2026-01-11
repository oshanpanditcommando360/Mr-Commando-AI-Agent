import { Suspense } from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { SearchInput } from "@/components/ui/Input";
import { TableSkeleton } from "@/components/ui/Loading";
import { EmptyState } from "@/components/ui/EmptyState";
import { getClients } from "@/lib/queries/clients";

interface PageProps {
  searchParams: Promise<{ search?: string }>;
}

async function ClientsTable({ search }: { search?: string }) {
  const clients = await getClients(search);

  if (clients.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="No clients found"
        description={search ? "Try adjusting your search terms." : "No clients have been added yet."}
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Industry</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Regions</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <TableRow key={client.id}>
            <TableCell>
              <Link
                href={`/clients/${client.id}`}
                className="font-medium text-white hover:text-blue-400 transition-colors"
              >
                {client.name}
              </Link>
            </TableCell>
            <TableCell>{client.code || "-"}</TableCell>
            <TableCell>{client.industry || "-"}</TableCell>
            <TableCell>
              {client.city && client.state
                ? `${client.city}, ${client.state}`
                : client.city || client.state || "-"}
            </TableCell>
            <TableCell>
              {client.contactPerson && (
                <div>
                  <p className="text-white">{client.contactPerson}</p>
                  {client.contactEmail && (
                    <p className="text-xs text-gray-500">{client.contactEmail}</p>
                  )}
                </div>
              )}
              {!client.contactPerson && "-"}
            </TableCell>
            <TableCell>{client._count.regions}</TableCell>
            <TableCell>
              <StatusBadge status={client.isActive ? "active" : "inactive"} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default async function ClientsPage({ searchParams }: PageProps) {
  const { search } = await searchParams;

  return (
    <div>
      <PageHeader
        title="Clients"
        description="Manage your client organizations"
      />

      <Card>
        <CardContent className="p-4">
          <form className="mb-4">
            <SearchInput
              name="search"
              placeholder="Search clients by name, code, or city..."
              defaultValue={search}
            />
          </form>

          <Suspense fallback={<TableSkeleton rows={8} cols={7} />}>
            <ClientsTable search={search} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
