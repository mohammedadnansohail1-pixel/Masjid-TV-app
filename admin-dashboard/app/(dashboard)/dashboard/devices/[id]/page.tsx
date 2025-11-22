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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Monitor, Layout } from "lucide-react";
import Link from "next/link";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useEffect, useState } from "react";

const deviceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  activeTemplate: z.string().optional(),
});

type DeviceFormData = z.infer<typeof deviceSchema>;

const TEMPLATES = [
  {
    id: "template1",
    name: "Classic Table",
    description: "Traditional table layout with all prayer times in rows",
  },
  {
    id: "template2",
    name: "Modern Cards",
    description: "Card-based layout with individual prayer time cards",
  },
  {
    id: "template3",
    name: "Minimalist",
    description: "Clean split-screen design with large countdown",
  },
];

export default function EditDevicePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: device, isLoading } = useDevice(id);
  const updateDevice = useUpdateDevice();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("template1");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DeviceFormData>({
    resolver: zodResolver(deviceSchema),
  });

  useEffect(() => {
    if (device) {
      reset({
        name: device.name,
        activeTemplate: device.activeTemplate || "template1",
      });
      setSelectedTemplate(device.activeTemplate || "template1");
    }
  }, [device, reset]);

  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value);
    setValue("activeTemplate", value);
  };

  const onSubmit = async (data: DeviceFormData) => {
    await updateDevice.mutateAsync({
      id,
      data: {
        ...data,
        activeTemplate: selectedTemplate,
      }
    });
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              Display Template
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose how prayer times are displayed on the TV screen. Changes are applied in real-time.
            </p>

            <div className="space-y-2">
              <Label>Select Template</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATES.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {TEMPLATES.map((template) => (
                <div
                  key={template.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedTemplate === template.id
                      ? "border-primary bg-primary/5 ring-2 ring-primary"
                      : "border-muted hover:border-primary/50"
                  }`}
                  onClick={() => handleTemplateChange(template.id)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Monitor className="h-4 w-4" />
                    <span className="font-medium">{template.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {template.description}
                  </p>
                  {selectedTemplate === template.id && (
                    <Badge className="mt-2" variant="default">
                      Active
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Template Preview</h4>
              <div className="bg-slate-900 rounded-lg aspect-video flex items-center justify-center text-white">
                {selectedTemplate === "template1" && (
                  <div className="text-center p-4 w-full">
                    <p className="text-lg font-bold mb-2">Classic Table Layout</p>
                    <div className="bg-slate-800 rounded p-2 text-xs">
                      <table className="w-full">
                        <tbody>
                          <tr><td className="py-1">Fajr</td><td>05:30</td><td>05:45</td></tr>
                          <tr><td className="py-1">Dhuhr</td><td>12:30</td><td>12:45</td></tr>
                          <tr><td className="py-1">Asr</td><td>15:30</td><td>15:45</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                {selectedTemplate === "template2" && (
                  <div className="text-center p-4 w-full">
                    <p className="text-lg font-bold mb-2">Modern Cards Layout</p>
                    <div className="flex gap-2 justify-center">
                      <div className="bg-emerald-700 rounded p-2 text-xs">
                        <div>Fajr</div>
                        <div className="font-bold">05:30</div>
                      </div>
                      <div className="bg-emerald-700 rounded p-2 text-xs">
                        <div>Dhuhr</div>
                        <div className="font-bold">12:30</div>
                      </div>
                      <div className="bg-emerald-700 rounded p-2 text-xs">
                        <div>Asr</div>
                        <div className="font-bold">15:30</div>
                      </div>
                    </div>
                  </div>
                )}
                {selectedTemplate === "template3" && (
                  <div className="text-center p-4 w-full">
                    <p className="text-lg font-bold mb-2">Minimalist Layout</p>
                    <div className="flex justify-between items-center">
                      <div className="text-xs space-y-1">
                        <div>Fajr: 05:30</div>
                        <div>Dhuhr: 12:30</div>
                      </div>
                      <div className="bg-emerald-600 rounded-lg p-3">
                        <div className="text-xs">Next Prayer</div>
                        <div className="text-xl font-bold">1:23:45</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
