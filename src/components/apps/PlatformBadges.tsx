import { PLATFORMS } from '@/lib/constants';
import type { Platform } from '@/types';

export default function PlatformBadges({
  platforms,
  size = 'sm',
}: {
  platforms: Platform[];
  size?: 'sm' | 'md';
}) {
  const sizeClasses = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1';

  return (
    <div className="flex flex-wrap gap-1">
      {platforms.map((platform) => {
        const config = PLATFORMS.find((p) => p.value === platform);
        if (!config) return null;
        return (
          <span
            key={platform}
            className={`inline-flex items-center gap-1 rounded-md bg-gray-100 text-gray-700 ${sizeClasses}`}
            title={config.label}
          >
            <span>{config.icon}</span>
            <span>{config.label}</span>
          </span>
        );
      })}
    </div>
  );
}
