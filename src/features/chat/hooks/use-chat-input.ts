import { useState } from "react";

type UseChatInputOptions = {
  onSubmit: (message: string) => void;
};

export function useChatInput({ onSubmit }: UseChatInputOptions) {
  const [value, setValue] = useState("");

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const nextValue = value.trim();
      if (!nextValue) return;

      onSubmit(nextValue);
      setValue("");
    }
  };

  const submit = () => {
    const nextValue = value.trim();
    if (!nextValue) return;

    onSubmit(nextValue);
    setValue("");
  };

  return {
    handleKeyDown,
    setValue,
    submit,
    value,
  };
}
