
import React, { useState } from 'react';
import { Filter, Tag, X, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePiiJobs } from '@/hooks/usePiiJobs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { Logo } from '@/components/pii-dashboard/Logo';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface SidebarNavProps {
  open: boolean;
  isLoading?: boolean;
  isAutoRefresh?: boolean;
  setIsAutoRefresh?: (value: boolean) => void;
  handleManualRefresh?: () => void;
  dashboardTitle?: string;
}

export function SidebarNav({ 
  open,
  isLoading = false,
  isAutoRefresh = false,
  setIsAutoRefresh = () => {},
  handleManualRefresh = () => {},
  dashboardTitle = "PII Detection Dashboard"
}: SidebarNavProps) {
  const isMobile = useIsMobile();
  
  const {
    selectedStatuses,
    selectedTags,
    handleStatusChange,
    handleTagChange,
    clearAllFilters,
    allJobs
  } = usePiiJobs();

  const [tagInput, setTagInput] = useState('');

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      handleTagChange(tagInput.trim());
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    handleTagChange(tag);
  };

  // Combined content for sidebar
  const SidebarContent = () => (
    <div className="flex flex-col flex-grow overflow-y-auto">
      {/* Dashboard controls section */}
      <div className="px-3 py-3 border-b border-datadog-100">
        <p className="text-indigo-600 mb-2 text-sm font-medium">
          Monitor and protect sensitive data
        </p>
        
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleManualRefresh} 
              disabled={isLoading}
              className="h-8 w-8 hover:bg-indigo-100"
            >
              <RefreshCw className={cn("h-4 w-4 text-indigo-600", isLoading && "animate-spin")} />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              className={cn("text-xs", 
                isAutoRefresh 
                  ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100" 
                  : "hover:bg-indigo-100 hover:text-indigo-700"
              )}
            >
              {isAutoRefresh ? "Auto Refresh" : "Manual Refresh"}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Filters section */}
      <div className="px-3 py-2">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-datadog-600 font-display">Filters</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAllFilters} 
            className="text-xs text-datadog-500 hover:text-datadog-800 font-roboto"
          >
            Clear all
          </Button>
        </div>
        
        {/* Tag Search Input */}
        <div className="mb-2">
          <label htmlFor="tag-search" className="text-sm font-medium text-datadog-600 mb-1 block font-display">
            Search Tags
          </label>
          <Input
            id="tag-search"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Type and press Enter"
            className="w-full border-datadog-200 focus:border-datadog-500 focus:ring-datadog-500 font-roboto"
          />
        </div>

        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <div className="mb-2">
            <p className="text-xs text-datadog-500 mb-1 font-roboto">Selected Tags:</p>
            <div className="flex flex-wrap gap-1">
              {selectedTags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1 px-2 py-1 bg-datadog-100 text-datadog-700 hover:bg-datadog-200 font-roboto">
                  {tag}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <Accordion type="multiple" defaultValue={["status"]}>
          {/* Status Filter */}
          <AccordionItem value="status" className="border-datadog-200">
            <AccordionTrigger className="py-1.5 text-sm hover:no-underline text-datadog-700 font-display">
              <div className="flex items-center">
                <Filter className="w-4 h-4 mr-2 text-datadog-500" />
                <span>Status</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1 pt-1">
                {["success", "failed", "processing"].map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`status-${status}`} 
                      checked={selectedStatuses.includes(status)}
                      onCheckedChange={() => handleStatusChange(status)}
                      className="border-datadog-300 text-datadog-600 focus:ring-datadog-500"
                    />
                    <label 
                      htmlFor={`status-${status}`} 
                      className={`text-sm cursor-pointer font-roboto ${selectedStatuses.includes(status) ? 'text-datadog-700 font-medium' : 'text-datadog-600'}`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );

  // For mobile: use a drawer
  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline" size="icon" className="fixed bottom-4 left-4 z-50 rounded-full shadow-lg bg-gradient-to-r from-datadog-500 to-dd-processing border-0 text-white hover:opacity-90">
            <Filter className="h-4 w-4" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="bg-gradient-to-br from-white to-retro-gray">
          <DrawerHeader>
            <DrawerTitle className="text-datadog-700 font-display">Dashboard Controls</DrawerTitle>
          </DrawerHeader>
          <div className="px-4">
            {/* Logo at the top */}
            <div className="py-2 border-b border-datadog-100">
              <Logo size="sm" animated={false} className="mx-auto" />
            </div>
            <SidebarContent />
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline" className="border-datadog-300 text-datadog-700 hover:bg-datadog-100 font-roboto">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }
  
  // For desktop: use the sidebar
  return (
    <div className={cn(
      "flex flex-col flex-shrink-0 bg-gradient-to-br from-white to-retro-gray border-r border-datadog-100 shadow-sm transition-all duration-300",
      open ? "w-64" : "w-20"
    )}>
      {/* Logo always visible at the top */}
      <div className="p-3 border-b border-datadog-100 flex justify-center">
        {open ? (
          <Logo size="md" animated={true} />
        ) : (
          <Logo size="sm" animated={false} />
        )}
      </div>
      
      {open && <SidebarContent />}

      {!open && (
        <div className="flex flex-col items-center py-3 mt-2">
          <div className="rounded-full bg-gradient-to-r from-datadog-500 to-dd-processing p-2 mb-3 shadow-md">
            <Filter className="h-5 w-5 text-white" />
          </div>
          <div className="rounded-full bg-gradient-to-r from-dd-processing to-datadog-400 p-2 shadow-md">
            <Tag className="h-5 w-5 text-white" />
          </div>
          <div className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 p-2 mt-3 shadow-md">
            <RefreshCw className="h-5 w-5 text-white" onClick={handleManualRefresh} />
          </div>
        </div>
      )}
    </div>
  );
}
