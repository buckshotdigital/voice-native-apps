import Image from 'next/image';
import Link from 'next/link';
import { truncate } from '@/lib/utils';
import type { App } from '@/types';
import { PLATFORMS, PRICING_MODELS } from '@/lib/constants';
import UpvoteChip from './UpvoteChip';
import InterestChip from './InterestChip';

export default function AppCard({ app, userId, userUpvoted, userInterested }: { app: App; userId?: string | null; userUpvoted?: boolean; userInterested?: boolean }) {
  const pricing = PRICING_MODELS.find((p) => p.value === app.pricing_model);

  return (
    <Link
      href={`/apps/${app.slug}`}
      className="group flex flex-col rounded-lg border bg-white p-3 transition-all hover:border-foreground/15 hover:shadow-sm sm:p-4"
    >
      {/* Top row: logo + meta */}
      <div className="flex items-start gap-2.5 sm:gap-3.5">
        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-[10px] bg-surface sm:h-11 sm:w-11">
          {app.logo_url ? (
            <Image
              src={app.logo_url}
              alt={app.name}
              className="h-full w-full object-cover"
              fill
              sizes="44px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted">
              {app.name[0]}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[14px] font-semibold text-foreground group-hover:text-accent">
              {app.name}
            </h3>
            {app.is_coming_soon && (
              <span className="flex-shrink-0 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                COMING SOON
              </span>
            )}
            {app.featured && !app.is_coming_soon && (
              <span className="flex-shrink-0 rounded bg-accent/8 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
                FEATURED
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-[13px] text-muted">
            {truncate(app.tagline, 70)}
          </p>
        </div>
      </div>

      {/* Bottom row: platforms + pricing + upvotes */}
      <div className="mt-3.5 flex items-center justify-between border-t pt-3">
        <div className="flex items-center gap-1.5">
          {app.platforms.slice(0, 3).map((p) => {
            const platform = PLATFORMS.find((pl) => pl.value === p);
            return platform ? (
              <span key={p} className="text-[12px]" title={platform.label}>
                {platform.icon}
              </span>
            ) : null;
          })}
          {app.platforms.length > 3 && (
            <span className="text-[11px] text-muted">+{app.platforms.length - 3}</span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {pricing && (
            <span className="text-[11px] font-medium text-muted">{pricing.label}</span>
          )}
          {app.is_coming_soon ? (
            <InterestChip
              appId={app.id}
              initialCount={app.interest_count}
              initialInterested={!!userInterested}
              userId={userId ?? null}
            />
          ) : (
            <UpvoteChip
              appId={app.id}
              initialCount={app.upvote_count}
              initialUpvoted={!!userUpvoted}
              userId={userId ?? null}
            />
          )}
        </div>
      </div>
    </Link>
  );
}
