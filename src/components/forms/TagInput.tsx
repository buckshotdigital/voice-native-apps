'use client';

import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
}

export default function TagInput({ value, onChange, maxTags = 10 }: TagInputProps) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<{ id: string; name: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (input.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('tags')
        .select('id, name')
        .ilike('name', `%${input}%`)
        .limit(5);

      setSuggestions(
        (data || []).filter((t) => !value.includes(t.name))
      );
      setShowSuggestions(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [input, value]);

  function addTag(tag: string) {
    const cleaned = tag.toLowerCase().trim();
    if (cleaned && !value.some(v => v.toLowerCase() === cleaned.toLowerCase()) && value.length < maxTags) {
      onChange([...value, cleaned]);
    }
    setInput('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Tags</label>
      <div className="mt-1 rounded-lg border border-gray-300 bg-white p-2 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-sm text-indigo-700"
            >
              #{tag}
              <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-600">
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          {value.length < maxTags && (
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addTag(input);
                  }
                  if (e.key === 'Backspace' && !input && value.length > 0) {
                    removeTag(value[value.length - 1]);
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 200);
                  if (input) addTag(input);
                }}
                placeholder={value.length === 0 ? 'Add tags (press Enter)' : 'Add more...'}
                className="w-full min-w-[120px] border-0 p-1 text-sm focus:outline-none"
              />

              {/* Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 top-full z-10 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => addTag(s.name)}
                      className="block w-full px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-indigo-50"
                    >
                      #{s.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <p className="mt-1 text-xs text-gray-400">
        Up to {maxTags} tags. Press Enter or comma to add.
      </p>
    </div>
  );
}
