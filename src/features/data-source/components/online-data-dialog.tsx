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

type OnlineDataDialogProps = {
  canSubmit: boolean;
  isOpen: boolean;
  isSubmitting: boolean;
  name: string;
  url: string;
  onNameChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  onUrlChange: (value: string) => void;
};

export function OnlineDataDialog({
  canSubmit,
  isOpen,
  isSubmitting,
  name,
  url,
  onNameChange,
  onOpenChange,
  onSubmit,
  onUrlChange,
}: OnlineDataDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
              onChange={(event) => onNameChange(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="online-data-url">在线地址</Label>
            <Input
              id="online-data-url"
              disabled={isSubmitting}
              value={url}
              placeholder="https://example.com/data.geojson"
              onChange={(event) => onUrlChange(event.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isSubmitting}>
              取消
            </Button>
          </DialogClose>
          <Button type="button" disabled={!canSubmit} onClick={() => void onSubmit()}>
            {isSubmitting ? "添加中" : "添加"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
