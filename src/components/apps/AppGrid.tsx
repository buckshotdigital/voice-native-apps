import AppCard from './AppCard';
import type { App } from '@/types';

export default function AppGrid({
  apps,
  emptyMessage,
}: {
  apps: App[];
  emptyMessage?: string;
}) {
  if (apps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20">
        <p className="text-[14px] text-muted">{emptyMessage || 'No apps found.'}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {apps.map((app) => (
        <AppCard key={app.id} app={app} />
      ))}
    </div>
  );
}
