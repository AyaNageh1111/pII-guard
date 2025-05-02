"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Copy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { generateShareableURL } from "@/lib/utils";

interface ShareDialogProps {
  filters: Record<string, any>;
}

export function ShareDialog({ filters }: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareableUrl = generateShareableURL(filters);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="outline" size="sm" className="transition-all hover:shadow-md">
          Share
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-background p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold">
            Share Dashboard
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-muted-foreground">
            Share your current dashboard view with others using this URL:
          </Dialog.Description>

          <div className="mt-4 flex items-center gap-2">
            <Input
              value={shareableUrl}
              readOnly
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
              className={copied ? "text-green-500" : ""}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          {copied && (
            <p className="mt-2 text-sm text-green-500">
              URL copied to clipboard!
            </p>
          )}

          <Dialog.Close asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
            >
              <X className="h-4 w-4" />
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}