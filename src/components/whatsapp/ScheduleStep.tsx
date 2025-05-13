
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar, Send } from "lucide-react";

interface MessageDetails {
  theme?: string;
  content: string;
  scheduledTime?: string;
  isScheduled: boolean;
}

interface ScheduleStepProps {
  message: MessageDetails;
  setMessage: (message: MessageDetails) => void;
}

const ScheduleStep: React.FC<ScheduleStepProps> = ({ message, setMessage }) => {
  return (
    <div className="space-y-6">
      {/* <Card>
        <CardHeader>
          <CardTitle>Schedule Message</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Enter your date & time (24h)
              </label>
              <Input 
                type="datetime-local"
                value={message.scheduledTime}
                onChange={(e) => setMessage({...message, scheduledTime: e.target.value, isScheduled: !!e.target.value})}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Please select your preferred date and time.
            </p>
          </div>
        </CardContent>
      </Card> */}
      
      <Card>
        <CardHeader>
          <CardTitle>Send Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              className="w-full"
              variant={message.isScheduled ? "outline" : "default"}
              onClick={() => setMessage({...message, isScheduled: false})}
            >
              <Send className="mr-2" size={16} />
              Send Now
            </Button>
            <Button 
              className="w-full" 
              variant={message.isScheduled ? "default" : "outline"}
              onClick={() => setMessage({...message, isScheduled: true})}
            >
              <Calendar className="mr-2" size={16} />
              Schedule Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleStep;
