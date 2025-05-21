"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardData {
  totalContacts: number;
  messagesSent: number;
  scheduledBlasts: number;
  successRate: number;
}

export function SectionCards({ agentPhone }: { agentPhone: string }) {
  const [data, setData] = useState<DashboardData>({
    totalContacts: 0,
    messagesSent: 0,
    scheduledBlasts: 0,
    successRate: 0,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/${agentPhone}`);
        const fetchedData = response.data;
        console.log("✅ Dashboard data fetched:", fetchedData);
        console.log("✅ Dashboard fetchedData.blastMessages:", fetchedData.blastMessages);
        // Dynamically calculate totals
        const messagesSentCount = fetchedData.blastMessages.length;
        const scheduledBlastsCount = fetchedData.blastMessages.filter((blast: any) => blast.scheduled).length;

        setData({
          totalContacts: fetchedData.totalContacts,
          messagesSent: messagesSentCount,
          scheduledBlasts: scheduledBlastsCount,
          successRate: fetchedData.successRate,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    }

    fetchData();
  }, [agentPhone]);

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Contacts</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{data.totalContacts}</CardTitle>
          {/* <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction> */}
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Trending up this month <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Visitors for the last 6 months</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Messages Sent</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{data.messagesSent}</CardTitle>
          {/* <CardAction>
            <Badge variant="outline">
              <IconTrendingDown />
              -20%
            </Badge>
          </CardAction> */}
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Down 20% this period <IconTrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">Acquisition needs attention</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Scheduled Blasts</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{data.scheduledBlasts}</CardTitle>
          {/* <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction> */}
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Strong user retention <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Engagement exceed targets</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Success Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{data.successRate}%</CardTitle>
          {/* <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +4.5%
            </Badge>
          </CardAction> */}
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Steady performance <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Meets growth projections</div>
        </CardFooter>
      </Card>
    </div>
  );
}
