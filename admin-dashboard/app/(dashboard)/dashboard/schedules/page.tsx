"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar } from "lucide-react";

export default function SchedulesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Content Schedules</h1>
          <p className="text-muted-foreground">Manage content display schedules</p>
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
          <CardTitle>All Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No schedules yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first content schedule to manage what displays on your devices
            </p>
            <Link href="/dashboard/schedules/new">
              <Button>Create Schedule</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
