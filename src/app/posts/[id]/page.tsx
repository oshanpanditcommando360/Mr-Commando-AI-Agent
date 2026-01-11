import { notFound } from "next/navigation";
import Link from "next/link";
import { Shield, MapPin, Calendar, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getPostById } from "@/lib/queries/posts";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title={post.name}
        description={post.description || "Security post"}
        breadcrumbs={[
          { label: "Posts", href: "/posts" },
          { label: post.name },
        ]}
        actions={
          <StatusBadge status={post.isActive ? "active" : "inactive"} />
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Post Info */}
        <Card>
          <CardHeader>
            <CardTitle>Post Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {post.code && (
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Code</p>
                  <p className="text-white">{post.code}</p>
                </div>
              </div>
            )}
            {post.postType && (
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="text-white">{post.postType}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Site</p>
                <Link
                  href={`/sites/${post.site.id}`}
                  className="text-blue-400 hover:text-blue-300"
                >
                  {post.site.name}
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Client</p>
                <Link
                  href={`/clients/${post.site.opzone.region.client.id}`}
                  className="text-blue-400 hover:text-blue-300"
                >
                  {post.site.opzone.region.client.name}
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-[#0f172a] rounded-lg">
                <p className="text-2xl font-bold text-white">{post.shifts.length}</p>
                <p className="text-sm text-gray-400">Total Shifts</p>
              </div>
              <div className="p-4 bg-[#0f172a] rounded-lg">
                <p className="text-2xl font-bold text-white">
                  {post.shifts.filter((s) => s.status === "completed").length}
                </p>
                <p className="text-sm text-gray-400">Completed</p>
              </div>
              <div className="p-4 bg-[#0f172a] rounded-lg">
                <p className="text-2xl font-bold text-white">{post.incidents.length}</p>
                <p className="text-sm text-gray-400">Incidents</p>
              </div>
              <div className="p-4 bg-[#0f172a] rounded-lg">
                <p className="text-2xl font-bold text-white">
                  {post.incidents.filter((i) => i.status === "open").length}
                </p>
                <p className="text-sm text-gray-400">Open Incidents</p>
              </div>
            </div>
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
            {post.shifts.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No shifts"
                description="No shifts have been scheduled for this post."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {post.shifts.slice(0, 10).map((shift) => (
                    <TableRow key={shift.id}>
                      <TableCell>
                        {new Date(shift.shiftDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/employees/${shift.employee.id}`}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          {shift.employee.firstName} {shift.employee.lastName}
                        </Link>
                      </TableCell>
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

        {/* Recent Incidents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Incidents</CardTitle>
            <Link href="/incidents" className="text-sm text-blue-400 hover:text-blue-300">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {post.incidents.length === 0 ? (
              <EmptyState
                icon={AlertTriangle}
                title="No incidents"
                description="No incidents have been reported."
              />
            ) : (
              <div className="space-y-2">
                {post.incidents.slice(0, 5).map((incident) => (
                  <Link
                    key={incident.id}
                    href={`/incidents/${incident.id}`}
                    className="block p-3 bg-[#0f172a] rounded hover:bg-[#334155] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{incident.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(incident.occurredAt).toLocaleDateString()}
                        </p>
                      </div>
                      <StatusBadge status={incident.severity} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
