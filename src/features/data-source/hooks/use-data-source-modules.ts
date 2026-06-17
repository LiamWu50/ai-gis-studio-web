import { useMemo, useState } from "react";
import { Cloud, Database, FileArchive, Server } from "lucide-react";
import ExampleData from "../modules/example-data";
import LocalData from "../modules/local-data";
import OnlineData from "../modules/online-data";
import OnlineService from "../modules/online-service";

export const DATA_SOURCE_MODULES = [
  { id: "local-data", label: "本地数据", icon: Database, component: LocalData },
  { id: "online-data", label: "在线数据", icon: Cloud, component: OnlineData },
  { id: "online-service", label: "在线服务", icon: Server, component: OnlineService },
  { id: "example-data", label: "实例数据", icon: FileArchive, component: ExampleData },
] as const;

export type DataSourceModuleId = (typeof DATA_SOURCE_MODULES)[number]["id"];

export function useDataSourceModules() {
  const [activeModuleId, setActiveModuleId] =
    useState<DataSourceModuleId>("local-data");

  const ActiveModule = useMemo(
    () =>
      DATA_SOURCE_MODULES.find((module) => module.id === activeModuleId)
        ?.component ?? LocalData,
    [activeModuleId],
  );

  return {
    ActiveModule,
    activeModuleId,
    modules: DATA_SOURCE_MODULES,
    setActiveModuleId,
  };
}
