import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6">
      <p className="text-[13px] font-medium tracking-wide text-muted uppercase">404</p>
      <h1 className="mt-2 text-xl font-semibold tracking-tight text-foreground">Page not found</h1>
      <p className="mt-2 text-[14px] text-muted">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-foreground px-4 py-2 text-[14px] font-medium text-white transition-colors hover:bg-foreground/80"
      >
        Go home
      </Link>
    </div>
  );
}
