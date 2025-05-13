"use client";
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
import React, { useEffect, useState } from "react";
import axios from "axios";

interface BlastItem {
  title: string;
  sent: number;
  delivered: number;
  failed: number;
  date: string;
}


export default function Page() {
  const [blasts, setBlasts] = useState<BlastItem[]>([]);

  useEffect(() => {
    const fetchBlasts = async () => {
      try {
        const response = await axios.get("https://dealmaker.turoid.ai/api/blast-dashboard");
        console.log("✅ Fetched Blast Dashboard data:", response.data);
        setBlasts(response.data.blasts);
      } catch (error) {
        console.error("❌ Error fetching Blast Dashboard data:", error);
      }
    };
    fetchBlasts();
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
                    {/* 
                      We'll pass blasts data into your <BlastHistoryTable> if it accepts a "data" prop.
                      Adjust as needed for your actual table component’s props. 
                    */}
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
