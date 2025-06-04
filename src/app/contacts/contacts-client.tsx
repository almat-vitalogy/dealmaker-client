"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useClearLoadingOnRouteChange } from "@/hooks/useClearLoadingOnRouteChange";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckCircle, Loader2, Send, XCircle, Upload, FileText } from "lucide-react";
import { useBlastStore } from "@/store/blast";

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

export default function ContactsClient({ user }: { user: any }) {
  const userEmail = encodeURIComponent(user?.email || "");
  const userEmail2 = user?.email || "";

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
  const [vcfFile, setVcfFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [importMessage, setImportMessage] = useState("");

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
        alert("Please select a .vcf file");
        return;
      }
      setVcfFile(file);
      setImportStatus("idle");
      setImportMessage("");
    }
  };

  const handleVcfImport = async () => {
    if (!vcfFile) {
      alert("Please select a VCF file first");
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
            await addContactToDB(userEmail, contactName, formattedPhone, userEmail2);
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

  const handleDelete = (name: string | null | undefined, phone: string | null | undefined) => {
    if (!phone) {
      console.error("Cannot delete contact: phone number is missing");
      return;
    }

    const displayName = name && name.trim() ? name.trim() : phone;
    const confirmed = window.confirm(`Are you sure you want to delete ${displayName}?`);

    if (confirmed) {
      try {
        deleteContactFromDB(userEmail, phone, userEmail2);
        alert(`${displayName} has been deleted!`);
      } catch (error) {
        console.error("Error deleting contact:", error);
        alert("Failed to delete contact. Please try again.");
      }
    }
  };

  const areAllSelected =
    Array.isArray(contacts) &&
    contacts.length > 0 &&
    contacts.every((c) => c && c.phone && Array.isArray(selectedContacts) && selectedContacts.includes(c.phone));

  const toggleSelectAll = () => {
    if (!Array.isArray(contacts) || !Array.isArray(selectedContacts)) {
      console.error("Contacts or selectedContacts is not an array");
      return;
    }

    if (areAllSelected) {
      // Deselect all
      contacts.forEach((c) => {
        if (c && c.phone && selectedContacts.includes(c.phone)) {
          selectContact(c.phone);
        }
      });
    } else {
      // Select all
      contacts.forEach((c) => {
        if (c && c.phone && !selectedContacts.includes(c.phone)) {
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
              <Button className="w-full" onClick={() => scrapeContacts(userEmail2)}>
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
                      alert("Please enter a phone number");
                      return;
                    }

                    try {
                      addContactToDB(userEmail, trimmedName || trimmedPhone, trimmedPhone, userEmail2);
                      setName("");
                      setPhone("");
                    } catch (error) {
                      console.error("Error adding contact:", error);
                      alert("Failed to add contact. Please try again.");
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{`Contact List (${Array.isArray(contacts) ? contacts.length : 0})`}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSelectAll}
                disabled={!Array.isArray(contacts) || contacts.length === 0}
              >
                {areAllSelected ? "Deselect All" : "Select All"}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[250px] overflow-y-auto">
                {Array.isArray(contacts) && contacts.length > 0 ? (
                  contacts
                    .filter((contact) => contact && contact.phone) // Filter out null/invalid contacts
                    .map((contact, index) => (
                      <div
                        key={`${contact.phone}-${index}`}
                        className="flex items-center justify-between border-b pb-2"
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={Array.isArray(selectedContacts) && selectedContacts.includes(contact.phone)}
                            onChange={() => contact.phone && selectContact(contact.phone)}
                            className="mr-3 h-4 w-4"
                          />
                          <label>{contact.name && contact.name.trim() ? contact.name.trim() : contact.phone}</label>
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
                    ))
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    No contacts found. Add some contacts to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
