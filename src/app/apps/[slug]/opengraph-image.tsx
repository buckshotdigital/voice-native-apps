import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';
import { PLATFORMS, PRICING_MODELS } from '@/lib/constants';

export const runtime = 'edge';
export const alt = 'Voice App Details';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data: app } = await supabase
    .from('apps')
    .select('name, tagline, pricing_model, platforms, category:categories(name)')
    .eq('slug', slug)
    .eq('status', 'approved')
    .single();

  if (!app) {
    return new ImageResponse(
      (
        <div
          style={{
            background: '#0f172a',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '36px',
            fontFamily: 'sans-serif',
          }}
        >
          App Not Found
        </div>
      ),
      { ...size },
    );
  }

  const pricingLabel =
    PRICING_MODELS.find((m) => m.value === app.pricing_model)?.label || app.pricing_model;
  const platforms: string[] = app.platforms || [];
  const platformLabels: string[] = platforms
    .map((p) => PLATFORMS.find((pl) => pl.value === p)?.label ?? '')
    .filter((l) => l !== '')
    .slice(0, 4);

  const pricingColor = app.pricing_model === 'free' ? '#22c55e' : app.pricing_model === 'freemium' ? '#3b82f6' : '#f59e0b';

  const categoryArr = app.category as { name: string }[] | null;
  const category = categoryArr?.[0] ?? null;

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <span
            style={{
              fontSize: '18px',
              color: '#94a3b8',
              fontFamily: 'sans-serif',
            }}
          >
            VoiceNative Directory
          </span>
          {category && (
            <span
              style={{
                fontSize: '16px',
                color: '#64748b',
                fontFamily: 'sans-serif',
              }}
            >
              / {category.name}
            </span>
          )}
        </div>

        {/* App name */}
        <div
          style={{
            fontSize: '52px',
            fontWeight: 700,
            color: 'white',
            lineHeight: 1.15,
            fontFamily: 'sans-serif',
            marginBottom: '16px',
          }}
        >
          {app.name}
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '24px',
            color: '#94a3b8',
            fontFamily: 'sans-serif',
            marginBottom: '40px',
            maxWidth: '800px',
          }}
        >
          {app.tagline}
        </div>

        {/* Badges */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          {/* Pricing badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '12px 20px',
            }}
          >
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: pricingColor,
              }}
            />
            <span
              style={{
                fontSize: '18px',
                color: 'white',
                fontFamily: 'sans-serif',
              }}
            >
              {pricingLabel}
            </span>
          </div>

          {/* Platform badges */}
          {platformLabels.map((label) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '12px 20px',
              }}
            >
              <span
                style={{
                  fontSize: '18px',
                  color: '#cbd5e1',
                  fontFamily: 'sans-serif',
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
