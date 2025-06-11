import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2, Send, XCircle, Clock, CalendarIcon } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "../ui/dialog";
import { useBlastStore } from "@/store/blast";
// import { useState } from "react";
// import { format } from "date-fns";
// import { toast } from "sonner";

const ScheduleStep = ({ user }: any) => {
  const { contacts, message, selectedContacts, sendMessage, messageStatus } = useBlastStore();
  // const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  // const [isScheduling, setIsScheduling] = useState(false);

  const userEmail = user.email || "";

  // const handleScheduleMessage = async () => {
  //   if (!scheduledDate) {
  //     toast.error("Please select a date and time");
  //     return;
  //   }

  //   if (scheduledDate <= new Date()) {
  //     toast.error("Scheduled time must be in the future");
  //     return;
  //   }

  //   if (!selectedContacts.length || !message) {
  //     toast.error("Please select contacts and compose a message");
  //     return;
  //   }

  //   setIsScheduling(true);

  //   try {
  //     // You'll need to implement this function in your store or create a new API call
  //     const response = await fetch("/api/schedule-message", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         userId: user.userId, // Make sure you have access to userId
  //         phoneNumbers: selectedContacts,
  //         message: message,
  //         userEmail: userEmail,
  //         title: `Scheduled message - ${format(scheduledDate, "MMM d, yyyy 'at' HH:mm")}`,
  //         scheduleDate: scheduledDate.toISOString(),
  //       }),
  //     });

  //     if (response.ok) {
  //       toast.success(`Message scheduled for ${format(scheduledDate, "MMM d, yyyy 'at' HH:mm")}`);
  //       setScheduledDate(undefined); // Reset the date picker
  //     } else {
  //       const error = await response.json();
  //       toast.error(error.error || "Failed to schedule message");
  //     }
  //   } catch (error) {
  //     console.error("Error scheduling message:", error);
  //     toast.error("Failed to schedule message");
  //   } finally {
  //     setIsScheduling(false);
  //   }
  // };

  return (
    <div className="-mt-6">
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle className="mx-auto">3. Save, Send, or Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <CardTitle className="mb-2">Recipients ({selectedContacts.length})</CardTitle>
              <div className="bg-muted p-3 rounded-md max-h-32 overflow-y-auto">
                {selectedContacts.length != 0 &&
                  selectedContacts.map((phone, index) => {
                    return (
                      <div key={index} className="mb-1">
                        {phone}
                      </div>
                    );
                  })}
                {selectedContacts.length == 0 && <span className="text-muted-foreground">No recipients</span>}
              </div>
            </div>

            <div>
              <CardTitle className="mb-2">Message Content</CardTitle>
              <div className="bg-muted p-3 rounded-md max-h-[350px] overflow-auto">
                {message || <span className="text-muted-foreground">No message content</span>}
              </div>
            </div>
          </div>
        </CardContent>

        <CardHeader></CardHeader>
        <CardContent className="-mt-5">
          <div className="space-y-4">
            {/* Send Now Button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full" variant={"default"}>
                  {!messageStatus && <Send className="mr-2" size={16} />}
                  {messageStatus === "loading" && <Loader2 className="mr-2 animate-spin" size={16} />}
                  {messageStatus === "success" && <CheckCircle className="mr-2" size={16} />}
                  {messageStatus === "error" && <XCircle className="mr-2" size={16} />}
                  {messageStatus === "loading" ? "Sending..." : messageStatus === "success" ? "Sent" : "Send Message"}
                </Button>
              </DialogTrigger>
              <DialogContent className="w-96 flex flex-col items-center">
                <DialogTitle>Do you want to send this message?</DialogTitle>
                <DialogDescription className="hidden"></DialogDescription>
                <div className="flex gap-4 mt-4 w-full">
                  <DialogClose
                    onClick={() => sendMessage(userEmail)}
                    className={`px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg transition w-1/2 duration-200 ${
                      messageStatus === "loading" || !contacts || !message ? "cursor-not-allowed" : "cursor-pointer"
                    }`}
                    disabled={messageStatus === "loading" || !contacts || !message}
                  >
                    Send Now
                  </DialogClose>
                  <DialogClose className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition w-1/2">
                    Cancel
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>

            {/* Schedule Button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">
                  {/* <DateTimePicker24hForm value={scheduledDate} onChange={setScheduledDate} placeholder="Schedule Send" /> */}
                  <CalendarIcon className="mr-2" size={16} />
                  Schedule Send
                </Button>
              </DialogTrigger>
              <DialogContent className="w-96 flex flex-col items-center">
                <DialogTitle>Schedule Message</DialogTitle>
                <DialogDescription className="text-center mb-4 hidden">
                  {/* {scheduledDate ? (
                    <>
                      Your message will be sent on <strong>{format(scheduledDate, "PPPP 'at' HH:mm")}</strong>
                    </>
                  ) : (
                    "Please select a date and time to schedule your message"
                  )} */}
                </DialogDescription>
                {/* <div className="w-full mb-4">
                  <DateTimePicker24hForm value={scheduledDate} onChange={setScheduledDate} placeholder="Select date and time" />
                </div>

                <div className="flex gap-4 mt-4 w-full">
                  <DialogClose
                    onClick={handleScheduleMessage}
                    className={`px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg transition w-1/2 duration-200 ${
                      isScheduling || !scheduledDate || !selectedContacts.length || !message
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer hover:bg-primary/90"
                    }`}
                    disabled={isScheduling || !scheduledDate || !selectedContacts.length || !message}
                  >
                    {isScheduling ? (
                      <>
                        <Loader2 className="mr-2 animate-spin" size={16} />
                        Scheduling...
                      </>
                    ) : (
                      <>
                        <Clock className="mr-2" size={16} />
                        Schedule
                      </>
                    )}
                  </DialogClose>
                  <DialogClose className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition w-1/2">
                    Cancel
                  </DialogClose>
                </div> */}
                Coming soon...
              </DialogContent>
            </Dialog>

            {/* Display selected schedule time */}
            {/* {scheduledDate && (
              <div className="text-sm text-muted-foreground text-center p-2 bg-muted rounded-md">
                Scheduled for: {format(scheduledDate, "MMM d, yyyy 'at' HH:mm")}
              </div>
            )} */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleStep;
