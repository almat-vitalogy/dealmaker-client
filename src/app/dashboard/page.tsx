"use client";
import { AppSidebar } from "@/components/app-sidebar";
// import { ChartAreaInteractive } from "@/components/chart-area-interactive";
// import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CheckCircle, Clock, RefreshCcw, RefreshCw, XCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import React, { useEffect, useState } from "react";
import axios from "axios";

interface RecentBlast {
  title: string;
  status: string;
  sent: number;
  failed: number;
  date: string;
}

interface RecentActivity {
  icon: 'CheckCircle' | 'RefreshCcw' | 'XCircle' | 'Clock';
  text: string;
  time: string;
}


interface DashboardData {
  totalContacts: number;
  messagesSent: number;
  scheduledBlasts: number;
  successRate: number;
  recentBlast: RecentBlast; // <-- single object
  recentActivity: RecentActivity;
}

export default function Page() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get("https://dealmaker.turoid.ai/api/dashboard");
        console.log("✅ Dashboard data fetched:", response.data);
        setDashboardData(response.data);
      } catch (error) {
        console.error("❌ Error fetching Dashboard data:", error);
      }
    };
    fetchDashboard();
  }, []);

  const iconMap = {
    CheckCircle: <CheckCircle className="text-green-500 w-4 h-4" />,
    RefreshCcw: <RefreshCcw className="text-blue-500 w-4 h-4" />,
    XCircle: <XCircle className="text-red-500 w-4 h-4" />,
    Clock: <Clock className="text-yellow-500 w-4 h-4" />,
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
        <SiteHeader left="Dashboard" right="WhatsApp Connected" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">{/* <ChartAreaInteractive /> */}</div>
              {/* <DataTable data={data} /> */}
              <div className="mx-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className={``}>
                  <CardHeader className="flex justify-between">
                    <CardTitle className="font-mono text-xl">Recent Blasts</CardTitle>
                    <Button>
                      Refresh
                      <RefreshCw size={14} className="mr-1" />
                    </Button>
                  </CardHeader>
                  <CardContent className="max-h-40 overflow-auto">
                    {dashboardData?.recentBlast && (
                      <div className="flex justify-between border-b py-1">
                        <span>{dashboardData.recentBlast.title}</span>
                        <span className="text-muted-foreground">
                          {dashboardData.recentBlast.status} • {dashboardData.recentBlast.sent}/{dashboardData.recentBlast.failed}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className={``}>
                  <CardHeader className="flex justify-between">
                    <CardTitle className="font-mono text-xl">Recent Activity</CardTitle>
                    <Button>
                      Refresh
                      <RefreshCw size={14} className="mr-1" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {dashboardData?.recentActivity.map((activity, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        {iconMap[activity.icon]}
                        <span>{activity.text}</span>
                        <span className="ml-auto text-xs text-muted-foreground">{activity.time}</span>
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
