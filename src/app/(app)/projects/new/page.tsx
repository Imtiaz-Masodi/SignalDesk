"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createProject } from "@/server/actions/projects";
import { createProjectSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const result = createProjectSchema.safeParse({ name, description });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const project = await createProject({ name, description });
      router.push(`/projects/${project.slug}/issues`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Project</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-foreground"
              >
                Project Name
              </label>
              <Input
                id="name"
                placeholder="e.g. Web App, Mobile API"
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
                Description{" "}
                <span className="text-muted-foreground">(optional)</span>
              </label>
              <Textarea
                id="description"
                placeholder="Brief description of this project"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" asChild>
                <Link href="/projects">Cancel</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
