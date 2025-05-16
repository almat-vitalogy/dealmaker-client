"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  CheckCircle,
  CheckCircle2,
  MessageSquare,
  PlusCircle,
  RefreshCcw,
  Send,
  XCircle,
} from "lucide-react";
import axios from "axios";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useEffect, useState } from "react";

interface BlastMessage {
  _id: string;
  title: string;
  sent: number;
  delivered: number;
  failed: number;
  date: string;
  status: string;
  activity: {
    icon: string;
    description: string;
    timestamp: string;
  };
}
export default function Page() {
  const [activityFeed, setActivityFeed] = useState<BlastMessage[]>([]);

  useEffect(() => {
    const fetchActivityFeed = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/activity-feed`);
        console.log("✅ Fetched Blast Messages for Activity Feed:", response.data);
        setActivityFeed(response.data);
      } catch (error) {
        console.error("❌ Error fetching Activity Feed data:", error);
      }
    };

    fetchActivityFeed();
  }, []);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "Send":
        return Send;
      case "PlusCircle":
        return PlusCircle;
      case "RefreshCcw":
        return RefreshCcw;
      case "MessageSquare":
        return MessageSquare;
      case "CheckCircle":
        return CheckCircle;
      case "CheckCircle2":
        return CheckCircle2;
      case "XCircle":
        return XCircle;
      default:
        return MessageSquare;
    }
  };

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
                const Icon = getIconComponent(item.activity.icon);
                return (
                  <div key={item._id} className="flex items-start gap-4">
                    <div className="rounded-full bg-muted p-2">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.activity.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {item.activity.timestamp}
                    </span>
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

