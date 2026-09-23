"use client";

import { useToastStore, type ToastVariant } from "@/store/useToastStore";

const variantStyle: Record<ToastVariant, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-red-200 bg-red-50 text-red-700",
  info: "border-stone-200 bg-white text-stone-700",
};

function Icon({ variant }: { variant: ToastVariant }) {
  if (variant === "success") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0 text-emerald-600">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path d="m8.5 12 2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (variant === "error") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0 text-red-600">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 7.5v5M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0 text-stone-500">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 11v5M12 8h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4 sm:bottom-6">
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => dismiss(t.id)}
          className={`toast-enter pointer-events-auto flex w-full max-w-sm items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg shadow-stone-900/5 ${variantStyle[t.variant]}`}
        >
          <Icon variant={t.variant} />
          <span className="text-left">{t.message}</span>
        </button>
      ))}
    </div>
  );
}
