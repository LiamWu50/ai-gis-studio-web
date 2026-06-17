import { EmptySelectLayerPanel } from "../components/empty-select-layer-panel";
import type { DataSourceModuleProps } from "../hooks/use-data-source-modules";

const OnlineService = ({ mode = "manage" }: DataSourceModuleProps) => {
  if (mode === "select-layer") {
    return <EmptySelectLayerPanel title="在线服务" />;
  }

  return <div className="h-full" />;
};

export default OnlineService;
