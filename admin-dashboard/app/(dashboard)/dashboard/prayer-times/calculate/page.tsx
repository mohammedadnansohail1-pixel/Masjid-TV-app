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
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const calculateSchema = z.object({
  // masjidId: z.number({ required_error: "Masjid is required" }),
  masjidId: z.string().min(1, "Masjid is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

type CalculateFormData = z.infer<typeof calculateSchema>;

export default function CalculatePrayerTimesPage() {
  const router = useRouter();
  const { data: masjids } = useMasjids();
  const calculatePrayerTimes = useCalculatePrayerTimes();

  // const {
  //   setValue,
  //   watch,
  //   handleSubmit,
  //   formState: { errors },
  // } = useForm<CalculateFormData>({
  //   resolver: zodResolver(calculateSchema),
  // });
  const { 
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<CalculateFormData>({
    resolver: zodResolver(calculateSchema),
    defaultValues: {
      masjidId: undefined,
      startDate: "",
      endDate: "",
    },
  });

  // const onSubmit = async (data: CalculateFormData) => {
  //   await calculatePrayerTimes.mutateAsync(data);
  //   router.push("/dashboard/prayer-times");
  // };

  const onSubmit = async (data: CalculateFormData) => {
    const start = new Date(data.startDate);

    const payload = {
      masjidId: data.masjidId,
      year: start.getFullYear(),
      month: start.getMonth() + 1,
      overwrite: true
    };

    await calculatePrayerTimes.mutateAsync(payload);
    router.push("/dashboard/prayer-times");
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
            Auto-calculate prayer times for a date range
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
                  // value={watch("masjidId")?.toString()}
                  // onValueChange={(value) => setValue("masjidId", parseInt(value))}
                  value={watch("masjidId") ?? ""}
                  onValueChange={(value) => {
                    console.log("CHOSEN VALUE =", value);
                    setValue("masjidId", value)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a masjid" />
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

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Note:</h4>
                <p className="text-sm text-muted-foreground">
                  Prayer times will be calculated based on the masjid&apos;s location,
                  timezone, and calculation method. Existing prayer times for the
                  selected date range will be replaced.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={calculatePrayerTimes.isPending}>
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
