import type { Viewer } from "cesium";
import type { InputDataSummary } from "@/types/agent";

export type MapCommandLayer = {
  id: string;
  name: string;
  dataset: InputDataSummary;
};

export type AddDatasetLayerOptions = {
  name?: string;
  opacity?: number;
  visible?: boolean;
};

export type MapCommandExecutorDependencies = {
  getViewer: () => Viewer | null;
  getUserLayers: () => MapCommandLayer[];
  getDataset: (datasetId: string) => Promise<InputDataSummary>;
  addUserLayerFromDataset: (
    dataset: InputDataSummary,
    options?: AddDatasetLayerOptions,
  ) => Promise<unknown>;
};
