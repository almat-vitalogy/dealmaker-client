import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CheckCircle, Clock, RefreshCcw, RefreshCw, XCircle } from "lucide-react";

import data from "./data.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const recentBlasts = [
  { title: "New Year Greetings", status: "Completed", sent: 148, failed: 2, date: "Jan 1, 2025" },
  { title: "Policy Reminder", status: "Completed", sent: 74, failed: 1, date: "Jan 10, 2025" },
  { title: "Valentine Promo", status: "Scheduled", sent: 0, failed: 0, date: "Feb 1, 2025" },
  { title: "New Year Greetings", status: "Completed", sent: 148, failed: 2, date: "Jan 1, 2025" },
];

const recentActivity = [
  { icon: <CheckCircle className="text-green-500 w-4 h-4" />, text: "Birthday greetings sent to 50 clients", time: "10 minutes ago" },
  { icon: <RefreshCcw className="text-blue-500 w-4 h-4" />, text: 'Contact list "VIP Clients" updated', time: "1 hour ago" },
  { icon: <XCircle className="text-red-500 w-4 h-4" />, text: "WhatsApp session expired", time: "3 hours ago" },
  { icon: <Clock className="text-yellow-500 w-4 h-4" />, text: "Scheduled renewal reminders for tomorrow", time: "5 hours ago" },
];

export default function Page() {
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
                  <CardContent className={`flex flex-col gap-2 max-h-40 overflow-auto`}>
                    {recentBlasts.map((blast, i) => (
                      <div key={i} className="flex justify-between border-b">
                        <span>{blast.title}</span>
                        <span className="text-gray-500">
                          {blast.status} • {blast.sent}/{blast.failed}
                        </span>
                      </div>
                    ))}
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
                    {recentActivity.map((activity, i) => (
                      <div key={i} className="flex items-center text-sm space-x-2">
                        {activity.icon}
                        <span>{activity.text}</span>
                        <span className="text-muted-foreground ml-auto text-xs">{activity.time}</span>
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
