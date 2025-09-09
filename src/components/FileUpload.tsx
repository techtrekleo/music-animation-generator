import React, { useCallback } from 'react';
import { Upload, Music, FileAudio } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  acceptedFormats?: string[];
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  isLoading = false,
  acceptedFormats = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4']
}) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && acceptedFormats.includes(file.type)) {
      onFileSelect(file);
    }
  }, [onFileSelect, acceptedFormats]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isLoading 
            ? 'border-primary-300 bg-primary-50' 
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="flex flex-col items-center space-y-4">
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
              <p className="text-primary-600 font-medium">載入音樂檔案中...</p>
            </>
          ) : (
            <>
              <div className="relative">
                <Music className="h-16 w-16 text-gray-400" />
                <FileAudio className="h-8 w-8 text-primary-500 absolute -bottom-1 -right-1" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  上傳音樂檔案
                </h3>
                <p className="text-gray-600 mb-4">
                  拖拽音樂檔案到這裡，或點擊選擇檔案
                </p>
                
                <input
                  type="file"
                  accept={acceptedFormats.join(',')}
                  onChange={handleFileChange}
                  className="hidden"
                  id="audio-upload"
                />
                
                <label
                  htmlFor="audio-upload"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer transition-colors"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  選擇檔案
                </label>
              </div>
              
              <div className="text-xs text-gray-500">
                支援格式: MP3, WAV, OGG, M4A
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
