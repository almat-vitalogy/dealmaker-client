import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CheckCircle, Clock, PlusCircle, RefreshCcw, RefreshCw, XCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
        <SiteHeader left="Contacts" right="" />
        <div className="p-6 space-y-6">
          {/* Top Cards: Import & Manual Entry */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Import Card */}
            <Card>
              <CardHeader>
                <CardTitle>Import Contacts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Upload a CSV, Excel, or Google Sheets file to import contacts.</p>
                <Button variant="outline">Upload File</Button>
                {/* In future, support drag & drop or integrations */}
              </CardContent>
            </Card>

            {/* Manual Entry Card */}
            <Card>
              <CardHeader>
                <CardTitle>Add Contact Manually</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="+852 9123 4567" />
                </div>
                <Button className="mt-2">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Contact
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact List */}
          <Card>
            <CardHeader>
              <CardTitle>Contact List</CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {/* Contact Row */}
              <div className="flex justify-between py-3">
                <span className="font-medium">John Doe</span>
                <span className="text-muted-foreground">+852 9123 4567</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="font-medium">Jane Chan</span>
                <span className="text-muted-foreground">+852 9876 5432</span>
              </div>
              {/* Add dynamic rows here later */}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
