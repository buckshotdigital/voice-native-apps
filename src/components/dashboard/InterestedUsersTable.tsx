'use client';

import type { InterestedUser } from '@/types';
import { formatDate } from '@/lib/utils';

export default function InterestedUsersTable({ users }: { users: InterestedUser[] }) {
  if (users.length === 0) {
    return (
      <p className="text-sm text-gray-400">No interested users yet.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-xs font-medium uppercase text-gray-500">
            <th className="px-3 py-2">Email</th>
            <th className="px-3 py-2">Name</th>
            <th className="px-3 py-2">Country</th>
            <th className="px-3 py-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, i) => (
            <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-3 py-2 font-medium text-gray-900">{user.email}</td>
              <td className="px-3 py-2 text-gray-600">{user.display_name || '—'}</td>
              <td className="px-3 py-2 text-gray-600">{user.country || '—'}</td>
              <td className="px-3 py-2 text-gray-500">{formatDate(user.interested_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
