"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { useLayerWorkspace } from "@/features/layers/layer-workspace";
import DataTablePanel from "../components/data-table-panel";
import { OnlineDataDialog } from "../components/online-data-dialog";
import { OnlineDataToolbar } from "../components/online-data-toolbar";
import { SelectLayerToolbar } from "../components/select-layer-toolbar";
import type { DataSourceModuleProps } from "../hooks/use-data-source-modules";
import { useDatasetsTable } from "../hooks/use-datasets-table";
import { useOnlineDatasetForm } from "../hooks/use-online-dataset-form";
import {
  datasetColumns,
  firstOnlineDatasetId,
  ONLINE_SOURCE_TYPES,
} from "../utils/dataset-table";

const OnlineData = ({
  mode = "manage",
  onLayerSelected,
}: DataSourceModuleProps) => {
  const [isAddingLayer, setIsAddingLayer] = useState(false);
  const { addUserLayerFromDataset } = useLayerWorkspace();
  const { toast } = useToast();
  const table = useDatasetsTable({
    filterDataset: (dataset) =>
      ONLINE_SOURCE_TYPES.has(dataset.sourceType),
    getInitialSelectedRowId: firstOnlineDatasetId,
    readyStatus: "已注册",
  });
  const form = useOnlineDatasetForm({
    onRegistered: table.upsertDataset,
  });
  const isSelectLayerMode = mode === "select-layer";

  const handleAddLayer = async () => {
    if (!table.selectedDataset) return;

    setIsAddingLayer(true);
    try {
      const layer = await addUserLayerFromDataset(table.selectedDataset);
      if (layer.loadStatus === "loaded") {
        toast({
          title: "图层已添加",
          description: `${layer.name} 已加载到地图`,
          variant: "success",
        });
        onLayerSelected?.();
        return;
      }

      toast({
        title: "图层已加入，暂未上图",
        description: layer.loadMessage,
        variant: layer.loadStatus === "failed" ? "error" : "warning",
      });
    } finally {
      setIsAddingLayer(false);
    }
  };

  return (
    <>
      <DataTablePanel
        columns={datasetColumns}
        emptyText={table.isLoading ? "正在加载在线数据..." : "暂无在线数据"}
        initialRows={[]}
        rows={table.rows}
        selectedRowId={table.selectedRowId}
        title="在线数据"
        toolbar={
          isSelectLayerMode ? (
            <SelectLayerToolbar
              isAdding={isAddingLayer}
              isLoading={table.isLoading}
              searchKeyword={table.searchKeyword}
              selectedRowId={table.selectedRowId}
              onAddLayer={() => void handleAddLayer()}
              onRefresh={() => void table.loadDatasets()}
              onSearchChange={table.setSearchKeyword}
            />
          ) : (
            <OnlineDataToolbar
              isLoading={table.isLoading}
              isSubmitting={form.isSubmitting}
              searchKeyword={table.searchKeyword}
              onAddClick={() => form.setOpen(true)}
              onRefresh={() => void table.loadDatasets()}
              onSearchChange={table.setSearchKeyword}
            />
          )
        }
        onSelectedRowIdChange={table.setSelectedRowId}
      />

      {!isSelectLayerMode ? (
        <OnlineDataDialog
          canSubmit={form.canSubmit}
          isOpen={form.isOpen}
          isSubmitting={form.isSubmitting}
          name={form.name}
          url={form.url}
          onNameChange={form.setName}
          onOpenChange={form.setOpen}
          onSubmit={form.submit}
          onUrlChange={form.setUrl}
        />
      ) : null}
    </>
  );
};

export default OnlineData;
