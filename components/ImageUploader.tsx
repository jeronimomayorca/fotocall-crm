
import React, { useState } from 'react';
import { Upload, Loader2, Image as ImageIcon, Sparkles, FileText, Smartphone } from 'lucide-react';
import { extractContactsFromImage } from '../services/geminiService';
import { Contact, CallStatus, ExtractedData } from '../types';
import { v4 as uuidv4 } from 'uuid'; // Fallback if needed

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
    <div className="w-full max-w-3xl mx-auto mb-12">
      <div className="relative group">
        {/* Glow effect */}
        <div className={`absolute -inset-1 bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 ${isDragging ? 'opacity-75 blur-md' : ''}`}></div>
        
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative glass-card rounded-2xl p-10 transition-all duration-300 text-center border-2 ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
              : 'border-white/50 bg-white/80 hover:bg-white/90'
          }`}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            disabled={isProcessing}
          />
          
          <div className="flex flex-col items-center justify-center space-y-6">
            {isProcessing ? (
              <div className="animate-fade-in-up py-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500 rounded-full blur-lg opacity-20 animate-pulse-slow"></div>
                  <Loader2 className="w-16 h-16 text-blue-600 animate-spin relative z-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mt-6">Analyzing with AI...</h3>
                <p className="text-slate-500 mt-2">Extracting contacts from your image</p>
              </div>
            ) : (
              <div className="py-4">
                <div className="flex justify-center space-x-6 mb-6">
                  <div className="p-4 bg-blue-50 rounded-2xl text-blue-600 transform -rotate-6 transition-transform group-hover:-rotate-12 duration-300">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600 z-10 transform transition-transform group-hover:scale-110 duration-300 shadow-xl shadow-indigo-100">
                    <Upload className="w-10 h-10" />
                  </div>
                  <div className="p-4 bg-violet-50 rounded-2xl text-violet-600 transform rotate-6 transition-transform group-hover:rotate-12 duration-300">
                    <Smartphone className="w-8 h-8" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                  Drop your files here
                </h3>
                <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed">
                  Upload screenshots, photos of business cards, or handwritten lists. <span className="text-indigo-600 font-medium flex items-center justify-center gap-1 mt-1"><Sparkles className="w-4 h-4" /> AI does the rest.</span>
                </p>
                
                <div className="mt-8">
                  <span className="inline-flex px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-sm font-medium group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    Browse Files
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-6 flex items-center justify-center gap-2 p-4 bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-700 rounded-xl text-sm font-medium animate-fade-in-up">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}
    </div>
  );
};