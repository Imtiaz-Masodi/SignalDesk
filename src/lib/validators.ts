import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(2, "Project name must be at least 2 characters")
    .max(50, "Project name must be at most 50 characters"),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional()
    .or(z.literal("")),
});

export const updateProjectSchema = createProjectSchema.partial();

export const createIssueSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be at most 200 characters"),
  description: z.string().optional().or(z.literal("")),
  status: z.enum(["OPEN", "IN_PROGRESS", "DONE", "CLOSED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  assigneeId: z.string().optional().or(z.literal("")),
});

export const updateIssueSchema = createIssueSchema.partial();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateIssueInput = z.infer<typeof createIssueSchema>;
export type UpdateIssueInput = z.infer<typeof updateIssueSchema>;
