"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSocket } from "@/lib/SocketProvider";
import { useEffect, useRef, useState } from "react";
import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useWhatsAppIntegration } from "@/hooks/useWhatsAppIntegration";
import ContactsStep from "@/components/whatsapp/ContactsStep";
import MessageStep from "@/components/whatsapp/MessageStep";
import ScheduleStep from "@/components/whatsapp/ScheduleStep";
import DoneStep from "@/components/whatsapp/DoneStep";
import { Loader2, Play, Square } from "lucide-react";
import { useBlastStore } from "@/store/blast";

type ConnectionStatus = "Start Streaming" | "Loading..." | "Stop Streaming";

export default function Page() {
  const { socket, isConnected, connect, disconnect } = useSocket();
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const [streamStatus, setStreamStatus] = useState<ConnectionStatus>("Start Streaming");
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { contacts, message, setContacts, setMessage } = useBlastStore();

  // const [message, setMessage] = useState("");
  const totalSlides = 3;

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
      setStreamStatus("Start Streaming");
    });

    socket.on("video-stream", (chunk: ArrayBuffer) => {
      if (sourceBufferRef.current && !sourceBufferRef.current.updating) {
        sourceBufferRef.current.appendBuffer(chunk);
      }
      // Once we receive the first chunk, consider the stream connected
      if (streamStatus === "Loading...") {
        setStreamStatus("Stop Streaming");
      }
    });

    socket.on("stream-ended", () => {
      if (mediaSourceRef.current && mediaSourceRef.current.readyState === "open") {
        mediaSourceRef.current.endOfStream();
      }
      setStreamStatus("Start Streaming");
    });

    socket.on("stream-error", (error) => {
      console.error("Stream error:", error);
      setStreamStatus("Start Streaming");
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
    switch (streamStatus) {
      case "Stop Streaming":
        return <Square className="h-5 w-5 " />;
      case "Loading...":
        return <Loader2 className="h-5 w-5 animate-spin" />;
      case "Start Streaming":
        return <Play className="h-5 w-5 " />;
    }
  };

  const handleToggleStream = () => {
    if (streamStatus === "Start Streaming") {
      console.log(`toggle connecting`);
      setStreamStatus("Loading...");
      connect();
    } else if (streamStatus !== "Loading...") {
      console.log(`toggle disconnecting`);
      disconnect();
      if (mediaSourceRef.current && mediaSourceRef.current.readyState === "open") {
        mediaSourceRef.current.endOfStream();
      }
      setStreamStatus("Start Streaming");
      if (videoRef.current) videoRef.current.src = "";
    }
  };

  // const sendWhatsAppMessage = async () => {
  //   const phoneList = phones
  //     .split(",")
  //     .map((phone) => phone.trim())
  //     .filter((phone) => phone);
  //   console.log(phoneList);

  //   try {
  //     setStatus("loading");
  //     await axios.post(`${SERVER_URL}/send-message`, {
  //       phones: phoneList,
  //       message,
  //     });
  //     setStatus("success");
  //     setMessage("");
  //   } catch (error) {
  //     console.error("Error sending message:", error);
  //     setStatus("error");
  //   }
  // };

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
          <Card className="py-2">
            <CardHeader className="flex py-2 my-0 justify-center">
              {/* <CardTitle>Live Stream</CardTitle> */}
              <div className="flex items-center my-0">
                {/* <Switch
                  checked={streamStatus !== "Start Streaming"}
                  onCheckedChange={handleToggleStream}
                  disabled={streamStatus === "Loading..."}
                  className="cursor-pointer mr-10"
                /> */}
                {/* <StatusIcon /> */}
                <button
                  className={`    
                              mr-5 font-medium rounded-lg p-2 cursor-pointer flex items-center justify-center gap-6
                              ${streamStatus === "Stop Streaming" ? "bg-red-200" : ""}
                              ${streamStatus === "Loading..." ? "bg-amber-200" : ""}
                              ${streamStatus === "Start Streaming" ? "bg-green-200" : ""}
                            `}
                  // checked={streamStatus !== "Start Streaming"}
                  onClick={() => handleToggleStream()}
                  disabled={streamStatus === "Loading..."}
                  // className="cursor-pointer mr-10"
                >
                  {streamStatus}
                  <StatusIcon />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-0 -mt-4">
              <div className="h-fit w-full bg-black rounded-b-lg flex items-center justify-center">
                <video ref={videoRef} controls autoPlay muted className="w-full h-full object-cover" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative p-6">
            <CardHeader className="text-center text-lg">
              <CardTitle>Send Message</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Carousel className="h-[700px]" setApi={setCarouselApi}>
                <CarouselContent>
                  <CarouselItem>
                    <ContactsStep />
                  </CarouselItem>
                  <CarouselItem>
                    <MessageStep />
                  </CarouselItem>
                  <CarouselItem>
                    <ScheduleStep />
                  </CarouselItem>
                  {/* <CarouselItem>
                    <PreviewStep selectedContacts={selectedContacts} message={message} />
                  </CarouselItem> */}
                  {/* <CarouselItem>
                    <DoneStep selectedContacts={selectedContacts} message={message} onReset={resetForm} />
                  </CarouselItem> */}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
              <div className="flex justify-center mt-4 space-x-2">
                {Array.from({ length: totalSlides }).map((_, i) => (
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
