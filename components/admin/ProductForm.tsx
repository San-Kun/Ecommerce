"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string };

type ProductFormValues = {
  name: string;
  slug: string;
  description: string;
  price: string;
  unit: "GRAM" | "KG" | "IKAT" | "PCS";
  weightPerUnit: string;
  stepQuantity: string;
  minOrderQty: string;
  stock: string;
  isOrganic: boolean;
  origin: string;
  categoryId: string;
  imagesText: string; // satu URL per baris
};

const emptyValues: ProductFormValues = {
  name: "",
  slug: "",
  description: "",
  price: "",
  unit: "KG",
  weightPerUnit: "",
  stepQuantity: "1",
  minOrderQty: "1",
  stock: "0",
  isOrganic: false,
  origin: "",
  categoryId: "",
  imagesText: "",
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function ProductForm({
  mode,
  categories,
  initialValues,
  slugParam,
}: {
  mode: "create" | "edit";
  categories: Category[];
  initialValues?: Partial<ProductFormValues>;
  /** slug produk asli di database, dipakai sebagai target endpoint PUT (bisa beda dari field slug yang lagi diketik user) */
  slugParam?: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>({ ...emptyValues, ...initialValues });
  const [slugTouched, setSlugTouched] = useState(mode === "edit"); // di mode edit, jangan auto-override slug yang sudah ada
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function update<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleNameChange(name: string) {
    update("name", name);
    if (!slugTouched) {
      update("slug", slugify(name));
    }
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
      unit: values.unit,
      weightPerUnit: values.weightPerUnit || undefined,
      stepQuantity: values.stepQuantity,
      minOrderQty: values.minOrderQty,
      stock: values.stock,
      isOrganic: values.isOrganic,
      origin: values.origin || undefined,
      categoryId: values.categoryId,
      images: values.imagesText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    const url = mode === "create" ? "/api/products" : `/api/products/${slugParam}`;
    const method = mode === "create" ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error && typeof data.error === "object") {
          setErrors(data.error);
        } else {
          setSubmitError(data.error ?? "Gagal menyimpan produk");
        }
        return;
      }

      router.push("/admin/produk");
      router.refresh();
    } catch {
      setSubmitError("Terjadi kesalahan jaringan, coba lagi");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      {submitError && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p>}

      <div>
        <label className="block text-sm font-medium text-stone-700">Nama produk</label>
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700">Kategori</label>
          <select
            value={values.categoryId}
            onChange={(e) => update("categoryId", e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="">Pilih kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="mt-1 text-xs text-red-600">{errors.categoryId[0]}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">Satuan</label>
          <select
            value={values.unit}
            onChange={(e) => update("unit", e.target.value as ProductFormValues["unit"])}
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="KG">Kilogram (kg)</option>
            <option value="GRAM">Gram</option>
            <option value="IKAT">Ikat</option>
            <option value="PCS">Pcs</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700">Harga (Rp)</label>
          <input
            type="number"
            min="0"
            step="1"
            value={values.price}
            onChange={(e) => update("price", e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
          {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price[0]}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">Stok</label>
          <input
            type="number"
            min="0"
            step="1"
            value={values.stock}
            onChange={(e) => update("stock", e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700">
            Step kuantitas <span className="font-normal text-stone-400">(mis. 0.25 utk kg)</span>
          </label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={values.stepQuantity}
            onChange={(e) => update("stepQuantity", e.target.value)}
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">Minimal pembelian</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={values.minOrderQty}
            onChange={(e) => update("minOrderQty", e.target.value)}
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">
          Keterangan berat <span className="font-normal text-stone-400">(opsional, mis. &quot;1 ikat ± 250g&quot;)</span>
        </label>
        <input
          type="text"
          value={values.weightPerUnit}
          onChange={(e) => update("weightPerUnit", e.target.value)}
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">
          Asal produk <span className="font-normal text-stone-400">(opsional)</span>
        </label>
        <input
          type="text"
          value={values.origin}
          onChange={(e) => update("origin", e.target.value)}
          placeholder="mis. Lembang, Jawa Barat"
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">
          URL gambar <span className="font-normal text-stone-400">(satu link per baris)</span>
        </label>
        <textarea
          value={values.imagesText}
          onChange={(e) => update("imagesText", e.target.value)}
          rows={2}
          placeholder="https://..."
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm font-mono focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-stone-700">
        <input
          type="checkbox"
          checked={values.isOrganic}
          onChange={(e) => update("isOrganic", e.target.checked)}
          className="rounded border-stone-300 text-emerald-700 focus:ring-emerald-600"
        />
        Produk organik
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          {isSubmitting ? "Menyimpan..." : mode === "create" ? "Tambah produk" : "Simpan perubahan"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/produk")}
          className="text-sm text-stone-500 hover:underline"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
