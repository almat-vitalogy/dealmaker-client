"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/lib/SocketProvider";
import { useEffect, useRef, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { CheckCircle, Loader2, XCircle } from "lucide-react";

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

  // useEffect(() => {
  //   return () => {
  //     if (streamStatus !== "Disconnected") {
  //       disconnect();
  //     }

  //     if (mediaSourceRef.current && mediaSourceRef.current.readyState === "open") {
  //       mediaSourceRef.current.endOfStream();
  //     }
  //   };
  // }, [disconnect, streamStatus]);

  useEffect(() => {
    if (isConnected && streamStatus === "Loading...") {
      setupVideoStream();
    }
  }, [isConnected, streamStatus]);

  const handleToggleStream = (checked: boolean) => {
    console.log(`checked: ${checked}`);
    if (checked) {
      console.log(`toggle connecting`);
      setStreamStatus("Loading...");
      connect();
    } else {
      console.log(`toggle disconnecting`);
      disconnect();
      if (mediaSourceRef.current && mediaSourceRef.current.readyState === "open") {
        mediaSourceRef.current.endOfStream();
      }
      setStreamStatus("Disconnected");
      if (videoRef.current) videoRef.current.src = "";
    }
  };

  const StatusIcon = () => {
    switch (streamStatus) {
      case "Connected":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "Loading...":
        return <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />;
      case "Disconnected":
        return <XCircle className="h-5 w-5 text-red-500" />;
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
                <div className="flex items-center space-x-2">
                  <StatusIcon />
                  <span
                    className={`
                                font-medium 
                                ${streamStatus === "Connected" ? "text-green-600" : ""}
                                ${streamStatus === "Loading..." ? "text-amber-500" : ""}
                                ${streamStatus === "Disconnected" ? "text-red-500" : ""}
                              `}
                  >
                    {streamStatus}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {/* <span className="text-sm text-muted-foreground">{streamStatus === "loading..." ? ""}</span> */}
                  <Switch
                    checked={streamStatus !== "Disconnected"}
                    onCheckedChange={handleToggleStream}
                    disabled={streamStatus === "Loading..."}
                    className="cursor-pointer"
                  />
                </div>
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
              <div className="h-fit w-full bg-black rounded-b-lg flex items-center justify-center">
                {/* <span className="text-white text-sm">[Stream Preview Placeholder]</span> */}
                <video ref={videoRef} controls autoPlay muted className="w-full h-full object-cover" />
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
