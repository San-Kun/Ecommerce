"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ProductOption = { id: string; name: string; unit: string };

type PaketItem = { productId: string; quantity: number };

type PaketMenuFormValues = {
  name: string;
  slug: string;
  description: string;
  price: string;
  image: string;
  items: PaketItem[];
};

const emptyValues: PaketMenuFormValues = {
  name: "",
  slug: "",
  description: "",
  price: "",
  image: "",
  items: [],
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function PaketMenuForm({
  mode,
  products,
  slugParam,
  initialValues,
}: {
  mode: "create" | "edit";
  products: ProductOption[];
  slugParam?: string;
  initialValues?: Partial<PaketMenuFormValues>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<PaketMenuFormValues>({ ...emptyValues, ...initialValues });
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function update<K extends keyof PaketMenuFormValues>(key: K, value: PaketMenuFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleNameChange(name: string) {
    update("name", name);
    if (!slugTouched) update("slug", slugify(name));
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", files[0]);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error ?? "Gagal mengunggah gambar");
        return;
      }
      update("image", data.url);
    } catch {
      setUploadError("Terjadi kesalahan jaringan saat mengunggah");
    } finally {
      setIsUploading(false);
    }
  }

  function addItem() {
    const firstUnused = products.find((p) => !values.items.some((it) => it.productId === p.id));
    if (!firstUnused) return;
    update("items", [...values.items, { productId: firstUnused.id, quantity: 1 }]);
  }

  function updateItem(index: number, patch: Partial<PaketItem>) {
    update(
      "items",
      values.items.map((it, i) => (i === index ? { ...it, ...patch } : it))
    );
  }

  function removeItem(index: number) {
    update(
      "items",
      values.items.filter((_, i) => i !== index)
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSubmitError(null);
    setIsSubmitting(true);

    const payload = {
      name: values.name,
      slug: values.slug,
      description: values.description || undefined,
      price: values.price,
      image: values.image || undefined,
      items: values.items,
    };

    const url = mode === "create" ? "/api/paket-menu" : `/api/paket-menu/${slugParam}`;
    const method = mode === "create" ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error && typeof data.error === "object") setErrors(data.error);
        else setSubmitError(data.error ?? "Gagal menyimpan paket menu");
        return;
      }
      router.push("/admin/paket-menu");
      router.refresh();
    } catch {
      setSubmitError("Terjadi kesalahan jaringan, coba lagi");
    } finally {
      setIsSubmitting(false);
    }
  }

  const availableToAdd = products.some((p) => !values.items.some((it) => it.productId === p.id));

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      {submitError && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p>}

      <div>
        <label className="block text-sm font-medium text-stone-700">Nama paket</label>
        <input
          type="text"
          value={values.name}
          onChange={(e) => handleNameChange(e.target.value)}
          required
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name[0]}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">Slug (URL)</label>
        <input
          type="text"
          value={values.slug}
          onChange={(e) => {
            setSlugTouched(true);
            update("slug", e.target.value);
          }}
          required
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm font-mono focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
        {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug[0]}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">Deskripsi</label>
        <textarea
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">Harga paket (Rp)</label>
        <input
          type="number"
          min="0"
          step="1"
          value={values.price}
          onChange={(e) => update("price", e.target.value)}
          required
          className="mt-1 w-48 rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
        {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price[0]}</p>}
      </div>

      {/* Gambar */}
      <div>
        <label className="block text-sm font-medium text-stone-700">Gambar paket</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          disabled={isUploading}
          onChange={(e) => handleUpload(e.target.files)}
          className="mt-1 block w-full text-sm text-stone-600 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-emerald-700 hover:file:bg-emerald-100"
        />
        {isUploading && <p className="mt-1 text-xs text-stone-500">Mengunggah gambar...</p>}
        {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}
        {values.image && (
          <div className="relative mt-3 h-24 w-32 overflow-hidden rounded-md border border-stone-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={values.image} alt="Pratinjau" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => update("image", "")}
              aria-label="Hapus gambar"
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600/90 text-xs font-bold text-white"
            >
              ×
            </button>
          </div>
        )}
        <input
          type="url"
          value={values.image}
          onChange={(e) => update("image", e.target.value)}
          placeholder="atau tempel URL gambar"
          className="mt-2 w-full rounded-md border border-stone-300 px-3 py-2 text-sm font-mono focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
      </div>

      {/* Item produk */}
      <div>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-stone-700">Isi paket</label>
          <button
            type="button"
            onClick={addItem}
            disabled={!availableToAdd}
            className="text-sm text-emerald-700 hover:underline disabled:text-stone-300"
          >
            + Tambah produk
          </button>
        </div>
        {typeof errors.items?.[0] === "string" && <p className="mt-1 text-xs text-red-600">{errors.items[0]}</p>}

        <div className="mt-2 space-y-2">
          {values.items.length === 0 && (
            <p className="rounded-md border border-dashed border-stone-300 px-3 py-3 text-sm text-stone-400">
              Belum ada produk. Klik &quot;Tambah produk&quot; untuk mengisi paket.
            </p>
          )}
          {values.items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <select
                value={item.productId}
                onChange={(e) => updateItem(i, { productId: e.target.value })}
                className="flex-1 rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                step="1"
                value={item.quantity}
                onChange={(e) => updateItem(i, { quantity: Number(e.target.value) })}
                className="w-20 rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
              <button
                type="button"
                onClick={() => removeItem(i)}
                aria-label="Hapus produk"
                className="rounded-md border border-red-200 px-2 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          {isSubmitting ? "Menyimpan..." : mode === "create" ? "Tambah paket" : "Simpan perubahan"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/paket-menu")}
          className="text-sm text-stone-500 hover:underline"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
