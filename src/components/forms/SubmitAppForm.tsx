'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { submitApp, updateApp } from '@/actions/apps';
import ImageUploader from './ImageUploader';
import TagInput from './TagInput';
import { PLATFORMS, PRICING_MODELS, VOICE_FEATURES, MAX_SCREENSHOTS } from '@/lib/constants';
import PlatformIcon from '@/components/ui/PlatformIcon';
import { AlertCircle, CheckCircle } from 'lucide-react';
import type { Category, App, Platform } from '@/types';

interface SubmitAppFormProps {
  categories: Category[];
  userId: string;
  editApp?: App;
}

export default function SubmitAppForm({ categories, userId, editApp }: SubmitAppFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState(editApp?.name || '');
  const [tagline, setTagline] = useState(editApp?.tagline || '');
  const [description, setDescription] = useState(editApp?.description || '');
  const [categoryId, setCategoryId] = useState(editApp?.category_id || '');
  const [voiceFeatures, setVoiceFeatures] = useState<string[]>(editApp?.voice_features || []);
  const [platforms, setPlatforms] = useState<string[]>(editApp?.platforms || []);
  const [websiteUrl, setWebsiteUrl] = useState(editApp?.website_url || '');
  const [appStoreUrl, setAppStoreUrl] = useState(editApp?.app_store_url || '');
  const [playStoreUrl, setPlayStoreUrl] = useState(editApp?.play_store_url || '');
  const [otherDownloadUrl, setOtherDownloadUrl] = useState(editApp?.other_download_url || '');
  const [demoVideoUrl, setDemoVideoUrl] = useState(editApp?.demo_video_url || '');
  const [pricingModel, setPricingModel] = useState(editApp?.pricing_model || 'free');
  const [pricingDetails, setPricingDetails] = useState(editApp?.pricing_details || '');
  const [isComingSoon, setIsComingSoon] = useState(editApp?.is_coming_soon || false);
  const [expectedLaunchDate, setExpectedLaunchDate] = useState(editApp?.expected_launch_date || '');
  const [tags, setTags] = useState<string[]>([]);
  const [logoUrl, setLogoUrl] = useState(editApp?.logo_url || '');
  const [screenshotUrls, setScreenshotUrls] = useState<string[]>(editApp?.screenshot_urls || []);

  // Honeypot
  const [website2, setWebsite2] = useState('');

  function toggleArrayValue(arr: string[], value: string, setter: (v: string[]) => void) {
    if (arr.includes(value)) {
      setter(arr.filter((v) => v !== value));
    } else {
      setter([...arr, value]);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const data = {
      name,
      tagline,
      description,
      category_id: categoryId,
      voice_features: voiceFeatures,
      platforms,
      website_url: websiteUrl,
      app_store_url: appStoreUrl,
      play_store_url: playStoreUrl,
      other_download_url: otherDownloadUrl,
      demo_video_url: demoVideoUrl,
      pricing_model: pricingModel,
      pricing_details: pricingDetails,
      is_coming_soon: isComingSoon,
      expected_launch_date: expectedLaunchDate,
      tags,
      website2, // honeypot
      logo_url: logoUrl,
      screenshot_urls: screenshotUrls,
    };

    // Client-side validation
    if (!logoUrl) {
      setError('Please upload a logo for your app.');
      return;
    }

    startTransition(async () => {
      const result = editApp
        ? await updateApp(editApp.id, data)
        : await submitApp(data);

      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(
          editApp
            ? 'App updated and resubmitted for review!'
            : 'App submitted for review! You can track its status in your dashboard.'
        );
        if (!editApp) {
          setTimeout(() => router.push('/dashboard'), 2000);
        }
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Honeypot - hidden from users */}
      <div className="absolute -left-[9999px] opacity-0" aria-hidden="true">
        <label htmlFor="website2">Website</label>
        <input
          type="text"
          id="website2"
          name="website2"
          value={website2}
          onChange={(e) => setWebsite2(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Section: Basic Info */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
        <p className="mt-1 text-sm text-gray-500">Tell us about your voice-native app.</p>

        <div className="mt-6 space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              App Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="My Voice App"
            />
            <p className="mt-1 text-xs text-gray-400">{name.length}/100</p>
          </div>

          {/* Tagline */}
          <div>
            <label htmlFor="tagline" className="block text-sm font-medium text-gray-700">
              Tagline <span className="text-red-500">*</span>
            </label>
            <input
              id="tagline"
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              required
              minLength={10}
              maxLength={150}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="A short description of what your app does"
            />
            <p className="mt-1 text-xs text-gray-400">{tagline.length}/150 (min 10)</p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={50}
              maxLength={2000}
              rows={5}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Describe your app in detail. What problem does it solve? How does it use voice interaction?"
            />
            <p className="mt-1 text-xs text-gray-400">{description.length}/2000 (min 50)</p>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Select a category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Section: Voice Features */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Voice Features <span className="text-red-500">*</span>
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Select the voice capabilities your app offers. At least one is required.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {VOICE_FEATURES.map((feature) => (
            <label
              key={feature}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                voiceFeatures.includes(feature)
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={voiceFeatures.includes(feature)}
                onChange={() => toggleArrayValue(voiceFeatures, feature, setVoiceFeatures)}
                className="sr-only"
              />
              <div
                className={`flex h-4 w-4 items-center justify-center rounded border ${
                  voiceFeatures.includes(feature)
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-gray-300'
                }`}
              >
                {voiceFeatures.includes(feature) && (
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              {feature}
            </label>
          ))}
        </div>
      </div>

      {/* Section: Platforms */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Platforms <span className="text-red-500">*</span>
        </h2>
        <p className="mt-1 text-sm text-gray-500">Select all platforms your app is available on.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => toggleArrayValue(platforms, p.value, setPlatforms)}
              className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                platforms.includes(p.value)
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <PlatformIcon platform={p.value as Platform} className="h-4 w-4" />
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section: Links */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Links</h2>
        <p className="mt-1 text-sm text-gray-500">Where can users find your app?</p>

        <div className="mt-6 space-y-5">
          <div>
            <label htmlFor="website_url" className="block text-sm font-medium text-gray-700">
              Website URL <span className="text-red-500">*</span>
            </label>
            <input
              id="website_url"
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="https://yourapp.com"
            />
          </div>

          <div>
            <label htmlFor="app_store_url" className="block text-sm font-medium text-gray-700">
              App Store URL <span className="text-xs text-gray-400">(optional)</span>
            </label>
            <input
              id="app_store_url"
              type="url"
              value={appStoreUrl}
              onChange={(e) => setAppStoreUrl(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="https://apps.apple.com/..."
            />
          </div>

          <div>
            <label htmlFor="play_store_url" className="block text-sm font-medium text-gray-700">
              Google Play URL <span className="text-xs text-gray-400">(optional)</span>
            </label>
            <input
              id="play_store_url"
              type="url"
              value={playStoreUrl}
              onChange={(e) => setPlayStoreUrl(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="https://play.google.com/store/apps/..."
            />
          </div>

          <div>
            <label htmlFor="other_download_url" className="block text-sm font-medium text-gray-700">
              Other Download URL <span className="text-xs text-gray-400">(optional)</span>
            </label>
            <input
              id="other_download_url"
              type="url"
              value={otherDownloadUrl}
              onChange={(e) => setOtherDownloadUrl(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="https://..."
            />
          </div>

          <div>
            <label htmlFor="demo_video_url" className="block text-sm font-medium text-gray-700">
              Demo Video URL <span className="text-xs text-gray-400">(optional, YouTube/Vimeo)</span>
            </label>
            <input
              id="demo_video_url"
              type="url"
              value={demoVideoUrl}
              onChange={(e) => setDemoVideoUrl(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
        </div>
      </div>

      {/* Section: Pricing */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Pricing</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {PRICING_MODELS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPricingModel(p.value)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                pricingModel === p.value
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {pricingModel !== 'free' && (
          <div className="mt-4">
            <label htmlFor="pricing_details" className="block text-sm font-medium text-gray-700">
              Pricing Details
            </label>
            <input
              id="pricing_details"
              type="text"
              value={pricingDetails}
              onChange={(e) => setPricingDetails(e.target.value)}
              maxLength={100}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="e.g. $9.99/month, Free tier available"
            />
          </div>
        )}
      </div>

      {/* Section: Coming Soon */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Launch Status</h2>
        <p className="mt-1 text-sm text-gray-500">Is your app available now, or coming soon?</p>

        <div className="mt-4">
          <div className="flex cursor-pointer items-center gap-3" onClick={() => setIsComingSoon(!isComingSoon)}>
            <button
              type="button"
              role="switch"
              aria-checked={isComingSoon}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors ${
                isComingSoon ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  isComingSoon ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-sm font-medium text-gray-700">This app is coming soon</span>
          </div>
        </div>

        {isComingSoon && (
          <div className="mt-4">
            <label htmlFor="expected_launch_date" className="block text-sm font-medium text-gray-700">
              Expected Launch Date <span className="text-xs text-gray-400">(optional)</span>
            </label>
            <input
              id="expected_launch_date"
              type="date"
              value={expectedLaunchDate}
              onChange={(e) => setExpectedLaunchDate(e.target.value)}
              className="mt-1 block w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        )}
      </div>

      {/* Section: Media */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Media</h2>
        <p className="mt-1 text-sm text-gray-500">Upload your app logo and screenshots.</p>

        <div className="mt-6 space-y-6">
          <ImageUploader
            label="App Logo *"
            type="logo"
            value={logoUrl}
            onChange={(v) => setLogoUrl(v as string)}
            userId={userId}
          />

          <ImageUploader
            label="Screenshots"
            type="screenshot"
            value={screenshotUrls}
            onChange={(v) => setScreenshotUrls(v as string[])}
            maxFiles={MAX_SCREENSHOTS}
            userId={userId}
          />
        </div>
      </div>

      {/* Section: Tags */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <TagInput value={tags} onChange={setTags} />
      </div>

      {/* Errors/Success */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-indigo-600 px-8 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {isPending
            ? 'Submitting...'
            : editApp
              ? 'Update & Resubmit'
              : 'Submit for Review'}
        </button>
      </div>
    </form>
  );
}
