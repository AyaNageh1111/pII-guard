"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Job } from "@/lib/types";
import { exportToCSV, exportToJSON } from "@/lib/utils";

interface ExportMenuProps {
  jobs: Job[];
}

export function ExportMenu({ jobs }: ExportMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="default" size="sm" className="transition-all hover:shadow-md">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[220px] bg-popover text-popover-foreground rounded-md p-1 shadow-md"
          sideOffset={5}
        >
          <DropdownMenu.Item
            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
            onSelect={() => exportToCSV(jobs)}
          >
            Export as CSV
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
            onSelect={() => exportToJSON(jobs)}
          >
            Export as JSON
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}