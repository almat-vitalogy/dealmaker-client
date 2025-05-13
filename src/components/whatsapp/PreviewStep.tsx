import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Contact {
  name: string;
  phone: string;
}

interface MessageDetails {
  theme?: string;
  content: string;
  scheduledTime?: string;
  isScheduled: boolean;
}

interface PreviewStepProps {
  selectedContacts: Contact[];
  message: MessageDetails;
}

const PreviewStep: React.FC<PreviewStepProps> = ({ selectedContacts, message }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Preview Message</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Recipients ({selectedContacts.length})</h3>
              <div className="bg-muted p-3 rounded-md max-h-32 overflow-y-auto">
                {selectedContacts.map((contact, index) => (
                  <div key={index} className="mb-1">
                    {contact.name} ({contact.phone})
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Message Content</h3>
              <div className="bg-muted p-3 rounded-md">
                {message.content || <span className="text-muted-foreground">No message content</span>}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Send Options</h3>
              <div className="bg-muted p-3 rounded-md">
                {message.isScheduled ? (
                  <div>
                    <span className="font-medium">Scheduled for:</span> {message.scheduledTime}
                  </div>
                ) : (
                  <div className="font-medium">Send immediately</div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PreviewStep;