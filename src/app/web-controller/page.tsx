import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/lib/SocketProvider";

export default function Page() {
  const { socket, isConnected } = useSocket();
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
        <SiteHeader left="Web Controller" right="" />
        <div className="p-6 space-y-6">
          {/* QR + Status */}
          <div className="flex justify-between h-80">
            {/* QR Code */}
            <Card className="flex items-center justify-center h-full w-fit">
              <CardContent className="flex items-center h-full flex-col gap-10">
                <div>Scan QR</div>
                <div className="w-52 h-52 rounded border bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">QR</span>
                </div>
              </CardContent>
            </Card>

            {/* Status & Instructions */}
            <Card className="w-2/3 flex justify-around">
              <CardHeader className="flex items-center justify-between">
                <Button variant="outline" size="sm" className="bg-green-100 text-green-700 border-green-600 hover:bg-green-100 hover:text-green-700">
                  Connected
                </Button>
                <Button size="sm" variant="outline">
                  Reconnect
                </Button>
              </CardHeader>
              <CardContent className="pt-2 pb-4 px-6">
                <ol className="list-decimal text-sm text-muted-foreground space-y-1 pl-4">
                  <li>Open WhatsApp on your mobile device.</li>
                  <li>
                    Go to <strong>Settings</strong>.
                  </li>
                  <li>
                    Select <strong>Linked Devices</strong>.
                  </li>
                  <li>
                    Tap <strong>Link a Device</strong>.
                  </li>
                  <li>Use your phone to scan the QR code on this page.</li>
                  <li>Wait for the connection to complete.</li>
                  <li>Do not close this browser window while connected.</li>
                </ol>
              </CardContent>
            </Card>
          </div>

          {/* Stream */}
          <Card>
            <CardHeader>
              <CardTitle>Live Stream</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-96 w-full bg-black rounded-b-lg flex items-center justify-center">
                <span className="text-white text-sm">[Stream Preview Placeholder]</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
