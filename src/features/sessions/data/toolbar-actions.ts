import {
  LocateFixed,
  MessageSquare,
  Settings,
  UserRound
} from "lucide-react";

import type { ToolbarAction } from "@/features/sessions/components/left-toolbar";

export const toolbarActions: ToolbarAction[] = [
  { icon: Settings, label: "设置" },
  { icon: MessageSquare, label: "会话" },
  { icon: LocateFixed, label: "定位" },
  { icon: UserRound, label: "用户" }
];
