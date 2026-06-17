import { useCallback, useEffect, useMemo, useState } from "react";
import { listDatasets } from "@/services/gis-data";
import type { InputDataSummary } from "@/types/agent";
import {
  matchesDatasetKeyword,
  toDatasetRow,
  type DatasetTableRow,
} from "../utils/dataset-table";

type UseDatasetsTableOptions = {
  filterDataset?: (dataset: InputDataSummary) => boolean;
  getInitialSelectedRowId: (datasets: InputDataSummary[]) => string | null;
  readyStatus: string;
};

export function useDatasetsTable({
  filterDataset,
  getInitialSelectedRowId,
  readyStatus,
}: UseDatasetsTableOptions) {
  const [datasets, setDatasets] = useState<InputDataSummary[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const tableDatasets = useMemo(
    () => (filterDataset ? datasets.filter(filterDataset) : datasets),
    [datasets, filterDataset],
  );

  const rows = useMemo<DatasetTableRow[]>(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    const filteredDatasets = keyword
      ? tableDatasets.filter((dataset) =>
          matchesDatasetKeyword(dataset, keyword),
        )
      : tableDatasets;

    return filteredDatasets.map((dataset) => toDatasetRow(dataset, readyStatus));
  }, [readyStatus, searchKeyword, tableDatasets]);

  const selectedDataset = useMemo(
    () =>
      datasets.find((dataset) => dataset.datasetId === selectedRowId) ?? null,
    [datasets, selectedRowId],
  );

  const applyDatasets = useCallback(
    (nextDatasets: InputDataSummary[]) => {
      setDatasets(nextDatasets);
      setSelectedRowId((currentId) => {
        if (nextDatasets.some((dataset) => dataset.datasetId === currentId)) {
          return currentId;
        }

        return getInitialSelectedRowId(nextDatasets);
      });
    },
    [getInitialSelectedRowId],
  );

  const loadDatasets = useCallback(async () => {
    setIsLoading(true);

    try {
      applyDatasets(await listDatasets());
    } catch {
      setDatasets([]);
      setSelectedRowId(null);
    } finally {
      setIsLoading(false);
    }
  }, [applyDatasets]);

  const upsertDataset = useCallback((dataset: InputDataSummary) => {
    setDatasets((currentDatasets) => [
      dataset,
      ...currentDatasets.filter(
        (currentDataset) => currentDataset.datasetId !== dataset.datasetId,
      ),
    ]);
    setSelectedRowId(dataset.datasetId);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeDatasets = async () => {
      try {
        const nextDatasets = await listDatasets();
        if (!isMounted) return;

        setDatasets(nextDatasets);
        setSelectedRowId(getInitialSelectedRowId(nextDatasets));
      } catch {
        if (!isMounted) return;

        setDatasets([]);
        setSelectedRowId(null);
      } finally {
        if (!isMounted) return;

        setIsLoading(false);
      }
    };

    void initializeDatasets();

    return () => {
      isMounted = false;
    };
  }, [getInitialSelectedRowId]);

  return {
    isLoading,
    loadDatasets,
    rows,
    searchKeyword,
    selectedDataset,
    selectedRowId,
    setSearchKeyword,
    setSelectedRowId,
    upsertDataset,
  };
}
