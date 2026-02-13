import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - VoiceNative',
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Terms of Service</h1>
      <p className="mt-2 text-[13px] text-muted">Last updated: February 2026</p>

      <div className="mt-8 space-y-6 text-[14px] leading-relaxed text-foreground/80">
        <section>
          <h2 className="text-[15px] font-semibold text-foreground">1. Acceptance of Terms</h2>
          <p className="mt-2">
            By accessing or using VoiceNative Directory (&quot;the Service&quot;), you agree to be bound by
            these Terms of Service. If you do not agree, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold text-foreground">2. Description of Service</h2>
          <p className="mt-2">
            VoiceNative Directory is a curated listing of voice-native applications. We provide
            information about third-party apps but do not develop, maintain, or endorse them.
          </p>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold text-foreground">3. User Accounts</h2>
          <p className="mt-2">
            You may create an account to submit apps and interact with the directory. You are
            responsible for maintaining the security of your account and all activity under it.
          </p>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold text-foreground">4. Submissions</h2>
          <p className="mt-2">
            By submitting an app listing, you represent that the information provided is accurate
            and that you have the right to submit it. We reserve the right to approve, reject, or
            remove any listing at our discretion.
          </p>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold text-foreground">5. Prohibited Conduct</h2>
          <p className="mt-2">You agree not to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Submit false, misleading, or spam content</li>
            <li>Manipulate upvotes or ratings</li>
            <li>Scrape or harvest data from the Service</li>
            <li>Interfere with the operation of the Service</li>
            <li>Impersonate others or misrepresent your affiliation</li>
          </ul>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold text-foreground">6. Intellectual Property</h2>
          <p className="mt-2">
            App names, logos, and trademarks belong to their respective owners. Listing an app
            does not imply endorsement or ownership by VoiceNative.
          </p>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold text-foreground">7. Disclaimer</h2>
          <p className="mt-2">
            The Service is provided &quot;as is&quot; without warranties of any kind. We are not responsible
            for the quality, safety, or legality of third-party apps listed in the directory.
          </p>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold text-foreground">8. Limitation of Liability</h2>
          <p className="mt-2">
            VoiceNative shall not be liable for any indirect, incidental, or consequential damages
            arising from your use of the Service.
          </p>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold text-foreground">9. Changes to Terms</h2>
          <p className="mt-2">
            We may update these terms at any time. Continued use of the Service after changes
            constitutes acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold text-foreground">10. Contact</h2>
          <p className="mt-2">
            For questions about these terms, please use the contact information provided on our website.
          </p>
        </section>
      </div>
    </div>
  );
}
