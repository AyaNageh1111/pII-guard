
import React from 'react';
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface FilterToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function FilterToolbar({
  searchQuery,
  onSearchChange,
}: FilterToolbarProps) {
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by tag (e.g., tag:production) or job ID..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>
      </div>
    </div>
  );
}
