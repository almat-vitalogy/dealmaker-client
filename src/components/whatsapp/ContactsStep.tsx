import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckCircle, Loader2, Send, XCircle } from "lucide-react";
import { useBlastStore } from "@/store/blast";

const ContactsStep = () => {
  const { contacts, selectContact, addContact, selectedContacts, scrapeContacts, contactStatus } = useBlastStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  return (
    <div className="-mt-6">
      <Card className="w-full border-none shadow-none">
        <CardHeader>
          <CardTitle>Import Contacts</CardTitle>
        </CardHeader>
        <CardContent className="-mt-5">
          <Button className="w-full">Upload CSV, Excel, or Google Sheets</Button>
        </CardContent>
        <div className=""></div>
        <CardHeader>
          <CardTitle>Scrape Contacts</CardTitle>
        </CardHeader>
        <CardContent className="-mt-5">
          <Button className="w-full" onClick={scrapeContacts}>
            {!contactStatus && <Send className="mr-2" size={16} />}
            {contactStatus === "loading" && <Loader2 className="mr-2 animate-spin" size={16} />}
            {contactStatus === "success" && <CheckCircle className="mr-2" size={16} />}
            {contactStatus === "error" && <XCircle className="mr-2" size={16} />}
            {contactStatus === "loading" ? "Scraping..." : contactStatus === "success" ? "Scraped" : "Scrape contacts from whatsapp (connect first)"}
          </Button>
        </CardContent>
        <div className=""></div>
        <CardHeader>
          <CardTitle>Add Contact Manually</CardTitle>
        </CardHeader>
        <CardContent className="-mt-5">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Input className="text-black" id="name" placeholder="Name (John Doe)" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Input
                  className="text-black"
                  id="phone"
                  placeholder="Phone Number (85291234567)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={() => {
                addContact(name, phone);
                setName("");
                setPhone("");
              }}
              className="w-full"
            >
              {/* <Check className="mr-2" size={16} /> */}
              Add Contact
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>Contact List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[250px] overflow-y-auto">
            {contacts.map((contact, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`contact-${index}`}
                    checked={selectedContacts.some((c) => c === contact.phone)}
                    onChange={() => selectContact(contact.phone)}
                    className="mr-3 h-4 w-4"
                  />
                  <label htmlFor={`contact-${index}`}>{contact.name}</label>
                </div>
                <span className="text-muted-foreground">{contact.phone}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactsStep;
