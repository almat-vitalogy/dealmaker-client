"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CheckCircle, Clock, RefreshCcw, RefreshCw, XCircle, PlusCircle, MessageSquare, CheckCircle2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import React, { useEffect, useState } from "react";
import axios from "axios";

interface RecentBlast {
  title: string;
  status: string;
  sent: number;
  delivered: number;
  failed: number;
  date: string;
}

interface RecentActivity {
  icon: "CheckCircle" | "RefreshCcw" | "XCircle" | "Clock" | "PlusCircle" | "MessageSquare" | "CheckCircle2";
  description: string;
  timestamp: string;
}

interface DashboardData {
  totalContacts: number;
  messagesSent: number;
  scheduledBlasts: number;
  successRate: number;
  recentBlasts: RecentBlast[];
  recentActivity: RecentActivity[];
}

const iconMap = {
  CheckCircle: <CheckCircle className="text-green-500 w-4 h-4" />,
  RefreshCcw: <RefreshCcw className="text-blue-500 w-4 h-4" />,
  XCircle: <XCircle className="text-red-500 w-4 h-4" />,
  Clock: <Clock className="text-yellow-500 w-4 h-4" />,
  PlusCircle: <PlusCircle className="text-purple-500 w-4 h-4" />,
  MessageSquare: <MessageSquare className="text-indigo-500 w-4 h-4" />,
  CheckCircle2: <CheckCircle2 className="text-teal-500 w-4 h-4" />,
};

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Hong_Kong", // +8 timezone
  })
    .format(new Date(dateString))
    .replace(/\//g, "-");
};

export default function DashboardClient({ user }: { user: any }) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      const agentPhone = "85268712802"; // dynamicallyy'y'y'yyyyy use logged-in agent's phone

      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/${agentPhone}`);
        console.log("✅ Dashboard data fetched:", response.data);
        setDashboardData(response.data);
      } catch (error) {
        console.error("❌ Error fetching Dashboard data:", error);
      }
    };
    fetchDashboard();
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
        <SiteHeader left="Dashboard" right="WhatsApp Connected" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards agentPhone="85268712802" />
              <div className="px-4 lg:px-6">{/* <ChartAreaInteractive /> */}</div>

              <div className="mx-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="flex justify-between">
                    <CardTitle className="font-mono text-xl">Recent Blasts</CardTitle>
                    <Button>
                      Refresh
                      <RefreshCw size={14} className="ml-1" />
                    </Button>
                  </CardHeader>
                  <CardContent className="max-h-40 overflow-auto">
                    {dashboardData?.recentBlasts.map((blast, i) => (
                      <div key={i} className="flex justify-between border-b py-1">
                        <span>{blast.title}</span>
                        <span className="text-muted-foreground">
                          {blast.status} • {blast.sent}/{blast.failed}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex justify-between">
                    <CardTitle className="font-mono text-xl">Recent Activity</CardTitle>
                    <Button>
                      Refresh
                      <RefreshCw size={14} className="ml-1" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {dashboardData?.recentActivity.map((activity, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        {iconMap[activity.icon]}
                        <span>{activity.description}</span>
                        <span className="ml-auto text-xs text-muted-foreground">{formatDate(activity.timestamp)}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
