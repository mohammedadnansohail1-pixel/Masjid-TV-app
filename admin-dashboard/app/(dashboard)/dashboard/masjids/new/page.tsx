"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateMasjid } from "@/hooks/useMasjids";
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

const masjidSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  country: z.string().min(1, "Country is required"),
  contactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  timezone: z.string().min(1, "Timezone is required"),
  calculationMethod: z.string().min(1, "Calculation method is required"),
});

type MasjidFormData = z.infer<typeof masjidSchema>;

export default function NewMasjidPage() {
  const router = useRouter();
  const createMasjid = useCreateMasjid();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MasjidFormData>({
    resolver: zodResolver(masjidSchema),
    defaultValues: {
      country: "USA",
      timezone: "America/New_York",
      calculationMethod: "ISNA",
    },
  });

  const onSubmit = async (data: MasjidFormData) => {
    await createMasjid.mutateAsync(data);
    router.push("/dashboard/masjids");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/masjids">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Add New Masjid</h1>
          <p className="text-muted-foreground">Create a new masjid in your network</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Masjid Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Masjid Name *</Label>
                <Input
                  id="name"
                  placeholder="Islamic Center of Example"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    placeholder="123 Main St"
                    {...register("address")}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500">{errors.address.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" placeholder="New York" {...register("city")} />
                  {errors.city && (
                    <p className="text-sm text-red-500">{errors.city.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input id="state" placeholder="NY" {...register("state")} />
                  {errors.state && (
                    <p className="text-sm text-red-500">{errors.state.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code *</Label>
                  <Input
                    id="zipCode"
                    placeholder="10001"
                    {...register("zipCode")}
                  />
                  {errors.zipCode && (
                    <p className="text-sm text-red-500">{errors.zipCode.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input id="country" {...register("country")} />
                  {errors.country && (
                    <p className="text-sm text-red-500">{errors.country.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="info@masjid.com"
                    {...register("contactEmail")}
                  />
                  {errors.contactEmail && (
                    <p className="text-sm text-red-500">
                      {errors.contactEmail.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    placeholder="(555) 123-4567"
                    {...register("contactPhone")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone *</Label>
                  <Select
                    value={watch("timezone")}
                    onValueChange={(value) => setValue("timezone", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">
                        Eastern Time
                      </SelectItem>
                      <SelectItem value="America/Chicago">
                        Central Time
                      </SelectItem>
                      <SelectItem value="America/Denver">
                        Mountain Time
                      </SelectItem>
                      <SelectItem value="America/Los_Angeles">
                        Pacific Time
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.timezone && (
                    <p className="text-sm text-red-500">{errors.timezone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="calculationMethod">Calculation Method *</Label>
                  <Select
                    value={watch("calculationMethod")}
                    onValueChange={(value) => setValue("calculationMethod", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ISNA">ISNA</SelectItem>
                      <SelectItem value="MWL">Muslim World League</SelectItem>
                      <SelectItem value="EGYPT">Egyptian General Authority</SelectItem>
                      <SelectItem value="MAKKAH">Umm Al-Qura University</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.calculationMethod && (
                    <p className="text-sm text-red-500">
                      {errors.calculationMethod.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={createMasjid.isPending}
              >
                {createMasjid.isPending ? "Creating..." : "Create Masjid"}
              </Button>
              <Link href="/dashboard/masjids">
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
