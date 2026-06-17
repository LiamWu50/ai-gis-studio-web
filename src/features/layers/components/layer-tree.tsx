import { FileTree, type FileTreeElement } from "@/components/unlumen-ui/file-tree";

type LayerTreeProps = {
  elements: FileTreeElement[];
  defaultOpenIds: string[];
  searchValue: string;
};

export function LayerTree({
  elements,
  defaultOpenIds,
  searchValue,
}: LayerTreeProps) {
  if (!elements.length) {
    return (
      <p className="px-1 py-3 text-xs text-muted-foreground">
        未找到匹配图层
      </p>
    );
  }

  return (
    <FileTree
      key={searchValue.trim() || "default"}
      elements={elements}
      defaultOpenIds={defaultOpenIds}
      className="[&_span]:text-foreground/80 [&_svg]:text-foreground/80"
    />
  );
}
