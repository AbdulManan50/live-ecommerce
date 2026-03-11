\"use client\";

import { useEffect, useMemo, useState } from \"react\";
import { useRouter } from \"next/navigation\";
import { getToken } from \"@/lib/auth-client\";
import { apiRequest } from \"@/lib/api\";

type CartProduct = {
  _id: string;
  title: string;
  price: number;
  images?: string[];
};

type CartItem = {
  product: CartProduct;
  quantity: number;
};

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setCheckingAuth(false);
      router.replace(\"/auth/login\");
      return;
    }

    (async () => {
      try {
        const me = await apiRequest(\"/api/users/me\", \"GET\", undefined, {
          authToken: token,
        });

        if (!me?._id) {
          setCheckingAuth(false);
          router.replace(\"/auth/login\");
          return;
        }

        const cart = await apiRequest(\"/api/cart\", \"POST\", {
          userId: me._id,
        });

        setItems(
          cart?.items?.map((it: any) => ({
            product: it.product,
            quantity: it.quantity,
          })) || [],
        );
      } catch (err: any) {
        setError(err?.message || \"Failed to load cart\");
      } finally {
        setLoading(false);
        setCheckingAuth(false);
      }
    })();
  }, [router]);

  const total = useMemo(
    () =>
      items.reduce(
        (sum, it) => sum + (Number(it.product.price) || 0) * (it.quantity || 1),
        0,
      ),
    [items],
  );

  const handleRemove = async (productId: string) => {
    const token = getToken();
    if (!token) {
      router.push(\"/auth/login\");
      return;
    }

    try {
      const me = await apiRequest(\"/api/users/me\", \"GET\", undefined, {
        authToken: token,
      });

      if (!me?._id) {
        router.push(\"/auth/login\");
        return;
      }

      const cart = await apiRequest(\"/api/cart/remove\", \"POST\", {
        userId: me._id,
        productId,
      });

      setItems(
        cart?.items?.map((it: any) => ({
          product: it.product,
          quantity: it.quantity,
        })) || [],
      );
    } catch {
      // ignore for now
    }
  };

  const handleCheckout = async () => {
    if (!items.length || !total) return;

    try {
      // amount is expected in the smallest currency unit
      const res = await apiRequest(\"/api/payments\", \"POST\", {
        amount: Math.round(total * 100),
      });

      // For this MVP we don't integrate Stripe Elements;
      // you can use res.clientSecret on a dedicated checkout screen.
      console.log(\"Stripe clientSecret\", res?.clientSecret);
      alert(\"Payment intent created. Implement card form using Stripe Elements for full checkout.\");
    } catch (err: any) {
      setError(err?.message || \"Failed to start payment\");
    }
  };

  return (
    <div className=\"min-h-screen bg-linear-to-b from-black via-zinc-950 to-black text-zinc-50\">
      <div className=\"max-w-5xl mx-auto px-4 py-8 md:py-10\">
        <header className=\"mb-6\">
          <h1 className=\"text-2xl md:text-3xl font-semibold\">Your Cart</h1>
          <p className=\"mt-1 text-sm text-zinc-400\">
            Review items added during and outside live streams.
          </p>
        </header>

        {checkingAuth || loading ? (
          <div className=\"flex items-center justify-center h-64 text-zinc-500\">
            Loading your cart…
          </div>
        ) : error ? (
          <div className=\"rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-100\">
            {error}
          </div>
        ) : !items.length ? (
          <div className=\"rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-8 text-center text-zinc-300\">
            Your cart is empty.
          </div>
        ) : (
          <div className=\"grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)] gap-6\">
            <div className=\"space-y-3\">
              {items.map((it) => (
                <div
                  key={it.product._id}
                  className=\"flex gap-3 border border-zinc-800 rounded-xl p-3 bg-zinc-950/70\"
                >
                  <div className=\"w-24 h-24 rounded-lg bg-zinc-900 overflow-hidden flex items-center justify-center\">
                    {it.product.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={it.product.images[0]}
                        alt={it.product.title}
                        className=\"w-full h-full object-cover\"
                      />
                    ) : (
                      <span className=\"text-[11px] text-zinc-500\">No image</span>
                    )}
                  </div>
                  <div className=\"flex-1 flex flex-col justify-between\">
                    <div>
                      <h3 className=\"text-sm font-semibold line-clamp-2\">
                        {it.product.title}
                      </h3>
                      <p className=\"mt-1 text-xs text-zinc-400\">
                        Qty {it.quantity}
                      </p>
                    </div>
                    <div className=\"flex items-center justify-between mt-2\">
                      <p className=\"text-sm font-semibold text-emerald-300\">
                        ${(Number(it.product.price) || 0).toFixed(2)}
                      </p>
                      <button
                        onClick={() => handleRemove(it.product._id)}
                        className=\"text-[11px] text-zinc-400 hover:text-red-300\"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className=\"rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 space-y-3\">
              <h2 className=\"text-sm font-semibold\">Order summary</h2>
              <div className=\"flex items-center justify-between text-sm\">
                <span className=\"text-zinc-400\">Items</span>
                <span>{items.length}</span>
              </div>
              <div className=\"flex items-center justify-between text-base font-semibold mt-2\">
                <span>Total</span>
                <span className=\"text-emerald-300\">
                  ${total.toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={!items.length}
                className=\"mt-3 w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-black text-sm font-medium py-2.5 transition-colors\"
              >
                Proceed to checkout
              </button>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

