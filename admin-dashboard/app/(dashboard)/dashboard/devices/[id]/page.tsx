"use client";

import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDevice, useUpdateDevice } from "@/hooks/useDevices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useEffect } from "react";

const deviceSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type DeviceFormData = z.infer<typeof deviceSchema>;

export default function EditDevicePage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);

  const { data: device, isLoading } = useDevice(id);
  const updateDevice = useUpdateDevice();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DeviceFormData>({
    resolver: zodResolver(deviceSchema),
  });

  useEffect(() => {
    if (device) {
      reset({
        name: device.name,
      });
    }
  }, [device, reset]);

  const onSubmit = async (data: DeviceFormData) => {
    await updateDevice.mutateAsync({ id, data });
    router.push("/dashboard/devices");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/devices">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Device</h1>
          <p className="text-muted-foreground">Update device settings</p>
        </div>
      </div>

      <div className="grid gap-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Device Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Pairing Code:</span>
              <code className="bg-muted px-3 py-1 rounded text-lg font-mono">
                {device?.pairingCode}
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              {device?.isPaired ? (
                <Badge>Paired</Badge>
              ) : (
                <Badge variant="secondary">Unpaired</Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Last Seen:</span>
              <span className="text-sm text-muted-foreground">
                {device?.lastSeen
                  ? new Date(device.lastSeen).toLocaleString()
                  : "Never"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Masjid:</span>
              <span className="text-sm">{device?.masjid?.name || "-"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Device Name *</Label>
                  <Input
                    id="name"
                    placeholder="Main Hall Display"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={updateDevice.isPending}>
                  {updateDevice.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Link href="/dashboard/devices">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
