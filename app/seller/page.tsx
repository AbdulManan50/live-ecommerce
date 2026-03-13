"use client";

import { useEffect, useRef, useState } from "react";
import { getToken } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api";
import { startStream } from "@/services/stream.service";

type SellerStream = {
  _id: string;
  title: string;
  status: "live" | "ended";
};

type SellerProduct = {
  _id: string;
  title: string;
  price: number;
  stock?: number;
  description?: string;
  images?: string[];
  category?: { _id: string; title: string; slug: string } | string;
};

export default function SellerDashboard() {
  const [storeCategory, setStoreCategory] = useState<string | null>(null);
  const [streams, setStreams] = useState<SellerStream[]>([]);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [categories, setCategories] = useState<
    { _id: string; title: string; slug: string }[]
  >([]);
  const [title, setTitle] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [creatingProduct, setCreatingProduct] = useState(false);
  const [productTitle, setProductTitle] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState("");
  const [productCategoryId, setProductCategoryId] = useState("");
  const [productImageUrls, setProductImageUrls] = useState<string[]>([]);
  const [productImageUploading, setProductImageUploading] = useState(false);
  const [productImageLocalPreviews, setProductImageLocalPreviews] = useState<
    { url: string; name: string }[]
  >([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    (async () => {
      try {
        const me = await apiRequest("/api/users/me", "GET", undefined, {
          authToken: token,
        });
        setStoreCategory(me?.store?.category || null);

        const [streamsData, productsData, categoriesData] = await Promise.all([
          apiRequest("/api/seller/streams", "POST", { sellerId: me._id }),
          apiRequest("/api/seller/products", "GET", undefined, {
            authToken: token,
          }),
          apiRequest("/api/categories", "GET"),
        ]);

        setStreams(streamsData || []);
        setProducts(productsData || []);
        setCategories(categoriesData || []);
      } catch {
        // ignore for MVP
      }
    })();
  }, []);

  const handleStartStream = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const token = getToken();
      if (!token) {
        setError("You must be logged in as a seller.");
        return;
      }

      const stream = await startStream(
        { title, categorySlug: categorySlug || undefined },
        token
      );

      setStreams((prev) => [stream, ...prev]);
      setTitle("");
      setCategorySlug("");
    } catch (err: any) {
      setError(err?.message || "Failed to start stream");
    } finally {
      setLoading(false);
    }
  };

  const uploadProductImage = async (file: File) => {
    const MAX_BYTES = 5 * 1024 * 1024;
    if (!file.type?.startsWith("image/")) {
      throw new Error("Only image files are allowed");
    }
    if (file.size > MAX_BYTES) {
      throw new Error("Image too large (max 5MB)");
    }

    const token = getToken();
    if (!token) throw new Error("Unauthorized");

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/uploads/product-image", {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: form,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || "Upload failed");
    }
    return data?.url as string;
  };

  const handleFiles = async (files: File[]) => {
    const picked = files.filter(Boolean);
    if (picked.length === 0) return;

    setError(null);
    setProductImageUploading(true);

    // local previews (immediate)
    const local = picked.map((f) => ({
      url: URL.createObjectURL(f),
      name: f.name,
    }));
    setProductImageLocalPreviews((prev) => [...prev, ...local]);

    try {
      const urls: string[] = [];
      for (const f of picked) {
        const url = await uploadProductImage(f);
        urls.push(url);
      }
      setProductImageUrls((prev) => [...prev, ...urls]);
    } catch (err: any) {
      setError(err?.message || "Failed to upload images");
    } finally {
      setProductImageUploading(false);
    }
  };

  const handlePickProductImages = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    await handleFiles(files);
    e.target.value = "";
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const token = getToken();
    if (!token) {
      setError("You must be logged in as a seller.");
      return;
    }

    if (!productCategoryId) {
      setError("Please choose a category.");
      return;
    }

    setCreatingProduct(true);
    try {
      const created = await apiRequest(
        "/api/seller/products",
        "POST",
        {
          title: productTitle,
          description: productDescription,
          price: Number(productPrice),
          stock: Number(productStock || 0),
          category: productCategoryId,
          images: productImageUrls,
        },
        { authToken: token }
      );

      setProducts((prev) => [created, ...prev]);
      setProductTitle("");
      setProductDescription("");
      setProductPrice("");
      setProductStock("");
      setProductCategoryId("");
      setProductImageUrls([]);
      setProductImageLocalPreviews((prev) => {
        prev.forEach((p) => URL.revokeObjectURL(p.url));
        return [];
      });
    } catch (err: any) {
      setError(err?.message || "Failed to create product");
    } finally {
      setCreatingProduct(false);
    }
  };

  const startEdit = (p: SellerProduct) => {
    setEditingId(p._id);
    setEditTitle(p.title || "");
    setEditDescription(p.description || "");
    setEditPrice(String(p.price ?? ""));
    setEditStock(String(p.stock ?? ""));
    const catId =
      typeof p.category === "string" ? p.category : p.category?._id || "";
    setEditCategoryId(catId);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
    setEditPrice("");
    setEditStock("");
    setEditCategoryId("");
  };

  const saveEdit = async (productId: string) => {
    setError(null);
    const token = getToken();
    if (!token) return;

    try {
      const updated = await apiRequest(
        `/api/products/${productId}`,
        "PUT",
        {
          title: editTitle,
          description: editDescription,
          price: Number(editPrice),
          stock: Number(editStock || 0),
          category: editCategoryId,
        },
        { authToken: token }
      );

      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? updated : p))
      );
      cancelEdit();
    } catch (err: any) {
      setError(err?.message || "Failed to update product");
    }
  };

  const deleteProduct = async (productId: string) => {
    setError(null);
    const token = getToken();
    if (!token) return;

    try {
      await apiRequest(`/api/products/${productId}`, "DELETE", undefined, {
        authToken: token,
      });
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (err: any) {
      setError(err?.message || "Failed to delete product");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-black via-zinc-950 to-black">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-10 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-zinc-50">
              Seller Studio
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Start live streams and manage your products.
            </p>
            {storeCategory && (
              <p className="mt-2 inline-flex items-center rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-200">
                Store category: {storeCategory}
              </p>
            )}
          </div>
        </header>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-100">
            Start a new live stream
          </h2>

          {error && (
            <div className="rounded-lg border border-red-500/50 bg-red-950/40 px-3 py-2 text-xs text-red-100">
              {error}
            </div>
          )}

          <form
            onSubmit={handleStartStream}
            className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_auto] gap-3"
          >
            <input
              placeholder="Stream title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/70"
              required
            />
            <input
              placeholder="Category slug (optional)"
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/70"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-black text-sm font-medium px-4 py-2 transition-colors"
            >
              {loading ? "Starting…" : "Go live"}
            </button>
          </form>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
            <h2 className="text-sm font-semibold text-zinc-100 mb-3">
              Your streams
            </h2>
            {streams.length === 0 ? (
              <p className="text-xs text-zinc-500">
                You haven&apos;t started any streams yet.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {streams.map((s) => (
                  <li
                    key={s._id}
                    className="flex items-center justify-between border border-zinc-800 rounded-lg px-3 py-2"
                  >
                    <span className="text-zinc-100 line-clamp-1">
                      {s.title}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {s.status === "live" ? "Live" : "Ended"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
            <h2 className="text-sm font-semibold text-zinc-100 mb-3">
              Your products
            </h2>
            <form onSubmit={handleCreateProduct} className="space-y-3 mb-4">
              <div className="grid grid-cols-1 gap-3">
                <input
                  placeholder="Product title"
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/70"
                  required
                />
                <textarea
                  placeholder="Description"
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  className="min-h-24 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/70"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    placeholder="Price"
                    inputMode="decimal"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/70"
                    required
                  />
                  <input
                    placeholder="Stock"
                    inputMode="numeric"
                    value={productStock}
                    onChange={(e) => setProductStock(e.target.value)}
                    className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/70"
                  />
                </div>
                <select
                  value={productCategoryId}
                  onChange={(e) => setProductCategoryId(e.target.value)}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/70"
                >
                  <option value="">Select a category…</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title} ({c.slug})
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-1 gap-3">
                  <div
                    onDragEnter={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragActive(true);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragActive(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragActive(false);
                    }}
                    onDrop={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragActive(false);
                      const files = Array.from(e.dataTransfer.files || []).filter(
                        (f) => f.type?.startsWith("image/")
                      );
                      await handleFiles(files);
                    }}
                    className={[
                      "rounded-2xl border border-dashed p-4 bg-zinc-950/40 transition-colors",
                      dragActive
                        ? "border-emerald-500/60 bg-emerald-500/5"
                        : "border-zinc-800",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-zinc-100">
                          Product images
                        </p>
                        <p className="text-xs text-zinc-500">
                          Drag & drop images here, or click to upload. Max 5MB
                          each.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={productImageUploading}
                        className="shrink-0 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-xs font-semibold text-zinc-200 hover:border-emerald-500/40 hover:text-emerald-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        {productImageUploading ? "Uploading…" : "Upload images"}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePickProductImages}
                        className="hidden"
                      />
                    </div>

                    {(productImageLocalPreviews.length > 0 ||
                      productImageUrls.length > 0) && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {productImageLocalPreviews.map((p) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={p.url}
                            src={p.url}
                            alt={p.name}
                            className="h-14 w-14 rounded-xl object-cover border border-zinc-800"
                          />
                        ))}
                        {productImageUrls.map((u) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={u}
                            src={u}
                            alt="Uploaded"
                            className="h-14 w-14 rounded-xl object-cover border border-emerald-500/20"
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={creatingProduct || productImageUploading}
                      className="rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-black text-sm font-semibold px-4 py-2.5 transition-colors"
                    >
                      {creatingProduct ? "Creating…" : "Add product"}
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {products.length === 0 ? (
              <p className="text-xs text-zinc-500">No products yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {products.map((p) => {
                  const isEditing = editingId === p._id;
                  const catTitle =
                    typeof p.category === "string"
                      ? "Uncategorized"
                      : p.category?.title || "Uncategorized";
                  return (
                    <li
                      key={p._id}
                      className="border border-zinc-800 rounded-lg px-3 py-2"
                    >
                      {!isEditing ? (
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-col">
                            <span className="text-zinc-100 line-clamp-1">
                              {p.title}
                            </span>
                            <span className="text-xs text-zinc-500">
                              {catTitle} • Stock {p.stock ?? 0}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-emerald-300">
                              ${(p.price ?? 0).toFixed(2)}
                            </span>
                            <button
                              onClick={() => startEdit(p)}
                              className="text-xs text-zinc-300 hover:text-zinc-50"
                              type="button"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteProduct(p._id)}
                              className="text-xs text-red-300 hover:text-red-200"
                              type="button"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="grid grid-cols-1 gap-2">
                            <input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/70"
                            />
                            <textarea
                              value={editDescription}
                              onChange={(e) =>
                                setEditDescription(e.target.value)
                              }
                              className="min-h-20 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/70"
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input
                                value={editPrice}
                                onChange={(e) => setEditPrice(e.target.value)}
                                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/70"
                              />
                              <input
                                value={editStock}
                                onChange={(e) => setEditStock(e.target.value)}
                                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/70"
                              />
                            </div>
                            <select
                              value={editCategoryId}
                              onChange={(e) => setEditCategoryId(e.target.value)}
                              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/70"
                            >
                              <option value="">Select a category…</option>
                              {categories.map((c) => (
                                <option key={c._id} value={c._id}>
                                  {c.title} ({c.slug})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={cancelEdit}
                              className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-900"
                              type="button"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => saveEdit(p._id)}
                              className="rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-medium px-3 py-2 transition-colors"
                              type="button"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

