"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMasjids } from "@/hooks/useMasjids";
import { useCreateCampaign } from "@/hooks/useDonations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";

const campaignSchema = z.object({
  masjidId: z.number({ required_error: "Masjid is required" }),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  goalAmount: z.number().min(1, "Goal amount must be greater than 0"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  isActive: z.boolean().default(true),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

export default function NewCampaignPage() {
  const router = useRouter();
  const { data: masjids } = useMasjids();
  const createCampaign = useCreateCampaign();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      isActive: true,
    },
  });

  const onSubmit = async (data: CampaignFormData) => {
    const formData = new FormData();
    formData.append("masjidId", data.masjidId.toString());
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("goalAmount", data.goalAmount.toString());
    formData.append("startDate", data.startDate);
    formData.append("endDate", data.endDate);
    formData.append("isActive", data.isActive.toString());

    if (imageFile) {
      formData.append("image", imageFile);
    }

    await createCampaign.mutateAsync(formData);
    router.push("/dashboard/donations");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/donations">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create Campaign</h1>
          <p className="text-muted-foreground">Create a new fundraising campaign</p>
        </div>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="masjidId">Masjid *</Label>
                <Select
                  value={watch("masjidId")?.toString()}
                  onValueChange={(value) => setValue("masjidId", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a masjid" />
                  </SelectTrigger>
                  <SelectContent>
                    {masjids?.map((masjid) => (
                      <SelectItem key={masjid.id} value={masjid.id.toString()}>
                        {masjid.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.masjidId && (
                  <p className="text-sm text-red-500">{errors.masjidId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Masjid Renovation Fund"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Campaign details..."
                  rows={5}
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="goalAmount">Goal Amount ($) *</Label>
                <Input
                  id="goalAmount"
                  type="number"
                  step="0.01"
                  placeholder="10000"
                  {...register("goalAmount", { valueAsNumber: true })}
                />
                {errors.goalAmount && (
                  <p className="text-sm text-red-500">{errors.goalAmount.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <input
                    type="date"
                    id="startDate"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={watch("startDate")}
                    onChange={(e) => setValue("startDate", e.target.value)}
                  />
                  {errors.startDate && (
                    <p className="text-sm text-red-500">{errors.startDate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <input
                    type="date"
                    id="endDate"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={watch("endDate")}
                    onChange={(e) => setValue("endDate", e.target.value)}
                  />
                  {errors.endDate && (
                    <p className="text-sm text-red-500">{errors.endDate.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Campaign Image (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-4">
                  <label htmlFor="image-upload" className="cursor-pointer block text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      {imageFile ? imageFile.name : "Click to upload image"}
                    </span>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={createCampaign.isPending}>
                {createCampaign.isPending ? "Creating..." : "Create Campaign"}
              </Button>
              <Link href="/dashboard/donations">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
