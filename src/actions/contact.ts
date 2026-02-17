'use server';

import { createClient } from '@/lib/supabase/server';

export async function submitContactMessage(data: {
  subject: string;
  message: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be signed in to send a message.' };
  }

  if (!data.subject || data.subject.trim().length < 3) {
    return { error: 'Please provide a subject (at least 3 characters).' };
  }

  if (!data.message || data.message.trim().length < 10) {
    return { error: 'Please provide a message (at least 10 characters).' };
  }

  const { error } = await supabase.from('contact_messages').insert({
    user_id: user.id,
    email: user.email || '',
    subject: data.subject.trim(),
    message: data.message.trim(),
  });

  if (error) {
    return { error: 'Failed to send message. Please try again.' };
  }

  return { success: true };
}
