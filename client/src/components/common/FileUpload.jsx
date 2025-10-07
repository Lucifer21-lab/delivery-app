import { useState } from 'react';
import { FaUpload, FaTimes, FaImage } from 'react-icons/fa';
import { toast } from 'react-toastify';

const FileUpload = ({ onFilesSelected, maxFiles = 5, accept = "image/*" }) => {
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);

        if (files.length + selectedFiles.length > maxFiles) {
            toast.error(`Maximum ${maxFiles} files allowed`);
            return;
        }

        // Validate file size (5MB max)
        const validFiles = selectedFiles.filter(file => {
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name} is too large. Max 5MB per file`);
                return false;
            }
            return true;
        });

        const newFiles = [...files, ...validFiles];
        setFiles(newFiles);
        onFilesSelected(newFiles);

        // Generate previews
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeFile = (index) => {
        const newFiles = files.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);
        setFiles(newFiles);
        setPreviews(newPreviews);
        onFilesSelected(newFiles);
    };

    return (
        <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition">
                <input
                    type="file"
                    multiple
                    accept={accept}
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                    <FaUpload className="mx-auto text-4xl text-gray-400 mb-2" />
                    <p className="text-gray-600">
                        Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        Max {maxFiles} files, 5MB each
                    </p>
                </label>
            </div>

            {previews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {previews.map((preview, index) => (
                        <div key={index} className="relative group">
                            <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
                            >
                                <FaTimes />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FileUpload;