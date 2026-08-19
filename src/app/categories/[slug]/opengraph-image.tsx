import { ImageResponse } from 'next/og';
import {
  getCategories,
  getCategoryBySlug,
  getCategoryApps,
  countAppsInCategory,
} from '@/lib/catalog';

export const alt = 'Voice App Category';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return getCategories().map((cat) => ({ slug: cat.slug }));
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
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
          Category Not Found
        </div>
      ),
      { ...size },
    );
  }

  const appCount = countAppsInCategory(category.id);
  const appNames = getCategoryApps(category.id, 4).map((a) => a.name);

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
        </div>

        {/* Category name */}
        <div
          style={{
            fontSize: '52px',
            fontWeight: 700,
            color: 'white',
            lineHeight: 1.15,
            fontFamily: 'sans-serif',
            marginBottom: '12px',
          }}
        >
          {`${category.name} Voice Apps`}
        </div>

        {/* App count */}
        <div
          style={{
            fontSize: '24px',
            color: '#818cf8',
            fontFamily: 'sans-serif',
            marginBottom: '40px',
          }}
        >
          {`${appCount} apps listed`}
        </div>

        {/* Top apps */}
        {appNames.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            {appNames.map((name) => (
              <div
                key={name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '12px 24px',
                }}
              >
                <span
                  style={{
                    fontSize: '18px',
                    color: '#cbd5e1',
                    fontFamily: 'sans-serif',
                  }}
                >
                  {name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    ),
    { ...size },
  );
}
