import React from 'react';
import { Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PricingCardProps {
  title: string;
  price: string;
  currency: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  isCurrentPlan?: boolean;
  onSubscribe: () => void;
  loading?: boolean;
  billingPeriod?: 'monthly' | 'yearly';
}

const PricingCard = ({
  title,
  price,
  currency,
  description,
  features,
  isPopular = false,
  isCurrentPlan = false,
  onSubscribe,
  loading = false,
  billingPeriod = 'monthly'
}: PricingCardProps) => {
  const isYearly = billingPeriod === 'yearly';
  const isFree = price === 'Free';

  return (
    <Card className={`relative transition-all duration-200 ${isPopular ? 'ring-2 ring-blue-500 shadow-lg scale-105' : 'hover:shadow-md'} ${isCurrentPlan ? 'border-green-500 bg-green-50' : ''}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-blue-500 text-white px-3 py-1 rounded-full flex items-center space-x-1">
            <Star className="w-3 h-3" />
            <span className="text-xs font-medium">Most Popular</span>
          </Badge>
        </div>
      )}
      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <Badge className="bg-green-500 text-white px-3 py-1 rounded-full">
            <span className="text-xs font-medium">Your Plan</span>
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-6">
        <CardTitle className="text-xl font-semibold text-gray-900">{title}</CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-bold text-gray-900">{price}</span>
          <span className="text-lg text-gray-500 ml-1">{currency}</span>
          {!isFree && (
            <div className="text-gray-500 text-sm">
              {isYearly ? '/year' : '/month'}
              {isYearly && <div className="text-green-600 font-medium text-xs mt-1">Save 30%!</div>}
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-2">{description}</p>
      </CardHeader>

      <CardContent className="space-y-6">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center space-x-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          onClick={onSubscribe}
          disabled={loading || isCurrentPlan}
          className={`w-full ${isPopular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'} ${isCurrentPlan ? 'bg-green-600 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <span className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </span>
          ) : isCurrentPlan ? (
            'Current Plan'
          ) : (
            `Subscribe to ${title}`
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PricingCard;
