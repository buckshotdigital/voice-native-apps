import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 text-[13px] text-muted sm:flex-row">
        <div className="flex items-center gap-4">
          <span>&copy; {new Date().getFullYear()} VoiceNative</span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/apps" className="transition-colors hover:text-foreground">Directory</Link>
          <Link href="/submit" className="transition-colors hover:text-foreground">Submit</Link>
          <Link href="/terms" className="transition-colors hover:text-foreground">Terms</Link>
          <Link href="/privacy" className="transition-colors hover:text-foreground">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
