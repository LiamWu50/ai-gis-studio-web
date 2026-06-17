import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type {
  DATA_SOURCE_MODULES,
  DataSourceModuleId,
} from "../hooks/use-data-source-modules";

type DataSourceModuleListProps = {
  activeModuleId: DataSourceModuleId;
  modules: typeof DATA_SOURCE_MODULES;
  onModuleChange: (moduleId: DataSourceModuleId) => void;
};

export function DataSourceModuleList({
  activeModuleId,
  modules,
  onModuleChange,
}: DataSourceModuleListProps) {
  return (
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
                    onClick={() => onModuleChange(module.id)}
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
  );
}
