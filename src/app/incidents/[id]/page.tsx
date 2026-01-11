import { notFound } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, MapPin, User, Calendar, Clock } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { getIncidentById } from "@/lib/queries/incidents";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function IncidentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const incident = await getIncidentById(id);

  if (!incident) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title={incident.title}
        description={`Incident at ${incident.post.site.name}`}
        breadcrumbs={[
          { label: "Incidents", href: "/incidents" },
          { label: incident.title },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={incident.severity} />
            <StatusBadge status={incident.status} />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incident Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Incident Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Description</h4>
              <p className="text-white whitespace-pre-wrap">
                {incident.description || "No description provided."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">
                  Incident Type
                </h4>
                <p className="text-white">{incident.incidentType || "Not specified"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Severity</h4>
                <StatusBadge status={incident.severity} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Status</h4>
                <StatusBadge status={incident.status} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">
                  Occurred At
                </h4>
                <p className="text-white">
                  {new Date(incident.occurredAt).toLocaleString()}
                </p>
              </div>
            </div>

            {incident.resolvedAt && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">
                  Resolved At
                </h4>
                <p className="text-white">
                  {new Date(incident.resolvedAt).toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location & Reporter */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Post</p>
                  <Link
                    href={`/posts/${incident.post.id}`}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {incident.post.name}
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Site</p>
                  <Link
                    href={`/sites/${incident.post.site.id}`}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {incident.post.site.name}
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Client</p>
                  <Link
                    href={`/clients/${incident.post.site.opzone.region.client.id}`}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {incident.post.site.opzone.region.client.name}
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reported By</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Employee</p>
                  <Link
                    href={`/employees/${incident.reporter.id}`}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {incident.reporter.firstName} {incident.reporter.lastName}
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Designation</p>
                  <p className="text-white">{incident.reporter.designation.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Reported</p>
                  <p className="text-white">
                    {new Date(incident.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-sm text-white">Incident Reported</p>
                    <p className="text-xs text-gray-500">
                      {new Date(incident.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-yellow-500" />
                  <div>
                    <p className="text-sm text-white">Incident Occurred</p>
                    <p className="text-xs text-gray-500">
                      {new Date(incident.occurredAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {incident.resolvedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-green-500" />
                    <div>
                      <p className="text-sm text-white">Incident Resolved</p>
                      <p className="text-xs text-gray-500">
                        {new Date(incident.resolvedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
