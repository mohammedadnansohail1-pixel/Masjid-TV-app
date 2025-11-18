import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { Announcement } from "@/types";
import { useToast } from "./use-toast";

export function useAnnouncements(masjidId?: number) {
  return useQuery({
    queryKey: ["announcements", masjidId],
    queryFn: async () => {
      const params = masjidId ? { masjidId } : {};
      const response = await apiClient.get<Announcement[]>("/announcements", { params });
      return response.data;
    },
  });
}

export function useAnnouncement(id: number) {
  return useQuery({
    queryKey: ["announcements", id],
    queryFn: async () => {
      const response = await apiClient.get<Announcement>(`/announcements/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiClient.post<Announcement>("/announcements", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast({
        title: "Success",
        description: "Announcement created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to create announcement",
      });
    },
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      const response = await apiClient.put<Announcement>(`/announcements/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      queryClient.invalidateQueries({ queryKey: ["announcements", variables.id] });
      toast({
        title: "Success",
        description: "Announcement updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update announcement",
      });
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/announcements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast({
        title: "Success",
        description: "Announcement deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to delete announcement",
      });
    },
  });
}
