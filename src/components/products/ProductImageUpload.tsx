import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { API_ENDPOINTS } from '@/config/api';
import { DEFAULT_REQUEST_OPTIONS } from '@/config/api';
import { toast } from 'sonner';

interface ProductImageUploadProps {
  productId: string;
  onImagesUploaded: () => void;
}

interface UploadedImage {
  id: string;
  imageUrl: string;
  publicId: string;
}

const ProductImageUpload: React.FC<ProductImageUploadProps> = ({
  productId,
  onImagesUploaded
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 3) {
      toast.error('Maximum 3 images allowed');
      return;
    }
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    setSelectedFiles(validFiles);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
  
    setIsUploading(true);
    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });
  
    try {
      const uploadOptions = {
        ...DEFAULT_REQUEST_OPTIONS,
        method: 'POST',
        body: formData,
        headers: {} 
      };
      
      uploadOptions.credentials = 'include';
      
      const response = await fetch(
        API_ENDPOINTS.PRODUCT_IMAGES.UPLOAD_MULTIPLE(productId),
        uploadOptions
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload images');
      }
  
      toast.success('Images uploaded successfully');
      setSelectedFiles([]);
      onImagesUploaded();
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        multiple
        className="hidden"
      />

      {selectedFiles.length === 0 ? (
        <div
          onClick={openFileDialog}
          className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors"
        >
          <ImagePlus className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">Click to select up to 3 images</p>
          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="relative group border rounded-lg overflow-hidden"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              onClick={openFileDialog}
              disabled={selectedFiles.length >= 3 || isUploading}
            >
              Add More
            </Button>
            <Button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || isUploading}
              className={cn(
                "ml-auto",
                isUploading && "opacity-50 cursor-not-allowed"
              )}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload Images'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImageUpload;
