"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAnnouncement, useUpdateAnnouncement } from "@/hooks/useAnnouncements";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const announcementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Body is required"),
  priority: z.number().min(0).default(0),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().default(true),
  imageUrl: z.string().optional(),
});

type AnnouncementFormData = z.infer<typeof announcementSchema>;

export default function EditAnnouncementPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: announcement, isLoading } = useAnnouncement(id);
  const updateAnnouncement = useUpdateAnnouncement();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      priority: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (announcement) {
      reset({
        title: announcement.title,
        body: announcement.body,
        priority: announcement.priority || 0,
        startDate: announcement.startDate ? announcement.startDate.split('T')[0] : "",
        endDate: announcement.endDate ? announcement.endDate.split('T')[0] : "",
        isActive: announcement.isActive,
        imageUrl: announcement.imageUrl || "",
      });
    }
  }, [announcement, reset]);

  const onSubmit = async (data: AnnouncementFormData) => {
    await updateAnnouncement.mutateAsync({
      id,
      data: {
        title: data.title,
        body: data.body,
        priority: data.priority,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
        isActive: data.isActive,
        imageUrl: data.imageUrl || undefined,
      },
    });
    router.push("/dashboard/announcements");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Announcement not found</h2>
        <Link href="/dashboard/announcements">
          <Button className="mt-4">Back to Announcements</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/announcements">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Announcement</h1>
          <p className="text-muted-foreground">Update announcement details</p>
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
                <Label htmlFor="body">Body *</Label>
                <Textarea
                  id="body"
                  placeholder="Announcement details..."
                  rows={5}
                  {...register("body")}
                />
                {errors.body && (
                  <p className="text-sm text-red-500">{errors.body.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority (0-20, higher = shown first)</Label>
                <Input
                  id="priority"
                  type="number"
                  min={0}
                  max={20}
                  {...register("priority", { valueAsNumber: true })}
                />
                <p className="text-xs text-muted-foreground">
                  0-4: Low, 5-9: Medium, 10+: High priority
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date (Optional)</Label>
                  <input
                    type="date"
                    id="startDate"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={watch("startDate") || ""}
                    onChange={(e) => setValue("startDate", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <input
                    type="date"
                    id="endDate"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={watch("endDate") || ""}
                    onChange={(e) => setValue("endDate", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                <Input
                  id="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  {...register("imageUrl")}
                />
                <p className="text-xs text-muted-foreground">
                  Enter a URL to an image to display with the announcement
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  className="h-4 w-4 rounded border-gray-300"
                  checked={watch("isActive")}
                  onChange={(e) => setValue("isActive", e.target.checked)}
                />
                <Label htmlFor="isActive" className="text-sm font-normal">
                  Active (announcement will be shown on displays)
                </Label>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={updateAnnouncement.isPending}>
                {updateAnnouncement.isPending ? "Saving..." : "Save Changes"}
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
