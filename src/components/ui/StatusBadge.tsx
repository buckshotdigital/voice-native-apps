import type { AppStatus } from '@/types';

const statusConfig: Record<AppStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700' },
  approved: { label: 'Live', className: 'bg-emerald-50 text-emerald-700' },
  rejected: { label: 'Rejected', className: 'bg-red-50 text-red-600' },
};

export default function StatusBadge({ status }: { status: AppStatus }) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}
