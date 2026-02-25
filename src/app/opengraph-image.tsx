import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';
export const alt = 'VoiceNative Directory - Best Voice-First Apps';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { count: appCount } = await supabase
    .from('apps')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  const { count: categoryCount } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true });

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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              color: 'white',
            }}
          >
            V
          </div>
          <span
            style={{
              fontSize: '24px',
              color: '#94a3b8',
              fontFamily: 'sans-serif',
            }}
          >
            VoiceNative Directory
          </span>
        </div>

        <div
          style={{
            fontSize: '56px',
            fontWeight: 700,
            color: 'white',
            lineHeight: 1.15,
            fontFamily: 'sans-serif',
            marginBottom: '32px',
          }}
        >
          Discover the Best
          <br />
          Voice-First Apps
        </div>

        <div
          style={{
            display: 'flex',
            gap: '32px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '20px 32px',
            }}
          >
            <span
              style={{
                fontSize: '40px',
                fontWeight: 700,
                color: '#818cf8',
                fontFamily: 'sans-serif',
              }}
            >
              {appCount || 100}+
            </span>
            <span
              style={{
                fontSize: '18px',
                color: '#94a3b8',
                fontFamily: 'sans-serif',
              }}
            >
              Voice Apps
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '20px 32px',
            }}
          >
            <span
              style={{
                fontSize: '40px',
                fontWeight: 700,
                color: '#818cf8',
                fontFamily: 'sans-serif',
              }}
            >
              {categoryCount || 10}
            </span>
            <span
              style={{
                fontSize: '18px',
                color: '#94a3b8',
                fontFamily: 'sans-serif',
              }}
            >
              Categories
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '20px 32px',
            }}
          >
            <span
              style={{
                fontSize: '40px',
                fontWeight: 700,
                color: '#818cf8',
                fontFamily: 'sans-serif',
              }}
            >
              Free
            </span>
            <span
              style={{
                fontSize: '18px',
                color: '#94a3b8',
                fontFamily: 'sans-serif',
              }}
            >
              To Browse
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
