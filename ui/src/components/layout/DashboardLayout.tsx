
import React, { useState, useEffect } from 'react';
import { SidebarNav } from './SidebarNav';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarProps?: React.ComponentProps<typeof SidebarNav>;
}

export function DashboardLayout({ children, sidebarProps }: DashboardLayoutProps) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  // Auto-collapse sidebar on mobile
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  return (
    <div className="flex h-screen overflow-hidden bg-dd-bg font-roboto">
      {!isMobile && <SidebarNav open={sidebarOpen} {...sidebarProps} />}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <main className={cn(
          "flex-1 relative overflow-y-auto focus:outline-none p-4 md:p-6 transition-all duration-300 font-roboto", 
          !sidebarOpen ? "ml-0" : "",
          isMobile ? "px-3" : ""
        )}>
          <div className="py-3">
            {children}
          </div>
        </main>
      </div>
      {isMobile && <SidebarNav open={sidebarOpen} {...sidebarProps} />}
    </div>
  );
}
