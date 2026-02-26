"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface IssueFiltersProps {
  currentStatus?: string;
  currentPriority?: string;
}

export function IssueFilters({
  currentStatus,
  currentPriority,
}: IssueFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="mb-4 flex flex-wrap gap-3">
      <Select
        value={currentStatus || "ALL"}
        onValueChange={(v) => updateFilter("status", v)}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Status</SelectItem>
          <SelectItem value="OPEN">Open</SelectItem>
          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
          <SelectItem value="DONE">Done</SelectItem>
          <SelectItem value="CLOSED">Closed</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={currentPriority || "ALL"}
        onValueChange={(v) => updateFilter("priority", v)}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Priority</SelectItem>
          <SelectItem value="LOW">Low</SelectItem>
          <SelectItem value="MEDIUM">Medium</SelectItem>
          <SelectItem value="HIGH">High</SelectItem>
          <SelectItem value="URGENT">Urgent</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
