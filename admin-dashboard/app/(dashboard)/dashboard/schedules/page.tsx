"use client";

import { useState } from "react";
import Link from "next/link";
import { useMasjids } from "@/hooks/useMasjids";
import { useSchedules, useDeleteSchedule } from "@/hooks/useSchedules";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Edit, Trash2, Calendar, Clock } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ContentSchedule } from "@/types";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CONTENT_TYPE_LABELS: Record<string, string> = {
  PRAYER_TIMES: "Prayer Times",
  ANNOUNCEMENT: "Announcement",
  IMAGE: "Image",
  VIDEO: "Video",
  WEBVIEW: "Web Page",
};

export default function SchedulesPage() {
  const { data: masjids } = useMasjids();
  const [selectedMasjid, setSelectedMasjid] = useState<string>("");
  const { data: schedules, isLoading } = useSchedules(selectedMasjid);
  const deleteSchedule = useDeleteSchedule();
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);

  const handleDelete = async () => {
    if (deleteDialog) {
      await deleteSchedule.mutateAsync(deleteDialog);
      setDeleteDialog(null);
    }
  };

  const formatTime = (time: string | undefined) => {
    if (!time) return "-";
    // Time is stored as ISO date with time component
    try {
      const date = new Date(time);
      return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return time;
    }
  };

  const formatDays = (days: number[] | undefined) => {
    if (!days || days.length === 0) return "All days";
    if (days.length === 7) return "All days";
    return days.map((d) => DAYS_OF_WEEK[d]).join(", ");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Content Schedules</h1>
          <p className="text-muted-foreground">Manage what content displays on your TV screens</p>
        </div>
        <Link href="/dashboard/schedules/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Schedule
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="space-y-2 flex-1 max-w-xs">
              <Label>Select Masjid</Label>
              <Select value={selectedMasjid} onValueChange={setSelectedMasjid}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a masjid" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(masjids) &&
                    masjids.map((masjid) => (
                      <SelectItem key={masjid.id} value={masjid.id}>
                        {masjid.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedMasjid ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Select a Masjid</h3>
              <p className="text-sm text-muted-foreground">
                Choose a masjid from the dropdown above to view schedules
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Content Type</TableHead>
                  <TableHead>Time Range</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!schedules || schedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No schedules found. Create your first schedule!
                    </TableCell>
                  </TableRow>
                ) : (
                  schedules.map((schedule: ContentSchedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">{schedule.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {CONTENT_TYPE_LABELS[schedule.contentType] || schedule.contentType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{formatDays(schedule.days)}</TableCell>
                      <TableCell>{schedule.duration}s</TableCell>
                      <TableCell>
                        <Badge variant={schedule.priority >= 10 ? "destructive" : "secondary"}>
                          {schedule.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {schedule.isActive ? (
                          <Badge className="bg-green-500">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/schedules/${schedule.id}/edit`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteDialog(schedule.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteDialog !== null} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Schedule</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this schedule? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteSchedule.isPending}
            >
              {deleteSchedule.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
