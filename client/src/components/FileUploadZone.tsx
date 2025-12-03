import { Upload, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  isProcessing?: boolean;
  acceptedTypes?: string;
}

export default function FileUploadZone({ 
  onFileSelect, 
  isProcessing = false,
  acceptedTypes = ".pdf,.docx,.pptx,.txt"
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  return (
    <div
      data-testid="file-upload-zone"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: '2px',
        borderStyle: 'dashed',
        borderRadius: '12px',
        borderColor: isDragging ? '#2F8FA5' : '#E2E7EF',
        backgroundColor: isDragging ? '#F0F2F5' : 'transparent',
        opacity: isProcessing ? 0.6 : 1,
        pointerEvents: isProcessing ? 'none' : 'auto',
        transition: 'all 0.2s ease',
        cursor: isProcessing ? 'not-allowed' : 'pointer'
      }}
      onMouseEnter={(e) => {
        if (!isProcessing && !isDragging) {
          e.currentTarget.style.borderColor = '#2F8FA5';
          e.currentTarget.style.backgroundColor = '#F0F2F5';
        }
      }}
      onMouseLeave={(e) => {
        if (!isProcessing && !isDragging) {
          e.currentTarget.style.borderColor = '#E2E7EF';
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      <input
        type="file"
        id="file-input"
        className="hidden"
        accept={acceptedTypes}
        onChange={handleFileInput}
        disabled={isProcessing}
        data-testid="input-file"
      />
      
      {isProcessing ? (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin" style={{ color: '#2F8FA5' }} />
          <p className="text-sm" style={{ color: '#6A7789' }}>Processing your document...</p>
        </div>
      ) : selectedFile ? (
        <div className="flex flex-col items-center gap-4">
          <FileText className="w-12 h-12" style={{ color: '#37C0A3' }} />
          <div className="text-center">
            <p className="font-medium" style={{ color: '#1C2635' }}>{selectedFile.name}</p>
            <p className="text-sm mt-1" style={{ color: '#6A7789' }}>
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('file-input')?.click()}
            data-testid="button-change-file"
          >
            Change File
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 px-6 py-8">
          <Upload className="w-12 h-12" style={{ color: '#A3D65C' }} />
          <div className="text-center">
            <p className="font-medium mb-1" style={{ color: '#1C2635' }}>
              Drop your file here, or browse
            </p>
            <p className="text-sm" style={{ color: '#6A7789' }}>
              Supports PDF, Word, PowerPoint, and text files
            </p>
          </div>
          <Button
            onClick={() => document.getElementById('file-input')?.click()}
            data-testid="button-browse"
            style={{ backgroundColor: '#2F8FA5', color: '#FFFFFF' }}
          >
            Browse Files
          </Button>
        </div>
      )}
    </div>
  );
}
