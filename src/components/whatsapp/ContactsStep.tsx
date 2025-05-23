"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckCircle, Loader2, Send, XCircle } from "lucide-react";
import { useBlastStore } from "@/store/blast";

const agentPhone = "85268712802"; // Dynamically set this for logged-in agent

const ContactsStep = () => {
  const {
    contacts,
    selectContact,
    selectedContacts,
    scrapeContacts,
    contactStatus,
    setContacts,
    addContactToDB,
    deleteContactFromDB,
  } = useBlastStore();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/${agentPhone}`);
        const data = await response.json();
        setContacts(data.contacts);
      } catch (error) {
        console.error("❌ Error fetching contacts:", error);
      }
    };
    fetchContacts();
  }, [setContacts]);

  const handleDelete = (name: string, phone: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete ${name || phone}?`);
    if (confirmed) {
      deleteContactFromDB(agentPhone, phone);
      alert(`${name || phone} has been deleted!`);
    }
  };
  
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
                addContactToDB(agentPhone, name, phone);
                setName("");
                setPhone("");
              }}
              className="w-full"
            >
              Add Contact
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>{`Contact List (${contacts ? contacts.length : 0})`}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[250px] overflow-y-auto">
            {(contacts || []).map((contact, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedContacts.includes(contact.phone)}
                    onChange={() => selectContact(contact.phone)}
                    className="mr-3 h-4 w-4"
                  />
                  <label>{contact.name || contact.phone}</label>
                </div>
                <span className="text-muted-foreground flex items-center gap-2">
                  {contact.phone}
                  <XCircle
                    className="cursor-pointer hover:text-red-500"
                    size={16}
                    onClick={() => handleDelete(contact.name, contact.phone)}
                  />
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactsStep;