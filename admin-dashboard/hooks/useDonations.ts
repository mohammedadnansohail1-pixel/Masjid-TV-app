import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { DonationCampaign, Donation } from "@/types";
import { useToast } from "./use-toast";

export function useCampaigns(masjidId?: number) {
  return useQuery({
    queryKey: ["campaigns", masjidId],
    queryFn: async () => {
      const params = masjidId ? { masjidId } : {};
      const response = await apiClient.get<DonationCampaign[]>("/campaigns", { params });
      return response.data;
    },
  });
}

export function useCampaign(id: number) {
  return useQuery({
    queryKey: ["campaigns", id],
    queryFn: async () => {
      const response = await apiClient.get<DonationCampaign>(`/campaigns/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiClient.post<DonationCampaign>("/campaigns", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast({
        title: "Success",
        description: "Campaign created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to create campaign",
      });
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData | Partial<DonationCampaign> }) => {
      const headers = data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {};
      const response = await apiClient.put<DonationCampaign>(`/campaigns/${id}`, data, { headers });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaigns", variables.id] });
      toast({
        title: "Success",
        description: "Campaign updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update campaign",
      });
    },
  });
}

export function useDonations(campaignId?: number) {
  return useQuery({
    queryKey: ["donations", campaignId],
    queryFn: async () => {
      const params = campaignId ? { campaignId } : {};
      const response = await apiClient.get<Donation[]>("/donations", { params });
      return response.data;
    },
  });
}
