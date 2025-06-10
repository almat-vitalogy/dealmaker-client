"use client";

import { useEffect, useState, useMemo } from "react";
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
  /* ─── Global state ─── */
  const {
    userEmail,
    labels,
    labelStatus,
    getLabels,
    createLabel,
    deleteLabel,
    setActiveLabel,
    activeLabel,
    /* NEW ↓ pulls from store */
    contacts,
    selectedContacts,
    toggleLabel,
    massAssignLabel,
    massDeassignLabel,
  } = useBlastStore();

  /* ─── Local UI state (create-label) ─── */
  const [isCreating, setCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(BASIC_COLORS[0]);

  /* ─── Fetch labels once ─── */
  useEffect(() => {
    if (userEmail) void getLabels(userEmail);
  }, [userEmail, getLabels]);

  /* ------------------------------------------------------------------
     Helpers for bulk-assign logic
  ------------------------------------------------------------------ */
  const selectedContactIds = useMemo(
    () => contacts.filter((c) => selectedContacts.includes(c.phone)).map((c) => c._id),
    [contacts, selectedContacts]
  );

  const isBulkMode = selectedContactIds.length > 0;

  /* updated click-handler */
  const makeToggleHandler = (lblId: string) => async () => {
    if (!isBulkMode) {
      /* normal filter behaviour */
      setActiveLabel(lblId === activeLabel ? "" : lblId);
      return;
    }

    /* bulk mode — decide assign vs deassign */
    const allHave = contacts.filter((c) => selectedContactIds.includes(c._id)).every((c) => c.labels.includes(lblId));

    if (allHave) {
      await massDeassignLabel(selectedContactIds, lblId, userEmail);
    } else {
      await massAssignLabel(selectedContactIds, lblId, userEmail);
    }
  };

  const bulkStatus = useMemo(() => {
    if (!isBulkMode) return {}; // nothing selected → no indicators

    const selectedSet = new Set(selectedContactIds);
    const totalSel = selectedSet.size;

    const status: Record<string, { fully: boolean; partially: boolean }> = {};

    labels.forEach((lbl) => {
      let hits = 0;
      contacts.forEach((c) => {
        if (selectedSet.has(c._id) && c.labels.includes(lbl._id)) hits++;
      });
      status[lbl._id] = {
        fully: hits === totalSel,
        partially: hits > 0 && hits < totalSel,
      };
    });

    return status;
  }, [isBulkMode, labels, contacts, selectedContactIds]);

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
        /* still allow normal filtering when not in bulk mode */
        if (!isBulkMode) setActiveLabel(val);
      }}
    >
      <SelectTrigger className="w-[220px]">
        <SelectValue
          placeholder={
            isBulkMode
              ? `Assign/Remove label (${selectedContactIds.length})`
              : labelStatus === "loading"
              ? "Loading…"
              : "Filter by label"
          }
        />
      </SelectTrigger>

      <SelectContent>
        {/* ─────────── Existing labels ─────────── */}
        {labels.map((lbl) => {
          const { fully, partially } = bulkStatus[lbl._id] ?? {
            fully: false,
            partially: false,
          };

          return (
            <div className="relative">
              <SelectItem
                key={lbl._id}
                value={lbl._id} // still needed for filter mode
                className="flex w-full items-center justify-between cursor-pointer"
                onPointerDown={(e) => {
                  if (isBulkMode) {
                    e.preventDefault(); // keep dropdown open
                    makeToggleHandler(lbl._id)(); // run assign / de-assign
                  }
                  /*  not bulk mode?
                      do nothing: Radix will treat the click as a normal
                      selection and close the menu, which is exactly what we want
                   */
                }}
              >
                <div className="flex items-center gap-2">
                  {isBulkMode && (
                    <span
                      className={`h-3 w-3 rounded-[2px] ${
                        fully ? "bg-primary" : partially ? "bg-primary/30" : "bg-transparent"
                      }`}
                    />
                  )}
                  <span className="truncate max-w-[80px]">{lbl.name}</span>
                  <span className="h-3 w-3 rounded-sm border" style={{ backgroundColor: lbl.color || "#3b82f6" }} />
                </div>
              </SelectItem>
              <XCircle
                size={16}
                className="absolute right-2 top-2 shrink-0 text-muted-foreground hover:text-red-500 z-10"
                onClick={(e) => {
                  e.stopPropagation(); // keep the select item from closing
                  handleDelete(lbl._id);
                }}
              />
            </div>
          );
        })}

        {/* divider */}
        <div className="my-1 h-px bg-muted" />

        {/* ─────────── Create-label entry (disabled in bulk mode) ─────────── */}
        {!isBulkMode &&
          (!isCreating ? (
            <div
              className="flex cursor-pointer items-center px-3 py-2 text-sm hover:bg-muted/50"
              onClick={() => setCreate(true)}
            >
              <span className="mr-2 text-primary">+</span> Create label
            </div>
          ) : (
            <div className="space-y-3 p-2">
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

              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreate} disabled={!newName.trim()}>
                  OK
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setCreate(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ))}

        {!isBulkMode && (
          <>
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
          </>
        )}
      </SelectContent>
    </Select>
  );
}
