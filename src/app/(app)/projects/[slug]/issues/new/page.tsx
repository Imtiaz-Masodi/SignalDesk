"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getProjectBySlug } from "@/server/actions/projects";
import { createIssue } from "@/server/actions/issues";
import { createIssueSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";

export default function NewIssuePage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getProjectBySlug(params.slug).then((p) => {
      if (p) setProjectId(p.id);
    });
  }, [params.slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!projectId) return;
    setError(null);

    const result = createIssueSchema.safeParse({
      title,
      description,
      priority,
    });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const issue = await createIssue(projectId, {
        title,
        description,
        priority: priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
      });
      router.push(`/projects/${params.slug}/issues/${issue.number}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create issue"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/projects/${params.slug}/issues`}>
            <ArrowLeft className="h-4 w-4" />
            Back to Issues
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Issue</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-sm font-medium text-foreground"
              >
                Title
              </label>
              <Input
                id="title"
                placeholder="Brief description of the issue"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium text-foreground"
              >
                Description{" "}
                <span className="text-muted-foreground">(Markdown supported)</span>
              </label>
              <Textarea
                id="description"
                placeholder="Detailed description, steps to reproduce, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Priority
              </label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">▽ Low</SelectItem>
                  <SelectItem value="MEDIUM">◇ Medium</SelectItem>
                  <SelectItem value="HIGH">△ High</SelectItem>
                  <SelectItem value="URGENT">⬆ Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" asChild>
                <Link href={`/projects/${params.slug}/issues`}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={loading || !projectId}>
                {loading ? "Creating..." : "Create Issue"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
