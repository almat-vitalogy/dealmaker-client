"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";

// const SERVER_URL = "http://localhost:4000/";
const SERVER_URL = "https://api.turoid.ai/blast-server";

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      const socket = io(SERVER_URL);
      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("Socket connected");
        setIsConnected(true);
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected");
        setIsConnected(false);
      });

      socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
      });
    }

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
