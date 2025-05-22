"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CheckCircle, CheckCircle2, MessageSquare, PlusCircle, RefreshCcw, XCircle, LucideIcon } from "lucide-react";
import axios from "axios";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { JSX, useEffect, useState } from "react";

interface ActivityItem {
  icon: string;
  description: string;
  timestamp: string;
}

const iconMap: Record<string, JSX.Element> = {
  CheckCircle: <CheckCircle className="text-green-500 w-5 h-5" />,
  CheckCircle2: <CheckCircle2 className="text-teal-500 w-5 h-5" />,
  MessageSquare: <MessageSquare className="text-indigo-500 w-5 h-5" />,
  PlusCircle: <PlusCircle className="text-purple-500 w-5 h-5" />,
  RefreshCcw: <RefreshCcw className="text-blue-500 w-5 h-5" />,
  XCircle: <XCircle className="text-red-500 w-5 h-5" />,
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid date";

  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Hong_Kong",
  })
    .format(date)
    .replace(/\//g, "-")
    .replace(",", "");
};

export default function ActivityFeedClient({ user }: { user: any }) {
  const [activityFeed, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const fetchActivityFeed = async () => {
      const agentPhone = "85268712802"; // dynamically use logged-in agent's phone
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/${agentPhone}`);

        const recentActivities = response.data.recentActivity.map((item: any) => ({
          icon: item.icon,
          description: item.description,
          timestamp: item.timestamp,
        }));

        setActivities(recentActivities);
      } catch (error) {
        console.error("❌ Error fetching Activity Feed data:", error);
      }
    };

    fetchActivityFeed();
  }, []);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" user={user} />
      <SidebarInset>
        <SiteHeader left="Activity Feed" right="" />
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {activityFeed.map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="rounded-full">{iconMap[item.icon] || <MessageSquare className="text-indigo-500 w-5 h-5" />}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(item.timestamp)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
