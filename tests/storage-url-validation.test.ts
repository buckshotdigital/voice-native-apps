import { describe, it, expect } from 'vitest';

// Mirror the server-side validation function from actions/apps.ts
function isValidStorageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:'
      && parsed.hostname.endsWith('.supabase.co')
      && parsed.pathname.startsWith('/storage/v1/object/public/app-assets/');
  } catch {
    return false;
  }
}

describe('isValidStorageUrl', () => {
  it('accepts valid Supabase storage URLs', () => {
    expect(isValidStorageUrl(
      'https://abc123.supabase.co/storage/v1/object/public/app-assets/user-id/logo-123.png'
    )).toBe(true);
  });

  it('rejects non-HTTPS URLs', () => {
    expect(isValidStorageUrl(
      'http://abc123.supabase.co/storage/v1/object/public/app-assets/user-id/logo.png'
    )).toBe(false);
  });

  it('rejects non-Supabase domains', () => {
    expect(isValidStorageUrl(
      'https://evil.com/storage/v1/object/public/app-assets/user-id/logo.png'
    )).toBe(false);
  });

  it('rejects wrong bucket path', () => {
    expect(isValidStorageUrl(
      'https://abc123.supabase.co/storage/v1/object/public/other-bucket/logo.png'
    )).toBe(false);
  });

  it('rejects completely invalid URLs', () => {
    expect(isValidStorageUrl('not-a-url')).toBe(false);
    expect(isValidStorageUrl('')).toBe(false);
  });

  it('rejects javascript: protocol', () => {
    expect(isValidStorageUrl('javascript:alert(1)')).toBe(false);
  });

  it('rejects data: URLs', () => {
    expect(isValidStorageUrl('data:text/html,<h1>hi</h1>')).toBe(false);
  });

  it('rejects domains that contain supabase.co but are not subdomains', () => {
    expect(isValidStorageUrl(
      'https://evil-supabase.co/storage/v1/object/public/app-assets/logo.png'
    )).toBe(false);
  });
});
