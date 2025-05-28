"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BlastHistoryTable } from "@/components/ui/blast-history-table";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useClearLoadingOnRouteChange } from "@/hooks/useClearLoadingOnRouteChange";

interface BlastItem {
  title: string;
  recepients: string[];
  message: string;
  // sent: number;
  // delivered: number;
  // failed: number;
  date: string;
  // status: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toISOString().replace("T", ", ").substring(0, 17); // "2025-05-28, 10:16"
};

export default function BlastDashboardClient({ user }: { user: any }) {
  const [blasts, setBlasts] = useState<BlastItem[]>([]);
  useClearLoadingOnRouteChange();

  useEffect(() => {
    const fetchBlasts = async () => {
      const userEmail = encodeURIComponent(user.email);
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/blast-messages/${userEmail}`);
        const blastData = response.data.map((blast: any) => ({
          title: blast.title,
          // sent: blast.sent,
          // delivered: blast.delivered,
          // failed: blast.failed,
          date: formatDate(blast.createdAt),
          recepients: blast.contacts,
          message: blast.content,
          // status: blast.status,
        }));
        setBlasts(blastData);
        console.log("response: ", response.data);
      } catch (error) {
        console.error("❌ Error fetching Blast Dashboard data:", error);
      }
    };
    fetchBlasts();
  }, [user.email]);

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
              {/* <SectionCards userEmail={user.email} /> */}
              <div className="p-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Blast History</CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    <BlastHistoryTable
                      data={blasts.map(({ title, recepients, message, date }) => ({
                        title,
                        recepients,
                        message,
                        // sent,
                        // delivered,
                        // failed,
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
