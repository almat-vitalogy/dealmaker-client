"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CheckCircle, CheckCircle2, MessageSquare, PlusCircle, RefreshCcw, XCircle, Download, SearchCheck, Tag, Trash2 } from "lucide-react";
import axios from "axios";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { JSX, useEffect, useState } from "react";
import { useClearLoadingOnRouteChange } from "@/hooks/useClearLoadingOnRouteChange";

interface ActivityItem {
  icon: string;
  description: string;
  updatedAt: string;
}

const iconMap: Record<string, JSX.Element> = {
  CheckCircle: <CheckCircle className="text-green-500 w-5 h-5" />,
  CheckCircle2: <CheckCircle2 className="text-teal-500 w-5 h-5" />,
  MessageSquare: <MessageSquare className="text-indigo-500 w-5 h-5" />,
  PlusCircle: <PlusCircle className="text-purple-500 w-5 h-5" />,
  RefreshCcw: <RefreshCcw className="text-blue-500 w-5 h-5" />,
  XCircle: <XCircle className="text-red-500 w-5 h-5" />,
  trash2: <XCircle className="text-red-500 w-5 h-5" />, // Assuming trash2 is a typo for XCircle
  Download: <Download className="text-green-500 w-5 h-5" />,
  SearchCheck: <SearchCheck className="text-teal-500 w-5 h-5" />,
  Trash2: <Trash2 className="text-red-500 w-5 h-5" />, // for mass delete
  Tag: <Tag className="text-yellow-600 w-5 h-5" />, //for mass label assign
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toISOString().replace("T", ", ").substring(0, 17); // "2025-05-28, 10:16"
};

export default function ActivityFeedClient({ user }: { user: any }) {
  const [activityFeed, setActivities] = useState<ActivityItem[]>([]);
  useClearLoadingOnRouteChange();

  useEffect(() => {
    const fetchActivityFeed = async () => {
      const userEmail = encodeURIComponent(user.email);
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/activities/${userEmail}`);
        console.log("📊 Activity Feed data:", response.data);

        const recentActivities = response.data.map((item: any) => ({
          icon: mapActionToIcon(item.action),
          description: item.action,
          updatedAt: item.updatedAt,
        }));

        setActivities(recentActivities);
      } catch (error) {
        console.error("❌ Error fetching Activity Feed data:", error);
      }
    };

    fetchActivityFeed();
  }, [user.email]);

  function mapActionToIcon(action: string): string {
    const iconMapping: { key: string; icon: string }[] = [
      { key: "contacts imported successfully", icon: "Download" },
      { key: "contacts scraped & saved", icon: "SearchCheck" },
      { key: "contact added", icon: "PlusCircle" },
      { key: "contact deleted", icon: "XCircle" },
      { key: "labels added", icon: "Tag" },
      { key: "contacts deleted", icon: "Trash2" },
      { key: "blast created", icon: "MessageSquare" },
      { key: "blast sent", icon: "CheckCircle" },
      { key: "session connected", icon: "RefreshCcw" },
      { key: "session disconnected", icon: "XCircle" },
      { key: "message composed", icon: "MessageSquare" },
      { key: "error", icon: "XCircle" },
    ];

    const match = iconMapping.find(({ key }) => action.startsWith(key));
    return match?.icon || "MessageSquare";
    // return iconMapping[action] || "Clock";
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
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(item.updatedAt)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
