import { cn } from "@/lib/utils";
import { SimpleChatInput } from "./components/simple-chat-input";

type SimpleChatProps = {
  isVisible: boolean;
  onSubmit: (message: string) => void;
};

const SimpleChat = ({ isVisible, onSubmit }: SimpleChatProps) => {
  return (
    <div
      className={cn(
        "fixed bottom-3 left-1/2 z-50 w-[320px] -translate-x-1/2 transition-opacity duration-200",
        isVisible ? "opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      <SimpleChatInput onSubmit={onSubmit} />
    </div>
  );
};

export default SimpleChat;
