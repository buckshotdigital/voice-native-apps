import { z } from 'zod';
import { APP_STORE_URL_REGEX, PLAY_STORE_URL_REGEX } from './constants';

/** Zod .url() accepts javascript: and data: protocols. This refinement restricts to http/https. */
const httpUrl = (message = 'Please enter a valid URL') =>
  z.string().url(message).refine(
    (url) => url.startsWith('https://') || url.startsWith('http://'),
    { message: 'URL must start with https:// or http://' }
  );

export const submitAppSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be under 100 characters'),
  tagline: z.string().min(10, 'Tagline must be at least 10 characters').max(150, 'Tagline must be under 150 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters').max(2000, 'Description must be under 2000 characters'),
  category_id: z.string().uuid('Please select a category'),
  voice_features: z.array(z.string()).min(1, 'Select at least one voice feature'),
  platforms: z.array(z.enum(['ios', 'android', 'web', 'macos', 'windows', 'linux', 'alexa', 'google_assistant'])).min(1, 'Select at least one platform'),
  website_url: httpUrl(),
  app_store_url: httpUrl().regex(APP_STORE_URL_REGEX, 'Must be a valid App Store URL').optional().or(z.literal('')),
  play_store_url: httpUrl().regex(PLAY_STORE_URL_REGEX, 'Must be a valid Play Store URL').optional().or(z.literal('')),
  other_download_url: httpUrl().optional().or(z.literal('')),
  demo_video_url: httpUrl().optional().or(z.literal('')),
  pricing_model: z.enum(['free', 'freemium', 'paid', 'subscription']),
  pricing_details: z.string().max(100).optional().or(z.literal('')),
  is_coming_soon: z.boolean().default(false),
  expected_launch_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected launch date must be a valid date').optional().or(z.literal('')),
  tags: z.array(
    z.string()
      .min(2, 'Tag must be at least 2 characters')
      .max(30, 'Tag must be under 30 characters')
      .regex(/^[a-zA-Z0-9\s\-]+$/, 'Tags can only contain letters, numbers, spaces, and hyphens')
  ).max(10, 'Maximum 10 tags'),
  // honeypot
  website2: z.string().optional(),
});

export type SubmitAppInput = z.infer<typeof submitAppSchema>;

export const reportSchema = z.object({
  app_id: z.string().uuid(),
  reason: z.enum(['spam', 'misleading', 'broken_links', 'duplicate', 'inappropriate', 'other']),
  details: z.string().min(10, 'Please provide at least 10 characters of detail').max(500, 'Details must be under 500 characters'),
});

export type ReportInput = z.infer<typeof reportSchema>;

export const authSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export type AuthInput = z.infer<typeof authSchema>;

export const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  display_name: z.string().min(2, 'Display name must be at least 2 characters').max(50),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export const countryCodeSchema = z.string().regex(/^[A-Z]{2}$/, 'Invalid country code');
