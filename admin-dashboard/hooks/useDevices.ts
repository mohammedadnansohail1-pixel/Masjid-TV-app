import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { Device } from "@/types";
import { useToast } from "./use-toast";

export function useDevices(masjidId?: number) {
  return useQuery({
    queryKey: ["devices", masjidId],
    queryFn: async () => {
      const params = masjidId ? { masjidId } : {};
      const response = await apiClient.get<Device[]>("/devices", { params });
      return response.data;
    },
  });
}

export function useDevice(id: number) {
  return useQuery({
    queryKey: ["devices", id],
    queryFn: async () => {
      const response = await apiClient.get<Device>(`/devices/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateDevice() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Partial<Device>) => {
      const response = await apiClient.post<Device>("/devices", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      toast({
        title: "Success",
        description: "Device created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to create device",
      });
    },
  });
}

export function useUpdateDevice() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Device> }) => {
      const response = await apiClient.put<Device>(`/devices/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({ queryKey: ["devices", variables.id] });
      toast({
        title: "Success",
        description: "Device updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update device",
      });
    },
  });
}

export function useDeleteDevice() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/devices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      toast({
        title: "Success",
        description: "Device deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to delete device",
      });
    },
  });
}
