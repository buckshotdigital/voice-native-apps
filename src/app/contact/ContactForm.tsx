'use client';

import { useState, useTransition } from 'react';
import { submitContactMessage } from '@/actions/contact';
import { AlertCircle, CheckCircle, Send } from 'lucide-react';

export default function ContactForm({ userEmail }: { userEmail: string }) {
  const [isPending, startTransition] = useTransition();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await submitContactMessage({ subject, message });
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setSubject('');
        setMessage('');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-[13px] font-medium text-foreground">
          Your email
        </label>
        <p className="mt-1 rounded-lg border bg-surface px-3 py-2 text-[14px] text-muted">
          {userEmail}
        </p>
      </div>

      <div>
        <label htmlFor="subject" className="block text-[13px] font-medium text-foreground">
          Subject <span className="text-red-500">*</span>
        </label>
        <input
          id="subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          minLength={3}
          maxLength={200}
          className="mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-[14px] text-foreground placeholder:text-muted/50 focus:border-foreground/20 focus:outline-none focus:ring-2 focus:ring-foreground/5"
          placeholder="What's this about?"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-[13px] font-medium text-foreground">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          minLength={10}
          maxLength={5000}
          rows={6}
          className="mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-[14px] text-foreground placeholder:text-muted/50 focus:border-foreground/20 focus:outline-none focus:ring-2 focus:ring-foreground/5"
          placeholder="Tell us what's on your mind..."
        />
        <p className="mt-1 text-[12px] text-muted">{message.length}/5000</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-[13px] text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-[13px] text-green-700">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          Message sent! We&apos;ll get back to you soon.
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-foreground/80 disabled:opacity-50"
      >
        <Send className="h-3.5 w-3.5" />
        {isPending ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
