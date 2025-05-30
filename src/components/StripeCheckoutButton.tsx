"use client";

import { redirectToCheckout } from '@/lib/stripe';

export default function StripeCheckoutButton({ priceId }: { priceId: string }) {
  const handleCheckout = async () => {
    const res = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });
    const data = await res.json();
    window.location.href = data.url;
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
