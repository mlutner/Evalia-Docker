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
  acceptedTypes = ".pdf,.docx,.txt"
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
      className={`
        min-h-[200px] flex flex-col items-center justify-center
        border-2 border-dashed rounded-xl transition-all
        ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
        ${isProcessing ? 'opacity-60 pointer-events-none' : 'hover:border-primary hover:bg-primary/5'}
      `}
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
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Processing your document...</p>
        </div>
      ) : selectedFile ? (
        <div className="flex flex-col items-center gap-4">
          <FileText className="w-12 h-12 text-primary" />
          <div className="text-center">
            <p className="font-medium">{selectedFile.name}</p>
            <p className="text-sm text-muted-foreground mt-1">
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
          <Upload className="w-12 h-12 text-muted-foreground" />
          <div className="text-center">
            <p className="font-medium text-foreground mb-1">
              Drop your file here, or browse
            </p>
            <p className="text-sm text-muted-foreground">
              Supports PDF, DOCX, and TXT files
            </p>
          </div>
          <Button
            onClick={() => document.getElementById('file-input')?.click()}
            data-testid="button-browse"
          >
            Browse Files
          </Button>
        </div>
      )}
    </div>
  );
}
