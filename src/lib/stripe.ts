import { loadStripe } from '@stripe/stripe-js';
import axios from "axios";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

export const redirectToCheckout = async (items: { id: string; quantity: number }[]) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/stripe/create-checkout-session`,
      { items }
    );
    window.location.href = response.data.url;
  } catch (error) {
    console.error("Stripe Checkout error:", error);
    alert("Failed to redirect to checkout.");
  }
};

export { stripePromise };
