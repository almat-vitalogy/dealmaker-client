"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useClearLoadingOnRouteChange } from "@/hooks/useClearLoadingOnRouteChange";
import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckCircle, Loader2, Send, XCircle, Upload, FileText, Search, Badge, Trash2 } from "lucide-react";
import { useBlastStore } from "@/store/blast";
import LabelSelect from "@/components/label-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@radix-ui/react-checkbox";
import {toast} from "sonner";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";

// VCF Parser Classes
class VCFParser {
  static parseVCF(vcfContent: string) {
    if (!vcfContent || typeof vcfContent !== "string") {
      return [];
    }

    const contacts: any[] = [];
    const vcards = vcfContent.split("BEGIN:VCARD");

    vcards.forEach((vcard) => {
      if (!vcard || !vcard.trim()) return;

      try {
        const contact = this.parseVCard(vcard);
        if (contact && (contact.name || (Array.isArray(contact.phones) && contact.phones.length > 0))) {
          contacts.push(contact);
        }
      } catch (error) {
        console.warn("Error parsing vCard:", error);
      }
    });

    return contacts;
  }

  static parseVCard(vcardContent: string) {
    if (!vcardContent || typeof vcardContent !== "string") {
      return null;
    }

    const lines = vcardContent.split("\n").map((line) => (line ? line.trim() : ""));
    const contact = {
      name: "",
      phones: [] as Array<{ number: string; type: string }>,
      email: "",
      organization: "",
    };

    lines.forEach((line) => {
      if (!line) return;

      try {
        // Parse name (FN = Formatted Name, N = Name)
        if (line.startsWith("FN:")) {
          const name = line.substring(3).trim();
          if (name) {
            contact.name = name;
          }
        } else if (line.startsWith("N:") && !contact.name) {
          // If no FN, parse from N (Last;First;Middle;Prefix;Suffix)
          const nameParts = line.substring(2).split(";");
          const firstName = (nameParts[1] || "").trim();
          const lastName = (nameParts[0] || "").trim();
          const fullName = `${firstName} ${lastName}`.trim();
          if (fullName) {
            contact.name = fullName;
          }
        }

        // Parse phone numbers
        if (line.startsWith("TEL")) {
          const phoneNumber = this.extractPhoneNumber(line);
          if (phoneNumber) {
            const phoneType = this.getPhoneType(line);
            contact.phones.push({
              number: phoneNumber,
              type: phoneType || "other",
            });
          }
        }

        // Parse email
        if (line.startsWith("EMAIL:")) {
          const email = line.substring(6).trim();
          if (email) {
            contact.email = email;
          }
        }

        // Parse organization
        if (line.startsWith("ORG:")) {
          const org = line.substring(4).trim();
          if (org) {
            contact.organization = org;
          }
        }
      } catch (error) {
        console.warn("Error parsing line:", line, error);
      }
    });

    return contact;
  }

  static extractPhoneNumber(telLine: string) {
    if (!telLine || typeof telLine !== "string") {
      return null;
    }

    const colonIndex = telLine.lastIndexOf(":");
    if (colonIndex === -1) return null;

    let phoneNumber = telLine.substring(colonIndex + 1).trim();

    if (!phoneNumber) return null;

    // Clean up phone number - remove common formatting
    phoneNumber = phoneNumber.replace(/[\s\-\(\)\.]/g, "");

    return phoneNumber || null;
  }

  static getPhoneType(telLine: string) {
    if (!telLine || typeof telLine !== "string") {
      return "other";
    }

    const upperLine = telLine.toUpperCase();

    if (upperLine.includes("CELL") || upperLine.includes("MOBILE")) {
      return "mobile";
    } else if (upperLine.includes("HOME")) {
      return "home";
    } else if (upperLine.includes("WORK")) {
      return "work";
    } else if (upperLine.includes("FAX")) {
      return "fax";
    }

    return "other";
  }

  static formatForWhatsApp(phoneNumber: string, defaultCountryCode: string = "") {
    if (!phoneNumber || typeof phoneNumber !== "string") {
      return "";
    }

    let cleaned = phoneNumber.replace(/[^\d+]/g, "");

    if (!cleaned) return "";

    if (!cleaned.startsWith("+") && defaultCountryCode) {
      cleaned = defaultCountryCode + cleaned;
    }

    return cleaned.replace("+", "");
  }
}
type Contact = {
  _id: string;
  name: string;
  phone: string;
  labels: string[];
};
export default function ContactsClient({ user }: { user: any }) {
  const userEmail = encodeURIComponent(user?.email || "");
  const userEmail2 = user?.email || "";
  const [searchTerm, setSearchTerm] = useState("");
  const {
    contacts,
    selectContact,
    selectedContacts,
    scrapeContacts,
    contactStatus,
    setContacts,
    addContactToDB,
    logActivity,
    deleteContactFromDB,
    qrCodeUrl,
    toggleLabel,
    getLabels,
    labels,
    labelStatus,
    activeLabel,
  } = useBlastStore();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vcfFile, setVcfFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [importMessage, setImportMessage] = useState("");
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
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

      const matchesLabel = !activeLabel || contact.labels.includes(activeLabel);

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

  const handleVcfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith(".vcf")) {
        toast.error("Please select a .vcf file");
        return;
      }
      setVcfFile(file);
      setImportStatus("idle");
      setImportMessage("");
    }
  };

  const handleVcfImport = async () => {
    if (!vcfFile) {
      toast.error("Please select a VCF file first");
      return;
    }

    setImportStatus("loading");
    setImportMessage("");

    try {
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result;
          if (typeof result === "string") {
            resolve(result);
          } else {
            reject(new Error("Invalid file content"));
          }
        };
        reader.onerror = () => reject(new Error("Error reading file"));
        reader.readAsText(vcfFile);
      });

      if (!fileContent || fileContent.trim().length === 0) {
        throw new Error("File is empty or invalid");
      }

      const parsedContacts = VCFParser.parseVCF(fileContent);

      if (!Array.isArray(parsedContacts) || parsedContacts.length === 0) {
        throw new Error("No valid contacts found in the file");
      }

      let successCount = 0;
      let errorCount = 0;

      // Process each contact
      for (const contact of parsedContacts) {
        if (!contact || typeof contact !== "object") {
          errorCount++;
          continue;
        }

        const phones = Array.isArray(contact.phones) ? contact.phones : [];

        if (phones.length === 0) {
          console.warn(`Contact ${contact.name || "Unknown"} has no phone numbers, skipping`);
          errorCount++;
          continue;
        }

        // Handle multiple phone numbers per contact
        for (const phone of phones) {
          if (!phone || !phone.number || typeof phone.number !== "string") {
            errorCount++;
            continue;
          }

          try {
            const phoneNumber = phone.number.trim();
            if (phoneNumber.length === 0) {
              errorCount++;
              continue;
            }

            const formattedPhone = VCFParser.formatForWhatsApp(phoneNumber, "+1");
            if (!formattedPhone || formattedPhone.length === 0) {
              errorCount++;
              continue;
            }

            const contactName =
              contact.name && typeof contact.name === "string" && contact.name.trim()
                ? contact.name.trim()
                : `Contact ${formattedPhone}`;

            // Add to database using your existing function
            await addContactToDB(userEmail, contactName, formattedPhone, userEmail2, true);
            successCount++;
          } catch (error) {
            console.error(`Error adding contact ${contact.name || "Unknown"}:`, error);
            errorCount++;
          }
        }
      }

      if (successCount === 0) {
        throw new Error("No contacts could be imported. Please check the file format.");
      }

      setImportStatus("success");
      setImportMessage(
        `Successfully imported ${successCount} contacts${errorCount > 0 ? ` (${errorCount} failed)` : ""}`
      );
      await logActivity(userEmail2, `contacts imported successfully - ${successCount}`);
      setVcfFile(null);

      // Clear the file input
      const fileInput = document.getElementById("vcf-file-input") as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.error("VCF import error:", error);
      setImportStatus("error");
      setImportMessage(
        error instanceof Error ? error.message : "Failed to import contacts. Please check the file format."
      );
    }
  };

  const handleDelete = async (name: string | null | undefined, phone: string | null | undefined) => {
    if (!phone) {
      console.error("Cannot delete contact: phone number is missing");
      return;
    }

    const displayName = name && name.trim() ? name.trim() : phone;
    const confirmed = await confirm({
      title: `Are you sure you want to delete ${displayName}?`,
      description: "This action cannot be undone.",
    });

    if (confirmed) {
      try {
        deleteContactFromDB(userEmail, phone, userEmail2, false);
        toast.success(`${displayName} has been deleted!`);
      } catch (error) {
        console.error("Error deleting contact:", error);
        toast.error("Failed to delete contact. Please try again.");
      }
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

    if (confirmed) {
      try {
        selectedContacts.forEach((phone) => {
          selectContact(phone);
          deleteContactFromDB(userEmail, phone, userEmail2,true);
        });
        await logActivity(userEmail2, `contacts deleted successfully - ${selectedContacts.length}`);
        toast.success(`${selectedContacts.length} contact${selectedContacts.length > 1 ? "s have" : " has"} been deleted!`);
      } catch (error) {
        console.error("Error deleting selected contacts:", error);
        toast.error("Failed to delete some contacts. Please try again.");
      }
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

  useClearLoadingOnRouteChange();

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" user={user} />
      <SidebarInset>
        <SiteHeader left="Contacts" right="" />
        <div className="p-6">
          <Card className="w-full border-none shadow-none">
            <CardHeader>
              <CardTitle>Scrape Contacts</CardTitle>
            </CardHeader>
            <CardContent className="-mt-5">
              <Button className="w-full" onClick={() => scrapeContacts(userEmail2)} disabled={qrCodeUrl === ""}>
                {!contactStatus && <Send className="mr-2" size={16} />}
                {contactStatus === "loading" && <Loader2 className="mr-2 animate-spin" size={16} />}
                {contactStatus === "success" && <CheckCircle className="mr-2" size={16} />}
                {contactStatus === "error" && <XCircle className="mr-2" size={16} />}
                {contactStatus === "loading"
                  ? "Scraping..."
                  : contactStatus === "success"
                  ? "Scraped"
                  : "Scrape contacts from WhatsApp (connect first)"}
              </Button>
            </CardContent>

            <CardHeader>
              <CardTitle>Import Contacts from VCF File</CardTitle>
            </CardHeader>
            <CardContent className="-mt-5">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Input
                    id="vcf-file-input"
                    type="file"
                    accept=".vcf"
                    onChange={handleVcfFileChange}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleVcfImport}
                    disabled={!vcfFile || importStatus === "loading"}
                    className="min-w-fit"
                  >
                    {importStatus === "loading" && <Loader2 className="mr-2 animate-spin" size={16} />}
                    {importStatus === "success" && <CheckCircle className="mr-2" size={16} />}
                    {importStatus === "error" && <XCircle className="mr-2" size={16} />}
                    {importStatus === "idle" && <Upload className="mr-2" size={16} />}
                    {importStatus === "loading" ? "Importing..." : "Import VCF"}
                  </Button>
                </div>

                {vcfFile && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText size={16} />
                    <span>Selected: {vcfFile.name}</span>
                  </div>
                )}

                {importMessage && (
                  <div className={`text-sm ${importStatus === "success" ? "text-green-600" : "text-red-600"}`}>
                    {importMessage}
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Supported format: .vcf files exported from iPhone, Android, or other contact apps
                </div>
              </div>
            </CardContent>

            <CardHeader>
              <CardTitle>Add Contact Manually</CardTitle>
            </CardHeader>
            <CardContent className="-mt-5">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <Input
                    className="text-black"
                    placeholder="Name (John Doe)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <Input
                    className="text-black"
                    placeholder="Phone Number (85291234567)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <Button
                  onClick={() => {
                    const trimmedName = name.trim();
                    const trimmedPhone = phone.trim();

                    if (!trimmedPhone) {
                      toast.error("Please enter a phone number");
                      return;
                    }

                    try {
                      addContactToDB(userEmail, trimmedName || trimmedPhone, trimmedPhone, userEmail2, false);
                      toast.success(`${trimmedName || trimmedPhone} has been added successfully!`);
                      setName("");
                      setPhone("");
                    } catch (error) {
                      console.error("Error adding contact:", error);
                      toast.error("Failed to add contact. Please try again.");
                    }
                  }}
                  className="w-full"
                  disabled={!phone.trim()}
                >
                  Add Contact
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-none">
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
                  disabled={!selectedContacts.length}
                  className="h-full"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected ({selectedContacts.length})
                </Button>
                <Button
                  variant="outline"
                  onClick={toggleSelectAll}
                  disabled={!filteredContacts.length}
                  className="h-full"
                >
                  {areAllSelected
                    ? `Deselect All (${filteredContacts.length})`
                    : `Select All (${filteredContacts.length})`}
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3 max-h-[380px] overflow-y-auto">
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
      </SidebarInset>
    </SidebarProvider>
  );
}
