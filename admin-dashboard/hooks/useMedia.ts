import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { useToast } from "./use-toast";

export interface MediaItem {
  id: string;
  masjidId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  type: "IMAGE" | "VIDEO" | "PDF";
  createdBy?: string;
  createdAt: string;
}

export interface MediaStats {
  totalFiles: number;
  totalSize: number;
  totalSizeMB: string;
  countByType: Record<string, number>;
}

export function useMedia(masjidId?: string, type?: string) {
  return useQuery({
    queryKey: ["media", masjidId, type],
    queryFn: async () => {
      if (!masjidId) {
        return [];
      }
      const params = type ? { type } : {};
      const response = await apiClient.get(`/media/masjid/${masjidId}`, { params });
      return response.data?.data || response.data || [];
    },
    enabled: !!masjidId,
  });
}

export function useMediaStats(masjidId?: string) {
  return useQuery({
    queryKey: ["media-stats", masjidId],
    queryFn: async () => {
      if (!masjidId) {
        return null;
      }
      const response = await apiClient.get(`/media/masjid/${masjidId}/stats`);
      return response.data?.data || response.data;
    },
    enabled: !!masjidId,
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ file, masjidId }: { file: File; masjidId: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("masjidId", masjidId);

      const response = await apiClient.post("/media/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      queryClient.invalidateQueries({ queryKey: ["media-stats"] });
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.response?.data?.message || "Failed to upload file",
      });
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/media/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      queryClient.invalidateQueries({ queryKey: ["media-stats"] });
      toast({
        title: "Success",
        description: "Media deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to delete media",
      });
    },
  });
}
