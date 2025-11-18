"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Monitor, Megaphone, Heart } from "lucide-react";

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Masjids",
      value: "0",
      icon: Building2,
      description: "Active masjids",
    },
    {
      title: "Active Devices",
      value: "0",
      icon: Monitor,
      description: "Paired devices",
    },
    {
      title: "Announcements",
      value: "0",
      icon: Megaphone,
      description: "Active announcements",
    },
    {
      title: "Total Donations",
      value: "$0",
      icon: Heart,
      description: "All campaigns",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your masjid management platform
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No recent activity to display
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Get started by adding your first masjid
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
