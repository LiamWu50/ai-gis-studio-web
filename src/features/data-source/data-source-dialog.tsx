"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { SidebarProvider } from "@/components/ui/sidebar";
import { type CSSProperties } from "react";
import { X } from "lucide-react";
import { DataSourceModuleList } from "./components/data-source-module-list";
import { useDataSourceModules } from "./hooks/use-data-source-modules";

type DataSourceDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

const DataSourceDialog = ({ isOpen, onClose }: DataSourceDialogProps) => {
  const {
    ActiveModule,
    activeModuleId,
    modules,
    setActiveModuleId,
  } = useDataSourceModules();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="flex h-[calc(100vh-10rem)] w-[calc(100vw-10rem)] max-w-none flex-col overflow-hidden border-0 p-0 [&>button]:hidden"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <DialogTitle className="sr-only">数据源面板</DialogTitle>
        <DialogDescription className="sr-only">数据源管理面板</DialogDescription>
        <header className="flex h-12 shrink-0 items-center justify-between border-b px-4">
          <div className="text-sm font-semibold text-foreground">数据源</div>
          <DialogClose className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-foreground/70 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            <X className="size-4" />
            <span className="sr-only">关闭</span>
          </DialogClose>
        </header>
        <SidebarProvider
          className="min-h-0 flex-1"
          defaultOpen
          style={
            {
              "--sidebar-width": "10rem",
            } as CSSProperties
          }
        >
          <DataSourceModuleList
            activeModuleId={activeModuleId}
            modules={modules}
            onModuleChange={setActiveModuleId}
          />
          <main className="min-w-0 flex-1 bg-background">
            <ActiveModule />
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  );
};

export default DataSourceDialog;
