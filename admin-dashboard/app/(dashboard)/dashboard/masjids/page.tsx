"use client";

import { useState } from "react";
import Link from "next/link";
import { useMasjids, useDeleteMasjid } from "@/hooks/useMasjids";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Masjid } from "@/types";

export default function MasjidsPage() {
  const { data: masjids, isLoading } = useMasjids();
  const deleteMasjid = useDeleteMasjid();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<number | null>(null);

  const filteredMasjids = masjids?.filter((masjid) =>
    masjid.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    masjid.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async () => {
    if (deleteDialog) {
      await deleteMasjid.mutateAsync(deleteDialog);
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
          <h1 className="text-3xl font-bold">Masjids</h1>
          <p className="text-muted-foreground">Manage all masjids in your network</p>
        </div>
        <Link href="/dashboard/masjids/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Masjid
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Masjids</CardTitle>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search masjids..."
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
                <TableHead>Location</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Timezone</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMasjids?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No masjids found
                  </TableCell>
                </TableRow>
              ) : (
                filteredMasjids?.map((masjid) => (
                  <TableRow key={masjid.id}>
                    <TableCell className="font-medium">{masjid.name}</TableCell>
                    <TableCell>
                      {masjid.city}, {masjid.state}
                    </TableCell>
                    <TableCell>{masjid.contactEmail || "-"}</TableCell>
                    <TableCell>{masjid.timezone}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/masjids/${masjid.id}`}>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteDialog(masjid.id)}
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
            <DialogTitle>Delete Masjid</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this masjid? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMasjid.isPending}
            >
              {deleteMasjid.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
