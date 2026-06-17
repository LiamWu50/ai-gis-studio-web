import { useMemo, useState } from "react";
import type { FileTreeElement } from "@/components/unlumen-ui/file-tree";
import { DEFAULT_OPEN_FOLDER_IDS } from "../layer-data";
import { useLayerWorkspace } from "../layer-workspace";

const filterLayerElements = (
  elements: FileTreeElement[],
  searchValue: string,
): FileTreeElement[] => {
  const keyword = searchValue.trim().toLowerCase();

  if (!keyword) return elements;

  return elements.reduce<FileTreeElement[]>((filteredElements, element) => {
    const children = element.children
      ? filterLayerElements(element.children, keyword)
      : undefined;
    const matches = element.name.toLowerCase().includes(keyword);

    if (matches || children?.length) {
      filteredElements.push({
        ...element,
        children,
      });
    }

    return filteredElements;
  }, []);
};

const getFolderIds = (elements: FileTreeElement[]): string[] =>
  elements.flatMap((element) => [
    ...(element.type === "folder" ? [element.id] : []),
    ...(element.children ? getFolderIds(element.children) : []),
  ]);

export function useLayerTree() {
  const [searchValue, setSearchValue] = useState("");
  const { layerElements } = useLayerWorkspace();

  const filteredElements = useMemo(
    () => filterLayerElements(layerElements, searchValue),
    [layerElements, searchValue],
  );

  const defaultOpenIds = useMemo(
    () =>
      searchValue.trim()
        ? getFolderIds(filteredElements)
        : DEFAULT_OPEN_FOLDER_IDS,
    [filteredElements, searchValue],
  );

  return {
    searchValue,
    setSearchValue,
    filteredElements,
    defaultOpenIds,
  };
}
