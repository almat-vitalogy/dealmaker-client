import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

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

interface DoneStepProps {
  selectedContacts: Contact[];
  message: MessageDetails;
  onReset: () => void;
}

const DoneStep: React.FC<DoneStepProps> = ({ selectedContacts, message, onReset }) => {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <div className="rounded-full bg-primary/20 p-4 mb-4">
        <Check size={48} className="text-primary" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Done!</h2>
      <p className="text-center text-muted-foreground max-w-xs">
        {message.isScheduled 
          ? `Your message has been scheduled to ${selectedContacts.length} recipient(s).`
          : `Your message has been sent to ${selectedContacts.length} recipient(s).`
        }
      </p>
      <Button className="mt-6" onClick={onReset}>
        Start New Message
      </Button>
    </div>
  );
};

export default DoneStep;