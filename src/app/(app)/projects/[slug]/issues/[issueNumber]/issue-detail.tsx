"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Pencil, Check, X } from "lucide-react";
import { updateIssue, deleteIssue } from "@/server/actions/issues";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "@/types";
import { formatDate } from "@/lib/utils";
import type { IssueStatus, IssuePriority, ActivityType } from "@/generated/prisma/enums";

interface IssueDetailProps {
  issue: {
    id: string;
    number: number;
    title: string;
    description: string | null;
    status: IssueStatus;
    priority: IssuePriority;
    creatorId: string;
    assigneeId: string | null;
    createdAt: Date;
    updatedAt: Date;
    closedAt: Date | null;
    activities: {
      id: string;
      type: ActivityType;
      userId: string;
      metadata: unknown;
      createdAt: Date;
    }[];
  };
  slug: string;
}

export function IssueDetail({ issue, slug }: IssueDetailProps) {
  const router = useRouter();
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [title, setTitle] = useState(issue.title);
  const [description, setDescription] = useState(issue.description || "");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleStatusChange(status: string) {
    await updateIssue(issue.id, { status: status as IssueStatus });
    router.refresh();
  }

  async function handlePriorityChange(priority: string) {
    await updateIssue(issue.id, { priority: priority as IssuePriority });
    router.refresh();
  }

  async function handleTitleSave() {
    if (title.trim() && title !== issue.title) {
      await updateIssue(issue.id, { title });
      router.refresh();
    }
    setEditingTitle(false);
  }

  async function handleDescSave() {
    if (description !== (issue.description || "")) {
      await updateIssue(issue.id, { description });
      router.refresh();
    }
    setEditingDesc(false);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteIssue(issue.id);
      router.push(`/projects/${slug}/issues`);
    } catch {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Main content */}
      <div className="min-w-0 flex-1">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-start gap-2">
              <span className="mt-1 shrink-0 text-sm text-muted-foreground">
                #{issue.number}
              </span>
              {editingTitle ? (
                <div className="flex flex-1 items-center gap-2">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-lg font-semibold"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleTitleSave();
                      if (e.key === "Escape") {
                        setTitle(issue.title);
                        setEditingTitle(false);
                      }
                    }}
                  />
                  <Button size="icon-sm" variant="ghost" onClick={handleTitleSave}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => {
                      setTitle(issue.title);
                      setEditingTitle(false);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <button
                  className="flex-1 text-left text-xl font-semibold text-foreground hover:text-primary"
                  onClick={() => setEditingTitle(true)}
                  title="Click to edit"
                >
                  {issue.title}
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                Description
              </h3>
              {!editingDesc && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setEditingDesc(true)}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              )}
            </div>
            {editingDesc ? (
              <div className="space-y-2">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={8}
                  autoFocus
                  placeholder="Add a description (Markdown supported)..."
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleDescSave}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setDescription(issue.description || "");
                      setEditingDesc(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none text-foreground">
                {issue.description ? (
                  <p className="whitespace-pre-wrap">{issue.description}</p>
                ) : (
                  <p className="italic text-muted-foreground">
                    No description provided
                  </p>
                )}
              </div>
            )}

            {/* Activity log */}
            {issue.activities.length > 0 && (
              <div className="mt-8 border-t border-border pt-6">
                <h3 className="mb-4 text-sm font-medium text-muted-foreground">
                  Activity
                </h3>
                <div className="space-y-3">
                  {issue.activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 text-sm"
                    >
                      <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-muted-foreground" />
                      <div className="flex-1">
                        <span className="text-muted-foreground">
                          {formatActivityMessage(activity.type, activity.metadata)}
                        </span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {formatDate(activity.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="w-full space-y-4 lg:w-64">
        <Card>
          <CardContent className="space-y-4 p-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Status
              </label>
              <Select
                value={issue.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Priority
              </label>
              <Select
                value={issue.priority}
                onValueChange={handlePriorityChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_CONFIG).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.icon} {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border-t border-border pt-4">
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Created</span>
                  <span>{formatDate(issue.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Updated</span>
                  <span>{formatDate(issue.updatedAt)}</span>
                </div>
                {issue.closedAt && (
                  <div className="flex justify-between">
                    <span>Closed</span>
                    <span>{formatDate(issue.closedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="w-full">
                    <Trash2 className="h-4 w-4" />
                    Delete Issue
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Issue</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete issue #{issue.number}?
                      This action cannot be undone.
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function formatActivityMessage(type: ActivityType, metadata: unknown): string {
  const meta = metadata as Record<string, string> | null;
  switch (type) {
    case "ISSUE_CREATED":
      return "Issue created";
    case "STATUS_CHANGED":
      return `Status changed from ${meta?.from ?? "?"} to ${meta?.to ?? "?"}`;
    case "PRIORITY_CHANGED":
      return `Priority changed from ${meta?.from ?? "?"} to ${meta?.to ?? "?"}`;
    case "ASSIGNEE_CHANGED":
      return "Assignee updated";
    case "COMMENT_ADDED":
      return "Comment added";
    case "LABEL_ADDED":
      return "Label added";
    case "LABEL_REMOVED":
      return "Label removed";
    default:
      return "Activity recorded";
  }
}
