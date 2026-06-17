import type { DataTableColumn, DataTableRow } from "../components/data-table-panel";
import type { InputDataSummary } from "@/types/agent";

export type DatasetTableRow = DataTableRow & {
  geometryType: string;
  crs: string;
  featureCount: string;
  fieldCount: string;
  status: string;
};

export const datasetColumns: DataTableColumn<DatasetTableRow>[] = [
  { key: "name", label: "数据名称" },
  { key: "geometryType", label: "几何类型" },
  { key: "crs", label: "坐标系" },
  { key: "featureCount", label: "要素数" },
  { key: "fieldCount", label: "字段数" },
  { key: "status", label: "状态" },
];

export const ONLINE_SOURCE_TYPES = new Set<InputDataSummary["sourceType"]>([
  "url",
  "map_service",
]);

export const toDatasetRow = (
  summary: InputDataSummary,
  readyStatus: string,
): DatasetTableRow => ({
  id: summary.datasetId,
  name: summary.name,
  geometryType: summary.geometryType ?? "-",
  crs: summary.crs ?? "-",
  featureCount:
    typeof summary.featureCount === "number"
      ? summary.featureCount.toLocaleString()
      : "-",
  fieldCount: summary.fields.length.toLocaleString(),
  status: summary.warnings.length > 0 ? "有警告" : readyStatus,
});

export const matchesDatasetKeyword = (
  dataset: InputDataSummary,
  keyword: string,
) =>
  [
    dataset.name,
    dataset.datasetId,
    dataset.geometryType,
    dataset.crs,
  ].some((value) => value?.toLowerCase().includes(keyword));

export const firstDatasetId = (datasets: InputDataSummary[]) =>
  datasets[0]?.datasetId ?? null;

export const firstOnlineDatasetId = (datasets: InputDataSummary[]) =>
  datasets.find((dataset) => ONLINE_SOURCE_TYPES.has(dataset.sourceType))
    ?.datasetId ?? null;
