
import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { UploadCloud, XCircle } from 'lucide-react';

interface ImageUploadProps {
  currentImage?: string; // base64 string or URL
  onImageChange: (base64Image: string | null) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ currentImage, onImageChange }) => {
  const { t } = useTranslation();
  const [imagePreview, setImagePreview] = useState<string | null>(currentImage || null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Max 2MB
        alert("File is too large. Maximum size is 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        onImageChange(base64String);
        setFileName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    onImageChange(null);
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
  };

  return (
    <div className="my-4">
      <label className="block text-sm font-medium text-neutral-700 mb-1">{t('imageUpload')}</label>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-neutral-300 border-dashed rounded-md">
        <div className="space-y-1 text-center">
          <UploadCloud className="mx-auto h-12 w-12 text-neutral-400" />
          <div className="flex text-sm text-neutral-600">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
            >
              <span>Upload a file</span>
              <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/gif" onChange={handleFileChange} ref={fileInputRef} />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-neutral-500">PNG, JPG, GIF up to 2MB</p>
        </div>
      </div>
      {imagePreview && (
        <div className="mt-3">
          <img src={imagePreview} alt="Preview" className="max-h-48 w-auto rounded-md shadow"/>
          <button
            type="button"
            onClick={removeImage}
            className="mt-2 text-sm text-red-600 hover:text-red-800 flex items-center"
          >
            <XCircle size={16} className="mr-1"/> {t('removeImage')}
          </button>
        </div>
      )}
      {fileName && !imagePreview && <p className="mt-2 text-sm text-green-600">{t('imageUploaded', {fileName})}</p>}
    </div>
  );
};

export default ImageUpload;
