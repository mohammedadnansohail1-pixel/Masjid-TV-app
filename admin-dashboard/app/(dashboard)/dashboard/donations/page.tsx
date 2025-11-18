"use client";

import { useState } from "react";
import Link from "next/link";
import { useCampaigns } from "@/hooks/useDonations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Heart } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function DonationsPage() {
  const { data: campaigns, isLoading } = useCampaigns();

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
          <h1 className="text-3xl font-bold">Donation Campaigns</h1>
          <p className="text-muted-foreground">Manage fundraising campaigns</p>
        </div>
        <Link href="/dashboard/donations/campaigns/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        </Link>
      </div>

      {campaigns?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <Heart className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No campaigns yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first fundraising campaign
            </p>
            <Link href="/dashboard/donations/campaigns/new">
              <Button>Create Campaign</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns?.map((campaign) => {
            const progress =
              campaign.goalAmount > 0
                ? (campaign.currentAmount / campaign.goalAmount) * 100
                : 0;

            return (
              <Link key={campaign.id} href={`/dashboard/donations/campaigns/${campaign.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{campaign.title}</CardTitle>
                      {campaign.isActive ? (
                        <Badge>Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {campaign.description}
                    </p>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">
                          {formatCurrency(campaign.currentAmount)}
                        </span>
                        <span className="text-muted-foreground">
                          of {formatCurrency(campaign.goalAmount)}
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(progress)}% funded
                      </p>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <p>
                        Ends: {formatDate(campaign.endDate)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
