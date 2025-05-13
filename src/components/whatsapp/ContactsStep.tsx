import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";
import { useBlastStore } from "@/store/blast";

const ContactsStep = () => {
  const { contacts, selectContact, addContact } = useBlastStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  return (
    <div className="-mt-6">
      <Card className="w-full border-none shadow-none">
        <CardHeader>
          <CardTitle>Import Contacts</CardTitle>
        </CardHeader>
        <CardContent className="-mt-5">
          <p className="text-sm text-muted-foreground mb-4">Upload a CSV, Excel, or Google Sheets file to import contacts.</p>
          <Button variant="outline" className="w-full">
            Upload File
          </Button>
        </CardContent>
        <CardHeader>
          <CardTitle>Add Contact Manually</CardTitle>
        </CardHeader>
        <CardContent className="-mt-5">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-6 text-muted-foreground">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Name
                </label>
                <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1">
                  Phone Number
                </label>
                <Input id="phone" placeholder="+852 9123 4567" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
            <Button onClick={() => addContact(name, phone)} className="w-full">
              <Check className="mr-2" size={16} />
              Add Contact
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* <Card>
          <CardHeader>
            <CardTitle>Add Contact Manually</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Name
                </label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  placeholder="+852 9123 4567"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                />
              </div>
              <Button onClick={handleAddContact} className="w-full">
                <Check className="mr-2" size={16} />
                Add Contact
              </Button>
            </div>
          </CardContent>
        </Card> */}

      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>Contact List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {contacts.map((contact, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`contact-${index}`}
                    // checked={selectedContacts.some((c) => c.phone === contact.phone)}
                    checked={contact.selected}
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
