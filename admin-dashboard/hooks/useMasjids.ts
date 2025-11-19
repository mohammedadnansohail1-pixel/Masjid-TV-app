import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { Masjid } from "@/types";
import { useToast } from "./use-toast";

export function useMasjids() {
  return useQuery({
    queryKey: ["masjids"],
    queryFn: async () => {
      // const response = await apiClient.get<Masjid[]>("/masjids");
      // return response.data;
      const response = await apiClient.get("/masjids");
      return response.data.data
    },
  });
}

export function useMasjid(id: number) {
  return useQuery({
    queryKey: ["masjids", id],
    queryFn: async () => {
      // const response = await apiClient.get<Masjid>(`/masjids/${id}`);
      // return response.data;
      const response = await apiClient.get(`/masjids/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateMasjid() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Partial<Masjid>) => {
      const response = await apiClient.post<Masjid>("/masjids", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["masjids"] });
      toast({
        title: "Success",
        description: "Masjid created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to create masjid",
      });
    },
  });
}

export function useUpdateMasjid() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Masjid> }) => {
      const response = await apiClient.put<Masjid>(`/masjids/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["masjids"] });
      queryClient.invalidateQueries({ queryKey: ["masjids", variables.id] });
      toast({
        title: "Success",
        description: "Masjid updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update masjid",
      });
    },
  });
}

export function useDeleteMasjid() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/masjids/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["masjids"] });
      toast({
        title: "Success",
        description: "Masjid deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to delete masjid",
      });
    },
  });
}
