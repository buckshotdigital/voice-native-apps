import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for VoiceNative Directory. Learn how we collect, use, and protect your data.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
      <p className="mt-2 text-[13px] text-muted">Last updated: February 2026</p>

      <div className="mt-8 space-y-6 text-[14px] leading-relaxed text-foreground/80">
        <section>
          <h2 className="text-[15px] font-semibold text-foreground">1. Information We Collect</h2>
          <p className="mt-2">When you use VoiceNative Directory, we may collect:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li><strong>Account information:</strong> email address and display name when you create an account</li>
            <li><strong>Submission data:</strong> app details you provide when submitting a listing</li>
            <li><strong>Usage data:</strong> page views, upvotes, and general interaction patterns</li>
            <li><strong>Cookies:</strong> authentication tokens to keep you signed in</li>
          </ul>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold text-foreground">2. How We Use Your Information</h2>
          <p className="mt-2">We use collected information to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Provide and maintain the Service</li>
            <li>Authenticate your account</li>
            <li>Display app listings and upvote counts</li>
            <li>Prevent abuse and enforce our Terms of Service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold text-foreground">3. Data Storage</h2>
          <p className="mt-2">
            Your data is stored securely using Supabase, which provides encryption at rest and in
            transit. We do not sell your personal information to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold text-foreground">4. Third-Party Services</h2>
          <p className="mt-2">
            We use the following third-party services that may process your data:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li><strong>Supabase:</strong> database and authentication</li>
            <li><strong>Vercel:</strong> hosting and deployment</li>
          </ul>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold text-foreground">5. Your Rights</h2>
          <p className="mt-2">You have the right to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and associated data</li>
            <li>Withdraw consent for data processing</li>
          </ul>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold text-foreground">6. Data Retention</h2>
          <p className="mt-2">
            We retain your data for as long as your account is active. If you delete your account,
            we will remove your personal data within 30 days, except where retention is required by law.
          </p>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold text-foreground">7. Cookies</h2>
          <p className="mt-2">
            We use essential cookies only for authentication. We do not use tracking or advertising
            cookies.
          </p>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold text-foreground">8. Changes to This Policy</h2>
          <p className="mt-2">
            We may update this policy periodically. We will notify users of significant changes
            through the Service.
          </p>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold text-foreground">9. Contact</h2>
          <p className="mt-2">
            For privacy-related inquiries, please use the contact information provided on our website.
          </p>
        </section>
      </div>
    </div>
  );
}
