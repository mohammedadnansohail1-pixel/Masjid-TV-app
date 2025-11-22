"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMasjids } from "@/hooks/useMasjids";
import { useCreateAnnouncement } from "@/hooks/useAnnouncements";
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

const announcementSchema = z.object({
  masjidId: z.number({ required_error: "Masjid is required" }),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  priority: z.enum(["low", "medium", "high"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  isActive: z.boolean().default(true),
});

type AnnouncementFormData = z.infer<typeof announcementSchema>;

export default function NewAnnouncementPage() {
  const router = useRouter();
  const { data: masjids } = useMasjids();
  const createAnnouncement = useCreateAnnouncement();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      masjidId: 0,
      priority: "medium",
      isActive: true,
    },
  });

  const onSubmit = async (data: AnnouncementFormData) => {
    const formData = new FormData();
    formData.append("masjidId", data.masjidId.toString());
    formData.append("title", data.title);
    formData.append("content", data.content);
    formData.append("priority", data.priority);
    formData.append("startDate", data.startDate);
    formData.append("endDate", data.endDate);
    formData.append("isActive", data.isActive.toString());

    if (imageFile) {
      formData.append("image", imageFile);
    }

    await createAnnouncement.mutateAsync(formData);
    router.push("/dashboard/announcements");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/announcements">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create Announcement</h1>
          <p className="text-muted-foreground">Create a new announcement</p>
        </div>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Announcement Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="masjidId">Masjid *</Label>
                <Select
                  // value={watch("masjidId")?.toString()}
                  // onValueChange={(value) => setValue("masjidId", parseInt(value))}
                  value={watch("masjidId") ? watch("masjidId").toString() : ""}
                  onValueChange={(value) => setValue("masjidId", Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a masjid" />
                  </SelectTrigger>
                  {/* <SelectContent>
                    {masjids?.map((masjid) => (
                      <SelectItem key={masjid.id} value={masjid.id.toString()}>
                        {masjid.name}
                      </SelectItem>
                    ))}
                  </SelectContent> */}
                  <SelectContent>
                    {Array.isArray(masjids) &&
                      masjids.map((masjid) => (
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
                  placeholder="Important Announcement"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Announcement details..."
                  rows={5}
                  {...register("content")}
                />
                {errors.content && (
                  <p className="text-sm text-red-500">{errors.content.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select
                  value={watch("priority")}
                  onValueChange={(value) => setValue("priority", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
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
                <Label htmlFor="image">Image (Optional)</Label>
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
              <Button type="submit" disabled={createAnnouncement.isPending}>
                {createAnnouncement.isPending ? "Creating..." : "Create Announcement"}
              </Button>
              <Link href="/dashboard/announcements">
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
