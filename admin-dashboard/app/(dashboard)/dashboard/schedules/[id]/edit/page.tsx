"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSchedule, useUpdateSchedule } from "@/hooks/useSchedules";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useMedia, MediaItem } from "@/hooks/useMedia";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const CONTENT_TYPES = [
  { value: "PRAYER_TIMES", label: "Prayer Times" },
  { value: "ANNOUNCEMENT", label: "Announcement" },
  { value: "IMAGE", label: "Image" },
  { value: "VIDEO", label: "Video" },
  { value: "WEBVIEW", label: "Web Page (URL)" },
];

const scheduleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contentType: z.enum(["PRAYER_TIMES", "ANNOUNCEMENT", "IMAGE", "VIDEO", "WEBVIEW"]),
  contentId: z.string().optional(),
  url: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  days: z.array(z.number()).default([]),
  duration: z.number().min(5).default(30),
  priority: z.number().min(0).default(0),
  isActive: z.boolean().default(true),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

export default function EditSchedulePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: schedule, isLoading } = useSchedule(id);
  const updateSchedule = useUpdateSchedule();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      contentType: "PRAYER_TIMES",
      days: [],
      duration: 30,
      priority: 0,
      isActive: true,
    },
  });

  const contentType = watch("contentType");
  const selectedDays = watch("days") || [];

  // Get masjidId from schedule for fetching related data
  const masjidId = schedule?.masjidId;

  // Fetch announcements for ANNOUNCEMENT content type
  const { data: announcements } = useAnnouncements(
    contentType === "ANNOUNCEMENT" ? masjidId : undefined
  );

  // Fetch media for IMAGE/VIDEO content types
  const { data: mediaItems } = useMedia(
    (contentType === "IMAGE" || contentType === "VIDEO") ? masjidId : undefined,
    contentType === "IMAGE" ? "IMAGE" : contentType === "VIDEO" ? "VIDEO" : undefined
  );

  useEffect(() => {
    if (schedule) {
      // Parse time from ISO date format
      let startTime = "";
      let endTime = "";

      if (schedule.startTime) {
        try {
          const date = new Date(schedule.startTime);
          startTime = date.toTimeString().slice(0, 5);
        } catch {
          startTime = "";
        }
      }

      if (schedule.endTime) {
        try {
          const date = new Date(schedule.endTime);
          endTime = date.toTimeString().slice(0, 5);
        } catch {
          endTime = "";
        }
      }

      reset({
        name: schedule.name,
        contentType: schedule.contentType,
        contentId: schedule.contentId || "",
        url: schedule.url || "",
        startTime,
        endTime,
        days: schedule.days || [],
        duration: schedule.duration || 30,
        priority: schedule.priority || 0,
        isActive: schedule.isActive,
      });
    }
  }, [schedule, reset]);

  const toggleDay = (day: number) => {
    const current = selectedDays || [];
    if (current.includes(day)) {
      setValue("days", current.filter((d) => d !== day));
    } else {
      setValue("days", [...current, day].sort());
    }
  };

  const onSubmit = async (data: ScheduleFormData) => {
    await updateSchedule.mutateAsync({
      id,
      data: {
        name: data.name,
        contentType: data.contentType,
        contentId: data.contentId || undefined,
        url: data.url || undefined,
        startTime: data.startTime || undefined,
        endTime: data.endTime || undefined,
        days: data.days,
        duration: data.duration,
        priority: data.priority,
        isActive: data.isActive,
      },
    });
    router.push("/dashboard/schedules");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Schedule not found</h2>
        <Link href="/dashboard/schedules">
          <Button className="mt-4">Back to Schedules</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/schedules">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Schedule</h1>
          <p className="text-muted-foreground">Update schedule settings</p>
        </div>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Schedule Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Schedule Name *</Label>
                <Input
                  id="name"
                  placeholder="Morning Prayer Times Display"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contentType">Content Type *</Label>
                <Select
                  value={watch("contentType")}
                  onValueChange={(value: any) => setValue("contentType", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {contentType === "ANNOUNCEMENT" && masjidId && (
                <div className="space-y-2">
                  <Label htmlFor="contentId">Select Announcement</Label>
                  <Select
                    value={watch("contentId") || ""}
                    onValueChange={(value) => setValue("contentId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an announcement" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(announcements) &&
                        announcements.map((ann: any) => (
                          <SelectItem key={ann.id} value={ann.id}>
                            {ann.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(contentType === "IMAGE" || contentType === "VIDEO") && masjidId && (
                <div className="space-y-2">
                  <Label htmlFor="contentId">
                    Select {contentType === "IMAGE" ? "Image" : "Video"} *
                  </Label>
                  <Select
                    value={watch("contentId") || ""}
                    onValueChange={(value) => setValue("contentId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Choose ${contentType === "IMAGE" ? "an image" : "a video"}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(mediaItems) && mediaItems.length > 0 ? (
                        mediaItems.map((item: MediaItem) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.originalName}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          No {contentType === "IMAGE" ? "images" : "videos"} uploaded yet.
                          <br />
                          Upload files in the Media Library.
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Upload files in the <a href="/dashboard/media" className="text-primary underline">Media Library</a> first
                  </p>
                </div>
              )}

              {contentType === "WEBVIEW" && (
                <div className="space-y-2">
                  <Label htmlFor="url">Web Page URL</Label>
                  <Input
                    id="url"
                    placeholder="https://example.com/page"
                    {...register("url")}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the URL of the web page to embed
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time (Optional)</Label>
                  <Input
                    id="startTime"
                    type="time"
                    {...register("startTime")}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to show all day
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time (Optional)</Label>
                  <Input
                    id="endTime"
                    type="time"
                    {...register("endTime")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Days of Week (Optional)</Label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <Button
                      key={day.value}
                      type="button"
                      variant={selectedDays.includes(day.value) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleDay(day.value)}
                    >
                      {day.label.slice(0, 3)}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Leave empty to show every day
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (seconds)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min={5}
                    {...register("duration", { valueAsNumber: true })}
                  />
                  <p className="text-xs text-muted-foreground">
                    How long to display this content
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Input
                    id="priority"
                    type="number"
                    min={0}
                    {...register("priority", { valueAsNumber: true })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher priority content shown first
                  </p>
                </div>
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
                  Active (schedule will be applied to displays)
                </Label>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={updateSchedule.isPending}>
                {updateSchedule.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Link href="/dashboard/schedules">
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
