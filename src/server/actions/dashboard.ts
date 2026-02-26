"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

async function getAuth() {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");
  return { userId, orgId };
}

export async function getDashboardStats() {
  const { orgId } = await getAuth();

  const projects = await prisma.project.findMany({
    where: { orgId },
    select: { id: true },
  });
  const projectIds = projects.map((p) => p.id);

  if (projectIds.length === 0) {
    return {
      totalIssues: 0,
      openIssues: 0,
      inProgressIssues: 0,
      doneIssues: 0,
      closedIssues: 0,
      projectCount: 0,
      recentIssues: [],
    };
  }

  const [total, open, inProgress, done, closed, recentIssues] =
    await Promise.all([
      prisma.issue.count({
        where: { projectId: { in: projectIds } },
      }),
      prisma.issue.count({
        where: { projectId: { in: projectIds }, status: "OPEN" },
      }),
      prisma.issue.count({
        where: { projectId: { in: projectIds }, status: "IN_PROGRESS" },
      }),
      prisma.issue.count({
        where: { projectId: { in: projectIds }, status: "DONE" },
      }),
      prisma.issue.count({
        where: { projectId: { in: projectIds }, status: "CLOSED" },
      }),
      prisma.issue.findMany({
        where: { projectId: { in: projectIds } },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          project: { select: { name: true, slug: true } },
        },
      }),
    ]);

  return {
    totalIssues: total,
    openIssues: open,
    inProgressIssues: inProgress,
    doneIssues: done,
    closedIssues: closed,
    projectCount: projectIds.length,
    recentIssues,
  };
}
