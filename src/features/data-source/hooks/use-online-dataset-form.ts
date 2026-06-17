import { useMemo, useState } from "react";
import { registerDatasetFromUrl } from "@/services/gis-data";
import type { InputDataSummary } from "@/types/agent";

const isHttpUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
};

const getUrlFileName = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    const fileName = parsedUrl.pathname.split("/").filter(Boolean).pop();
    return fileName?.replace(/\.[^/.]+$/, "") || "在线 GeoJSON";
  } catch {
    return "在线 GeoJSON";
  }
};

type UseOnlineDatasetFormOptions = {
  onRegistered: (dataset: InputDataSummary) => void;
};

export function useOnlineDatasetForm({
  onRegistered,
}: UseOnlineDatasetFormOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedName = name.trim();
  const trimmedUrl = url.trim();
  const canSubmit = useMemo(
    () => !isSubmitting && isHttpUrl(trimmedUrl),
    [isSubmitting, trimmedUrl],
  );

  const resetForm = () => {
    setName("");
    setUrl("");
  };

  const setOpen = (open: boolean) => {
    setIsOpen(open);
    if (!open) resetForm();
  };

  const submit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);

    try {
      const registeredDataset = await registerDatasetFromUrl(
        trimmedUrl,
        trimmedName || getUrlFileName(trimmedUrl),
      );
      onRegistered(registeredDataset);
      resetForm();
      setIsOpen(false);
    } catch {
      // 后续接入统一反馈组件时再展示注册错误。
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    canSubmit,
    isOpen,
    isSubmitting,
    name,
    setName,
    setOpen,
    setUrl,
    submit,
    url,
  };
}
