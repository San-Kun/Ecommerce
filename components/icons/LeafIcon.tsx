export function LeafIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M24 42C24 42 10 36 10 20C10 12 16 6 24 6C32 6 38 12 38 20C38 36 24 42 24 42Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M24 42V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 26C24 26 18 24 16 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 20C24 20 30 18 32 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
