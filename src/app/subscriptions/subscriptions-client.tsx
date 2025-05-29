"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import StripeCheckoutButton from "@/components/StripeCheckoutButton";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SubscriptionsClientProps {
  user: any;
}

export default function SubscriptionsClient({ user }: SubscriptionsClientProps) {
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
        <SiteHeader left="Subscriptions" right="" />
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plans</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <h2 className="text-xl font-semibold">Premium Plan</h2>
              <p>Unlock advanced features and enhance your productivity.</p>
              <div className="mt-4">
                <StripeCheckoutButton />
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
