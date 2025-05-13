"use client";

import { createContext, useContext, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";

// const SERVER_URL = "http://localhost:5001/";
// const SERVER_URL = "https://api.turoid.ai/blast-server";
const SERVER_URL = "https://dealmaker.turoid.ai/";

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
};

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const connect = () => {
    // Don't create a new socket if one already exists and is connected
    if (socketRef.current?.connected) {
      console.log("Socket already connected");
      return;
    }

    // Disconnect existing socket if there is one
    if (socketRef.current) {
      console.log("disconnecting existing socket");
      socketRef.current.disconnect();
    }

    console.log("Creating new socket connection");
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
  };

  const disconnect = () => {
    console.log("Disconnecting socket");
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        connect,
        disconnect,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
