"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function UploadPrayerTimesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a file to upload",
      });
      return;
    }

    setIsUploading(true);
    // TODO: Implement CSV upload logic
    setTimeout(() => {
      toast({
        title: "Success",
        description: "Prayer times uploaded successfully",
      });
      setIsUploading(false);
      router.push("/dashboard/prayer-times");
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/prayer-times">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Upload Prayer Times</h1>
          <p className="text-muted-foreground">Bulk upload prayer times via CSV</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>CSV Upload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <div className="mt-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-primary hover:underline">
                    Choose a CSV file
                  </span>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                {file && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Selected: {file.name}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-medium">CSV Format:</h4>
              <p className="text-sm text-muted-foreground">
                The CSV file should have the following columns:
              </p>
              <code className="text-sm block bg-background p-2 rounded">
                masjid_id,date,fajr,sunrise,dhuhr,asr,maghrib,isha
              </code>
              <p className="text-sm text-muted-foreground">
                Example: 1,2024-01-01,06:30:00,08:00:00,12:30:00,15:00:00,17:30:00,19:00:00
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={handleUpload} disabled={!file || isUploading}>
              {isUploading ? "Uploading..." : "Upload CSV"}
            </Button>
            <Link href="/dashboard/prayer-times">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
