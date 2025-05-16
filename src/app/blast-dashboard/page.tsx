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
  _id: string;
  title: string;
  sent: number;
  delivered: number;
  failed: number;
  date: string;
  status: string;
}

export default function Page() {
  const [blasts, setBlasts] = useState<BlastItem[]>([]);

  useEffect(() => {
    const fetchBlasts = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/blast-dashboard`);
        setBlasts(response.data);
      } catch (error) {
        console.error("❌ Error fetching Blast Dashboard data:", error);
      }
    };
    fetchBlasts();
  }, []);


  return (
    <SidebarProvider
      style={{ "--sidebar-width": "calc(var(--spacing) * 72)", "--header-height": "calc(var(--spacing) * 12)" } as React.CSSProperties}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader left="Blast Dashboard" right="" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="p-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Blast History</CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    <BlastHistoryTable data={blasts.map(({ _id, title, sent, delivered, failed, date }) => ({
                      title, sent, delivered, failed, date
                    }))} />
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
