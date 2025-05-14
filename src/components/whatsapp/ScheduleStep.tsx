import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar, CheckCircle, Loader2, Send, XCircle } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "../ui/dialog";
import { useBlastStore } from "@/store/blast";
import { useSocket } from "@/lib/SocketProvider";
import axios from "axios";
const SERVER_URL = "https://dealmaker.turoid.ai";
import { DateTimePicker24hForm } from "../ui/date-time-picker";

const ScheduleStep = () => {
  const { contacts, message, setMessage, setContacts } = useBlastStore();
  const { isConnected } = useSocket();
  const [status, setStatus] = useState("");

  const sendWhatsAppMessage = async () => {
    if (!isConnected) return;

    const phoneList = contacts.map((contact) => contact.phone);
    console.log(phoneList);

    try {
      setStatus("loading");
      await axios.post(`${SERVER_URL}/send-message`, {
        phones: phoneList,
        message,
      });
      setStatus("success");
      setMessage("");
      setContacts(
        contacts.map((contact) => ({
          ...contact,
          selected: false,
        }))
      );
    } catch (error) {
      console.error("Error sending message:", error);
      setStatus("error");
    }
  };

  return (
    <div className="-mt-6">
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>Preview Message</CardTitle>
        </CardHeader>
        <CardContent className="-mt-5">
          <div className="space-y-6">
            <div>
              <h3 className="text-muted-foreground text-sm font-medium mb-2">Recipients ({contacts.filter((contact) => contact.selected).length})</h3>
              <div className="bg-muted p-3 rounded-md max-h-32 overflow-y-auto">
                {contacts.length != 0 &&
                  contacts.map((contact, index) => {
                    if (contact.selected) {
                      return (
                        <div key={index} className="mb-1">
                          {contact.name} ({contact.phone})
                        </div>
                      );
                    }
                  })}
                {!contacts.some((contact) => contact.selected) && <span className="text-muted-foreground">No recepients</span>}
              </div>
            </div>

            <div>
              <h3 className="text-muted-foreground text-sm font-medium mb-2">Message Content</h3>
              <div className="bg-muted p-3 rounded-md max-h-[350px] overflow-auto">
                {message || <span className="text-muted-foreground">No message content</span>}
              </div>
            </div>
          </div>
        </CardContent>

        <CardHeader>
          <CardTitle>Send Options</CardTitle>
        </CardHeader>
        <CardContent className="-mt-5">
          <div className="space-y-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full" variant={"default"}>
                  {!status && <Send className="mr-2" size={16} />}
                  {status === "loading" && <Loader2 className="mr-2 animate-spin" size={16} />}
                  {status === "success" && <CheckCircle className="mr-2" size={16} />}
                  {status === "error" && <XCircle className="mr-2" size={16} />}
                  Send Now
                </Button>
              </DialogTrigger>
              <DialogContent className="w-96 flex flex-col items-center">
                <DialogTitle>Do you want to send this message?</DialogTitle>
                <DialogDescription className="hidden">This action will log you out of your account.</DialogDescription>
                <div className="flex gap-4 mt-4 w-full">
                  <DialogClose
                    onClick={sendWhatsAppMessage}
                    // className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg transition w-1/2 cursor-pointer"
                    className={`px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg transition w-1/2  duration-200 ${
                      status === "loading" || !contacts || !message ? "cursor-not-allowed" : "cursor-pointer"
                    }`}
                    disabled={status === "loading" || !contacts || !message}
                  >
                    {status === "loading" ? "Sending..." : "Send Message"}
                  </DialogClose>
                  <DialogClose className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition w-1/2">
                    Cancel
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>
            <Button className="w-full" variant={"outline"}>
              <DateTimePicker24hForm></DateTimePicker24hForm>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleStep;
