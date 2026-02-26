"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  createProjectSchema,
  updateProjectSchema,
  type CreateProjectInput,
  type UpdateProjectInput,
} from "@/lib/validators";
import { slugify } from "@/lib/utils";

async function getAuth() {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");
  return { userId, orgId };
}

export async function createProject(input: CreateProjectInput) {
  const { orgId } = await getAuth();
  const validated = createProjectSchema.parse(input);

  let slug = slugify(validated.name);

  const existing = await prisma.project.findUnique({
    where: { orgId_slug: { orgId, slug } },
  });
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const project = await prisma.project.create({
    data: {
      name: validated.name,
      slug,
      description: validated.description || null,
      orgId,
    },
  });

  revalidatePath("/projects");
  return project;
}

export async function getProjects() {
  const { orgId } = await getAuth();

  return prisma.project.findMany({
    where: { orgId },
    include: {
      _count: {
        select: { issues: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProjectBySlug(slug: string) {
  const { orgId } = await getAuth();

  return prisma.project.findUnique({
    where: { orgId_slug: { orgId, slug } },
    include: {
      _count: {
        select: { issues: true },
      },
    },
  });
}

export async function updateProject(id: string, input: UpdateProjectInput) {
  const { orgId } = await getAuth();
  const validated = updateProjectSchema.parse(input);

  const project = await prisma.project.findFirst({
    where: { id, orgId },
  });
  if (!project) throw new Error("Project not found");

  const updated = await prisma.project.update({
    where: { id },
    data: {
      ...(validated.name !== undefined && { name: validated.name }),
      ...(validated.description !== undefined && {
        description: validated.description || null,
      }),
    },
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${project.slug}`);
  return updated;
}

export async function deleteProject(id: string) {
  const { orgId } = await getAuth();

  const project = await prisma.project.findFirst({
    where: { id, orgId },
  });
  if (!project) throw new Error("Project not found");

  await prisma.project.delete({ where: { id } });

  revalidatePath("/projects");
  return { success: true };
}
