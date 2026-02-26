import Link from "next/link";
import { Plus, FolderKanban } from "lucide-react";
import { getProjects } from "@/server/actions/projects";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeDate } from "@/lib/utils";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Manage your team&apos;s projects
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderKanban className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-1 text-lg font-medium">No projects yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Create your first project to start tracking issues
            </p>
            <Button asChild>
              <Link href="/projects/new">
                <Plus className="h-4 w-4" />
                New Project
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.slug}/issues`}>
              <Card className="transition-colors hover:border-primary/50 hover:shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary text-sm font-bold text-secondary-foreground">
                      {project.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate">{project.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {project.description && (
                    <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                      {project.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {project._count.issues}{" "}
                      {project._count.issues === 1 ? "issue" : "issues"}
                    </span>
                    <span>{formatRelativeDate(project.createdAt)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
