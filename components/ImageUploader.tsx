import React, { useCallback, useState } from 'react';
import { Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { extractContactsFromImage } from '../services/geminiService';
import { Contact, CallStatus, ExtractedData } from '../types';
import { v4 as uuidv4 } from 'uuid'; // We'll implement a simple ID generator since uuid lib isn't strictly available in this env, but using random string is fine.

// Simple ID generator replacement
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

interface ImageUploaderProps {
  onContactsAdded: (contacts: Contact[]) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onContactsAdded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [processingCount, setProcessingCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const isProcessing = processingCount > 0;

  const processFile = async (file: File) => {
    setProcessingCount(prev => prev + 1);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      try {
        const extractedData = await extractContactsFromImage(base64);

        if (extractedData.length === 0) {
          setError("No contacts found in this image.");
          setProcessingCount(prev => prev - 1);
          return;
        }

        const newContacts: Contact[] = extractedData.map((data: ExtractedData) => ({
          id: generateId(),
          name: data.name || 'Unknown',
          phone: data.phone,
          company: data.company,
          notes: data.notes,
          status: CallStatus.PENDING,
          importedAt: new Date().toISOString(),
          // We truncate the image data to save memory, or you could store it if needed
          // sourceImage: base64
        }));

        onContactsAdded(newContacts);
      } catch (err) {
        setError("Error processing image. Ensure API Key is valid.");
      } finally {
        setProcessingCount(prev => prev - 1);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        processFile(e.dataTransfer.files[i]);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      for (let i = 0; i < e.target.files.length; i++) {
        processFile(e.target.files[i]);
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 text-center ${
          isDragging
            ? 'border-blue-500 bg-blue-50 scale-[1.02]'
            : 'border-slate-300 hover:border-slate-400 bg-white'
        }`}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          {isProcessing ? (
            <>
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              <p className="text-lg font-medium text-slate-700">Analyzing Image with AI...</p>
              <p className="text-sm text-slate-500">Extracting names and numbers</p>
            </>
          ) : (
            <>
              <div className="p-4 bg-blue-100 rounded-full">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-medium text-slate-800">
                  Drop images here, or click to upload
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Supports multiple screenshots, photos of business cards, or handwritten lists.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-center text-sm font-medium">
          {error}
        </div>
      )}
    </div>
  );
};