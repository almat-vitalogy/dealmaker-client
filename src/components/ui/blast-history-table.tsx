import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TableCaption } from "@/components/ui/table";

// const blastHistory = [
//   {
//     title: "🎉 Birthday Promo",
//     sent: 120,
//     delivered: 115,
//     failed: 5,
//     date: "2025-04-29 15:00",
//   },
//   {
//     title: "💬 Follow-up Message",
//     sent: 98,
//     delivered: 97,
//     failed: 1,
//     date: "2025-04-28 18:30",
//   },
// ];

interface BlastItem {
  title: string;
  sent: number;
  delivered: number;
  failed: number;
  date: string;
}

interface BlastHistoryTableProps {
  data: BlastItem[];
}

export function BlastHistoryTable({ data }: BlastHistoryTableProps) {
  return (
    <Table>
      <TableCaption>A list of your recent message blasts.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[240px]">Title</TableHead>
          <TableHead>Sent</TableHead>
          <TableHead>Delivered</TableHead>
          <TableHead>Failed</TableHead>
          <TableHead className="text-right">Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((blast, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{blast.title}</TableCell>
            <TableCell>{blast.sent}</TableCell>
            <TableCell>{blast.delivered}</TableCell>
            <TableCell>{blast.failed}</TableCell>
            <TableCell className="text-right">{blast.date}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
