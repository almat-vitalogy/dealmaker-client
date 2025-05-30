/* client/src/app/subscriptions/subscriptions-client.tsx */

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import PricingCard from "@/components/PricingCard";
import SubscriptionHistory from "@/components/SubscriptionHistory";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Settings } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { useClearLoadingOnRouteChange } from "@/hooks/useClearLoadingOnRouteChange";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const getDiscountedPrice = (m: number) => Math.round(m * 12 * 0.7);

/** map Stripe priceId → plan title (extend when you add more plans) */
const priceIdToPlan: Record<string, string> = {
  "price_1RU4CrDlkgrFyQgUESMdh6o6": "Pro Plan",
  "price_1RU4EbDlkgrFyQgUHILLc7IQ": "Pro Plan (Yearly)",
  "price_1RU4FUDlkgrFyQgUgHth5GjP": "Enterprise Plan",
  "price_1RU4FpDlkgrFyQgUNl8anlpL": "Enterprise Plan (Yearly)",
};

const formatAmount = (
  raw: number | null,
  currency = "",
  isCents = false
): string =>
  raw != null
    ? `${(isCents ? raw / 100 : raw).toFixed(2)} ${currency.toUpperCase()}`.trim()
    : "–";

type Transaction = {
  id: string;
  date: string;
  plan: string;
  amount: string;
  status: "completed" | "failed" | "pending";
};

/* ------------------------------------------------------------------ */
/*  Constant plan definitions (used by the UI cards)                  */
/* ------------------------------------------------------------------ */

const plans = [
  {
    id: "free",
    title: "Free Plan",
    price: "Free",
    currency: "",
    yearlyPrice: "Free",
    description: "Perfect for getting started with basic blast messaging",
    features: ["100 blast messages per month", "10 AI message generation per month"],
    stripePriceIdMonthly: null,
    stripePriceIdYearly: null,
  },
  {
    id: "pro",
    title: "Pro Plan",
    price: "99",
    currency: "HKD",
    yearlyPrice: getDiscountedPrice(99).toString(),
    description: "Ideal for growing businesses with higher volume needs",
    features: [
      "1,000 blast messages per month",
      "200 AI message generation per month",
      "Crawl contacts from WhatsApp group",
      "Reuse custom templates",
    ],
    isPopular: true,
    stripePriceIdMonthly: "price_1RU4CrDlkgrFyQgUESMdh6o6",
    stripePriceIdYearly: "price_1RU4EbDlkgrFyQgUHILLc7IQ",
  },
  {
    id: "enterprise",
    title: "Enterprise Plan",
    price: "199",
    currency: "HKD",
    yearlyPrice: getDiscountedPrice(199).toString(),
    description: "For businesses that need unlimited messaging power",
    features: [
      "Unlimited blast messages",
      "Unlimited AI message generation",
      "Crawl contacts from WhatsApp group",
      "Reuse custom templates",
      "Dedicated account manager",
    ],
    stripePriceIdMonthly: "price_1RU4FUDlkgrFyQgUgHth5GjP",
    stripePriceIdYearly: "price_1RU4FpDlkgrFyQgUNl8anlpL",
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function SubscriptionsClient({ user }: { user: any }) {
  const { toast } = useToast();
  useClearLoadingOnRouteChange();
  const searchParams = useSearchParams();

  /* ----- UI state ---------------------------------------------------- */
  const [activeTab, setActiveTab] = useState<"plans" | "history">("plans");
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState("free"); // ← replace when you have a “current subscription” endpoint
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  /* ----- choose tab on first load ----------------------------------- */
  useEffect(() => {
    if (searchParams.get("tab") === "history" || searchParams.get("session_id")) {
      setActiveTab("history");
    }
  }, [searchParams]);

  /* ----- fetch billing history -------------------------------------- */
  useEffect(() => {
    if (!user?.email) return;

    const load = async () => {
      try {
        setHistoryLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/${encodeURIComponent(
            user.email
          )}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        const mapped: Transaction[] = (json.subscriptionEvents || []).map(
          (evt: any): Transaction => ({
            id   : evt.invoiceId || evt.eventId,
            date : new Date(evt.createdAt || evt.periodEnd || Date.now())
              .toLocaleString("en-GB", { hour12: false }),
            plan : priceIdToPlan[evt.lineItems?.[0]?.priceId] || "Subscription",
            amount: formatAmount(evt.amountPaid, evt.currency),
            status: evt.status === "paid" ? "completed" : "pending",
            /** 🔥 NEW: pass hosted invoice link to the component */
            invoiceUrl: evt.hostedInvoiceUrl ?? undefined,
          })
        );

        setTransactions(mapped);
      } catch (err: any) {
        console.error("[BillingHistory] load error:", err);
        toast({
          title: "Could not load billing history",
          description: err.message ?? "Unknown error",
          variant: "destructive",
        });
      } finally {
        setHistoryLoading(false);
      }
    };

    load();
  }, [user?.email, toast]);
  /* ----- helpers ----------------------------------------------------- */
  const mockCurrentPlan = useMemo(
    () =>
      currentPlan !== "free"
        ? {
            name: plans.find((p) => p.id === currentPlan)?.title || "Pro Plan",
            price: "99 HKD",
            nextBilling: "28-06-2025",
            status: "active",
          }
        : undefined,
    [currentPlan]
  );

  /* ----- subscribe handler ------------------------------------------ */
  const handleSubscribe = async (planId: string) => {
    if (planId === "free") {
      toast({
        title: "Free Plan Selected",
        description: "You're already on the free plan!",
      });
      return;
    }
    setLoadingPlan(planId);
    try {
      const plan = plans.find((p) => p.id === planId);
      const priceId =
        billingPeriod === "monthly" ? plan?.stripePriceIdMonthly : plan?.stripePriceIdYearly;
      if (!priceId) throw new Error("PriceId not found for this plan");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/stripe/create-checkout-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priceId, userEmail: user?.email }),
        }
      );

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Stripe did not return a redirect URL");
      }
    } catch (error: any) {
      toast({
        title: "Subscription Failed",
        description: error.message ?? "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageSubscription = () => {
    toast({
      title: "Opening Billing Portal",
      description: "Redirecting to Stripe billing portal...",
    });
    // TODO: redirect to your customer-portal endpoint
  };

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */

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
        <SiteHeader left="Subscriptions" right="" />

        <div className="p-8">
          {/* ------------------------------------------------ Plans / History Tabs ----- */}
          <div className="bg-white border-b border-gray-200 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Subscriptions</h1>
                <p className="text-gray-600 mt-1">
                  Manage your subscription plans and billing
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                {currentPlan !== "free" && (
                  <Button variant="outline" size="sm" onClick={handleManageSubscription}>
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Billing
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* --------------- Tab navigation ---------------- */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 w-fit">
            <button
              onClick={() => setActiveTab("plans")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "plans"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Subscription Plans
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "history"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Billing History
            </button>
          </div>

          {/* ------------------ PLANS TAB ------------------ */}
          {activeTab === "plans" && (
            <div>
              {currentPlan !== "free" && (
                <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-green-900">
                        You&apos;re currently on the{" "}
                        {plans.find((p) => p.id === currentPlan)?.title}
                      </h3>
                      <p className="text-sm text-green-700 mt-1">
                        Next billing date: 28-06-2025
                      </p>
                    </div>
                    <Badge className="bg-green-500 text-white">Active</Badge>
                  </div>
                </div>
              )}

              {/* Billing-period toggle */}
              <div className="flex justify-center mb-8">
                <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                  {(["monthly", "yearly"] as const).map((period) => (
                    <button
                      key={period}
                      onClick={() => setBillingPeriod(period)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        billingPeriod === period
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      } ${period === "yearly" ? "relative" : ""}`}
                    >
                      {period === "monthly" ? "Monthly" : "Yearly"}
                      {period === "yearly" && (
                        <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1 rounded">
                          30% OFF
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pricing cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan) => (
                  <PricingCard
                    key={plan.id}
                    title={plan.title}
                    price={billingPeriod === "yearly" ? plan.yearlyPrice : plan.price}
                    currency={plan.currency}
                    description={plan.description}
                    features={plan.features}
                    isPopular={plan.isPopular}
                    isCurrentPlan={currentPlan === plan.id}
                    onSubscribe={() => handleSubscribe(plan.id)}
                    loading={loadingPlan === plan.id}
                    billingPeriod={billingPeriod}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ------------------ HISTORY TAB ---------------- */}
          {activeTab === "history" && (
            <SubscriptionHistory
              currentPlan={mockCurrentPlan}
              transactions={transactions}
              loading={historyLoading}
            />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
