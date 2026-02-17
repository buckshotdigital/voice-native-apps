import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ContactForm from './ContactForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the VoiceNative team.',
  alternates: { canonical: '/contact' },
};

export default async function ContactPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirect=/contact');
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Contact Us</h1>
      <p className="mt-2 text-[14px] text-muted">
        Have a question, feedback, or concern? Send us a message and we&apos;ll get back to you.
      </p>

      <div className="mt-8">
        <ContactForm userEmail={user.email || ''} />
      </div>
    </div>
  );
}
