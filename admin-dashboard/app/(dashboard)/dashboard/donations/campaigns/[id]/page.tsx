"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useCampaign, useDonations } from "@/hooks/useDonations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function CampaignDetailsPage() {
  const params = useParams();
  const id = parseInt(params.id as string);

  const { data: campaign, isLoading: campaignLoading } = useCampaign(id);
  const { data: donations, isLoading: donationsLoading } = useDonations(id);

  if (campaignLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!campaign) {
    return <div>Campaign not found</div>;
  }

  const progress =
    campaign.goalAmount > 0
      ? (campaign.currentAmount / campaign.goalAmount) * 100
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/donations">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{campaign.title}</h1>
          <p className="text-muted-foreground">{campaign.masjid?.name}</p>
        </div>
        {campaign.isActive ? (
          <Badge>Active</Badge>
        ) : (
          <Badge variant="secondary">Inactive</Badge>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(campaign.currentAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              of {formatCurrency(campaign.goalAmount)} goal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(progress)}%</div>
            <div className="w-full bg-secondary rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{donations?.length || 0}</div>
            <p className="text-xs text-muted-foreground">contributors</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-muted-foreground">{campaign.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-1">Start Date</h4>
              <p className="text-muted-foreground">{formatDate(campaign.startDate)}</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">End Date</h4>
              <p className="text-muted-foreground">{formatDate(campaign.endDate)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Donations</CardTitle>
        </CardHeader>
        <CardContent>
          {donationsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Donor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donations?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No donations yet
                    </TableCell>
                  </TableRow>
                ) : (
                  donations?.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell>
                        {donation.isAnonymous
                          ? "Anonymous"
                          : donation.donorName || "Anonymous"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(donation.amount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {donation.message || "-"}
                      </TableCell>
                      <TableCell>
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
