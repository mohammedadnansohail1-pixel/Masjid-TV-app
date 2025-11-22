import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { ContentSchedule } from "@/types";
import { useToast } from "./use-toast";

export function useSchedules(masjidId?: string, activeOnly?: boolean) {
  return useQuery({
    queryKey: ["schedules", masjidId, activeOnly],
    queryFn: async () => {
      if (!masjidId) {
        return [];
      }
      const params = activeOnly ? { activeOnly: true } : {};
      const response = await apiClient.get(`/schedules/masjid/${masjidId}`, { params });
      return response.data?.data || response.data || [];
    },
    enabled: !!masjidId,
  });
}

export function useSchedule(id: string) {
  return useQuery({
    queryKey: ["schedules", id],
    queryFn: async () => {
      const response = await apiClient.get(`/schedules/${id}`);
      return response.data?.data || response.data;
    },
    enabled: !!id,
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Partial<ContentSchedule>) => {
      const response = await apiClient.post<ContentSchedule>("/schedules", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      toast({
        title: "Success",
        description: "Schedule created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to create schedule",
      });
    },
  });
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ContentSchedule> }) => {
      const response = await apiClient.put<ContentSchedule>(`/schedules/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["schedules", variables.id] });
      toast({
        title: "Success",
        description: "Schedule updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update schedule",
      });
    },
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/schedules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      toast({
        title: "Success",
        description: "Schedule deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to delete schedule",
      });
    },
  });
}
