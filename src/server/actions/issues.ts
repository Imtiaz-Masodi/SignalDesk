"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  createIssueSchema,
  updateIssueSchema,
  type CreateIssueInput,
  type UpdateIssueInput,
} from "@/lib/validators";

async function getAuth() {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");
  return { userId, orgId };
}

export async function createIssue(projectId: string, input: CreateIssueInput) {
  const { userId, orgId } = await getAuth();
  const validated = createIssueSchema.parse(input);

  const project = await prisma.project.findFirst({
    where: { id: projectId, orgId },
  });
  if (!project) throw new Error("Project not found");

  const lastIssue = await prisma.issue.findFirst({
    where: { projectId },
    orderBy: { number: "desc" },
    select: { number: true },
  });
  const nextNumber = (lastIssue?.number ?? 0) + 1;

  const issue = await prisma.issue.create({
    data: {
      number: nextNumber,
      title: validated.title,
      description: validated.description || null,
      status: validated.status ?? "OPEN",
      priority: validated.priority ?? "MEDIUM",
      projectId,
      creatorId: userId,
      assigneeId: validated.assigneeId || null,
    },
  });

  await prisma.activity.create({
    data: {
      type: "ISSUE_CREATED",
      issueId: issue.id,
      userId,
    },
  });

  revalidatePath(`/projects/${project.slug}/issues`);
  return issue;
}

export async function getIssues(
  projectId: string,
  filters?: {
    status?: string;
    priority?: string;
  }
) {
  const { orgId } = await getAuth();

  const project = await prisma.project.findFirst({
    where: { id: projectId, orgId },
  });
  if (!project) throw new Error("Project not found");

  return prisma.issue.findMany({
    where: {
      projectId,
      ...(filters?.status && filters.status !== "ALL"
        ? { status: filters.status as "OPEN" | "IN_PROGRESS" | "DONE" | "CLOSED" }
        : {}),
      ...(filters?.priority && filters.priority !== "ALL"
        ? { priority: filters.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT" }
        : {}),
    },
    orderBy: [{ createdAt: "desc" }],
  });
}

export async function getIssueByNumber(projectSlug: string, number: number) {
  const { orgId } = await getAuth();

  const project = await prisma.project.findUnique({
    where: { orgId_slug: { orgId, slug: projectSlug } },
  });
  if (!project) return null;

  return prisma.issue.findUnique({
    where: { projectId_number: { projectId: project.id, number } },
    include: {
      activities: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });
}

export async function updateIssue(id: string, input: UpdateIssueInput) {
  const { userId, orgId } = await getAuth();
  const validated = updateIssueSchema.parse(input);

  const issue = await prisma.issue.findFirst({
    where: { id },
    include: { project: true },
  });
  if (!issue) throw new Error("Issue not found");

  const project = await prisma.project.findFirst({
    where: { id: issue.projectId, orgId },
  });
  if (!project) throw new Error("Unauthorized");

  const activities: {
    type: "STATUS_CHANGED" | "PRIORITY_CHANGED" | "ASSIGNEE_CHANGED";
    issueId: string;
    userId: string;
    metadata: Record<string, string | null>;
  }[] = [];

  if (validated.status && validated.status !== issue.status) {
    activities.push({
      type: "STATUS_CHANGED",
      issueId: id,
      userId,
      metadata: { from: issue.status, to: validated.status },
    });
  }
  if (validated.priority && validated.priority !== issue.priority) {
    activities.push({
      type: "PRIORITY_CHANGED",
      issueId: id,
      userId,
      metadata: { from: issue.priority, to: validated.priority },
    });
  }
  if (
    validated.assigneeId !== undefined &&
    validated.assigneeId !== issue.assigneeId
  ) {
    activities.push({
      type: "ASSIGNEE_CHANGED",
      issueId: id,
      userId,
      metadata: {
        from: issue.assigneeId,
        to: validated.assigneeId || null,
      },
    });
  }

  const isClosed =
    validated.status === "CLOSED" || validated.status === "DONE";
  const wasClosed =
    issue.status === "CLOSED" || issue.status === "DONE";

  const updated = await prisma.issue.update({
    where: { id },
    data: {
      ...(validated.title !== undefined && { title: validated.title }),
      ...(validated.description !== undefined && {
        description: validated.description || null,
      }),
      ...(validated.status !== undefined && { status: validated.status }),
      ...(validated.priority !== undefined && { priority: validated.priority }),
      ...(validated.assigneeId !== undefined && {
        assigneeId: validated.assigneeId || null,
      }),
      ...(isClosed && !wasClosed && { closedAt: new Date() }),
      ...(!isClosed && wasClosed && { closedAt: null }),
    },
  });

  if (activities.length > 0) {
    await prisma.activity.createMany({ data: activities });
  }

  revalidatePath(`/projects/${project.slug}/issues`);
  revalidatePath(`/projects/${project.slug}/issues/${issue.number}`);
  return updated;
}

export async function deleteIssue(id: string) {
  const { orgId } = await getAuth();

  const issue = await prisma.issue.findFirst({
    where: { id },
    include: { project: true },
  });
  if (!issue) throw new Error("Issue not found");

  const project = await prisma.project.findFirst({
    where: { id: issue.projectId, orgId },
  });
  if (!project) throw new Error("Unauthorized");

  await prisma.issue.delete({ where: { id } });

  revalidatePath(`/projects/${project.slug}/issues`);
  return { success: true };
}
