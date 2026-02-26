"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { OrganizationSwitcher } from "@clerk/nextjs";
import {
  LayoutDashboard,
  FolderKanban,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-surface transition-transform duration-200 ease-in-out md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <span className="text-sm font-bold text-primary-foreground">S</span>
            </div>
            <span className="text-sm font-semibold text-foreground">
              SignalDesk
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="border-b border-border px-4 py-3">
          <OrganizationSwitcher
            hidePersonal
            afterSelectOrganizationUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: "w-full",
                organizationSwitcherTrigger:
                  "w-full justify-between rounded-md border border-border px-3 py-2 text-sm",
              },
            }}
          />
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border px-4 py-3">
          <p className="text-xs text-muted-foreground">SignalDesk v0.1.0</p>
        </div>
      </aside>
    </>
  );
}
