"use client";
import { AppSidebar } from "@/components/app-sidebar";
// import { ChartAreaInteractive } from "@/components/chart-area-interactive";
// import { DataTable } from "@/components/data-table";
// import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  // CalendarIcon,
  // CheckCircle,
  CheckCircle2,
  // Clock,
  MessageSquare,
  PlusCircle,
  RefreshCcw,
  // RefreshCw,
  Send,
  // SendIcon,
  XCircle,
} from "lucide-react";
import axios from "axios";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { DateTimePicker24hForm } from "@/components/ui/date-time-picker";
// import { BlastHistoryTable } from "@/components/ui/blast-history-table";
import React, { useEffect, useState } from "react";

interface ActivityItem {
  _id: string;
  icon: string;
  title: string;
  description: string;
  timestamp: string;
}
export default function Page() {
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/activity-feed`);
      console.log("✅ Fetched Activity Feed from server:", response.data);

      setActivityFeed(response.data);
    };

    fetch();
  }, []);

  function getIconComponent(iconName: string) {
    switch (iconName) {
      case "Send":
        return Send;
      case "PlusCircle":
        return PlusCircle;
      case "RefreshCcw":
        return RefreshCcw;
      case "MessageSquare":
        return MessageSquare;
      case "CheckCircle2":
        return CheckCircle2;
      case "XCircle":
        return XCircle;
      default:
        return MessageSquare;
    }
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader left="Activity Feed" right="" />
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {activityFeed.map((item) => {
                const Icon = getIconComponent(item.icon);
                return (
                  <div key={item._id} className="flex items-start gap-4">
                    <div className="rounded-full bg-muted p-2">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{item.timestamp}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
