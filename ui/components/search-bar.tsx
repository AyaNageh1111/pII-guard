"use client";

import { Search, X } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import * as Label from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SearchBarProps {
  onTagsChange: (tags: string[]) => void;
  initialTags?: string[];
}

export function SearchBar({ onTagsChange, initialTags = [] }: SearchBarProps) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [input, setInput] = useState("");
  const [searchTerms, setSearchTerms] = useState<string[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && input.trim()) {
      if (input.startsWith("tag:")) {
        const tag = input.slice(4).trim();
        if (tag && !tags.includes(tag)) {
          const newTags = [...tags, tag];
          setTags(newTags);
          onTagsChange(newTags);
        }
      } else {
        setSearchTerms(prev => [...prev, input.trim()]);
      }
      setInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    onTagsChange(newTags);
  };

  const removeSearchTerm = (termToRemove: string) => {
    setSearchTerms(prev => prev.filter(term => term !== termToRemove));
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Label.Root htmlFor="tag-search" className="sr-only">
            Search by tag
          </Label.Root>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="tag-search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search or filter by tag (e.g., tag:production)"
            className="w-[300px] pl-9"
          />
        </div>
        {input && (
          <Badge variant="outline" className="h-8 px-2">
            {input.startsWith("tag:") ? (
              <>
                <span className="text-xs text-muted-foreground mr-1">tag:</span>
                {input.slice(4).trim()}
              </>
            ) : (
              input
            )}
          </Badge>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-1">
        {searchTerms.map((term, index) => (
          <Tooltip.Provider key={`term-${index}`}>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 px-2 py-1 h-8"
                >
                  {term}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSearchTerm(term)}
                    className="h-4 w-4 p-0 hover:bg-transparent ml-1"
                  >
                    <X className="h-3 w-3 hover:text-destructive" />
                  </Button>
                </Badge>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="bg-popover px-3 py-1.5 text-sm text-popover-foreground rounded-md"
                  sideOffset={5}
                >
                  Remove search term
                  <Tooltip.Arrow className="fill-popover" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        ))}
        {tags.map(tag => (
          <Tooltip.Provider key={tag}>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 px-2 py-1 h-8"
                >
                  <span className="text-xs text-muted-foreground">tag:</span>
                  {tag}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTag(tag)}
                    className="h-4 w-4 p-0 hover:bg-transparent ml-1"
                  >
                    <X className="h-3 w-3 hover:text-destructive" />
                  </Button>
                </Badge>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="bg-popover px-3 py-1.5 text-sm text-popover-foreground rounded-md"
                  sideOffset={5}
                >
                  Remove tag
                  <Tooltip.Arrow className="fill-popover" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        ))}
        {(searchTerms.length > 0 || tags.length > 0) && (
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setTags([]);
                    setSearchTerms([]);
                    onTagsChange([]);
                  }}
                  className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
                >
                  Clear all
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="bg-popover px-3 py-1.5 text-sm text-popover-foreground rounded-md"
                  sideOffset={5}
                >
                  Remove all filters
                  <Tooltip.Arrow className="fill-popover" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        )}
      </div>
    </div>
  );
}