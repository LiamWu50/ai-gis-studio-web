import { EmptySelectLayerPanel } from "../components/empty-select-layer-panel";
import type { DataSourceModuleProps } from "../hooks/use-data-source-modules";

const ExampleData = ({ mode = "manage" }: DataSourceModuleProps) => {
  if (mode === "select-layer") {
    return <EmptySelectLayerPanel title="实例数据" />;
  }

  return <div className="h-full" />;
};

export default ExampleData;
