"use client";

import DataTablePanel from "../components/data-table-panel";
import { LocalDataToolbar } from "../components/local-data-toolbar";
import { useDatasetsTable } from "../hooks/use-datasets-table";
import { useLocalDatasetUpload } from "../hooks/use-local-dataset-upload";
import { datasetColumns, firstDatasetId } from "../utils/dataset-table";

const LocalData = () => {
  const table = useDatasetsTable({
    getInitialSelectedRowId: firstDatasetId,
    readyStatus: "已接入",
  });
  const upload = useLocalDatasetUpload({
    onUploaded: table.upsertDataset,
  });

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
        }
        onSelectedRowIdChange={table.setSelectedRowId}
      />
    </section>
  );
};

export default LocalData;
