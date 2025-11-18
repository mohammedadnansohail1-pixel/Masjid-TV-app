"use client";

import { useState } from "react";
import Link from "next/link";
import { useAnnouncements, useDeleteAnnouncement } from "@/hooks/useAnnouncements";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Edit, Trash2 } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { formatDate } from "@/lib/utils";

export default function AnnouncementsPage() {
  const { data: announcements, isLoading } = useAnnouncements();
  const deleteAnnouncement = useDeleteAnnouncement();
  const [deleteDialog, setDeleteDialog] = useState<number | null>(null);

  const handleDelete = async () => {
    if (deleteDialog) {
      await deleteAnnouncement.mutateAsync(deleteDialog);
      setDeleteDialog(null);
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Announcements</h1>
          <p className="text-muted-foreground">Manage announcements for displays</p>
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
          <CardTitle>All Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Masjid</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {announcements?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No announcements found
                  </TableCell>
                </TableRow>
              ) : (
                announcements?.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell className="font-medium">{announcement.title}</TableCell>
                    <TableCell>{announcement.masjid?.name || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          announcement.priority === "high"
                            ? "destructive"
                            : announcement.priority === "medium"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {announcement.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(announcement.startDate)}</TableCell>
                    <TableCell>{formatDate(announcement.endDate)}</TableCell>
                    <TableCell>
                      {announcement.isActive ? (
                        <Badge>Active</Badge>
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
