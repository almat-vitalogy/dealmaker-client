"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import PricingCard from "@/components/PricingCard";
import SubscriptionHistory from "@/components/SubscriptionHistory";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Settings } from "lucide-react";
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// MOCK DATA
const getDiscountedPrice = (monthlyPrice: number) => Math.round(monthlyPrice * 12 * 0.7);

const plans = [
  {
    id: 'free',
    title: 'Free Plan',
    price: 'Free',
    currency: '',
    yearlyPrice: 'Free',
    description: 'Perfect for getting started with basic blast messaging',
    features: [
      '100 blast messages per month',
      '10 AI message generation per month'
    ],
  },
  {
    id: 'pro',
    title: 'Pro Plan',
    price: '99',
    currency: 'HKD',
    yearlyPrice: getDiscountedPrice(99).toString(),
    description: 'Ideal for growing businesses with higher volume needs',
    features: [
      '1,000 blast messages per month',
      '200 AI message generation per month',
      'Crawl contacts from WhatsApp group',
      'Reuse custom templates'
    ],
    isPopular: true,
  },
  {
    id: 'enterprise',
    title: 'Enterprise Plan',
    price: '199',
    currency: 'HKD',
    yearlyPrice: getDiscountedPrice(199).toString(),
    description: 'For businesses that need unlimited messaging power',
    features: [
      'Unlimited blast messages',
      'Unlimited AI message generation',
      'Crawl contacts from WhatsApp group',
      'Reuse custom templates',
      'Dedicated account manager'
    ],
  }
];

const mockTransactions = [
  {
    id: '1',
    date: '28-05-2025, 19:06',
    plan: 'Pro Plan',
    amount: '99 HKD',
    status: 'completed' as const
  },
  {
    id: '2',
    date: '28-04-2025, 19:06',
    plan: 'Pro Plan',
    amount: '99 HKD',
    status: 'completed' as const
  }
];

export default function SubscriptionsClient({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState('plans');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState('free'); // mock current plan
  const { toast } = useToast();

  const mockCurrentPlan = currentPlan !== 'free' ? {
    name: plans.find(p => p.id === currentPlan)?.title || 'Pro Plan',
    price: '99 HKD',
    nextBilling: '28-06-2025',
    status: 'active'
  } : undefined;

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') {
      toast({
        title: "Free Plan Selected",
        description: "You're already on the free plan!",
      });
      return;
    }
    setLoadingPlan(planId);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCurrentPlan(planId);
      toast({
        title: "Subscription Successful!",
        description: `You've successfully subscribed to the ${plans.find(p => p.id === planId)?.title}`,
      });
    } catch (error) {
      toast({
        title: "Subscription Failed",
        description: "There was an error processing your subscription. Please try again.",
        variant: "destructive"
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
    // Stripe customer portal redirect goes here
  };

  return (
    <SidebarProvider style={{
      "--sidebar-width": "calc(var(--spacing) * 72)",
      "--header-height": "calc(var(--spacing) * 12)"
    } as React.CSSProperties}>
      <AppSidebar variant="inset" user={user} />
      <SidebarInset>
        <SiteHeader left="Subscriptions" right="" />
        <div className="p-8">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Subscriptions</h1>
                <p className="text-gray-600 mt-1">Manage your subscription plans and billing</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                {currentPlan !== 'free' && (
                  <Button variant="outline" size="sm" onClick={handleManageSubscription}>
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Billing
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 w-fit">
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'plans'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Subscription Plans
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'history'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Billing History
            </button>
          </div>

          {activeTab === 'plans' && (
            <div>
              {/* Current Plan Status */}
              {currentPlan !== 'free' && (
                <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-green-900">
                        You're currently on the {plans.find(p => p.id === currentPlan)?.title}
                      </h3>
                      <p className="text-sm text-green-700 mt-1">
                        Next billing date: 28-06-2025
                      </p>
                    </div>
                    <Badge className="bg-green-500 text-white">Active</Badge>
                  </div>
                </div>
              )}

              {/* Billing Period Toggle */}
              <div className="flex justify-center mb-8">
                <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setBillingPeriod('monthly')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${billingPeriod === 'monthly'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingPeriod('yearly')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${billingPeriod === 'yearly'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    Yearly
                    <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1 rounded">
                      30% OFF
                    </span>
                  </button>
                </div>
              </div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan) => (
                  <PricingCard
                    key={plan.id}
                    title={plan.title}
                    price={billingPeriod === 'yearly' ? plan.yearlyPrice : plan.price}
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

              {/* Feature Comparison */}
              <div className="mt-12 bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Plan Comparison</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feature</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Free</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Pro</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Enterprise</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Blast Messages</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">100/month</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">1,000/month</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">Unlimited</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">AI Message Generation</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">10/month</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">200/month</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">Unlimited</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Crawl Contacts from WhatsApp Group</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">-</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">✓</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">✓</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Reuse Custom Templates</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">-</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">✓</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">✓</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Dedicated Account Manager</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">-</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">-</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">✓</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <SubscriptionHistory
              currentPlan={mockCurrentPlan}
              transactions={mockTransactions}
            />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
