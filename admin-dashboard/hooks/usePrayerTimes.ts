import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { PrayerTime } from "@/types";
import { useToast } from "./use-toast";

export function usePrayerTimes(masjidId?: string, month?: string) {
  return useQuery({
    queryKey: ["prayer-times", masjidId, month],
    queryFn: async () => {
      if (!masjidId) {
        return [];
      }

      // Build query params for date range based on month
      const params: any = {};
      if (month) {
        // Convert month (YYYY-MM) to start and end dates
        const [year, monthNum] = month.split('-').map(Number);
        const startDate = new Date(year, monthNum - 1, 1);
        const endDate = new Date(year, monthNum, 0); // Last day of month
        params.startDate = startDate.toISOString().split('T')[0];
        params.endDate = endDate.toISOString().split('T')[0];
      }

      const response = await apiClient.get(`/prayer-times/masjid/${masjidId}`, { params });
      return response.data?.data || response.data || [];
    },
    enabled: !!masjidId, // Only fetch when masjidId is selected
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
    mutationFn: async ({ masjidId, date, data }: { masjidId: string; date: string; data: Partial<PrayerTime> }) => {
      // Format date to YYYY-MM-DD if it's not already
      const formattedDate = date.split('T')[0];
      const response = await apiClient.put<PrayerTime>(`/prayer-times/masjid/${masjidId}/date/${formattedDate}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayer-times"] });
      toast({
        title: "Success",
        description: "Iqamah times updated successfully",
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
