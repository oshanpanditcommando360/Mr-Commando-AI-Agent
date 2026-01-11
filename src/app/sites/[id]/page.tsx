import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Phone, User, Shield, Calendar, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getSiteById } from "@/lib/queries/sites";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SiteDetailPage({ params }: PageProps) {
  const { id } = await params;
  const site = await getSiteById(id);

  if (!site) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title={site.name}
        description={site.address || "Site location"}
        breadcrumbs={[
          { label: "Sites", href: "/sites" },
          { label: site.name },
        ]}
        actions={
          <StatusBadge status={site.isActive ? "active" : "inactive"} />
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Site Info */}
        <Card>
          <CardHeader>
            <CardTitle>Site Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {site.code && (
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Code</p>
                  <p className="text-white">{site.code}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="text-white">
                  {[site.address, site.city, site.state, site.pincode]
                    .filter(Boolean)
                    .join(", ") || "Not specified"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Client</p>
                <Link
                  href={`/clients/${site.opzone.region.client.id}`}
                  className="text-blue-400 hover:text-blue-300"
                >
                  {site.opzone.region.client.name}
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Region / Opzone</p>
                <p className="text-white">
                  {site.opzone.region.name} / {site.opzone.name}
                </p>
              </div>
            </div>
            {site.siteInchargeName && (
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Site In-charge</p>
                  <p className="text-white">{site.siteInchargeName}</p>
                  {site.siteInchargePhone && (
                    <p className="text-xs text-gray-500">{site.siteInchargePhone}</p>
                  )}
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
                <p className="text-2xl font-bold text-white">{site.posts.length}</p>
                <p className="text-sm text-gray-400">Posts</p>
              </div>
              <div className="p-4 bg-[#0f172a] rounded-lg">
                <p className="text-2xl font-bold text-white">
                  {site.employeeSiteAssignments.length}
                </p>
                <p className="text-sm text-gray-400">Assigned Employees</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assigned Employees */}
        <Card>
          <CardHeader>
            <CardTitle>Assigned Employees</CardTitle>
          </CardHeader>
          <CardContent>
            {site.employeeSiteAssignments.length === 0 ? (
              <p className="text-gray-400 text-sm">No employees assigned</p>
            ) : (
              <div className="space-y-2">
                {site.employeeSiteAssignments.slice(0, 5).map((assignment) => (
                  <Link
                    key={assignment.id}
                    href={`/employees/${assignment.employee.id}`}
                    className="flex items-center justify-between p-2 bg-[#0f172a] rounded hover:bg-[#334155] transition-colors"
                  >
                    <div>
                      <p className="text-sm text-white">
                        {assignment.employee.firstName} {assignment.employee.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {assignment.employee.designation.name}
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

        {/* Posts */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Posts</CardTitle>
          </CardHeader>
          <CardContent>
            {site.posts.length === 0 ? (
              <EmptyState
                icon={Shield}
                title="No posts"
                description="No posts have been added to this site."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Shifts</TableHead>
                    <TableHead>Incidents</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {site.posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <Link
                          href={`/posts/${post.id}`}
                          className="font-medium text-white hover:text-blue-400 transition-colors"
                        >
                          {post.name}
                        </Link>
                      </TableCell>
                      <TableCell>{post.code || "-"}</TableCell>
                      <TableCell>{post.postType || "-"}</TableCell>
                      <TableCell>{post._count.shifts}</TableCell>
                      <TableCell>{post._count.incidents}</TableCell>
                      <TableCell>
                        <StatusBadge status={post.isActive ? "active" : "inactive"} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
