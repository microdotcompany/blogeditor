import { useState } from "react";
import { apiClient } from "@/api/client";

interface UploadParams {
  owner: string;
  repo: string;
  branch: string;
  file: File;
  uploadDir: string;
  urlPrefix: string;
}

interface UploadResult {
  displayUrl: string;
  contentUrl: string;
}

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async ({
    owner,
    repo,
    branch,
    file,
    uploadDir,
    urlPrefix,
  }: UploadParams): Promise<UploadResult> => {
    setIsUploading(true);
    setError(null);

    try {
      const base64 = await fileToBase64(file);
      const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const repoPath = `${uploadDir}/${filename}`;

      const response = await apiClient<{ content: { download_url: string } }>(
        `/api/github/repos/${owner}/${repo}/contents/${repoPath}`,
        {
          method: "PUT",
          body: JSON.stringify({
            message: `Upload image: ${filename}`,
            content: base64,
            branch,
          }),
        }
      );

      const displayUrl = response.content.download_url;
      const contentUrl = `${urlPrefix}/${filename}`;
      return { displayUrl, contentUrl };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Image upload failed";
      setError(message);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, isUploading, error };
};

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
