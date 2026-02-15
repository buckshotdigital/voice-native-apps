'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, StarOff, LayoutGrid, Search } from 'lucide-react';

type AppRow = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  featured: boolean;
  upvote_count: number;
  view_count: number;
  categoryName: string;
};

export default function AdminAppTable({ apps }: { apps: AppRow[] }) {
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? apps.filter((app) => {
        const q = query.toLowerCase();
        return (
          app.name.toLowerCase().includes(q) ||
          app.categoryName.toLowerCase().includes(q) ||
          app.slug.toLowerCase().includes(q)
        );
      })
    : apps;

  return (
    <div className="mt-10">
      <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
        <LayoutGrid className="h-5 w-5 text-indigo-500" />
        All Apps ({apps.length})
      </h2>

      <div className="relative mt-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search apps by name or category..."
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-gray-300 py-8 text-center text-sm text-gray-500">
          No apps match &ldquo;{query}&rdquo;
        </div>
      ) : (
        <div className="mt-3 overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">App</th>
                <th className="hidden px-4 py-3 sm:table-cell">Category</th>
                <th className="px-4 py-3 text-center">Featured</th>
                <th className="hidden px-4 py-3 text-right sm:table-cell">Views</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filtered.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {app.logo_url ? (
                          <Image src={app.logo_url} alt={app.name} fill className="object-cover" sizes="32px" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-bold text-gray-400">
                            {app.name[0]}
                          </div>
                        )}
                      </div>
                      <span className="truncate font-medium text-gray-900">{app.name}</span>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-gray-500 sm:table-cell">
                    {app.categoryName}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {app.featured ? (
                      <Star className="mx-auto h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ) : (
                      <StarOff className="mx-auto h-4 w-4 text-gray-300" />
                    )}
                  </td>
                  <td className="hidden px-4 py-3 text-right text-gray-500 sm:table-cell">
                    {app.view_count}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/app/${app.id}`}
                      className="text-indigo-600 hover:text-indigo-700"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
