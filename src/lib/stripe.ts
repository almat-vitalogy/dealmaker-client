import { loadStripe } from '@stripe/stripe-js';
import axios from "axios";
import { toast } from "sonner";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export const redirectToCheckout = async (items: { id: string; quantity: number }[]) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/stripe/create-checkout-session`,
      { items }
    );
    window.location.href = response.data.url;
  } catch (error) {
    console.error("Stripe Checkout error:", error);
    toast.error("Failed to redirect to checkout.");
  }
};

export { stripePromise };
