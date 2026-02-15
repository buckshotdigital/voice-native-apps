import { describe, it, expect } from 'vitest';
import { submitAppSchema, reportSchema, authSchema, signUpSchema } from '@/lib/validations';

describe('submitAppSchema', () => {
  const validApp = {
    name: 'Test Voice App',
    tagline: 'A great voice app for testing purposes',
    description: 'This is a test description that is at least fifty characters long to pass validation requirements here.',
    category_id: '550e8400-e29b-41d4-a716-446655440000',
    voice_features: ['Voice Commands'],
    platforms: ['web'],
    website_url: 'https://example.com',
    pricing_model: 'free',
    tags: ['test'],
  };

  it('accepts valid app data', () => {
    const result = submitAppSchema.safeParse(validApp);
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = submitAppSchema.safeParse({ ...validApp, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects short tagline', () => {
    const result = submitAppSchema.safeParse({ ...validApp, tagline: 'Short' });
    expect(result.success).toBe(false);
  });

  it('rejects short description', () => {
    const result = submitAppSchema.safeParse({ ...validApp, description: 'Too short' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid category UUID', () => {
    const result = submitAppSchema.safeParse({ ...validApp, category_id: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });

  it('rejects empty platforms', () => {
    const result = submitAppSchema.safeParse({ ...validApp, platforms: [] });
    expect(result.success).toBe(false);
  });

  it('rejects invalid website URL', () => {
    const result = submitAppSchema.safeParse({ ...validApp, website_url: 'not-a-url' });
    expect(result.success).toBe(false);
  });

  it('accepts valid App Store URL', () => {
    const result = submitAppSchema.safeParse({
      ...validApp,
      app_store_url: 'https://apps.apple.com/us/app/test/id123456',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid App Store URL', () => {
    const result = submitAppSchema.safeParse({
      ...validApp,
      app_store_url: 'https://example.com/not-app-store',
    });
    expect(result.success).toBe(false);
  });

  it('rejects javascript: protocol in website URL', () => {
    const result = submitAppSchema.safeParse({ ...validApp, website_url: 'javascript:alert(1)' });
    expect(result.success).toBe(false);
  });

  it('rejects data: protocol in website URL', () => {
    const result = submitAppSchema.safeParse({ ...validApp, website_url: 'data:text/html,<h1>xss</h1>' });
    expect(result.success).toBe(false);
  });

  it('rejects javascript: protocol in demo_video_url', () => {
    const result = submitAppSchema.safeParse({ ...validApp, demo_video_url: 'javascript:alert(1)' });
    expect(result.success).toBe(false);
  });

  it('rejects javascript: protocol in other_download_url', () => {
    const result = submitAppSchema.safeParse({ ...validApp, other_download_url: 'javascript:void(0)' });
    expect(result.success).toBe(false);
  });

  it('accepts https demo video URL', () => {
    const result = submitAppSchema.safeParse({ ...validApp, demo_video_url: 'https://youtube.com/watch?v=123' });
    expect(result.success).toBe(true);
  });

  it('rejects more than 10 tags', () => {
    const result = submitAppSchema.safeParse({
      ...validApp,
      tags: Array.from({ length: 11 }, (_, i) => `tag${i}`),
    });
    expect(result.success).toBe(false);
  });
});

describe('reportSchema', () => {
  it('accepts valid report', () => {
    const result = reportSchema.safeParse({
      app_id: '550e8400-e29b-41d4-a716-446655440000',
      reason: 'spam',
      details: 'This app is clearly spam content.',
    });
    expect(result.success).toBe(true);
  });

  it('rejects short details', () => {
    const result = reportSchema.safeParse({
      app_id: '550e8400-e29b-41d4-a716-446655440000',
      reason: 'spam',
      details: 'Short',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid reason', () => {
    const result = reportSchema.safeParse({
      app_id: '550e8400-e29b-41d4-a716-446655440000',
      reason: 'invalid_reason',
      details: 'This is a detailed report.',
    });
    expect(result.success).toBe(false);
  });
});

describe('authSchema', () => {
  it('accepts valid credentials', () => {
    const result = authSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = authSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });
});

describe('signUpSchema', () => {
  it('accepts valid signup data', () => {
    const result = signUpSchema.safeParse({
      email: 'test@example.com',
      password: 'Password1',
      display_name: 'Test User',
    });
    expect(result.success).toBe(true);
  });

  it('rejects password without uppercase', () => {
    const result = signUpSchema.safeParse({
      email: 'test@example.com',
      password: 'password1',
      display_name: 'Test',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password without number', () => {
    const result = signUpSchema.safeParse({
      email: 'test@example.com',
      password: 'Password',
      display_name: 'Test',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short password', () => {
    const result = signUpSchema.safeParse({
      email: 'test@example.com',
      password: 'Pa1',
      display_name: 'Test',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short display name', () => {
    const result = signUpSchema.safeParse({
      email: 'test@example.com',
      password: 'Password1',
      display_name: 'A',
    });
    expect(result.success).toBe(false);
  });
});
