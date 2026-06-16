"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { ChatPanel } from "@/features/chat/chat-panel";
import DataSourcePanel from "@/features/data-source";
import SimpleChat from "@/features/chat/simple-chat";
import LayerPanel from "@/features/layers";
import User from "@/features/user";
import Setting from "@/features/setting";

const MapContainer = dynamic(
  () => import("@/features/map").then((mod) => mod.MapContainer),
  {
    ssr: false
  }
);

export default function HomePage() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const openChatPanel = () => setIsChatOpen(true);

  return (
    <main className="relative h-screen overflow-hidden bg-background text-foreground">
      <section className="relative flex h-full">
        <div className="relative flex-1 overflow-hidden">
          <MapContainer />
          <LayerPanel />
          <DataSourcePanel />
          <Setting />
          <User />
          <SimpleChat isVisible={!isChatOpen} onSubmit={openChatPanel} />
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
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      </section>
    </main>
  );
}
