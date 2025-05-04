
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Download } from "lucide-react";

interface GdprReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: string;
  onDownload: () => void;
  title?: string;
}

export function GdprReportModal({ isOpen, onClose, report, onDownload, title = "GDPR/PII Scan Report" }: GdprReportModalProps) {
  // Convert markdown to displayable HTML (simple version)
  const formatMarkdown = (markdown: string) => {
    if (!markdown) return '';
    
    return markdown
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4 text-datadog-800">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mb-3 text-datadog-700">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mb-2 text-datadog-600">$1</h3>')
      .replace(/^#### (.*$)/gm, '<h4 class="text-base font-semibold mb-2 text-datadog-500">$1</h4>')
      .replace(/^\* (.*$)/gm, '<li class="ml-4">$1</li>')
      .replace(/^- (.*$)/gm, '<li class="ml-4 mb-1">$1</li>')
      .replace(/^\> (.*$)/gm, '<blockquote class="border-l-4 border-datadog-400 pl-4 italic">$1</blockquote>')
      .replace(/\*\*(.*)\*\*/gm, '<span class="font-bold">$1</span>')
      .replace(/\*(.*)\*/gm, '<span class="italic">$1</span>')
      .replace(/\`(.*)\`/gm, '<code class="bg-gray-100 px-1 py-0.5 rounded text-datadog-800 font-mono text-sm">$1</code>')
      .replace(/^\s*\n/gm, '<br />')
      .replace(/---/g, '<hr class="my-4 border-t border-datadog-200" />')
      .split('\n').map(line => {
        // If it's not a header or list item already processed
        if (!/^<(h[1-6]|li|blockquote)/.test(line) && line.trim() !== '' && !line.includes('<br />')) {
          return `<p class="mb-2">${line}</p>`;
        }
        return line;
      }).join('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-datadog-600">{title}</span>
          </DialogTitle>
          <DialogDescription>
            Detailed analysis of personally identifiable information detected in system logs.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 mt-4 mb-4">
          <ScrollArea className="h-[60vh] border rounded-md p-4 bg-white">
            <div 
              className="markdown-content pr-4"
              dangerouslySetInnerHTML={{ __html: formatMarkdown(report) }}
            />
          </ScrollArea>
        </div>
        
        <DialogFooter>
          <Button
            onClick={onDownload}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download as Markdown
          </Button>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

