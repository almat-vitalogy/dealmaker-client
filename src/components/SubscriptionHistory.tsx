import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  DollarSign,
  CreditCard,
  ExternalLink,
  Loader2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Type definitions                                                  */
/* ------------------------------------------------------------------ */

export type Transaction = {
  id: string;
  date: string;
  plan: string;
  amount: string;
  status: "completed" | "pending" | "failed";
  invoiceUrl?: string;
};

type Props = {
  currentPlan?: {
    name: string;
    price: string;
    nextBilling: string;
    status: string;
  };
  transactions: Transaction[];
  /** when true, show a spinner instead of the table */
  loading?: boolean;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
    case "active":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "failed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const openInvoice = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function SubscriptionHistory({
  currentPlan,
  transactions,
  loading = false,
}: Props) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading billing history…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ---------- Current plan banner ---------- */}
      {currentPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Current Subscription</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Plan</p>
                <p className="text-lg font-semibold text-gray-900">
                  {currentPlan.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Price</p>
                <p className="text-lg font-semibold text-gray-900">
                  {currentPlan.price}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge className={getStatusColor(currentPlan.status)}>
                  {currentPlan.status}
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Next billing: {currentPlan.nextBilling}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ---------- Purchase history ---------- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5" />
            <span>Purchase History</span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No purchase history yet
            </p>
          ) : (
            <div className="space-y-3">
              {transactions.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium text-gray-900">{t.plan}</p>
                        <p className="text-sm text-gray-600">{t.date}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-gray-900">
                      {t.amount}
                    </span>

                    <Badge className={getStatusColor(t.status)}>
                      {t.status}
                    </Badge>

                    {t.status === "completed" && t.invoiceUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openInvoice(t.invoiceUrl!)}
                        className="flex items-center space-x-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>View Invoice</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
