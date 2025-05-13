import { useState } from "react";

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

export const useWhatsAppIntegration = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [contacts, setContacts] = useState<Contact[]>([
    { name: "John Doe", phone: "+852 9123 4567" },
    { name: "Jane Chan", phone: "+852 9876 5432" },
    { name: "John Doe", phone: "+852 9123 4567" },
    { name: "Jane Chan", phone: "+852 9876 5432" },
    { name: "John Doe", phone: "+852 9123 4567" },
    { name: "Jane Chan", phone: "+852 9876 5432" },
    { name: "John Doe", phone: "+852 9123 4567" },
    { name: "Jane Chan", phone: "+852 9876 5432" },
    { name: "John Doe", phone: "+852 9123 4567" },
    { name: "Jane Chan", phone: "+852 9876 5432" },
    { name: "John Doe", phone: "+852 9123 4567" },
    { name: "Jane Chan", phone: "+852 9876 5432" },
  ]);
  const [newContact, setNewContact] = useState<Contact>({ name: "", phone: "" });
  const [message, setMessage] = useState<MessageDetails>({
    theme: "",
    content: "",
    scheduledTime: "",
    isScheduled: false,
  });
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);

  const totalSteps = 5;

  const handleAddContact = () => {
    // if (newContact.name && newContact.phone) {
    //   setContacts([...contacts, { ...newContact }]);
    //   setNewContact({ name: "", phone: "" });
    //   toast({
    //     title: "Contact Added",
    //     description: `${newContact.name} has been added to your contacts.`,
    //   });
    // } else {
    //   toast({
    //     title: "Error",
    //     description: "Please fill in all fields",
    //     variant: "destructive",
    //   });
    // }
  };

  const handleSelectContact = (contact: Contact) => {
    if (selectedContacts.some((c) => c.phone === contact.phone)) {
      setSelectedContacts(selectedContacts.filter((c) => c.phone !== contact.phone));
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  const handleSendMessage = () => {
    // if (selectedContacts.length === 0) {
    //   toast({
    //     title: "Error",
    //     description: "Please select at least one contact",
    //     variant: "destructive",
    //   });
    //   return;
    // }
    // if (!message.content) {
    //   toast({
    //     title: "Error",
    //     description: "Please enter a message",
    //     variant: "destructive",
    //   });
    //   return;
    // }
    // if (message.isScheduled && !message.scheduledTime) {
    //   toast({
    //     title: "Error",
    //     description: "Please select a time to schedule the message",
    //     variant: "destructive",
    //   });
    //   return;
    // }
    // // In a real app, this would send the message to the backend
    // setCurrentStep(4); // Move to the final step
    // toast({
    //   title: "Success",
    //   description: message.isScheduled
    //     ? `Message scheduled to be sent to ${selectedContacts.length} contact(s)`
    //     : `Message sent to ${selectedContacts.length} contact(s)`,
    // });
  };

  const handleNext = () => {
    if (currentStep === 3) {
      handleSendMessage();
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const resetForm = () => {
    setCurrentStep(0);
    setSelectedContacts([]);
    setMessage({
      theme: "",
      content: "",
      scheduledTime: "",
      isScheduled: false,
    });
  };

  return {
    currentStep,
    setCurrentStep,
    totalSteps,
    contacts,
    newContact,
    setNewContact,
    message,
    setMessage,
    selectedContacts,
    handleAddContact,
    handleSelectContact,
    handleNext,
    handlePrevious,
    resetForm,
  };
};
