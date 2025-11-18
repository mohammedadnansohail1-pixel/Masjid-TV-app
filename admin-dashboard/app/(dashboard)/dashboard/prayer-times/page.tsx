"use client";

import { useState } from "react";
import Link from "next/link";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useMasjids } from "@/hooks/useMasjids";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Upload } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { formatDate, formatTime } from "@/lib/utils";

export default function PrayerTimesPage() {
  const [selectedMasjid, setSelectedMasjid] = useState<number | undefined>();
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );

  const { data: masjids } = useMasjids();
  const { data: prayerTimes, isLoading } = usePrayerTimes(selectedMasjid, selectedMonth);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Prayer Times</h1>
          <p className="text-muted-foreground">Manage prayer times for all masjids</p>
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
                value={selectedMasjid?.toString() || "all"}
                onValueChange={(value) =>
                  setSelectedMasjid(value === "all" ? undefined : parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Masjids" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Masjids</SelectItem>
                  {masjids?.map((masjid) => (
                    <SelectItem key={masjid.id} value={masjid.id.toString()}>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Fajr</TableHead>
                  <TableHead>Sunrise</TableHead>
                  <TableHead>Dhuhr</TableHead>
                  <TableHead>Asr</TableHead>
                  <TableHead>Maghrib</TableHead>
                  <TableHead>Isha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prayerTimes?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No prayer times found. Click "Calculate Times" to generate them.
                    </TableCell>
                  </TableRow>
                ) : (
                  prayerTimes?.map((pt) => (
                    <TableRow key={pt.id}>
                      <TableCell>{formatDate(pt.date)}</TableCell>
                      <TableCell>{formatTime(pt.fajr)}</TableCell>
                      <TableCell>{formatTime(pt.sunrise)}</TableCell>
                      <TableCell>{formatTime(pt.dhuhr)}</TableCell>
                      <TableCell>{formatTime(pt.asr)}</TableCell>
                      <TableCell>{formatTime(pt.maghrib)}</TableCell>
                      <TableCell>{formatTime(pt.isha)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
