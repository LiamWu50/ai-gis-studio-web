"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";

import { ToastProvider } from "@/components/ui/toast";
import { ChatPanel } from "@/features/chat/chat-panel";
import DataSourcePanel from "@/features/data-source";
import SimpleChat from "@/features/chat/simple-chat";
import LayerPanel from "@/features/layers";
import { LayerWorkspaceProvider } from "@/features/layers/layer-workspace";
import User from "@/features/user";
import {
  AuthSessionProvider,
  useAuthSession,
} from "@/features/user/hooks/use-auth-session";
import Setting from "@/features/setting";

const MapContainer = dynamic(
  () => import("@/features/map").then((mod) => mod.MapContainer),
  {
    ssr: false
  }
);

const createChatSessionId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `session_${crypto.randomUUID()}`;
  }

  return `session_${Date.now().toString(36)}`;
};

export default function HomePage() {
  return (
    <main className="relative h-screen overflow-hidden bg-background text-foreground">
      <ToastProvider>
        <AuthSessionProvider>
          <LayerWorkspaceProvider>
            <HomeContent />
          </LayerWorkspaceProvider>
        </AuthSessionProvider>
      </ToastProvider>
    </main>
  );
}

function HomeContent() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState(createChatSessionId);
  const { accessToken } = useAuthSession();
  const openChatPanel = () => setIsChatOpen(true);

  const handleAgentPrompt = (message: string) => {
    openChatPanel();
    setPendingPrompt(message);
  };

  const handleNewThread = useCallback(() => {
    setPendingPrompt(null);
    setSessionId(createChatSessionId());
  }, []);

  return (
    <section className="relative flex h-full">
      <div className="relative flex-1 overflow-hidden">
        <MapContainer />
        <LayerPanel />
        <DataSourcePanel />
        <Setting />
        <User />
        <SimpleChat isVisible={!isChatOpen} onSubmit={handleAgentPrompt} />
        {!isChatOpen ? (
          <button
            className="group absolute inset-y-0 right-0 z-40 w-5 cursor-pointer"
            onClick={openChatPanel}
            type="button"
            aria-label="打开聊天面板"
          >
            <span className="absolute inset-y-3 right-3 w-px bg-line opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100" />
          </button>
        ) : null}
      </div>

      <ChatPanel
        accessToken={accessToken}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onNewThread={handleNewThread}
        onPendingPromptHandled={() => setPendingPrompt(null)}
        pendingPrompt={pendingPrompt}
        sessionId={sessionId}
      />
    </section>
  );
}
