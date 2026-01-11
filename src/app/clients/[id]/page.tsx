import { notFound } from "next/navigation";
import Link from "next/link";
import { Building2, MapPin, Mail, Phone, User } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { getClientById } from "@/lib/queries/clients";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: PageProps) {
  const { id } = await params;
  const client = await getClientById(id);

  if (!client) {
    notFound();
  }

  const totalSites = client.regions.reduce(
    (acc, region) =>
      acc + region.opzones.reduce((acc2, opzone) => acc2 + opzone.sites.length, 0),
    0
  );

  return (
    <div>
      <PageHeader
        title={client.name}
        description={client.industry || "Client organization"}
        breadcrumbs={[
          { label: "Clients", href: "/clients" },
          { label: client.name },
        ]}
        actions={
          <StatusBadge status={client.isActive ? "active" : "inactive"} />
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Info */}
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {client.code && (
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Code</p>
                  <p className="text-white">{client.code}</p>
                </div>
              </div>
            )}
            {(client.city || client.state) && (
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-white">
                    {[client.city, client.state].filter(Boolean).join(", ")}
                  </p>
                </div>
              </div>
            )}
            {client.contactPerson && (
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Contact Person</p>
                  <p className="text-white">{client.contactPerson}</p>
                </div>
              </div>
            )}
            {client.contactEmail && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-white">{client.contactEmail}</p>
                </div>
              </div>
            )}
            {client.contactPhone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-white">{client.contactPhone}</p>
                </div>
              </div>
            )}
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
                <p className="text-2xl font-bold text-white">
                  {client.regions.length}
                </p>
                <p className="text-sm text-gray-400">Regions</p>
              </div>
              <div className="p-4 bg-[#0f172a] rounded-lg">
                <p className="text-2xl font-bold text-white">{totalSites}</p>
                <p className="text-sm text-gray-400">Sites</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Regions & Sites */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Regions & Sites</CardTitle>
          </CardHeader>
          <CardContent>
            {client.regions.length === 0 ? (
              <p className="text-gray-400">No regions found</p>
            ) : (
              <div className="space-y-4">
                {client.regions.map((region) => (
                  <div
                    key={region.id}
                    className="border border-[#334155] rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-white">{region.name}</h4>
                      <StatusBadge
                        status={region.isActive ? "active" : "inactive"}
                      />
                    </div>
                    {region.opzones.length > 0 && (
                      <div className="space-y-2 ml-4">
                        {region.opzones.map((opzone) => (
                          <div key={opzone.id}>
                            <p className="text-sm text-gray-400 mb-2">
                              {opzone.name}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 ml-4">
                              {opzone.sites.map((site) => (
                                <Link
                                  key={site.id}
                                  href={`/sites/${site.id}`}
                                  className="flex items-center justify-between p-2 bg-[#0f172a] rounded hover:bg-[#334155] transition-colors"
                                >
                                  <span className="text-sm text-white">
                                    {site.name}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {site._count.posts} posts
                                  </span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
