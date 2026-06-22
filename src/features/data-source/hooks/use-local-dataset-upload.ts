import { useRef, useState } from "react";
import { uploadDataset } from "@/services/gis-data";
import type { InputDataSummary } from "@/types/agent";

const ACCEPTED_EXTENSIONS = [".geojson", ".json"];

const getFileStem = (fileName: string) =>
  fileName.replace(/\.[^/.]+$/, "") || fileName;

const isSupportedFile = (file: File) =>
  ACCEPTED_EXTENSIONS.some((extension) =>
    file.name.toLowerCase().endsWith(extension),
  );

const normalizePropertyValue = (value: unknown) => {
  if (value === null || typeof value !== "object") return value;
  return JSON.stringify(value);
};

const normalizeGeoJsonProperties = async (file: File) => {
  try {
    const geoJson = JSON.parse(await file.text()) as {
      type?: string;
      features?: Array<{
        type?: string;
        properties?: Record<string, unknown> | null;
      }>;
    };

    if (
      geoJson.type !== "FeatureCollection" ||
      !Array.isArray(geoJson.features)
    ) {
      return file;
    }

    let hasComplexProperties = false;
    const normalizedGeoJson = {
      ...geoJson,
      features: geoJson.features.map((feature) => {
        if (!feature.properties) return feature;

        const properties = Object.fromEntries(
          Object.entries(feature.properties).map(([key, value]) => {
            const nextValue = normalizePropertyValue(value);
            if (nextValue !== value) hasComplexProperties = true;
            return [key, nextValue];
          }),
        );

        return {
          ...feature,
          properties,
        };
      }),
    };

    if (!hasComplexProperties) return file;

    return new File([JSON.stringify(normalizedGeoJson)], file.name, {
      lastModified: file.lastModified,
      type: file.type || "application/geo+json",
    });
  } catch {
    return file;
  }
};

type UseLocalDatasetUploadOptions = {
  onUploaded: (dataset: InputDataSummary) => void;
};

export function useLocalDatasetUpload({
  onUploaded,
}: UseLocalDatasetUploadOptions) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lastUploadedFileName, setLastUploadedFileName] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const resetFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const uploadFile = async (file: File | undefined) => {
    if (!file) return;

    setLastUploadedFileName("");
    setUploadError("");

    if (file.size === 0 || !isSupportedFile(file)) {
      setUploadError("请选择 GeoJSON 或 JSON 文件。");
      resetFileInput();
      return;
    }

    setIsUploading(true);

    try {
      const normalizedFile = await normalizeGeoJsonProperties(file);
      const uploadedDataset = await uploadDataset(
        normalizedFile,
        getFileStem(file.name),
      );
      onUploaded(uploadedDataset);
      setLastUploadedFileName(file.name);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "上传失败，请稍后重试。");
    } finally {
      setIsUploading(false);
      resetFileInput();
    }
  };

  return {
    fileInputRef,
    isUploading,
    lastUploadedFileName,
    openFilePicker,
    uploadError,
    uploadFile,
  };
}
