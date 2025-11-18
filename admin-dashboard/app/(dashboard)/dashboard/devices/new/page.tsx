"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMasjids } from "@/hooks/useMasjids";
import { useCreateDevice } from "@/hooks/useDevices";
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

const deviceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  masjidId: z.number({ required_error: "Masjid is required" }),
});

type DeviceFormData = z.infer<typeof deviceSchema>;

export default function NewDevicePage() {
  const router = useRouter();
  const { data: masjids } = useMasjids();
  const createDevice = useCreateDevice();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DeviceFormData>({
    resolver: zodResolver(deviceSchema),
  });

  const onSubmit = async (data: DeviceFormData) => {
    await createDevice.mutateAsync(data);
    router.push("/dashboard/devices");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/devices">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Add New Device</h1>
          <p className="text-muted-foreground">Register a new display device</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Device Information</CardTitle>
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

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Next Steps:</h4>
                <p className="text-sm text-muted-foreground">
                  After creating the device, you will receive a pairing code. Enter this
                  code on the TV display device to pair it with the platform.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={createDevice.isPending}>
                {createDevice.isPending ? "Creating..." : "Create Device"}
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
  );
}
