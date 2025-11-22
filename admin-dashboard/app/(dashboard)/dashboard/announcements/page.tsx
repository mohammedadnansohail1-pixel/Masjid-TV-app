"use client";

import { useState } from "react";
import Link from "next/link";
import { useMasjids } from "@/hooks/useMasjids";
import { useAnnouncements, useDeleteAnnouncement } from "@/hooks/useAnnouncements";
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
import { Plus, Edit, Trash2, Megaphone } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { formatDate } from "@/lib/utils";
import { Announcement } from "@/types";

export default function AnnouncementsPage() {
  const { data: masjids } = useMasjids();
  const [selectedMasjid, setSelectedMasjid] = useState<string>("");
  const { data: announcements, isLoading } = useAnnouncements(selectedMasjid);
  const deleteAnnouncement = useDeleteAnnouncement();
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);

  const handleDelete = async () => {
    if (deleteDialog) {
      await deleteAnnouncement.mutateAsync(deleteDialog);
      setDeleteDialog(null);
    }
  };

  const getPriorityBadge = (priority: number) => {
    if (priority >= 10) {
      return <Badge variant="destructive">High ({priority})</Badge>;
    } else if (priority >= 5) {
      return <Badge>Medium ({priority})</Badge>;
    }
    return <Badge variant="secondary">Low ({priority})</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Announcements</h1>
          <p className="text-muted-foreground">Manage announcements for TV displays</p>
        </div>
        <Link href="/dashboard/announcements/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Announcement
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Announcements</CardTitle>
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
          <CardTitle>All Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedMasjid ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Megaphone className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Select a Masjid</h3>
              <p className="text-sm text-muted-foreground">
                Choose a masjid from the dropdown above to view announcements
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
                  <TableHead>Title</TableHead>
                  <TableHead>Body</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!announcements || announcements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No announcements found. Create your first announcement!
                    </TableCell>
                  </TableRow>
                ) : (
                  announcements.map((announcement: Announcement) => (
                    <TableRow key={announcement.id}>
                      <TableCell className="font-medium">{announcement.title}</TableCell>
                      <TableCell className="max-w-xs truncate">{announcement.body}</TableCell>
                      <TableCell>{getPriorityBadge(announcement.priority)}</TableCell>
                      <TableCell>{announcement.startDate ? formatDate(announcement.startDate) : "-"}</TableCell>
                      <TableCell>{announcement.endDate ? formatDate(announcement.endDate) : "-"}</TableCell>
                      <TableCell>
                        {announcement.isActive ? (
                          <Badge className="bg-green-500">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/announcements/${announcement.id}/edit`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteDialog(announcement.id)}
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
            <DialogTitle>Delete Announcement</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this announcement? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteAnnouncement.isPending}
            >
              {deleteAnnouncement.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
