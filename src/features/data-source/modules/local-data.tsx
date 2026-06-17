"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { useLayerWorkspace } from "@/features/layers/layer-workspace";
import DataTablePanel from "../components/data-table-panel";
import { LocalDataToolbar } from "../components/local-data-toolbar";
import { SelectLayerToolbar } from "../components/select-layer-toolbar";
import type { DataSourceModuleProps } from "../hooks/use-data-source-modules";
import { useDatasetsTable } from "../hooks/use-datasets-table";
import { useLocalDatasetUpload } from "../hooks/use-local-dataset-upload";
import { datasetColumns, firstDatasetId } from "../utils/dataset-table";

const LocalData = ({
  mode = "manage",
  onLayerSelected,
}: DataSourceModuleProps) => {
  const [isAddingLayer, setIsAddingLayer] = useState(false);
  const { addUserLayerFromDataset } = useLayerWorkspace();
  const { toast } = useToast();
  const table = useDatasetsTable({
    getInitialSelectedRowId: firstDatasetId,
    readyStatus: "已接入",
  });
  const upload = useLocalDatasetUpload({
    onUploaded: table.upsertDataset,
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
    <section className="flex h-full min-w-0 flex-col">
      <DataTablePanel
        columns={datasetColumns}
        emptyText={table.isLoading ? "正在加载本地数据..." : "暂无本地数据"}
        initialRows={[]}
        rows={table.rows}
        selectedRowId={table.selectedRowId}
        title="本地数据"
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
            <LocalDataToolbar
              fileInputRef={upload.fileInputRef}
              isLoading={table.isLoading}
              isUploading={upload.isUploading}
              searchKeyword={table.searchKeyword}
              onFileChange={upload.uploadFile}
              onRefresh={() => void table.loadDatasets()}
              onSearchChange={table.setSearchKeyword}
              onUploadClick={upload.openFilePicker}
            />
          )
        }
        onSelectedRowIdChange={table.setSelectedRowId}
      />
    </section>
  );
};

export default LocalData;
