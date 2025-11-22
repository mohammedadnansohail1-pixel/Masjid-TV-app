"use client";

import { useState, useRef } from "react";
import { useMasjids } from "@/hooks/useMasjids";
import { useMedia, useMediaStats, useUploadMedia, useDeleteMedia, MediaItem } from "@/hooks/useMedia";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Trash2, Image, Video, FileText, HardDrive, Files } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  IMAGE: <Image className="h-8 w-8" />,
  VIDEO: <Video className="h-8 w-8" />,
  PDF: <FileText className="h-8 w-8" />,
};

const TYPE_COLORS: Record<string, string> = {
  IMAGE: "bg-blue-500",
  VIDEO: "bg-purple-500",
  PDF: "bg-red-500",
};

export default function MediaLibraryPage() {
  const { data: masjids } = useMasjids();
  const [selectedMasjid, setSelectedMasjid] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("all");
  const { data: mediaItems, isLoading } = useMedia(
    selectedMasjid,
    filterType !== "all" ? filterType : undefined
  );
  const { data: stats } = useMediaStats(selectedMasjid);
  const uploadMedia = useUploadMedia();
  const deleteMedia = useDeleteMedia();
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedMasjid) {
      await uploadMedia.mutateAsync({ file, masjidId: selectedMasjid });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async () => {
    if (deleteDialog) {
      await deleteMedia.mutateAsync(deleteDialog);
      setDeleteDialog(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Media Library</h1>
          <p className="text-muted-foreground">Upload and manage images, videos, and documents</p>
        </div>
        {selectedMasjid && (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,video/*,application/pdf"
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMedia.isPending}
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploadMedia.isPending ? "Uploading..." : "Upload File"}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Select Masjid</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {selectedMasjid && stats && (
          <Card>
            <CardHeader>
              <CardTitle>Storage Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Files className="h-5 w-5 text-muted-foreground" />
                  <span className="text-2xl font-bold">{stats.totalFiles}</span>
                  <span className="text-muted-foreground">files</span>
                </div>
                <div className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5 text-muted-foreground" />
                  <span className="text-2xl font-bold">{stats.totalSizeMB}</span>
                  <span className="text-muted-foreground">MB</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedMasjid && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Media Files</CardTitle>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground">Filter:</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="IMAGE">Images</SelectItem>
                  <SelectItem value="VIDEO">Videos</SelectItem>
                  <SelectItem value="PDF">PDFs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            ) : !mediaItems || mediaItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Image className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No media files</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload images, videos, or PDFs to display on your TV screens
                </p>
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mediaItems.map((item: MediaItem) => (
                  <div
                    key={item.id}
                    className="border rounded-lg overflow-hidden group relative"
                  >
                    {item.type === "IMAGE" ? (
                      <div className="aspect-video bg-gray-100">
                        <img
                          src={item.url}
                          alt={item.originalName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : item.type === "VIDEO" ? (
                      <div className="aspect-video bg-gray-900 flex items-center justify-center">
                        <video
                          src={item.url}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Video className="h-12 w-12 text-white opacity-80" />
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        <FileText className="h-12 w-12 text-red-500" />
                      </div>
                    )}

                    <div className="p-3">
                      <p className="text-sm font-medium truncate" title={item.originalName}>
                        {item.originalName}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge className={TYPE_COLORS[item.type]}>
                          {item.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(item.size)}
                        </span>
                      </div>
                    </div>

                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setDeleteDialog(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!selectedMasjid && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <Image className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Select a Masjid</h3>
            <p className="text-sm text-muted-foreground">
              Choose a masjid from the dropdown above to manage media files
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={deleteDialog !== null} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Media</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this file? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMedia.isPending}
            >
              {deleteMedia.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
