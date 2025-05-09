import { AppSidebar } from "@/components/app-sidebar";
// import { ChartAreaInteractive } from "@/components/chart-area-interactive";
// import { DataTable } from "@/components/data-table";
// import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CalendarIcon, SendIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker24hForm } from "@/components/ui/date-time-picker";

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
        <SiteHeader left="Message Composer" right="" />
        <div className="p-6 space-y-6">
          {/* AI Generator */}
          <Card>
            <CardHeader>
              <CardTitle>AI Message Generator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label htmlFor="theme">Message Theme</Label>
              <Input id="theme" placeholder="e.g. Birthday greeting, Promo reminder" />
              <Button className="mt-2">Generate Message</Button>
            </CardContent>
          </Card>

          {/* Message Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Message Editor</CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <Textarea placeholder="Generated or custom message will appear here..." rows={10} className="w-full resize-none" />
              <div className="flex justify-end mt-4">
                <Button variant="outline">Save as Template</Button>
              </div>
            </CardContent>
          </Card>

          {/* Schedule & Send */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Schedule Options */}
            <Card>
              <CardHeader>
                <CardTitle>Schedule Message</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <DateTimePicker24hForm></DateTimePicker24hForm>
              </CardContent>
            </Card>

            {/* Send Options */}
            <Card>
              <CardHeader>
                <CardTitle>Send Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" variant="default">
                  <SendIcon className="mr-2 h-4 w-4" /> Send Now
                </Button>
                <Button className="w-full" variant="outline">
                  <CalendarIcon className="mr-2 h-4 w-4" /> Schedule Send
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
