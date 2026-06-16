"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { type CSSProperties, useState } from "react";
import { Cloud, Database, FileArchive, Server, X } from "lucide-react";
import ExampleData from "./modules/example-data";
import LocalData from "./modules/local-data";
import OnlineData from "./modules/online-data";
import OnlineService from "./modules/online-service";

type DataSourceDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

const modules = [
  { id: "local-data", label: "本地数据", icon: Database, component: LocalData },
  { id: "online-data", label: "在线数据", icon: Cloud, component: OnlineData },
  { id: "online-service", label: "在线服务", icon: Server, component: OnlineService },
  { id: "example-data", label: "实例数据", icon: FileArchive, component: ExampleData },
] as const;

type ModuleId = (typeof modules)[number]["id"];

const DataSourceDialog = ({ isOpen, onClose }: DataSourceDialogProps) => {
  const [activeModuleId, setActiveModuleId] = useState<ModuleId>("local-data");
  const ActiveModule =
    modules.find((module) => module.id === activeModuleId)?.component ??
    LocalData;

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
          <Sidebar collapsible="none">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {modules.map((module) => (
                      <SidebarMenuItem key={module.id}>
                        <SidebarMenuButton
                          className="text-xs"
                          isActive={module.id === activeModuleId}
                          onClick={() => setActiveModuleId(module.id)}
                        >
                          <module.icon strokeWidth={1.75} />
                          <span>{module.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className="min-w-0 flex-1 bg-background">
            <ActiveModule />
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  );
};

export default DataSourceDialog;
