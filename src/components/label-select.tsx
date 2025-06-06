"use client";

import { useEffect, useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectSeparator } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { useBlastStore } from "@/store/blast";

/* ------------------------------------------------------------------ */
/*  CONSTANTS                                                          */
/* ------------------------------------------------------------------ */
const BASIC_COLORS = [
  "#EF4444", // red-500
  "#F97316", // orange-500
  "#EAB308", // yellow-500
  "#22C55E", // green-500
  "#14B8A6", // teal-500
  "#0EA5E9", // sky-500
  "#6366F1", // indigo-500
  "#F43F5E", // rose-500
];

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */
export default function LabelSelect() {
  /* ─── Pull everything we need from the store ─── */
  const {
    userEmail, // already stored in Zustand
    labels, // global label list
    labelStatus, // "success" | "loading" | "error" | ""
    getLabels, // async fetcher
    createLabel, // POST creator
    deleteLabel, // DELETE label
    setActiveLabel,
    activeLabel,
  } = useBlastStore();

  /* ─── Local UI state for the Select component ─── */
  const [isCreating, setCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<string>(BASIC_COLORS[0]);

  /* ─── Fetch labels on mount / when userEmail changes ─── */
  useEffect(() => {
    if (userEmail) void getLabels(userEmail);
  }, [userEmail, getLabels]);

  /* ─── Handlers ─── */
  const handleCreate = async () => {
    if (!newName.trim() || !userEmail) return;
    await createLabel(newName.trim(), newColor, userEmail);
    /* reset UI */
    setCreate(false);
    setNewName("");
    setNewColor(BASIC_COLORS[0]);
  };

  const handleDelete = async (id: string) => {
    if (!userEmail) return;
    await deleteLabel(id, userEmail);
  };

  /* ---------------------------------------------------------------- */
  return (
    <Select
      value={activeLabel}
      onValueChange={(val) => {
        setActiveLabel(val);
      }}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder={labelStatus === "loading" ? "Loading…" : "Select label"} />
      </SelectTrigger>

      <SelectContent>
        {/* ─────────── Existing labels ─────────── */}
        {labels.map((lbl) => (
          <div key={lbl._id} className="relative">
            <SelectItem value={lbl._id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="truncate max-w-[80px]">{lbl.name}</span>
                <span className="h-3 w-3 rounded-sm border" style={{ backgroundColor: lbl.color || "#3b82f6" }} />
              </div>
            </SelectItem>

            {/* inline delete icon */}
            <XCircle
              size={16}
              className="absolute right-2 top-2 shrink-0 text-muted-foreground hover:text-red-500"
              onClick={(e) => {
                e.stopPropagation(); // keep the select item from closing
                handleDelete(lbl._id);
              }}
            />
          </div>
        ))}

        {/* divider */}
        <div className="my-1 h-px bg-muted" />

        {/* ─────────── Create-label entry ─────────── */}
        {!isCreating ? (
          <div
            className="flex cursor-pointer items-center px-3 py-2 text-sm hover:bg-muted/50"
            onClick={() => setCreate(true)}
          >
            <span className="mr-2 text-primary">+</span> Create label
          </div>
        ) : (
          <div className="space-y-3 p-2">
            {/* name input */}
            <input
              className="w-full rounded-md border bg-background px-2 py-1 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Label name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />

            {/* color palette */}
            <div className="grid grid-cols-4 gap-2">
              {BASIC_COLORS.map((c) => (
                <button
                  key={c}
                  className={`h-6 w-6 rounded-sm border transition-all focus:outline-none ${
                    newColor === c ? "ring-2 ring-offset-2 ring-primary" : ""
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setNewColor(c)}
                />
              ))}
            </div>

            {/* action buttons */}
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreate} disabled={!newName.trim()}>
                OK
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setCreate(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        <SelectSeparator />
        <Button
          className="w-full px-2"
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setActiveLabel("");
          }}
        >
          Clear
        </Button>
      </SelectContent>
    </Select>
  );
}
