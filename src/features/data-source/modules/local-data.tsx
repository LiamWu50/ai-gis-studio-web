import DataTablePanel, {
  type DataTableColumn,
  type DataTableRow,
} from "../components/data-table-panel";

type LocalDataRow = DataTableRow & {
  format: string;
  coordinate: string;
  size: string;
  status: string;
};

const columns: DataTableColumn<LocalDataRow>[] = [
  { key: "name", label: "数据名称" },
  { key: "format", label: "格式" },
  { key: "coordinate", label: "坐标系" },
  { key: "size", label: "大小" },
  { key: "status", label: "状态" },
];

const initialRows: LocalDataRow[] = [
  {
    id: "local-1",
    name: "城市道路中心线",
    format: "GeoJSON",
    coordinate: "WGS84",
    size: "12.4 MB",
    status: "已加载",
  },
  {
    id: "local-2",
    name: "建筑轮廓面",
    format: "Shapefile",
    coordinate: "CGCS2000",
    size: "48.7 MB",
    status: "已加载",
  },
  {
    id: "local-3",
    name: "兴趣点位清单",
    format: "CSV",
    coordinate: "WGS84",
    size: "3.1 MB",
    status: "已加载",
  },
];

const createRow = (index: number): LocalDataRow => ({
  id: `local-${Date.now()}`,
  name: `本地数据 ${index}`,
  format: "GeoJSON",
  coordinate: "WGS84",
  size: "0 MB",
  status: "已加载",
});

const LocalData = () => {
  return (
    <DataTablePanel
      columns={columns}
      createRow={createRow}
      initialRows={initialRows}
      title="本地数据"
    />
  );
};

export default LocalData;
