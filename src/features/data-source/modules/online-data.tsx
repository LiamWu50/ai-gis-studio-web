"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  listDatasets,
  registerDatasetFromUrl,
} from "@/services/gis-data";
import type { InputDataSummary } from "@/types/agent";
import DataTablePanel, {
  type DataTableColumn,
  type DataTableRow,
} from "../components/data-table-panel";

type OnlineDataRow = DataTableRow & {
  geometryType: string;
  crs: string;
  featureCount: string;
  fieldCount: string;
  status: string;
};

const columns: DataTableColumn<OnlineDataRow>[] = [
  { key: "name", label: "数据名称" },
  { key: "geometryType", label: "几何类型" },
  { key: "crs", label: "坐标系" },
  { key: "featureCount", label: "要素数" },
  { key: "fieldCount", label: "字段数" },
  { key: "status", label: "状态" },
];

const ONLINE_SOURCE_TYPES = new Set<InputDataSummary["sourceType"]>([
  "url",
  "map_service",
]);

const toRow = (summary: InputDataSummary): OnlineDataRow => ({
  id: summary.datasetId,
  name: summary.name,
  geometryType: summary.geometryType ?? "-",
  crs: summary.crs ?? "-",
  featureCount:
    typeof summary.featureCount === "number"
      ? summary.featureCount.toLocaleString()
      : "-",
  fieldCount: summary.fields.length.toLocaleString(),
  status: summary.warnings.length > 0 ? "有警告" : "已注册",
});

const isHttpUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
};

const getUrlFileName = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    const fileName = parsedUrl.pathname.split("/").filter(Boolean).pop();
    return fileName?.replace(/\.[^/.]+$/, "") || "在线 GeoJSON";
  } catch {
    return "在线 GeoJSON";
  }
};

const OnlineData = () => {
  const [datasets, setDatasets] = useState<InputDataSummary[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rows = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    const onlineDatasets = datasets.filter((dataset) =>
      ONLINE_SOURCE_TYPES.has(dataset.sourceType),
    );
    const filteredDatasets = keyword
      ? onlineDatasets.filter((dataset) =>
          [
            dataset.name,
            dataset.datasetId,
            dataset.geometryType,
            dataset.crs,
          ].some((value) => value?.toLowerCase().includes(keyword)),
        )
      : onlineDatasets;

    return filteredDatasets.map(toRow);
  }, [datasets, searchKeyword]);

  const trimmedUrl = url.trim();
  const trimmedName = name.trim();
  const canSubmit = useMemo(
    () => !isSubmitting && isHttpUrl(trimmedUrl),
    [isSubmitting, trimmedUrl],
  );

  const resetForm = () => {
    setName("");
    setUrl("");
  };

  const loadDatasets = async () => {
    setIsLoading(true);

    try {
      const nextDatasets = await listDatasets();
      setDatasets(nextDatasets);
      setSelectedRowId((currentId) => {
        if (nextDatasets.some((dataset) => dataset.datasetId === currentId)) {
          return currentId;
        }

        const firstOnlineDataset = nextDatasets.find((dataset) =>
          ONLINE_SOURCE_TYPES.has(dataset.sourceType),
        );
        return firstOnlineDataset?.datasetId ?? null;
      });
    } catch {
      setDatasets([]);
      setSelectedRowId(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    listDatasets()
      .then((nextDatasets) => {
        if (!isMounted) return;

        setDatasets(nextDatasets);
        const firstOnlineDataset = nextDatasets.find((dataset) =>
          ONLINE_SOURCE_TYPES.has(dataset.sourceType),
        );
        setSelectedRowId(firstOnlineDataset?.datasetId ?? null);
      })
      .catch(() => {
        if (!isMounted) return;

        setDatasets([]);
        setSelectedRowId(null);
      })
      .finally(() => {
        if (!isMounted) return;

        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);

    try {
      const registeredDataset = await registerDatasetFromUrl(
        trimmedUrl,
        trimmedName || getUrlFileName(trimmedUrl),
      );
      setDatasets((currentDatasets) => [
        registeredDataset,
        ...currentDatasets.filter(
          (dataset) => dataset.datasetId !== registeredDataset.datasetId,
        ),
      ]);
      setSelectedRowId(registeredDataset.datasetId);
      resetForm();
      setIsDialogOpen(false);
    } catch {
      // 后续接入统一反馈组件时再展示注册错误。
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DataTablePanel
        columns={columns}
        emptyText={isLoading ? "正在加载在线数据..." : "暂无在线数据"}
        initialRows={[]}
        rows={rows}
        selectedRowId={selectedRowId}
        title="在线数据"
        toolbar={
          <div className="flex items-center gap-2">
            <div className="p-px">
              <Input
                aria-label="搜索在线数据"
                className="box-border h-8 w-44 border-border/70 text-xs shadow-none focus-visible:border-foreground/30 focus-visible:ring-0"
                disabled={isSubmitting}
                placeholder="搜索在线数据"
                value={searchKeyword}
                onChange={(event) => setSearchKeyword(event.target.value)}
              />
            </div>
            <Button
              type="button"
              size="sm"
              className="h-8 w-20 transition-colors duration-200 ease-out"
              disabled={isSubmitting}
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="size-3.5" />
              新增
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 w-20 transition-colors duration-200 ease-out hover:border-foreground/30 hover:bg-muted/60 hover:text-foreground"
              disabled={isLoading}
              onClick={() => void loadDatasets()}
            >
              <RefreshCw className="size-3.5" />
              刷新
            </Button>
          </div>
        }
        onSelectedRowIdChange={setSelectedRowId}
      />

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>新增在线 GeoJSON</DialogTitle>
            <DialogDescription>
              添加一个可通过 HTTP 访问的 GeoJSON 或 JSON 数据地址。
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="online-data-name">数据名称</Label>
              <Input
                id="online-data-name"
                disabled={isSubmitting}
                value={name}
                placeholder="默认使用文件名"
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="online-data-url">在线地址</Label>
              <Input
                id="online-data-url"
                disabled={isSubmitting}
                value={url}
                placeholder="https://example.com/data.geojson"
                onChange={(event) => setUrl(event.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                取消
              </Button>
            </DialogClose>
            <Button type="button" disabled={!canSubmit} onClick={() => void handleSubmit()}>
              {isSubmitting ? "添加中" : "添加"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OnlineData;
