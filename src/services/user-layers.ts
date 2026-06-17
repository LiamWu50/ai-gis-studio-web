const API_BASE_PATH = "/api";

export type LayerTreeNodeType = "folder" | "layer";

export type LayerTreeNode = {
  id: string;
  name: string;
  type: LayerTreeNodeType;
  parentId: string | null;
  children: LayerTreeNode[];
  datasetId: string | null;
  sourceType: string | null;
  geometryType: string | null;
  bbox: [number, number, number, number] | null;
  iconKey: string | null;
  visible: boolean;
  opacity: number;
  userManaged: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LayerTreeResponse = {
  userId: string;
  nodes: LayerTreeNode[];
};

export type CreateDatasetLayerRequest = {
  datasetId: string;
  name?: string;
  parentId?: string | null;
  position?: number | null;
  visible?: boolean;
  opacity?: number;
};

export type UpdateLayerTreeNodeRequest = {
  name?: string;
  visible?: boolean;
  opacity?: number;
};

export type MoveLayerTreeNodeRequest = {
  parentId?: string | null;
  position: number;
};

const layerTreeUrl = (path = "") => `${API_BASE_PATH}/layer-tree${path}`;

const authorizationHeaders = (accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`,
});

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

export const getLayerTree = async (accessToken: string) => {
  const response = await fetch(layerTreeUrl(), {
    cache: "no-store",
    headers: authorizationHeaders(accessToken),
  });

  await assertOk(response);
  return (await response.json()) as LayerTreeResponse;
};

export const createDatasetLayer = async (
  accessToken: string,
  payload: CreateDatasetLayerRequest,
) => {
  const response = await fetch(layerTreeUrl("/dataset-layers"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authorizationHeaders(accessToken),
    },
    body: JSON.stringify(payload),
  });

  await assertOk(response);
  return (await response.json()) as LayerTreeNode;
};

export const updateLayerTreeNode = async (
  accessToken: string,
  nodeId: string,
  payload: UpdateLayerTreeNodeRequest,
) => {
  const response = await fetch(
    layerTreeUrl(`/nodes/${encodeURIComponent(nodeId)}`),
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authorizationHeaders(accessToken),
      },
      body: JSON.stringify(payload),
    },
  );

  await assertOk(response);
  return (await response.json()) as LayerTreeNode;
};

export const moveLayerTreeNode = async (
  accessToken: string,
  nodeId: string,
  payload: MoveLayerTreeNodeRequest,
) => {
  const response = await fetch(
    layerTreeUrl(`/nodes/${encodeURIComponent(nodeId)}/move`),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authorizationHeaders(accessToken),
      },
      body: JSON.stringify(payload),
    },
  );

  await assertOk(response);
  return (await response.json()) as LayerTreeNode;
};

export const deleteLayerTreeNode = async (
  accessToken: string,
  nodeId: string,
) => {
  const response = await fetch(
    layerTreeUrl(`/nodes/${encodeURIComponent(nodeId)}`),
    {
      method: "DELETE",
      headers: authorizationHeaders(accessToken),
    },
  );

  await assertOk(response);
};
