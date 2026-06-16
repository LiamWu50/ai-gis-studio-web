import DataTablePanel, {
  type DataTableColumn,
  type DataTableRow,
} from "../components/data-table-panel";

type OnlineDataRow = DataTableRow & {
  category: string;
  source: string;
  updatedAt: string;
  status: string;
};

const columns: DataTableColumn<OnlineDataRow>[] = [
  { key: "name", label: "数据名称" },
  { key: "category", label: "类型" },
  { key: "source", label: "来源" },
  { key: "updatedAt", label: "更新时间" },
  { key: "status", label: "状态" },
];

const initialRows: OnlineDataRow[] = [
  {
    id: "online-1",
    name: "全国行政区划",
    category: "矢量数据",
    source: "公共地理数据平台",
    updatedAt: "2026-06-01",
    status: "已加载",
  },
  {
    id: "online-2",
    name: "实时交通指数",
    category: "时序数据",
    source: "交通运行中心",
    updatedAt: "2026-06-16",
    status: "已加载",
  },
  {
    id: "online-3",
    name: "遥感影像索引",
    category: "栅格数据",
    source: "影像云仓库",
    updatedAt: "2026-05-28",
    status: "已加载",
  },
];

const createRow = (index: number): OnlineDataRow => ({
  id: `online-${Date.now()}`,
  name: `在线数据 ${index}`,
  category: "矢量数据",
  source: "在线数据源",
  updatedAt: "2026-06-16",
  status: "已加载",
});

const OnlineData = () => {
  return (
    <DataTablePanel
      columns={columns}
      createRow={createRow}
      initialRows={initialRows}
      title="在线数据"
    />
  );
};

export default OnlineData;
