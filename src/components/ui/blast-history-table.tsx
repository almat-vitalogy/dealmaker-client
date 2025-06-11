import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TableCaption } from "@/components/ui/table";

interface BlastItem {
  title: string;
  recepients: string[];
  message: string;
  date: string;
}

interface BlastHistoryTableProps {
  data: BlastItem[];
}

export function BlastHistoryTable({ data }: BlastHistoryTableProps) {
  const [selectedBlast, setSelectedBlast] = useState<BlastItem | null>(null);
  const [open, setOpen] = useState(false);

  const handleRowClick = (blast: BlastItem) => {
    setSelectedBlast(blast);
    setOpen(true);
  };

  return (
    <>
      <Table>
        <TableCaption>A list of your recent message blasts.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[240px]">Title</TableHead>
            <TableHead className="text-center">Recepients</TableHead>
            <TableHead className="text-center">Message</TableHead>
            <TableHead className="text-right">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((blast, index) => (
            <TableRow
              key={index}
              className="cursor-pointer hover:bg-muted transition"
              onClick={() => handleRowClick(blast)}
            >
              <TableCell className="font-medium">{blast.title}</TableCell>
              <TableCell className="text-center">{blast.recepients.length}</TableCell>
              <TableCell className="text-center truncate max-w-[240px]">
                {blast.message}
              </TableCell>
              <TableCell className="text-right">{blast.date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Single Dialog outside the map */}
      <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) {
          setSelectedBlast(null);
        }
        setOpen(isOpen);
      }}>
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedBlast?.title}</DialogTitle>
            <DialogDescription>Detailed information about this blast.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <strong>Message:</strong>
              <textarea
                className="bg-muted w-full h-54 p-3 mb-5 resize-none rounded-md focus:outline-offset-1" 
                disabled
                value={selectedBlast?.message || ""}
              ></textarea>
            </div>
            <div>
              <strong>Date:</strong>
              <p>{selectedBlast?.date}</p>
            </div>
            <div>
              <strong>Recipients:</strong>
              <ul className="list-disc list-inside max-h-[160px] overflow-y-auto">
                {selectedBlast?.recepients.map((recipient, idx) => (
                  <li key={idx}>{recipient}</li>
                ))}
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}