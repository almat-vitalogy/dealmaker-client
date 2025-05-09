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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { DateTimePicker24hForm } from "@/components/ui/date-time-picker";
// import { BlastHistoryTable } from "@/components/ui/blast-history-table";

const activityFeed = [
  {
    id: 1,
    icon: Send,
    title: "Message Sent",
    description: "Blast message '🎉 Birthday Promo' sent to 120 contacts.",
    timestamp: "2 mins ago",
  },
  {
    id: 2,
    icon: PlusCircle,
    title: "New Contact Added",
    description: "Manually added contact: Jane Chan (+852 9876 5432).",
    timestamp: "15 mins ago",
  },
  {
    id: 3,
    icon: RefreshCcw,
    title: "Reconnected",
    description: "WhatsApp session reconnected successfully.",
    timestamp: "1 hour ago",
  },
  {
    id: 4,
    icon: MessageSquare,
    title: "Template Saved",
    description: "Saved new template: '💬 Follow-up Reminder'",
    timestamp: "2 hours ago",
  },
  {
    id: 5,
    icon: CheckCircle2,
    title: "Sync Complete",
    description: "Google Sheet import completed without issues.",
    timestamp: "Yesterday",
  },
  {
    id: 6,
    icon: XCircle,
    title: "Send Failed",
    description: "Blast message 'Promo Alert' failed for 3 contacts.",
    timestamp: "2 days ago",
  },
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
        <SiteHeader left="Activity Feed" right="" />
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {activityFeed.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="flex items-start gap-4">
                    <div className="rounded-full bg-muted p-2">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 space-y-0.5">
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
