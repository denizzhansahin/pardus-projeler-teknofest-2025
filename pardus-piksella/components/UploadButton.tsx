import React, { useRef } from 'react';
import { UploadIcon } from './icons';

interface UploadButtonProps {
    onUpload: (files: FileList) => void;
}

const UploadButton: React.FC<UploadButtonProps> = ({ onUpload }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            onUpload(event.target.files);
            // Reset input value bir tick sonra, canlı FileList sorununu önler
            setTimeout(() => { event.target.value = ''; }, 0);
        }
    };

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
                multiple
            />
            <button
                onClick={handleButtonClick}
                className="flex items-center bg-pardus-accent hover:bg-pardus-accent-hover text-white font-bold py-2 px-4 rounded-full transition-colors duration-200"
                aria-label="Görsel yükle"
            >
                <UploadIcon className="h-5 w-5 mr-2" />
                <span>Yükle</span>
            </button>
        </>
    );
};

export default UploadButton;