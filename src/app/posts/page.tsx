import { Suspense } from "react";
import Link from "next/link";
import { Shield } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { SearchInput } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { TableSkeleton } from "@/components/ui/Loading";
import { EmptyState } from "@/components/ui/EmptyState";
import { getPosts, getSitesForFilter } from "@/lib/queries/posts";

interface PageProps {
  searchParams: Promise<{ search?: string; siteId?: string; status?: string }>;
}

async function PostsTable({
  search,
  siteId,
  status,
}: {
  search?: string;
  siteId?: string;
  status?: string;
}) {
  const posts = await getPosts({
    search,
    siteId,
    isActive: status === "active" ? true : status === "inactive" ? false : undefined,
  });

  if (posts.length === 0) {
    return (
      <EmptyState
        icon={Shield}
        title="No posts found"
        description={search || siteId || status ? "Try adjusting your filters." : "No posts have been added yet."}
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Site</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Shifts</TableHead>
          <TableHead>Incidents</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {posts.map((post) => (
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
            <TableCell>
              <Link
                href={`/sites/${post.site.id}`}
                className="text-blue-400 hover:text-blue-300"
              >
                {post.site.name}
              </Link>
            </TableCell>
            <TableCell>{post.site.opzone.region.client.name}</TableCell>
            <TableCell>{post._count.shifts}</TableCell>
            <TableCell>{post._count.incidents}</TableCell>
            <TableCell>
              <StatusBadge status={post.isActive ? "active" : "inactive"} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

async function FiltersSection({
  search,
  siteId,
  status,
}: {
  search?: string;
  siteId?: string;
  status?: string;
}) {
  const sites = await getSitesForFilter();

  return (
    <form className="flex flex-col md:flex-row gap-4 mb-4">
      <div className="flex-1">
        <SearchInput
          name="search"
          placeholder="Search posts by name or code..."
          defaultValue={search}
        />
      </div>
      <Select
        name="siteId"
        defaultValue={siteId || ""}
        options={[
          { value: "", label: "All Sites" },
          ...sites.map((s) => ({ value: s.id, label: s.name })),
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

export default async function PostsPage({ searchParams }: PageProps) {
  const { search, siteId, status } = await searchParams;

  return (
    <div>
      <PageHeader title="Posts" description="Manage security posts" />

      <Card>
        <CardContent className="p-4">
          <Suspense fallback={<div className="h-12 skeleton rounded mb-4" />}>
            <FiltersSection search={search} siteId={siteId} status={status} />
          </Suspense>

          <Suspense fallback={<TableSkeleton rows={8} cols={8} />}>
            <PostsTable search={search} siteId={siteId} status={status} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
