export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-black via-zinc-950 to-black text-zinc-50">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-10 space-y-4">
        <h1 className="text-2xl md:text-3xl font-semibold">Checkout</h1>
        <p className="text-sm text-zinc-400">
          This project currently creates a Stripe PaymentIntent from your cart,
          but the card form (Stripe Elements) still needs to be wired to confirm
          payment and then create an order.
        </p>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 text-sm text-zinc-200">
          Go to <span className="font-mono">/cart</span> and click{" "}
          <span className="font-semibold">Proceed to checkout</span> to create a
          PaymentIntent.
        </div>
      </div>
    </div>
  );
}

