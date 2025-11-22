"use client";

import { useState } from "react";
import Link from "next/link";
import { usePrayerTimes, useUpdatePrayerTime } from "@/hooks/usePrayerTimes";
import { useMasjids } from "@/hooks/useMasjids";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Upload, Edit, Clock } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { formatDate, formatTime } from "@/lib/utils";
import { PrayerTime } from "@/types";

export default function PrayerTimesPage() {
  const [selectedMasjid, setSelectedMasjid] = useState<string | undefined>();
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  const [editingPrayerTime, setEditingPrayerTime] = useState<PrayerTime | null>(null);
  const [iqamahValues, setIqamahValues] = useState({
    fajrIqamah: "",
    dhuhrIqamah: "",
    asrIqamah: "",
    maghribIqamah: "",
    ishaIqamah: "",
    jumuah1: "",
    jumuah2: "",
  });

  const { data: masjids } = useMasjids();
  const { data: prayerTimes, isLoading } = usePrayerTimes(selectedMasjid, selectedMonth);
  const updatePrayerTime = useUpdatePrayerTime();

  const openEditDialog = (pt: PrayerTime) => {
    setEditingPrayerTime(pt);
    setIqamahValues({
      fajrIqamah: pt.fajrIqamah || "",
      dhuhrIqamah: pt.dhuhrIqamah || "",
      asrIqamah: pt.asrIqamah || "",
      maghribIqamah: pt.maghribIqamah || "",
      ishaIqamah: pt.ishaIqamah || "",
      jumuah1: pt.jumuah1 || "",
      jumuah2: pt.jumuah2 || "",
    });
  };

  const handleSaveIqamah = async () => {
    if (!editingPrayerTime) return;

    await updatePrayerTime.mutateAsync({
      masjidId: editingPrayerTime.masjidId,
      date: editingPrayerTime.date,
      data: {
        fajrIqamah: iqamahValues.fajrIqamah || undefined,
        dhuhrIqamah: iqamahValues.dhuhrIqamah || undefined,
        asrIqamah: iqamahValues.asrIqamah || undefined,
        maghribIqamah: iqamahValues.maghribIqamah || undefined,
        ishaIqamah: iqamahValues.ishaIqamah || undefined,
        jumuah1: iqamahValues.jumuah1 || undefined,
        jumuah2: iqamahValues.jumuah2 || undefined,
      },
    });
    setEditingPrayerTime(null);
  };

  const isFriday = (dateString: string) => {
    const date = new Date(dateString);
    return date.getDay() === 5;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Prayer Times</h1>
          <p className="text-muted-foreground">Manage prayer times and Iqamah for all masjids</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/prayer-times/calculate">
            <Button>
              <Calculator className="mr-2 h-4 w-4" />
              Calculate Times
            </Button>
          </Link>
          <Link href="/dashboard/prayer-times/upload">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Upload CSV
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Prayer Times</CardTitle>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Masjid</label>
              <Select
                value={selectedMasjid || "all"}
                onValueChange={(value) =>
                  setSelectedMasjid(value === "all" ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Masjids" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Masjids</SelectItem>
                  {masjids?.map((masjid) => (
                    <SelectItem key={masjid.id} value={masjid.id}>
                      {masjid.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Month</label>
              <input
                type="month"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead rowSpan={2} className="align-middle">Date</TableHead>
                    <TableHead colSpan={2} className="text-center border-l">Fajr</TableHead>
                    <TableHead className="text-center border-l">Sunrise</TableHead>
                    <TableHead colSpan={2} className="text-center border-l">Dhuhr</TableHead>
                    <TableHead colSpan={2} className="text-center border-l">Asr</TableHead>
                    <TableHead colSpan={2} className="text-center border-l">Maghrib</TableHead>
                    <TableHead colSpan={2} className="text-center border-l">Isha</TableHead>
                    <TableHead rowSpan={2} className="text-center border-l align-middle">Actions</TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="text-xs text-center border-l">Adhan</TableHead>
                    <TableHead className="text-xs text-center text-amber-600">Iqamah</TableHead>
                    <TableHead className="text-xs text-center border-l">Time</TableHead>
                    <TableHead className="text-xs text-center border-l">Adhan</TableHead>
                    <TableHead className="text-xs text-center text-amber-600">Iqamah</TableHead>
                    <TableHead className="text-xs text-center border-l">Adhan</TableHead>
                    <TableHead className="text-xs text-center text-amber-600">Iqamah</TableHead>
                    <TableHead className="text-xs text-center border-l">Adhan</TableHead>
                    <TableHead className="text-xs text-center text-amber-600">Iqamah</TableHead>
                    <TableHead className="text-xs text-center border-l">Adhan</TableHead>
                    <TableHead className="text-xs text-center text-amber-600">Iqamah</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prayerTimes?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={13} className="text-center text-muted-foreground">
                        No prayer times found. Click &ldquo;Calculate Times&rdquo; to generate them.
                      </TableCell>
                    </TableRow>
                  ) : (
                    prayerTimes?.map((pt) => (
                      <TableRow key={pt.id} className={isFriday(pt.date) ? "bg-green-50" : ""}>
                        <TableCell className="font-medium">
                          {formatDate(pt.date)}
                          {isFriday(pt.date) && (
                            <span className="ml-1 text-xs text-green-600">(Jumu&apos;ah)</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center border-l">{formatTime(pt.fajr)}</TableCell>
                        <TableCell className="text-center text-amber-600 font-medium">
                          {pt.fajrIqamah ? formatTime(pt.fajrIqamah) : "-"}
                        </TableCell>
                        <TableCell className="text-center border-l">{formatTime(pt.sunrise)}</TableCell>
                        <TableCell className="text-center border-l">{formatTime(pt.dhuhr)}</TableCell>
                        <TableCell className="text-center text-amber-600 font-medium">
                          {pt.dhuhrIqamah ? formatTime(pt.dhuhrIqamah) : "-"}
                        </TableCell>
                        <TableCell className="text-center border-l">{formatTime(pt.asr)}</TableCell>
                        <TableCell className="text-center text-amber-600 font-medium">
                          {pt.asrIqamah ? formatTime(pt.asrIqamah) : "-"}
                        </TableCell>
                        <TableCell className="text-center border-l">{formatTime(pt.maghrib)}</TableCell>
                        <TableCell className="text-center text-amber-600 font-medium">
                          {pt.maghribIqamah ? formatTime(pt.maghribIqamah) : "-"}
                        </TableCell>
                        <TableCell className="text-center border-l">{formatTime(pt.isha)}</TableCell>
                        <TableCell className="text-center text-amber-600 font-medium">
                          {pt.ishaIqamah ? formatTime(pt.ishaIqamah) : "-"}
                        </TableCell>
                        <TableCell className="text-center border-l">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(pt)}
                            title="Edit Iqamah Times"
                          >
                            <Clock className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Iqamah Dialog */}
      <Dialog open={editingPrayerTime !== null} onOpenChange={() => setEditingPrayerTime(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Iqamah Times</DialogTitle>
            <DialogDescription>
              Set Iqamah times for {editingPrayerTime && formatDate(editingPrayerTime.date)}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="fajrIqamah" className="text-right">
                Fajr Iqamah
              </Label>
              <Input
                id="fajrIqamah"
                type="time"
                value={iqamahValues.fajrIqamah}
                onChange={(e) =>
                  setIqamahValues({ ...iqamahValues, fajrIqamah: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="dhuhrIqamah" className="text-right">
                Dhuhr Iqamah
              </Label>
              <Input
                id="dhuhrIqamah"
                type="time"
                value={iqamahValues.dhuhrIqamah}
                onChange={(e) =>
                  setIqamahValues({ ...iqamahValues, dhuhrIqamah: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="asrIqamah" className="text-right">
                Asr Iqamah
              </Label>
              <Input
                id="asrIqamah"
                type="time"
                value={iqamahValues.asrIqamah}
                onChange={(e) =>
                  setIqamahValues({ ...iqamahValues, asrIqamah: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="maghribIqamah" className="text-right">
                Maghrib Iqamah
              </Label>
              <Input
                id="maghribIqamah"
                type="time"
                value={iqamahValues.maghribIqamah}
                onChange={(e) =>
                  setIqamahValues({ ...iqamahValues, maghribIqamah: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="ishaIqamah" className="text-right">
                Isha Iqamah
              </Label>
              <Input
                id="ishaIqamah"
                type="time"
                value={iqamahValues.ishaIqamah}
                onChange={(e) =>
                  setIqamahValues({ ...iqamahValues, ishaIqamah: e.target.value })
                }
              />
            </div>

            {editingPrayerTime && isFriday(editingPrayerTime.date) && (
              <>
                <div className="border-t pt-4 mt-2">
                  <p className="text-sm text-green-600 font-medium mb-3">Jumu&apos;ah Times</p>
                </div>
                <div className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor="jumuah1" className="text-right">
                    First Jumu&apos;ah
                  </Label>
                  <Input
                    id="jumuah1"
                    type="time"
                    value={iqamahValues.jumuah1}
                    onChange={(e) =>
                      setIqamahValues({ ...iqamahValues, jumuah1: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor="jumuah2" className="text-right">
                    Second Jumu&apos;ah
                  </Label>
                  <Input
                    id="jumuah2"
                    type="time"
                    value={iqamahValues.jumuah2}
                    onChange={(e) =>
                      setIqamahValues({ ...iqamahValues, jumuah2: e.target.value })
                    }
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPrayerTime(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveIqamah} disabled={updatePrayerTime.isPending}>
              {updatePrayerTime.isPending ? "Saving..." : "Save Iqamah Times"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
