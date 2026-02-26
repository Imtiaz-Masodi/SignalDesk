import Link from "next/link";
import {
  Bug,
  CircleDot,
  Loader2,
  CheckCircle2,
  XCircle,
  FolderKanban,
} from "lucide-react";
import { getDashboardStats } from "@/server/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeDate } from "@/lib/utils";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "@/types";
import type { IssueStatus, IssuePriority } from "@/generated/prisma/enums";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const statCards = [
    {
      label: "Total Issues",
      value: stats.totalIssues,
      icon: Bug,
      color: "text-foreground",
      bg: "bg-muted",
    },
    {
      label: "Open",
      value: stats.openIssues,
      icon: CircleDot,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "In Progress",
      value: stats.inProgressIssues,
      icon: Loader2,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      label: "Done",
      value: stats.doneIssues,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Closed",
      value: stats.closedIssues,
      icon: XCircle,
      color: "text-gray-500",
      bg: "bg-gray-50",
    },
    {
      label: "Projects",
      value: stats.projectCount,
      icon: FolderKanban,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your team&apos;s issues
        </p>
      </div>

      <div className="mb-8 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.bg}`}
                >
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Issues</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentIssues.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No issues yet
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentIssues.map((issue) => {
                  const status = STATUS_CONFIG[issue.status as IssueStatus];
                  const priority = PRIORITY_CONFIG[issue.priority as IssuePriority];
                  return (
                    <Link
                      key={issue.id}
                      href={`/projects/${issue.project.slug}/issues/${issue.number}`}
                      className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-surface-hover"
                    >
                      <span
                        className={`inline-flex shrink-0 items-center rounded-full px-1.5 py-0.5 text-xs font-medium ${priority.color}`}
                      >
                        {priority.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {issue.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {issue.project.name} &middot;{" "}
                          {formatRelativeDate(issue.createdAt)}
                        </p>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Placeholder for charts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Charts coming in Phase 3
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Issue trends, resolution time, priority breakdown
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
