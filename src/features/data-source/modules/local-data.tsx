"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listDatasets, uploadDataset } from "@/services/gis-data";
import type { InputDataSummary } from "@/types/agent";
import DataTablePanel, {
  type DataTableColumn,
  type DataTableRow,
} from "../components/data-table-panel";

type LocalDataRow = DataTableRow & {
  geometryType: string;
  crs: string;
  featureCount: string;
  fieldCount: string;
  status: string;
};

const columns: DataTableColumn<LocalDataRow>[] = [
  { key: "name", label: "数据名称" },
  { key: "geometryType", label: "几何类型" },
  { key: "crs", label: "坐标系" },
  { key: "featureCount", label: "要素数" },
  { key: "fieldCount", label: "字段数" },
  { key: "status", label: "状态" },
];

const ACCEPTED_EXTENSIONS = [".geojson", ".json"];

const toRow = (summary: InputDataSummary): LocalDataRow => ({
  id: summary.datasetId,
  name: summary.name,
  geometryType: summary.geometryType ?? "-",
  crs: summary.crs ?? "-",
  featureCount:
    typeof summary.featureCount === "number"
      ? summary.featureCount.toLocaleString()
      : "-",
  fieldCount: summary.fields.length.toLocaleString(),
  status: summary.warnings.length > 0 ? "有警告" : "已接入",
});

const getFileStem = (fileName: string) =>
  fileName.replace(/\.[^/.]+$/, "") || fileName;

const isSupportedFile = (file: File) =>
  ACCEPTED_EXTENSIONS.some((extension) =>
    file.name.toLowerCase().endsWith(extension),
  );

const normalizePropertyValue = (value: unknown) => {
  if (value === null || typeof value !== "object") return value;
  return JSON.stringify(value);
};

const normalizeGeoJsonProperties = async (file: File) => {
  try {
    const geoJson = JSON.parse(await file.text()) as {
      type?: string;
      features?: Array<{
        type?: string;
        properties?: Record<string, unknown> | null;
      }>;
    };

    if (geoJson.type !== "FeatureCollection" || !Array.isArray(geoJson.features)) {
      return file;
    }

    let hasComplexProperties = false;
    const normalizedGeoJson = {
      ...geoJson,
      features: geoJson.features.map((feature) => {
        if (!feature.properties) return feature;

        const properties = Object.fromEntries(
          Object.entries(feature.properties).map(([key, value]) => {
            const nextValue = normalizePropertyValue(value);
            if (nextValue !== value) hasComplexProperties = true;
            return [key, nextValue];
          }),
        );

        return {
          ...feature,
          properties,
        };
      }),
    };

    if (!hasComplexProperties) return file;

    return new File([JSON.stringify(normalizedGeoJson)], file.name, {
      lastModified: file.lastModified,
      type: file.type || "application/geo+json",
    });
  } catch {
    return file;
  }
};

const LocalData = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [datasets, setDatasets] = useState<InputDataSummary[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const rows = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    const filteredDatasets = keyword
      ? datasets.filter((dataset) =>
          [
            dataset.name,
            dataset.datasetId,
            dataset.geometryType,
            dataset.crs,
          ].some((value) => value?.toLowerCase().includes(keyword)),
        )
      : datasets;

    return filteredDatasets.map(toRow);
  }, [datasets, searchKeyword]);

  const loadDatasets = async () => {
    setIsLoading(true);

    try {
      const nextDatasets = await listDatasets();
      setDatasets(nextDatasets);
      setSelectedRowId((currentId) => {
        if (nextDatasets.some((dataset) => dataset.datasetId === currentId)) {
          return currentId;
        }

        return nextDatasets[0]?.datasetId ?? null;
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
        setSelectedRowId(nextDatasets[0]?.datasetId ?? null);
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

  const handleFileChange = async (file: File | undefined) => {
    if (!file) return;

    if (file.size === 0) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (!isSupportedFile(file)) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);

    try {
      const uploadFile = await normalizeGeoJsonProperties(file);
      const uploadedDataset = await uploadDataset(
        uploadFile,
        getFileStem(file.name),
      );
      setDatasets((currentDatasets) => [
        uploadedDataset,
        ...currentDatasets.filter(
          (dataset) => dataset.datasetId !== uploadedDataset.datasetId,
        ),
      ]);
      setSelectedRowId(uploadedDataset.datasetId);
    } catch {
      // 后续接入统一反馈组件时再展示上传错误。
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <section className="flex h-full min-w-0 flex-col">
      <DataTablePanel
        columns={columns}
        emptyText={isLoading ? "正在加载本地数据..." : "暂无本地数据"}
        initialRows={[]}
        rows={rows}
        selectedRowId={selectedRowId}
        title="本地数据"
        toolbar={
          <div className="flex items-center gap-2">
            <div className="p-px">
              <Input
                aria-label="搜索本地数据"
                className="box-border h-8 w-44 border-border/70 text-xs shadow-none focus-visible:border-foreground/30 focus-visible:ring-0"
                disabled={isUploading}
                placeholder="搜索本地数据"
                value={searchKeyword}
                onChange={(event) => setSearchKeyword(event.target.value)}
              />
            </div>
            <input
              ref={fileInputRef}
              accept=".geojson,.json,application/geo+json,application/json"
              className="sr-only"
              disabled={isUploading}
              type="file"
              onChange={(event) => void handleFileChange(event.target.files?.[0])}
            />
            <Button
              type="button"
              size="sm"
              className="h-8 w-20 transition-colors duration-200 ease-out"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-3.5" />
              {isUploading ? "上传中" : "上传"}
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
    </section>
  );
};

export default LocalData;
