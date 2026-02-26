"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  getProjectBySlug,
  updateProject,
  deleteProject,
} from "@/server/actions/projects";
import { updateProjectSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ProjectSettingsPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const [project, setProject] = useState<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
  } | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getProjectBySlug(params.slug).then((p) => {
      if (p) {
        setProject(p);
        setName(p.name);
        setDescription(p.description || "");
      }
    });
  }, [params.slug]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!project) return;
    setError(null);

    const result = updateProjectSchema.safeParse({ name, description });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      await updateProject(project.id, { name, description });
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update project"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!project) return;
    setDeleting(true);
    try {
      await deleteProject(project.id);
      router.push("/projects");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete project"
      );
      setDeleting(false);
    }
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/projects/${params.slug}/issues`}>
            <ArrowLeft className="h-4 w-4" />
            Back to Issues
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Project Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-foreground"
              >
                Project Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium text-foreground"
              >
                Description
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Deleting this project will permanently remove all its issues,
            comments, and data. This action cannot be undone.
          </p>
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4" />
                Delete Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Project</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete &quot;{project.name}&quot;?
                  This will permanently remove all issues and data.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
