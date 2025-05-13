"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
import { useSocket } from "@/lib/SocketProvider";
import { useEffect, useRef, useState } from "react";

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useWhatsAppIntegration } from "@/hooks/useWhatsAppIntegration";
import ContactsStep from "@/components/whatsapp/ContactsStep";
import MessageStep from "@/components/whatsapp/MessageStep";
import ScheduleStep from "@/components/whatsapp/ScheduleStep";
import PreviewStep from "@/components/whatsapp/PreviewStep";
import DoneStep from "@/components/whatsapp/DoneStep";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

type ConnectionStatus = "Disconnected" | "Loading..." | "Connected";

export default function Page() {
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const [streamStatus, setStreamStatus] = useState<ConnectionStatus>("Disconnected");

  const { socket, isConnected, connect, disconnect } = useSocket();

  // Set up the media source when the stream starts
  const setupVideoStream = () => {
    const mediaSource = new MediaSource();
    mediaSourceRef.current = mediaSource;

    if (videoRef.current) {
      videoRef.current.src = URL.createObjectURL(mediaSource);
    }

    mediaSource.addEventListener("sourceopen", () => {
      const mimeCodec = 'video/webm; codecs="vp8"';
      const sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);
      sourceBufferRef.current = sourceBuffer;

      sourceBuffer.mode = "segments";

      // Start the stream
      socket?.emit("start-stream", { url: "https://web.whatsapp.com/" });
    });
  };

  useEffect(() => {
    if (!socket) return;

    // Setup video stream event listeners
    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setStreamStatus("Disconnected");
    });

    socket.on("video-stream", (chunk: ArrayBuffer) => {
      if (sourceBufferRef.current && !sourceBufferRef.current.updating) {
        sourceBufferRef.current.appendBuffer(chunk);
      }
      // Once we receive the first chunk, consider the stream connected
      if (streamStatus === "Loading...") {
        setStreamStatus("Connected");
      }
    });

    socket.on("stream-ended", () => {
      if (mediaSourceRef.current && mediaSourceRef.current.readyState === "open") {
        mediaSourceRef.current.endOfStream();
      }
      setStreamStatus("Disconnected");
    });

    socket.on("stream-error", (error) => {
      console.error("Stream error:", error);
      setStreamStatus("Disconnected");
    });

    return () => {
      socket.off("video-stream");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("stream-ended");
      socket.off("stream-error");
    };
  }, [socket]);

  useEffect(() => {
    if (isConnected && streamStatus === "Loading...") {
      setupVideoStream();
    }
  }, [isConnected, streamStatus]);

  const {
    currentStep,
    setCurrentStep,
    totalSteps,
    contacts,
    newContact,
    setNewContact,
    message,
    setMessage,
    selectedContacts,
    handleAddContact,
    handleSelectContact,
    handleNext,
    handlePrevious,
    resetForm,
  } = useWhatsAppIntegration();

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
          {/* Stream */}
          <Card>
            <CardHeader>
              <CardTitle>Live Stream</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-fit w-full bg-black rounded-b-lg flex items-center justify-center">
                {/* <span className="text-white text-sm">[Stream Preview Placeholder]</span> */}
                <video ref={videoRef} controls autoPlay muted className="w-full h-full object-cover" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent> 
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                WhatsApp Integration
              </h2>
            </div>
              <Carousel
                  setApi={(api) => {
                    api?.on('select', () => setCurrentStep(api.selectedScrollSnap()));
                  }}
                  opts={{ startIndex: currentStep }}
                >
                  <CarouselContent>
                    <CarouselItem><ContactsStep contacts={contacts} selectedContacts={selectedContacts} newContact={newContact} setNewContact={setNewContact} handleAddContact={handleAddContact} handleSelectContact={handleSelectContact} /></CarouselItem>
                    <CarouselItem><MessageStep message={message} setMessage={setMessage} /></CarouselItem>
                    <CarouselItem><ScheduleStep message={message} setMessage={setMessage} /></CarouselItem>
                    <CarouselItem><PreviewStep selectedContacts={selectedContacts} message={message} /></CarouselItem>
                    <CarouselItem><DoneStep selectedContacts={selectedContacts} message={message} onReset={resetForm} /></CarouselItem>
                  </CarouselContent>
                  <div className="flex justify-between items-center mt-6">
                    {currentStep >= 0 && currentStep < 4 && (
                      <Button 
                        variant="outline" 
                        onClick={handlePrevious} 
                        disabled={currentStep === 0}
                        className="flex items-center"
                      >
                        <ArrowLeft className="mr-2" size={16} /> Previous
                      </Button>
                    )}
                    
                    {/* Step indicator in the middle */}
                    <div className="text-sm text-muted-foreground mx-auto absolute bottom-2 right-1/2">
                      Step {currentStep + 1} of {totalSteps}
                    </div>
                    
                    {currentStep < 4 && (
                      <Button 
                        onClick={handleNext}
                        className="flex items-center"
                      >
                        {currentStep === 3 ? 'Send Message' : 'Next'} <ArrowRight className="ml-2" size={16} />
                      </Button>
                    )}
                  </div>
                </Carousel>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
