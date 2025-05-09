import { AppSidebar } from "@/components/app-sidebar";
// import { ChartAreaInteractive } from "@/components/chart-area-interactive";
// import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
// import { CalendarIcon, CheckCircle, Clock, PlusCircle, RefreshCcw, RefreshCw, SendIcon, XCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { DateTimePicker24hForm } from "@/components/ui/date-time-picker";
import { BlastHistoryTable } from "@/components/ui/blast-history-table";
// export const columns = [
//   { accessorKey: "title", header: "Title" },
//   { accessorKey: "sent", header: "Sent" },
//   { accessorKey: "delivered", header: "Delivered" },
//   { accessorKey: "failed", header: "Failed" },
//   { accessorKey: "date", header: "Date" },
// ];

// export const data = [
//   {
//     title: "🎉 Birthday Promo",
//     sent: 120,
//     delivered: 115,
//     failed: 5,
//     date: "2025-04-29 15:00",
//   },
//   {
//     title: "💬 Follow-up Message",
//     sent: 98,
//     delivered: 97,
//     failed: 1,
//     date: "2025-04-28 18:30",
//   },
// ];

// const converted = data.map((item, index) => ({
//   id: index,
//   header: item.title,
//   type: "Blast",
//   status: "Done",
//   target: item.sent.toString(),
//   limit: "N/A",
//   reviewer: "System",
// }));

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
        <SiteHeader left="Blast Dashboard" right="" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />

              <div className="p-6 space-y-6">
                {/* Blast History Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Blast History</CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    {/* <DataTable data={converted} /> */}
                    <BlastHistoryTable></BlastHistoryTable>
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
