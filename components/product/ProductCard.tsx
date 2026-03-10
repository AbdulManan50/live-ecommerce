type ProductCardProps = {
  product: {
    _id: string;
    title: string;
    price: number;
    images?: string[];
  };
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="border border-zinc-800 rounded-2xl p-4 bg-zinc-950/70 hover:border-emerald-500/50 transition-colors flex flex-col gap-3">
      <div className="aspect-video rounded-xl bg-zinc-900 overflow-hidden flex items-center justify-center">
        {product.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-xs text-zinc-500">No image</div>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-zinc-50 line-clamp-2">
          {product.title}
        </h3>
        <p className="text-lg font-semibold text-emerald-300">
          ${product.price.toFixed(2)}
        </p>
      </div>

      <button className="mt-1 w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-medium py-2.5 transition-colors">
        Buy Now
      </button>
    </div>
  );
}
