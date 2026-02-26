import { notFound } from "next/navigation";
import Link from "next/link";
import { Plus, Settings } from "lucide-react";
import { getProjectBySlug } from "@/server/actions/projects";
import { getIssues } from "@/server/actions/issues";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatRelativeDate } from "@/lib/utils";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "@/types";
import { IssueFilters } from "./issue-filters";

export default async function IssuesPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ status?: string; priority?: string }>;
}) {
  const { slug } = await params;
  const filters = await searchParams;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const issues = await getIssues(project.id, {
    status: filters.status,
    priority: filters.priority,
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">
              {project.name}
            </h1>
            <Link
              href={`/projects/${slug}/settings`}
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            {project._count.issues}{" "}
            {project._count.issues === 1 ? "issue" : "issues"}
          </p>
        </div>
        <Button asChild>
          <Link href={`/projects/${slug}/issues/new`}>
            <Plus className="h-4 w-4" />
            New Issue
          </Link>
        </Button>
      </div>

      <IssueFilters
        currentStatus={filters.status}
        currentPriority={filters.priority}
      />

      {issues.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="mb-4 text-sm text-muted-foreground">
              {filters.status || filters.priority
                ? "No issues match the current filters"
                : "No issues yet. Create your first one!"}
            </p>
            {!filters.status && !filters.priority && (
              <Button asChild>
                <Link href={`/projects/${slug}/issues/new`}>
                  <Plus className="h-4 w-4" />
                  New Issue
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {issues.map((issue) => {
            const status = STATUS_CONFIG[issue.status];
            const priority = PRIORITY_CONFIG[issue.priority];
            return (
              <Link
                key={issue.id}
                href={`/projects/${slug}/issues/${issue.number}`}
                className="block"
              >
                <Card className="transition-colors hover:border-primary/30 hover:bg-surface-hover">
                  <CardContent className="flex items-center gap-4 p-4">
                    <span
                      className="hidden text-sm text-muted-foreground sm:inline-block sm:w-16 sm:text-right"
                      title={`Issue #${issue.number}`}
                    >
                      #{issue.number}
                    </span>

                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${priority.color}`}
                    >
                      <span className="mr-1">{priority.icon}</span>
                      <span className="hidden sm:inline">{priority.label}</span>
                    </span>

                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                      {issue.title}
                    </span>

                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}
                    >
                      {status.label}
                    </span>

                    <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline-block">
                      {formatRelativeDate(issue.createdAt)}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
