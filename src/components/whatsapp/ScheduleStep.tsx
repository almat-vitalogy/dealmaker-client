import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2, Send, XCircle } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "../ui/dialog";
import { useBlastStore } from "@/store/blast";
import { DateTimePicker24hForm } from "../ui/date-time-picker";

const ScheduleStep = () => {
  const { contacts, message, selectedContacts, sendMessage, messageStatus } = useBlastStore();

  return (
    <div className="-mt-6">
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>Preview Message</CardTitle>
        </CardHeader>
        <CardContent className="-mt-5">
          <div className="space-y-6">
            <div>
              <h3 className="text-muted-foreground text-sm font-medium mb-2">Recipients ({selectedContacts.length})</h3>
              <div className="bg-muted p-3 rounded-md max-h-32 overflow-y-auto">
                {selectedContacts.length != 0 &&
                  selectedContacts.map((phone, index) => {
                    return (
                      <div key={index} className="mb-1">
                        {phone}
                      </div>
                    );
                  })}
                {selectedContacts.length == 0 && <span className="text-muted-foreground">No recepients</span>}
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
                  {!messageStatus && <Send className="mr-2" size={16} />}
                  {messageStatus === "loading" && <Loader2 className="mr-2 animate-spin" size={16} />}
                  {messageStatus === "success" && <CheckCircle className="mr-2" size={16} />}
                  {messageStatus === "error" && <XCircle className="mr-2" size={16} />}
                  Send Now
                </Button>
              </DialogTrigger>
              <DialogContent className="w-96 flex flex-col items-center">
                <DialogTitle>Do you want to send this message?</DialogTitle>
                <DialogDescription className="hidden"></DialogDescription>
                <div className="flex gap-4 mt-4 w-full">
                  <DialogClose
                    onClick={sendMessage}
                    className={`px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg transition w-1/2  duration-200 ${
                      messageStatus === "loading" || !contacts || !message ? "cursor-not-allowed" : "cursor-pointer"
                    }`}
                    disabled={messageStatus === "loading" || !contacts || !message}
                  >
                    {messageStatus === "loading" ? "Sending..." : "Send Message"}
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
