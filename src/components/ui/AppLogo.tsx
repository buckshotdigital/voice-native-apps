'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function AppLogo({
  src,
  appName,
  sizes = '44px',
  priority = false,
  className = '',
}: {
  src: string | null;
  appName: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`flex h-full w-full items-center justify-center text-sm font-semibold text-muted ${className}`}>
        {appName[0]}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={`${appName} logo`}
      className={`h-full w-full object-cover ${className}`}
      fill
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
    />
  );
}
