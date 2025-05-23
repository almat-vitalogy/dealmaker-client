"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BlastHistoryTable } from "@/components/ui/blast-history-table";
import React, { useEffect, useState } from "react";
import axios from "axios";

interface BlastItem {
  title: string;
  sent: number;
  delivered: number;
  failed: number;
  date: string;
  status: string;
}

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

export default function BlastDashboardClient({ user }: { user: any }) {
  const [blasts, setBlasts] = useState<BlastItem[]>([]);

  useEffect(() => {
    const fetchBlasts = async () => {
      const agentPhone = "85268712802"; // dynamically use logged-in agent's phone
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/${agentPhone}`);
        const blastData = response.data.blastMessages.map((blast: any) => ({
          title: blast.title,
          sent: blast.sent,
          delivered: blast.delivered,
          failed: blast.failed,
          date: formatDate(blast.createdAt),
          status: blast.status,
        }));
        setBlasts(blastData);
      } catch (error) {
        console.error("❌ Error fetching Blast Dashboard data:", error);
      }
    };
    fetchBlasts();
  }, []);

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "calc(var(--spacing) * 72)", "--header-height": "calc(var(--spacing) * 12)" } as React.CSSProperties}
    >
      <AppSidebar variant="inset" user={user} />
      <SidebarInset>
        <SiteHeader left="Blast Dashboard" right="" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards agentPhone="85268712802" />
              <div className="p-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Blast History</CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    <BlastHistoryTable
                      data={blasts.map(({ title, sent, delivered, failed, date }) => ({
                        title,
                        sent,
                        delivered,
                        failed,
                        date,
                      }))}
                    />
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
