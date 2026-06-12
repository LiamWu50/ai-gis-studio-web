import type { ChatMessage } from "@/features/chat/components/chat-dock";

export const chatMessages: ChatMessage[] = [
  {
    role: "assistant",
    content: "已为你准备好空间分析工作台，可以直接描述你想查看的区域、图层或分析目标。"
  },
  {
    role: "user",
    content: "帮我看一下当前图层组合是否适合做城市商业选址。"
  },
  {
    role: "assistant",
    content: "当前已经加载道路网络、行政边界和 POI 热力，适合先做可达性与活跃度初筛。"
  }
];
