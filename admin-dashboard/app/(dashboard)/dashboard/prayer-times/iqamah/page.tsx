"use client";

import { useState, useEffect, useCallback } from "react";
import { useMasjids } from "@/hooks/useMasjids";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Clock, Save, RefreshCw } from "lucide-react";

interface IqamahTimes {
  fajrIqamah: string;
  dhuhrIqamah: string;
  asrIqamah: string;
  maghribIqamah: string;
  ishaIqamah: string;
  jumuah1: string;
  jumuah2: string;
}

interface PrayerTimeData {
  id: string;
  date: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  fajrIqamah?: string;
  dhuhrIqamah?: string;
  asrIqamah?: string;
  maghribIqamah?: string;
  ishaIqamah?: string;
  jumuah1?: string;
  jumuah2?: string;
}

const PRAYERS = [
  { key: 'fajr', name: 'Fajr', arabic: 'الفجر', iqamahKey: 'fajrIqamah' },
  { key: 'dhuhr', name: 'Dhuhr', arabic: 'الظهر', iqamahKey: 'dhuhrIqamah' },
  { key: 'asr', name: 'Asr', arabic: 'العصر', iqamahKey: 'asrIqamah' },
  { key: 'maghrib', name: 'Maghrib', arabic: 'المغرب', iqamahKey: 'maghribIqamah' },
  { key: 'isha', name: 'Isha', arabic: 'العشاء', iqamahKey: 'ishaIqamah' },
];

export default function IqamahTimesPage() {
  const [selectedMasjid, setSelectedMasjid] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [prayerData, setPrayerData] = useState<PrayerTimeData | null>(null);
  const [iqamahTimes, setIqamahTimes] = useState<IqamahTimes>({
    fajrIqamah: "",
    dhuhrIqamah: "",
    asrIqamah: "",
    maghribIqamah: "",
    ishaIqamah: "",
    jumuah1: "",
    jumuah2: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { data: masjids } = useMasjids();
  const { toast } = useToast();

  const loadPrayerTimes = useCallback(async () => {
    if (!selectedMasjid || !selectedDate) return;

    setIsLoading(true);
    try {
      const response = await apiClient.get(
        `/prayer-times/masjid/${selectedMasjid}/date/${selectedDate}`
      );
      const data = response.data.data || response.data;
      setPrayerData(data);
      setIqamahTimes({
        fajrIqamah: data.fajrIqamah || "",
        dhuhrIqamah: data.dhuhrIqamah || "",
        asrIqamah: data.asrIqamah || "",
        maghribIqamah: data.maghribIqamah || "",
        ishaIqamah: data.ishaIqamah || "",
        jumuah1: data.jumuah1 || "",
        jumuah2: data.jumuah2 || "",
      });
    } catch (error: any) {
      if (error.response?.status === 404) {
        setPrayerData(null);
        toast({
          variant: "destructive",
          title: "No prayer times",
          description: "Prayer times not found for this date. Please calculate prayer times first.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load prayer times",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedMasjid, selectedDate, toast]);

  // Load prayer times when masjid or date changes
  useEffect(() => {
    if (selectedMasjid && selectedDate) {
      loadPrayerTimes();
    }
  }, [selectedMasjid, selectedDate, loadPrayerTimes]);

  const handleSave = async () => {
    if (!selectedMasjid || !selectedDate || !prayerData) return;

    setIsSaving(true);
    try {
      await apiClient.put(
        `/prayer-times/masjid/${selectedMasjid}/date/${selectedDate}`,
        iqamahTimes
      );
      toast({
        title: "Success",
        description: "Iqamah times saved successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to save iqamah times",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleIqamahChange = (key: string, value: string) => {
    setIqamahTimes(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Check if selected date is Friday for Jummah
  const isFriday = new Date(selectedDate).getDay() === 5;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Iqamah Times</h1>
          <p className="text-muted-foreground">
            Set iqamah times for your masjid&apos;s daily prayers
          </p>
        </div>
      </div>

      {/* Selection Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Select Masjid & Date
          </CardTitle>
          <CardDescription>
            Choose a masjid and date to manage iqamah times
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Masjid</label>
              <Select
                value={selectedMasjid}
                onValueChange={setSelectedMasjid}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a masjid" />
                </SelectTrigger>
                <SelectContent>
                  {masjids?.map((masjid) => (
                    <SelectItem key={masjid.id} value={String(masjid.id)}>
                      {masjid.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={loadPrayerTimes}
                variant="outline"
                disabled={!selectedMasjid || isLoading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Iqamah Times Card */}
      {isLoading ? (
        <Card>
          <CardContent className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </CardContent>
        </Card>
      ) : prayerData ? (
        <Card>
          <CardHeader>
            <CardTitle>Set Iqamah Times</CardTitle>
            <CardDescription>
              Enter iqamah times in 24-hour format (HH:MM)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Prayer Times Table */}
              <div className="rounded-lg border">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-semibold">Prayer</th>
                      <th className="text-left p-4 font-semibold">الصلاة</th>
                      <th className="text-center p-4 font-semibold">Adhan Time</th>
                      <th className="text-center p-4 font-semibold text-primary">Iqamah Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PRAYERS.map((prayer) => (
                      <tr key={prayer.key} className="border-t">
                        <td className="p-4 font-medium">{prayer.name}</td>
                        <td className="p-4 text-muted-foreground font-arabic text-lg">
                          {prayer.arabic}
                        </td>
                        <td className="p-4 text-center">
                          <span className="font-mono text-lg">
                            {prayerData[prayer.key as keyof PrayerTimeData] || '--:--'}
                          </span>
                        </td>
                        <td className="p-4">
                          <Input
                            type="time"
                            value={iqamahTimes[prayer.iqamahKey as keyof IqamahTimes]}
                            onChange={(e) => handleIqamahChange(prayer.iqamahKey, e.target.value)}
                            className="max-w-[150px] mx-auto text-center font-mono"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Jummah Times (only shown on Fridays) */}
              {isFriday && (
                <div className="rounded-lg border p-4 bg-primary/5">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <span className="text-lg">🕌</span>
                    Jummah Prayer Times (Friday)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">First Jummah</label>
                      <Input
                        type="time"
                        value={iqamahTimes.jumuah1}
                        onChange={(e) => handleIqamahChange('jumuah1', e.target.value)}
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Second Jummah (if applicable)</label>
                      <Input
                        type="time"
                        value={iqamahTimes.jumuah2}
                        onChange={(e) => handleIqamahChange('jumuah2', e.target.value)}
                        className="font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving} size="lg">
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Iqamah Times"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : selectedMasjid && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Prayer Times Found</h3>
            <p className="text-muted-foreground mb-4">
              Prayer times have not been set for this date yet.
            </p>
            <Button variant="outline" onClick={() => window.location.href = '/dashboard/prayer-times/calculate'}>
              Calculate Prayer Times
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
