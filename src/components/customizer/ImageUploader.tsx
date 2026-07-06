import React, { useState, useRef } from 'react';
import { Upload, X, RotateCcw, Link2, Image as ImageIcon } from 'lucide-react';

interface PresetImage {
  name: string;
  url: string;
}

interface ImageUploaderProps {
  id: string;
  label: string;
  imageUrl: string;
  onUrlChange: (url: string) => void;
  onFileUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  presets?: PresetImage[];
  placeholder?: string;
}

export default function ImageUploader({
  id,
  label,
  imageUrl,
  onUrlChange,
  onFileUpload,
  isUploading,
  presets,
  placeholder = "https://example.com/image.jpg",
}: ImageUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        await onFileUpload(file);
      } else {
        alert("Please drop an image file.");
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await onFileUpload(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    onUrlChange('');
  };

  return (
    <div className="flex flex-col gap-2 bg-white dark:bg-[#1E1E1F] border border-gray-150 dark:border-gray-800 p-4 rounded-xl shadow-sm">
      <div className="flex justify-between items-center">
        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{label}</label>
        {imageUrl && (
          <button
            type="button"
            onClick={removeImage}
            className="text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center gap-0.5 cursor-pointer"
          >
            <X size={12} /> Remove
          </button>
        )}
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={!imageUrl ? triggerFileInput : undefined}
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 transition-all duration-200 cursor-pointer text-center ${
          isDragActive
            ? 'border-[#008060] bg-green-50/20 dark:bg-[#008060]/5'
            : imageUrl
            ? 'border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-black/5'
            : 'border-gray-300 dark:border-gray-700 hover:border-[#008060] hover:bg-gray-50/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-6 h-6 border-2 border-[#008060] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[11px] font-semibold text-[#008060] mt-2">Uploading asset...</span>
          </div>
        ) : imageUrl ? (
          <div className="w-full flex items-center gap-3">
            {/* Image Preview Thumbnail */}
            <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 shrink-0 bg-gray-100 flex items-center justify-center relative group">
              <img
                src={imageUrl}
                alt="Upload preview"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <ImageIcon size={18} className="text-gray-300 absolute group-hover:opacity-0" />
            </div>

            <div className="flex-1 min-w-0 text-left">
              <p className="text-[11px] font-bold text-gray-700 dark:text-gray-300 truncate">Image Loaded Successfully</p>
              <p className="text-[9px] text-gray-400 dark:text-gray-500 truncate">{imageUrl.slice(0, 50)}...</p>
              <div className="flex gap-2 mt-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerFileInput();
                  }}
                  className="text-[10px] font-semibold bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                >
                  Replace
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-2">
            <Upload size={22} className="text-gray-400 mb-1.5" />
            <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">Drag & drop or Click to upload</span>
            <span className="text-[9px] text-gray-400 mt-0.5">Supports PNG, JPG, WEBP</span>
          </div>
        )}
      </div>

      {/* Manual URL Input */}
      <div className="flex flex-col gap-1 mt-1">
        <div className="flex items-center gap-1">
          <Link2 size={10} className="text-gray-400" />
          <span className="text-[10px] font-bold text-gray-400 uppercase">Or Specify Image URL Directly</span>
        </div>
        <input
          type="text"
          value={imageUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          className="border border-[#C9CCCF] dark:border-gray-800 rounded-lg p-2 text-xs outline-none bg-white dark:bg-black font-mono text-gray-600 dark:text-gray-300 focus:border-[#008060] focus:ring-1 focus:ring-[#008060]/20 transition-all"
          placeholder={placeholder}
        />
      </div>

      {/* Optional Preset Image Gallery */}
      {presets && presets.length > 0 && (
        <div className="flex flex-col gap-1.5 mt-2 border-t border-gray-100 dark:border-gray-800/60 pt-2.5">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Or Select Premium Unsplash Presets:</span>
          <div className="grid grid-cols-4 gap-1.5">
            {presets.map((preset, i) => {
              const isSelected = imageUrl.split('?')[0] === preset.url.split('?')[0];
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onUrlChange(preset.url)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-[#008060] scale-95 shadow-md' 
                      : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  title={preset.name}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-[#008060]/25 flex items-center justify-center">
                      <div className="bg-white rounded-full p-0.5">
                        <div className="w-2 h-2 rounded-full bg-[#008060]"></div>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
