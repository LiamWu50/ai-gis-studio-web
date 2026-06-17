"use client";

import DataTablePanel from "../components/data-table-panel";
import { OnlineDataDialog } from "../components/online-data-dialog";
import { OnlineDataToolbar } from "../components/online-data-toolbar";
import { useDatasetsTable } from "../hooks/use-datasets-table";
import { useOnlineDatasetForm } from "../hooks/use-online-dataset-form";
import {
  datasetColumns,
  firstOnlineDatasetId,
  ONLINE_SOURCE_TYPES,
} from "../utils/dataset-table";

const OnlineData = () => {
  const table = useDatasetsTable({
    filterDataset: (dataset) =>
      ONLINE_SOURCE_TYPES.has(dataset.sourceType),
    getInitialSelectedRowId: firstOnlineDatasetId,
    readyStatus: "已注册",
  });
  const form = useOnlineDatasetForm({
    onRegistered: table.upsertDataset,
  });

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
          <OnlineDataToolbar
            isLoading={table.isLoading}
            isSubmitting={form.isSubmitting}
            searchKeyword={table.searchKeyword}
            onAddClick={() => form.setOpen(true)}
            onRefresh={() => void table.loadDatasets()}
            onSearchChange={table.setSearchKeyword}
          />
        }
        onSelectedRowIdChange={table.setSelectedRowId}
      />

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
    </>
  );
};

export default OnlineData;
