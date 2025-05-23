"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Loader2, Play, Square, Clock, RefreshCw, AlertTriangle } from "lucide-react";
import { useBlastStore } from "@/store/blast";
import ContactsStep from "@/components/whatsapp/ContactsStep";
import MessageStep from "@/components/whatsapp/MessageStep";
import ScheduleStep from "@/components/whatsapp/ScheduleStep";

export default function WebControllerClient({ user }: { user: any }) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { connectUser, qrCodeUrl, disconnectUser, connectionStatus } = useBlastStore();

  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    };

    onSelect(); // set initial
    carouselApi.on("select", onSelect);

    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  const StatusIcon = () => {
    switch (connectionStatus) {
      case "Disconnect":
        return <Square className="h-5 w-5 " />;
      case "Loading...":
        return <Loader2 className="h-5 w-5 animate-spin" />;
      case "Connect":
        return <Play className="h-5 w-5 " />;
    }
  };

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
        <SiteHeader left="Web Controller" right="" />
        <div className="p-6 space-y-6">
          {/* Connection */}
          <div className="w-full flex gap-6">
            <Card className="p-6 w-1/3">
              <CardHeader>
                <CardTitle className="flex items-center justify-center">
                  <button
                    className={`    
                              font-medium rounded-lg p-2 cursor-pointer flex items-center justify-center gap-6
                              ${connectionStatus === "Disconnect" ? "bg-red-200" : ""}
                              ${connectionStatus === "Loading..." ? "bg-amber-200 opacity-50 cursor-not-allowed pointer-events-none" : ""}
                              ${connectionStatus === "Connect" ? "bg-green-200" : ""}
                            `}
                    onClick={() => {
                      if (connectionStatus === "Connect") connectUser();
                      else disconnectUser();
                    }}
                    disabled={connectionStatus === "Loading..."}
                  >
                    {connectionStatus}
                    <StatusIcon />
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 -mt-4 flex items-center justify-center">
                {qrCodeUrl ? (
                  <img src={`${process.env.NEXT_PUBLIC_API_URL}${qrCodeUrl}`} alt="QR Code" className="w-48 h-48 object-contain rounded-lg border" />
                ) : (
                  <div className="w-48 h-48 bg-gray-100 rounded-lg border border-dashed border-gray-400 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">QR Code</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instruction Card */}
            <Card className="w-2/3 p-6">
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-700">Important Notes</h2>
              </CardHeader>
              <CardContent className="space-y-5 text-sm text-gray-700 leading-relaxed">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 mt-1" />
                  <p className="flex-1">
                    After a successful connection, please <strong>wait 30–40 seconds</strong> before sending any messages.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 mt-1" />
                  <p className="flex-1">
                    <strong>The WhatsApp session will remain active</strong> — reloading the page, closing the browser, or restarting your computer
                    will <strong>not disconnect</strong> it. The connection stays intact until you manually press <strong>Disconnect</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 mt-1" />
                  <p className="flex-1">
                    <strong>If you press Disconnect, all scheduled messages will be lost</strong> and will not be sent, even if you reconnect later.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="relative p-6">
            <CardHeader className="text-center text-lg">
              <CardTitle>Send Message</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Carousel className="h-[700px]" setApi={setCarouselApi}>
                <CarouselContent>
                  <CarouselItem>
                    <ContactsStep user={user} />
                  </CarouselItem>
                  <CarouselItem>
                    <MessageStep />
                  </CarouselItem>
                  <CarouselItem>
                    <ScheduleStep />
                  </CarouselItem>
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
              <div className="flex justify-center mt-4 space-x-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i === currentSlide ? "bg-primary" : "bg-gray-300"} transition-all duration-300`} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
