"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMasjids } from "@/hooks/useMasjids";
import { useCalculatePrayerTimes } from "@/hooks/usePrayerTimes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

// Validation: end date must be after start date and within 366 days
const calculateSchema = z.object({
  masjidId: z.string().min(1, "Masjid is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  overwrite: z.boolean().default(true),
}).refine((data) => {
  if (!data.startDate || !data.endDate) return true;
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end >= start;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
}).refine((data) => {
  if (!data.startDate || !data.endDate) return true;
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return daysDiff <= 366;
}, {
  message: "Date range cannot exceed 1 year + 1 day (366 days)",
  path: ["endDate"],
});

type CalculateFormData = z.infer<typeof calculateSchema>;

export default function CalculatePrayerTimesPage() {
  const router = useRouter();
  const { data: masjids } = useMasjids();
  const calculatePrayerTimes = useCalculatePrayerTimes();

  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<CalculateFormData>({
    resolver: zodResolver(calculateSchema),
    defaultValues: {
      masjidId: "",
      startDate: new Date().toISOString().split('T')[0],
      endDate: "",
      overwrite: true,
    },
  });

  // Calculate days in range for display
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  let daysInRange = 0;
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end >= start) {
      daysInRange = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }
  }

  const onSubmit = async (data: CalculateFormData) => {
    await calculatePrayerTimes.mutateAsync({
      masjidId: data.masjidId,
      startDate: data.startDate,
      endDate: data.endDate,
      overwrite: data.overwrite,
    });
    router.push("/dashboard/prayer-times");
  };

  // Set default end date to 1 year from start when start changes
  const handleStartDateChange = (value: string) => {
    setValue("startDate", value);
    if (value && !endDate) {
      const start = new Date(value);
      const defaultEnd = new Date(start);
      defaultEnd.setFullYear(defaultEnd.getFullYear() + 1);
      setValue("endDate", defaultEnd.toISOString().split('T')[0]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/prayer-times">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Calculate Prayer Times</h1>
          <p className="text-muted-foreground">
            Auto-calculate Adhan times for a date range (max 1 year)
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Calculation Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="masjidId">Select Masjid *</Label>
                <Select
                  value={watch("masjidId") ?? ""}
                  onValueChange={(value) => setValue("masjidId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a masjid" />
                  </SelectTrigger>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <input
                    type="date"
                    id="startDate"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={watch("startDate")}
                    onChange={(e) => handleStartDateChange(e.target.value)}
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

              {daysInRange > 0 && (
                <div className={`p-3 rounded-lg flex items-center gap-2 ${daysInRange > 366 ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">
                    {daysInRange} days will be calculated
                    {daysInRange > 366 && " (exceeds maximum of 366 days)"}
                  </span>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="overwrite"
                  className="h-4 w-4 rounded border-gray-300"
                  checked={watch("overwrite")}
                  onChange={(e) => setValue("overwrite", e.target.checked)}
                />
                <Label htmlFor="overwrite" className="text-sm font-normal">
                  Overwrite existing Adhan times (Iqamah times will be preserved)
                </Label>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Note:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>- Prayer times will be calculated based on the masjid&apos;s location, timezone, and calculation method.</li>
                  <li>- Maximum date range is 1 year + 1 day (366 days).</li>
                  <li>- If overwrite is enabled, existing Adhan times will be replaced but Iqamah times will be preserved.</li>
                  <li>- After calculating, use &quot;Set Default Iqamah Times&quot; to set Iqamah for all dates at once.</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={calculatePrayerTimes.isPending || daysInRange > 366}>
                {calculatePrayerTimes.isPending
                  ? "Calculating..."
                  : "Calculate Prayer Times"}
              </Button>
              <Link href="/dashboard/prayer-times">
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
