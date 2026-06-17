import type { InputDataSummary } from "@/types/agent";

const API_BASE_PATH = "/api";

type DatasetListResponse = {
  datasets: InputDataSummary[];
};

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type DatasetPreviewResponse = {
  datasetId: string;
  bbox: [number, number, number, number] | null;
  featureCount: number | null;
  returnedFeatureCount: number;
  data: JsonValue;
};

const datasetUrl = (path = "") => `${API_BASE_PATH}/datasets${path}`;

const readErrorMessage = async (response: Response) => {
  try {
    const body = (await response.json()) as { detail?: string };
    return body.detail ?? response.statusText;
  } catch {
    return response.statusText;
  }
};

const assertOk = async (response: Response) => {
  if (response.ok) return;
  throw new Error(await readErrorMessage(response));
};

export const listDatasets = async () => {
  const response = await fetch(datasetUrl(), {
    cache: "no-store",
  });

  await assertOk(response);
  const body = (await response.json()) as DatasetListResponse;
  return body.datasets;
};

export const getDataset = async (datasetId: string) => {
  const response = await fetch(datasetUrl(`/${encodeURIComponent(datasetId)}`), {
    cache: "no-store",
  });

  await assertOk(response);
  return (await response.json()) as InputDataSummary;
};

export const getDatasetPreview = async (datasetId: string, limit = 1000) => {
  const searchParams = new URLSearchParams({ limit: String(limit) });
  const response = await fetch(
    datasetUrl(`/${encodeURIComponent(datasetId)}/preview?${searchParams}`),
    {
      cache: "no-store",
    },
  );

  await assertOk(response);
  return (await response.json()) as DatasetPreviewResponse;
};

export const registerDatasetFromUrl = async (url: string, name?: string) => {
  const response = await fetch(datasetUrl("/from-url"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      ...(name?.trim() ? { name: name.trim() } : {}),
    }),
  });

  await assertOk(response);
  return (await response.json()) as InputDataSummary;
};

export const uploadDataset = async (file: File, name?: string) => {
  const formData = new FormData();
  formData.append("file", file);

  const trimmedName = name?.trim();
  if (trimmedName) {
    formData.append("name", trimmedName);
  }

  const response = await fetch(datasetUrl(), {
    method: "POST",
    body: formData,
  });

  await assertOk(response);
  return (await response.json()) as InputDataSummary;
};
