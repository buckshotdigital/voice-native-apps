'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, AlertCircle } from 'lucide-react';
import { ALLOWED_IMAGE_TYPES, MAX_LOGO_SIZE, MAX_SCREENSHOT_SIZE } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';

interface ImageUploaderProps {
  label: string;
  type: 'logo' | 'screenshot';
  value: string | string[];
  onChange: (value: string | string[]) => void;
  maxFiles?: number;
  userId: string;
}

export default function ImageUploader({
  label,
  type,
  value,
  onChange,
  maxFiles = 1,
  userId,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const isMultiple = type === 'screenshot';
  const maxSize = type === 'logo' ? MAX_LOGO_SIZE : MAX_SCREENSHOT_SIZE;
  const urls = isMultiple ? (value as string[]) : value ? [value as string] : [];

  async function handleFiles(files: FileList) {
    setError(null);

    if (isMultiple && urls.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed.`);
      return;
    }

    for (const file of Array.from(files)) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setError('Only JPEG, PNG, and WebP images are allowed.');
        return;
      }
      if (file.size > maxSize) {
        setError(`File size must be under ${maxSize / 1024 / 1024}MB.`);
        return;
      }
    }

    setUploading(true);
    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop();
      const path = `${userId}/${type}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('app-assets')
        .upload(path, file);

      if (uploadError) {
        setError('Upload failed. Please try again.');
        setUploading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('app-assets')
        .getPublicUrl(path);

      uploadedUrls.push(publicUrl);
    }

    if (isMultiple) {
      onChange([...urls, ...uploadedUrls]);
    } else {
      onChange(uploadedUrls[0]);
    }
    setUploading(false);
  }

  function removeImage(index: number) {
    if (isMultiple) {
      const newUrls = [...urls];
      newUrls.splice(index, 1);
      onChange(newUrls);
    } else {
      onChange('');
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {/* Preview */}
      {urls.length > 0 && (
        <div className={`mt-2 flex flex-wrap gap-3 ${isMultiple ? '' : ''}`}>
          {urls.map((url, i) => (
            <div key={url} className="group relative">
              <div
                className={`relative overflow-hidden rounded-lg bg-gray-100 ${
                  type === 'logo' ? 'h-20 w-20' : 'h-28 w-40'
                }`}
              >
                <Image src={url} alt="Upload preview" fill className="object-cover" sizes="160px" />
              </div>
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -right-1.5 -top-1.5 rounded-full bg-red-500 p-0.5 text-white opacity-0 shadow transition group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {(isMultiple ? urls.length < maxFiles : urls.length === 0) && (
        <div className="mt-2">
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(',')}
            multiple={isMultiple}
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 transition hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading...' : `Upload ${type === 'logo' ? 'logo' : 'screenshot(s)'}`}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-2 flex items-center gap-1.5 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <p className="mt-1 text-xs text-gray-400">
        {type === 'logo'
          ? 'Square image recommended. Max 2MB. JPEG, PNG, or WebP.'
          : `Up to ${maxFiles} screenshots. Max 5MB each. JPEG, PNG, or WebP.`}
      </p>
    </div>
  );
}
