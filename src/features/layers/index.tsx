"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileTree, type FileTreeElement } from "@/components/unlumen-ui/file-tree";
import { cn } from "@/lib/utils";
import {
  Activity,
  Building2,
  Camera,
  Layers,
  Map,
  MapPinned,
  Plus,
  Route,
  Satellite,
  Search,
  SquareDashedMousePointer,
  Tags,
  TrafficCone,
} from "lucide-react";

const initElements = (): FileTreeElement[] => [
  {
    id: "basemap",
    name: "底图",
    type: "folder",
    icon: Map,
    children: [
      { id: "basemap-imagery", name: "天地图影像", icon: Satellite },
      { id: "basemap-annotation", name: "影像注记", icon: Tags },
    ],
  },
  {
    id: "business-layers",
    name: "业务图层",
    type: "folder",
    icon: Layers,
    children: [
      { id: "road-network", name: "道路网络", icon: Route },
      { id: "traffic-hub", name: "交通枢纽", icon: TrafficCone },
      { id: "poi", name: "兴趣点位", icon: MapPinned },
      { id: "building", name: "建筑轮廓", icon: Building2 },
    ],
  },
  {
    id: "analysis-layers",
    name: "分析结果",
    type: "folder",
    icon: SquareDashedMousePointer,
    children: [
      { id: "heatmap", name: "客流热力", icon: Activity },
      { id: "camera", name: "监控点位", icon: Camera },
    ],
  },
];

const filterElements = (
  elements: FileTreeElement[],
  searchValue: string,
): FileTreeElement[] => {
  const keyword = searchValue.trim().toLowerCase();

  if (!keyword) return elements;

  return elements.reduce<FileTreeElement[]>((filteredElements, element) => {
    const children = element.children
      ? filterElements(element.children, keyword)
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

const LayerPanel = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [elements] = useState(initElements());
  const [searchValue, setSearchValue] = useState("");
  const filteredElements = useMemo(
    () => filterElements(elements, searchValue),
    [elements, searchValue],
  );
  const defaultOpenIds = useMemo(
    () =>
      searchValue.trim()
        ? getFolderIds(filteredElements)
        : ["basemap", "business-layers"],
    [filteredElements, searchValue],
  );

  return (
    <div className="absolute left-3 top-3 z-30">
      <Button
        type="button"
        size="icon"
        aria-label={isOpen ? "隐藏图层面板" : "显示图层面板"}
        aria-pressed={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          "bg-background text-foreground shadow-md transition-colors hover:bg-muted [&_svg]:size-4",
          isOpen &&
            "bg-foreground text-background hover:bg-foreground focus-visible:ring-foreground",
        )}
      >
        <Layers strokeWidth={1.75} />
      </Button>

      <div
        aria-hidden={!isOpen}
        className={cn(
          "absolute left-12 top-0 w-[260px] bg-background px-4 py-3 shadow-lg backdrop-blur transition-all duration-200 ease-out",
          isOpen
            ? "pointer-events-auto translate-x-0 scale-100 opacity-100"
            : "pointer-events-none -translate-x-2 scale-95 opacity-0",
        )}
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-foreground">图层</h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-4 justify-end p-0 text-foreground hover:bg-transparent hover:text-foreground focus-visible:bg-transparent focus-visible:text-foreground"
            aria-label="添加图层"
          >
            <Plus className="size-4" />
          </Button>
        </div>
        <div className="mb-2 flex h-8 items-center rounded-md bg-muted/50 px-2">
          <Search className="pointer-events-none size-3 shrink-0 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="搜索图层"
            className="h-full border-0 bg-transparent p-0 pl-2 text-xs leading-none shadow-none placeholder:text-[11px] focus-visible:ring-0"
          />
        </div>
        <FileTree
          elements={filteredElements}
          defaultOpenIds={defaultOpenIds}
          className="[&_span]:text-foreground/80 [&_svg]:text-foreground/80"
        />
      </div>
    </div>
  );
};

export default LayerPanel;
