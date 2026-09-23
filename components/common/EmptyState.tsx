import Link from "next/link";
import { LeafIcon } from "@/components/icons/LeafIcon";

type EmptyStateProps = {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  icon?: React.ReactNode;
};

export function EmptyState({ title, description, actionHref, actionLabel, icon }: EmptyStateProps) {
  return (
    <div className="animate-fade-in-up mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center">
      <div className="leaf-pattern flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50">
        {icon ?? <LeafIcon className="h-12 w-12 text-emerald-300" />}
      </div>
      <h2 className="font-heading mt-5 text-lg font-semibold text-stone-900">{title}</h2>
      {description && <p className="mt-1 text-sm text-stone-500">{description}</p>}
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-5 rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-800"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
