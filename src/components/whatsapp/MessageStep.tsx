
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface MessageDetails {
  theme?: string;
  content: string;
  scheduledTime?: string;
  isScheduled: boolean;
}

interface MessageStepProps {
  message: MessageDetails;
  setMessage: (message: MessageDetails) => void;
}

const MessageStep: React.FC<MessageStepProps> = ({ message, setMessage }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Message Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label htmlFor="theme" className="block text-sm font-medium mb-1">
                Message Theme
              </label>
              <Input 
                id="theme" 
                placeholder="e.g. Birthday greeting, Promo reminder" 
                value={message.theme || ""}
                onChange={(e) => setMessage({...message, theme: e.target.value})}
              />
            </div>
            <Button className="w-full">
              Generate Message
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Message Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <textarea 
              className="w-full h-32 p-3 border rounded-md" 
              placeholder="Generated or custom message will appear here..."
              value={message.content}
              onChange={(e) => setMessage({...message, content: e.target.value})}
            />
            <div className="flex justify-end">
              <Button variant="outline">
                Save as Template
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessageStep;