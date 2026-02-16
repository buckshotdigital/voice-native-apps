'use client';

import { useState, useTransition } from 'react';
import { Download } from 'lucide-react';
import { getInterestedUsers } from '@/actions/premium';

export default function CsvExportButton({ appId, appName }: { appId: string; appName: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleExport() {
    setError(null);
    startTransition(async () => {
      const result = await getInterestedUsers(appId);
      if (result.error || !result.users) {
        setError(result.error || 'Failed to export.');
        return;
      }

      const header = 'Email,Name,Country,Date';
      const rows = result.users.map((u) => {
        const email = `"${u.email.replace(/"/g, '""')}"`;
        const name = `"${(u.display_name || '').replace(/"/g, '""')}"`;
        const country = u.country || '';
        const date = new Date(u.interested_at).toISOString().split('T')[0];
        return `${email},${name},${country},${date}`;
      });

      const csv = [header, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${appName.replace(/[^a-zA-Z0-9]/g, '_')}_interests.csv`;
      link.click();
      URL.revokeObjectURL(url);
    });
  }

  return (
    <div>
      <button
        onClick={handleExport}
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        {isPending ? 'Exporting...' : 'Export CSV'}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
