"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckCircle, Loader2, Send, XCircle } from "lucide-react";
import { useBlastStore } from "@/store/blast";

interface ChooseBlastStepProps {
  user?: any;
}

const ChooseBlastStep = ({ user }: ChooseBlastStepProps) => {
  const userEmail = encodeURIComponent(user?.email || "");
  const [blasts, setBlasts] = useState<any[]>([]);
  const selectBlast = () => {};
  const [selectedBlasts, setSelectedBlasts] = useState<string[]>([]);

  //   const { contacts, selectContact, selectedContacts, scrapeContacts, contactStatus, setContacts, addContactToDB, deleteContactFromDB } =
  //     useBlastStore();

  //   const [name, setName] = useState("");
  //   const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!userEmail) return;

    const fetchContacts = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blast-messages/${userEmail}`);
        const data = await response.json();
        setBlasts(data);
      } catch (error) {
        console.error("❌ Error fetching contacts:", error);
      }
    };
    fetchContacts();
  }, []);

  // const handleDelete = (name: string, phone: string) => {
  //   const confirmed = window.confirm(`Are you sure you want to delete ${name || phone}?`);
  //   if (confirmed) {
  //     deleteContactFromDB(userEmail, phone);
  //     alert(`${name || phone} has been deleted!`);
  //   }
  // };

  return (
    <div className="-mt-6">
      <Card className="w-full border-none shadow-none">
        <CardHeader>
          <CardTitle className="mx-auto">2. Select which blast to send</CardTitle>
        </CardHeader>

        <CardHeader>
          <CardTitle>{`Blasts List (${blasts ? blasts.length : 0})`}</CardTitle>
        </CardHeader>
        <CardContent className="-mt-5">
          <div className="space-y-3 max-h-[250px] overflow-y-auto">
            {(blasts || []).map((blast, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center">
                  <input type="checkbox" checked={selectedBlasts.includes(blast.phone)} onChange={() => selectBlast()} className="mr-3 h-4 w-4" />
                  <label>{blast.name || blast.phone}</label>
                </div>
                <span className="text-muted-foreground flex items-center gap-2">
                  {blast.phone}
                  {/* <XCircle className="cursor-pointer hover:text-red-500" size={16} onClick={() => handleDelete(contact.name, contact.phone)} /> */}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChooseBlastStep;
