"use client";

import { redirectToCheckout } from '@/lib/stripe';

export default function StripeCheckoutButton() {
  const handleCheckout = async () => {
    await redirectToCheckout([{ id: 'prod_basic_subscription', quantity: 1 }]);
  };

  return (
    <button
      className="bg-blue-500 text-white rounded px-4 py-2"
      onClick={handleCheckout}
    >
      Subscribe Now
    </button>
  );
}
