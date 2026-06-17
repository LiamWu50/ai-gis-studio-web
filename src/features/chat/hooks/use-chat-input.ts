import { useState } from "react";

type UseChatInputOptions = {
  onSubmit: () => void;
};

export function useChatInput({ onSubmit }: UseChatInputOptions) {
  const [value, setValue] = useState("");

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onSubmit();
    }
  };

  return {
    handleKeyDown,
    setValue,
    value,
  };
}
