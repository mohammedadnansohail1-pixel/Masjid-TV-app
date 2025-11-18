"use client";

import { useState } from "react";
import Link from "next/link";
import { useDevices, useDeleteDevice } from "@/hooks/useDevices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus, Search, Edit, Trash2, Monitor } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function DevicesPage() {
  const { data: devices, isLoading } = useDevices();
  const deleteDevice = useDeleteDevice();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<number | null>(null);

  const filteredDevices = devices?.filter((device) =>
    device.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async () => {
    if (deleteDialog) {
      await deleteDevice.mutateAsync(deleteDialog);
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
          <h1 className="text-3xl font-bold">Devices</h1>
          <p className="text-muted-foreground">Manage display devices</p>
        </div>
        <Link href="/dashboard/devices/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Device
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Devices</CardTitle>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search devices..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Masjid</TableHead>
                <TableHead>Pairing Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDevices?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No devices found
                  </TableCell>
                </TableRow>
              ) : (
                filteredDevices?.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        {device.name}
                      </div>
                    </TableCell>
                    <TableCell>{device.masjid?.name || "-"}</TableCell>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded">
                        {device.pairingCode}
                      </code>
                    </TableCell>
                    <TableCell>
                      {device.isPaired ? (
                        <Badge>Paired</Badge>
                      ) : (
                        <Badge variant="secondary">Unpaired</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {device.lastSeen
                        ? new Date(device.lastSeen).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/devices/${device.id}`}>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteDialog(device.id)}
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
            <DialogTitle>Delete Device</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this device? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteDevice.isPending}
            >
              {deleteDevice.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
