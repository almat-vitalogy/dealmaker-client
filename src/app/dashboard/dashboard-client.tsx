"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  CheckCircle,
  Clock,
  RefreshCcw,
  RefreshCw,
  XCircle,
  PlusCircle,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Play,
  Square,
  QrCode,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useClearLoadingOnRouteChange } from "@/hooks/useClearLoadingOnRouteChange";
import { useBlastStore } from "@/store/blast";

interface RecentBlast {
  title: string;
  status: string;
  sent: number;
  delivered: number;
  failed: number;
  createdAt: string;
}

interface RecentActivity {
  icon: "CheckCircle" | "RefreshCcw" | "XCircle" | "Clock" | "PlusCircle" | "MessageSquare" | "CheckCircle2";
  description: string;
  timestamp: string;
}

interface DashboardData {
  totalContacts: number;
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
  Trash2: <XCircle className="text-red-500 w-4 h-4" />, // Assuming trash2 is a typo for XCircle
  MessageCircle: <MessageSquare className="text-indigo-500 w-4 h-4" />, // Assuming MessageCircle is similar to MessageSquare
};

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    // timeZone: "Asia/Hong_Kong",
  })
    .format(new Date(dateString))
    .replace(/\//g, "-");
};

export default function DashboardClient({ user }: { user: any }) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const { connectUser, qrCodeUrl, disconnectUser, connectionStatus, userId } = useBlastStore();
  const userEmail = user?.email || "";

  useEffect(() => {
    const fetchDashboard = async () => {
      const userEmail = user.email;

      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/${encodeURIComponent(userEmail)}`);
        console.log("✅ Dashboard data fetched:", response.data);
        setDashboardData(response.data);
      } catch (error) {
        console.error("❌ Error fetching Dashboard data:", error);
      }
    };
    fetchDashboard();
  }, [user.email]);

  const StatusIcon = () => {
    switch (connectionStatus) {
      case "Disconnect":
        return <Square className="h-5 w-5 " />;
      case "Loading...":
        return <Loader2 className="h-5 w-5 animate-spin" />;
      case "Connect":
        return <Play className="h-5 w-5 " />;
    }
  };

  useClearLoadingOnRouteChange();

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
              <div className="px-6 w-full flex gap-4">
                {/* <Card className=" w-1/3">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-center">
                      <button
                        className={`    
                              font-medium rounded-lg p-2 cursor-pointer flex items-center justify-center gap-6
                              ${connectionStatus === "Disconnect" ? "bg-red-200" : ""}
                              ${connectionStatus === "Loading..." ? "bg-amber-200 opacity-50 cursor-not-allowed pointer-events-none" : ""}
                              ${connectionStatus === "Connect" ? "bg-green-200" : ""}
                            `}
                        onClick={() => {
                          if (connectionStatus === "Connect") connectUser(userEmail);
                          else disconnectUser(userEmail);
                        }}
                        disabled={connectionStatus === "Loading..."}
                      >
                        {connectionStatus}
                        <StatusIcon />
                      </button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 -mt-4 flex items-center justify-center">
                    {qrCodeUrl ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}${qrCodeUrl}`}
                        alt="QR Code"
                        className="w-48 h-48 object-contain rounded-lg border"
                      />
                    ) : (
                      <div className="w-48 h-48 bg-gray-100 rounded-lg border border-dashed border-gray-400 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">QR Code</span>
                      </div>
                    )}
                  </CardContent>
                </Card> */}
                <Card className=" w-1/3">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-center">
                      <button
                        className={`    
                              font-medium rounded-lg p-2 cursor-pointer flex items-center justify-center gap-6 w-48
                              ${connectionStatus === "Disconnect" ? "bg-green-200" : ""}
                              ${connectionStatus === "Loading..." ? "bg-amber-200 opacity-50 cursor-not-allowed pointer-events-none" : ""}
                              ${connectionStatus === "Connect" ? "bg-green-200" : ""}
                            `}
                        onClick={async () => {
                          if (connectionStatus === "Loading...") return;

                          if (!userId) {
                            // First time: just connect
                            await connectUser(userEmail);
                          } else {
                            // Already connected before: disconnect first, then reconnect
                            await disconnectUser(userEmail);
                            await connectUser(userEmail);
                          }
                        }}
                        disabled={connectionStatus === "Loading..."}
                      >
                        {connectionStatus === "Loading..." ? (
                          <div className="flex items-center justify-center gap-4">
                            Loading...
                            <Loader2 className="animate-spin w-4 h-4" />
                          </div>
                        ) : userId === "" ? (
                          <div className="flex items-center justify-center gap-4">
                            Get QR Code <QrCode />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-4">
                            Refresh QR Code <QrCode />
                          </div>
                        )}
                        {/* <StatusIcon /> */}
                      </button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 -mt-4 flex items-center justify-center">
                    {qrCodeUrl ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}${qrCodeUrl}`}
                        alt="QR Code"
                        className="w-48 h-48 object-contain rounded-lg border"
                      />
                    ) : (
                      <div className="w-48 h-48 bg-gray-100 rounded-lg border border-dashed border-gray-400 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">QR Code</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Instruction Card */}
                <Card className="w-2/3">
                  <CardHeader>
                    <h2 className="text-lg font-semibold text-gray-700">Important Notes</h2>
                  </CardHeader>
                  <CardContent className="space-y-5 text-sm text-gray-700 leading-relaxed">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 mt-1" />
                      <p className="flex-1">
                        After a successful connection, please <strong>wait 30–40 seconds</strong> before sending any messages.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <RefreshCw className="w-5 h-5 mt-1" />
                      <p className="flex-1">
                        <strong>The WhatsApp session will remain active</strong> — reloading the page, closing the browser, or restarting your
                        computer will <strong>not disconnect</strong> it. The connection stays intact until you manually press{" "}
                        <strong>Disconnect</strong>.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 mt-1" />
                      <p className="flex-1">
                        <strong>If you press Disconnect, all scheduled messages will be lost</strong> and will not be sent, even if you reconnect
                        later.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <SectionCards userEmail={user.email} />
              <div className="px-4 lg:px-6"></div>

              <div className="mx-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="flex justify-between">
                    <CardTitle className="font-mono text-xl">Recent Blasts</CardTitle>
                    <Button>
                      Refresh
                      <RefreshCw size={14} className="ml-1" />
                    </Button>
                  </CardHeader>
                  <CardContent className="max-h-45 overflow-auto">
                    {dashboardData?.recentBlasts.map((blast, i) => (
                      <div key={i} className="flex justify-between border-b py-1">
                        <span>{blast.title}</span>
                        <span className="text-muted-foreground">
                          {blast.status} {formatDate(blast.createdAt)}
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
