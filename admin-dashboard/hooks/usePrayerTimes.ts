import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { PrayerTime } from "@/types";
import { useToast } from "./use-toast";

export function usePrayerTimes(masjidId?: number, month?: string) {
  return useQuery({
    queryKey: ["prayer-times", masjidId, month],
    queryFn: async () => {
      const params: any = {};
      if (masjidId) params.masjidId = masjidId;
      if (month) params.month = month;

      const response = await apiClient.get<PrayerTime[]>("/prayer-times", { params });
      return response.data;
    },
  });
}

export function useCreatePrayerTime() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Partial<PrayerTime>) => {
      const response = await apiClient.post<PrayerTime>("/prayer-times", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayer-times"] });
      toast({
        title: "Success",
        description: "Prayer time created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to create prayer time",
      });
    },
  });
}

export function useUpdatePrayerTime() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<PrayerTime> }) => {
      const response = await apiClient.put<PrayerTime>(`/prayer-times/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayer-times"] });
      toast({
        title: "Success",
        description: "Prayer time updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update prayer time",
      });
    },
  });
}

export function useCalculatePrayerTimes() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    // mutationFn: async (data: { masjidId: number; startDate: string; endDate: string }) => {
    //   const response = await apiClient.post("/prayer-times/calculate", data);
    //   return response.data;
    // },
    mutationFn: async (data: { masjidId: string; year: number; month: number; overwrite?: boolean }) => {
      const response = await apiClient.post("/prayer-times/calculate", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayer-times"] });
      toast({
        title: "Success",
        description: "Prayer times calculated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to calculate prayer times",
      });
    },
  });
}
