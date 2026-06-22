"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Edit3, Eye, EyeOff, MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/toast";
import { FileTree, type FileTreeElement } from "@/components/unlumen-ui/file-tree";
import { useLayerWorkspace } from "../layer-workspace";

type LayerTreeProps = {
  elements: FileTreeElement[];
  defaultOpenIds: string[];
  searchValue: string;
};

type MenuPosition = {
  left: number;
  top: number;
};

function LayerTreeItemActions({ node }: { node: FileTreeElement }) {
  const { deleteUserLayer, toggleLayerVisibility } = useLayerWorkspace();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isLayerVisible = node.visible ?? true;

  const openMenu = () => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    setMenuPosition({
      left: rect.right + 8,
      top: rect.top,
    });
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (menuRef.current?.contains(event.target as Node)) return;
      setIsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    const handleReposition = () => {
      const button = buttonRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      setMenuPosition({
        left: rect.right + 8,
        top: rect.top,
      });
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [isOpen]);

  const handleMenuAction = () => {
    setIsOpen(false);
  };

  const handleDeleteClick = () => {
    setIsOpen(false);
    setIsDeleteDialogOpen(true);
  };

  const handleVisibilityClick = async () => {
    setIsTogglingVisibility(true);
    try {
      await toggleLayerVisibility(node.id, !isLayerVisible);
    } catch (error) {
      toast({
        title: "图层显隐更新失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "error",
      });
    } finally {
      setIsTogglingVisibility(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteUserLayer(node.id);
      toast({
        title: "图层已删除",
        description: `${node.name} 已从图层树移除`,
        variant: "success",
      });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "图层删除失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-5 rounded-sm bg-transparent text-foreground/45 shadow-none hover:bg-transparent hover:text-foreground/80 [&_svg]:text-current"
              aria-label={isLayerVisible ? `隐藏 ${node.name}` : `显示 ${node.name}`}
              disabled={isTogglingVisibility}
              onClick={(event) => {
                event.stopPropagation();
                void handleVisibilityClick();
              }}
            >
              {isLayerVisible ? (
                <Eye className="size-3" strokeWidth={1.8} />
              ) : (
                <EyeOff className="size-3" strokeWidth={1.8} />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            {isLayerVisible ? "隐藏图层" : "显示图层"}
          </TooltipContent>
        </Tooltip>
        <Button
          ref={buttonRef}
          type="button"
          variant="ghost"
          size="icon"
          className="size-5 rounded-sm bg-transparent text-foreground/45 shadow-none hover:bg-transparent hover:text-foreground/80 [&_svg]:text-current"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-label={`${node.name} 图层操作`}
          onClick={(event) => {
            event.stopPropagation();
            if (isOpen) {
              setIsOpen(false);
              return;
            }

            openMenu();
          }}
        >
          <MoreVertical className="size-3" strokeWidth={1.8} />
        </Button>
      </TooltipProvider>

      {isOpen && menuPosition
        ? createPortal(
        <div
          ref={menuRef}
          className="fixed z-50 w-36 rounded-md bg-card p-1 text-card-foreground shadow-[0_14px_36px_rgba(0,0,0,0.42)]"
          role="menu"
          aria-label={`${node.name} 图层菜单`}
          onClick={(event) => event.stopPropagation()}
          style={{
            left: menuPosition.left,
            top: menuPosition.top,
          }}
        >
          <Button
            type="button"
            variant="ghost"
            className="h-8 w-full justify-start px-2 text-xs"
            role="menuitem"
            onClick={handleMenuAction}
          >
            <Edit3 className="size-3.5" strokeWidth={1.8} />
            编辑图层
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-8 w-full justify-start px-2 text-xs text-destructive hover:text-destructive disabled:text-muted-foreground"
            disabled={!node.userManaged}
            role="menuitem"
            onClick={handleDeleteClick}
          >
            <Trash2 className="size-3.5" strokeWidth={1.8} />
            删除图层
          </Button>
        </div>,
            document.body,
          )
        : null}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm border-0">
          <DialogHeader>
            <DialogTitle>删除图层</DialogTitle>
            <DialogDescription>
              确认删除「{node.name}」吗？删除后该图层会从图层树中移除。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              disabled={isDeleting}
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={() => void handleConfirmDelete()}
            >
              {isDeleting ? "删除中..." : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

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
      renderActions={(node) => <LayerTreeItemActions node={node} />}
      className="[&_span]:text-foreground/80"
    />
  );
}
