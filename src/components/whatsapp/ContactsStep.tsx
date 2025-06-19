"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckCircle, Loader2, Search, Send, Trash2, XCircle } from "lucide-react";
import { useBlastStore } from "@/store/blast";
import LabelSelect from "../label-select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { toast } from "sonner";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";

interface ContactsStepProps {
  user?: any;
}
type Contact = {
  _id: string;
  name: string;
  phone: string;
  labels: string[];
};

const ContactsStep = ({ user }: ContactsStepProps) => {
  const userEmail = encodeURIComponent(user?.email || "");
  const userEmail2 = user?.email || "";
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const {
    contacts,
    selectContact,
    selectedContacts,
    setContacts,
    addContactToDB,
    deleteContactFromDB,
    overlayVisible,
    labels,
    activeLabel,
    toggleLabel,
    logActivity,
    massDeleteContacts
  } = useBlastStore();
  const confirm = useConfirmDialog();

  useEffect(() => {
    if (!Array.isArray(contacts)) {
      setFilteredContacts([]);
      return;
    }

    const filtered = contacts.filter((contact) => {
      const q = searchTerm.toLowerCase();

      // Get contact's assigned labels
      const assignedLabels = labels.filter(
        (label) => Array.isArray(label.contactIds) && label.contactIds.includes(contact._id)
      );

      const matchesSearch =
        (contact.name && contact.name.toLowerCase().includes(q)) ||
        (contact.phone && contact.phone.toLowerCase().includes(q)) ||
        assignedLabels.some((label) => label.name && label.name.toLowerCase().includes(q));

      const matchesLabel = !activeLabel || contact.labels?.includes(activeLabel);

      return matchesSearch && matchesLabel;
    });

    setFilteredContacts(filtered);
  }, [contacts, searchTerm, addContactToDB, activeLabel, labels]);

  useEffect(() => {
    if (!userEmail) return;

    const fetchContacts = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contacts/${userEmail}`);
        const data = await response.json();
        setContacts(data);
      } catch (error) {
        console.error("❌ Error fetching contacts:", error);
      }
    };
    fetchContacts();
  }, [userEmail, setContacts]);

  const handleDelete = async (name: string, phone: string) => {
    const confirmed = await confirm({
      title: `Are you sure you want to delete ${name || phone}?`,
      description: "This action cannot be undone.",
    });
    if (confirmed) {
      deleteContactFromDB(userEmail, phone, userEmail2, false);
      toast.success(`${name || phone} has been deleted!`);
    }
  };

  const handleDeleteSelected = async () => {
    if (!Array.isArray(selectedContacts) || selectedContacts.length === 0) {
      toast.error("No contacts selected for deletion");
      return;
    }

    const confirmed = await confirm({
      title: `Delete ${selectedContacts.length} contact${selectedContacts.length > 1 ? "s" : ""}?`,
      description: "This action cannot be undone.",
    });

    if (!confirmed) return;

    try {
      // Optimistically unselect contacts in UI (optional)
      selectedContacts.forEach((phone) => selectContact(phone));

      // Use your new bulk delete method
      await massDeleteContacts(userEmail2, selectedContacts);

      // Log + Toast
      await logActivity(userEmail2, `contacts deleted  - ${selectedContacts.length}`);
      toast.success(`${selectedContacts.length} contact${selectedContacts.length > 1 ? "s have" : " has"} been deleted!`);
    } catch (error) {
      console.error("❌ Error deleting selected contacts:", error);
      toast.error("Failed to delete some contacts. Please try again.");
    }
  };

  const areAllSelected = useMemo(() => {
      return (
        Array.isArray(filteredContacts) &&
        filteredContacts.length > 0 &&
        filteredContacts.every((c) => c?.phone && Array.isArray(selectedContacts) && selectedContacts.includes(c.phone))
      );
    }, [filteredContacts, selectedContacts]);
  const toggleSelectAll = () => {
    if (!Array.isArray(filteredContacts) || !Array.isArray(selectedContacts)) {
      console.error("Filtered contacts or selectedContacts is not an array");
      return;
    }

    if (areAllSelected) {
      // Deselect all filtered contacts
      filteredContacts.forEach((c) => {
        if (c?.phone && selectedContacts.includes(c.phone)) {
          selectContact(c.phone);
        }
      });
    } else {
      // Select all filtered contacts
      filteredContacts.forEach((c) => {
        if (c?.phone && !selectedContacts.includes(c.phone)) {
          selectContact(c.phone);
        }
      });
    }
  };

  return (
    <div className="-mt-6">
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle className="mx-auto">1. Select who is going to receive your blast</CardTitle>
        </CardHeader>

        <CardHeader className="flex flex-row items-center justify-between relative mx-5 p-0">
          <Search className="absolute left-2 text-gray-500 h-5 w-5"></Search>
          <Input
            type="text"
            placeholder="Search name, phone, or label"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 pl-9"
          />
          <div className="flex gap-5">
            <LabelSelect></LabelSelect>
            <Button
              variant="outline"
              onClick={handleDeleteSelected}
              disabled={!selectedContacts.length || overlayVisible === true}
              className="h-full"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected ({selectedContacts.length})
            </Button>
            <Button variant="outline" onClick={toggleSelectAll} disabled={!filteredContacts.length} className="h-full">
              {areAllSelected ? `Deselect All (${filteredContacts.length})` : `Select All (${filteredContacts.length})`}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
            {filteredContacts.length === 0 && (
              <div className="text-center text-muted-foreground py-4">No contacts found.</div>
            )}

            {filteredContacts.map((c) => {
              const assignedLabels = labels.filter(
                (label) => Array.isArray(label.contactIds) && label.contactIds.includes(c._id)
              );
              return (
                <Dialog key={c.phone}>
                  <DialogTrigger asChild>
                    <div className="flex items-center justify-between border-b pb-2 cursor-pointer hover:bg-muted/30 rounded-md px-2">
                      <div className="flex gap-10">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedContacts.includes(c.phone)}
                            onChange={() => selectContact(c.phone)}
                            onClick={(e) => e.stopPropagation()}
                            className="mr-3 h-4 w-4"
                          />
                          <span>{c.name?.trim() || c.phone}</span>
                        </div>
                        {assignedLabels.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {assignedLabels.map((label) => (
                              <span
                                key={label._id}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
                                style={{ backgroundColor: label.color ?? "#3b82f6" }}
                              >
                                {label.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <span className="text-muted-foreground flex items-center gap-2">
                        {c.phone}
                        <XCircle
                          size={16}
                          className="hover:text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(c.name, c.phone);
                          }}
                        />
                      </span>
                    </div>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-lg">{c.name?.trim() || c.phone}</DialogTitle>
                      <DialogDescription className="flex flex-col gap-1">
                        <span className="text-sm text-muted-foreground">Phone: {c.phone}</span>
                        {assignedLabels.length > 0 && (
                          <span className="flex flex-wrap gap-1 mt-2">
                            {assignedLabels.map((label) => (
                              <span
                                key={label._id}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                                style={{ backgroundColor: label.color ?? "#3b82f6" }}
                              >
                                {label.name}
                              </span>
                            ))}
                          </span>
                        )}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {labels.map((lbl) => {
                        const checked = Array.isArray(lbl.contactIds) && lbl.contactIds.includes(c._id);
                        return (
                          <label
                            key={lbl._id}
                            className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-muted/50 cursor-pointer border-b"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleLabel(c._id, lbl._id, userEmail2)}
                                className="mr-3 h-4 w-4"
                              />
                              <span>{lbl.name}</span>
                            </div>
                            <span
                              className="inline-block w-3 h-3 rounded-sm"
                              style={{ background: lbl.color ?? "#3b82f6" }}
                            />
                          </label>
                        );
                      })}

                      {labels.length === 0 && <p className="text-muted-foreground text-sm">No labels yet.</p>}
                    </div>
                  </DialogContent>
                </Dialog>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default ContactsStep;
