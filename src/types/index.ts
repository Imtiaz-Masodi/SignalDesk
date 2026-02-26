import type { IssueStatus, IssuePriority } from "@/generated/prisma/enums";

export const STATUS_CONFIG: Record<
  IssueStatus,
  { label: string; color: string }
> = {
  OPEN: { label: "Open", color: "bg-blue-100 text-blue-800" },
  IN_PROGRESS: { label: "In Progress", color: "bg-yellow-100 text-yellow-800" },
  DONE: { label: "Done", color: "bg-green-100 text-green-800" },
  CLOSED: { label: "Closed", color: "bg-gray-100 text-gray-600" },
};

export const PRIORITY_CONFIG: Record<
  IssuePriority,
  { label: string; color: string; icon: string }
> = {
  LOW: { label: "Low", color: "bg-slate-100 text-slate-600", icon: "▽" },
  MEDIUM: {
    label: "Medium",
    color: "bg-secondary text-secondary-foreground",
    icon: "◇",
  },
  HIGH: { label: "High", color: "bg-orange-100 text-orange-700", icon: "△" },
  URGENT: {
    label: "Urgent",
    color: "bg-red-100 text-red-700",
    icon: "⬆",
  },
};
