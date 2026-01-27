'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, Image as ImageIcon, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface BulkImageUploaderProps {
    onUploadComplete: (urls: string[]) => void;
    maxFiles?: number;
    existingImages?: string[];
}

interface UploadingFile {
    file: File;
    preview: string;
    status: 'pending' | 'uploading' | 'success' | 'error';
    url?: string;
    error?: string;
}

export function BulkImageUploader({
    onUploadComplete,
    maxFiles = 20,
    existingImages = []
}: BulkImageUploaderProps) {
    const [files, setFiles] = useState<UploadingFile[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles: UploadingFile[] = acceptedFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            status: 'pending' as const
        }));
        setFiles(prev => [...prev, ...newFiles].slice(0, maxFiles));
    }, [maxFiles]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'] },
        maxFiles: maxFiles - files.length,
        multiple: true
    });

    const removeFile = (index: number) => {
        setFiles(prev => {
            const newFiles = [...prev];
            URL.revokeObjectURL(newFiles[index].preview);
            newFiles.splice(index, 1);
            return newFiles;
        });
    };

    const uploadAllFiles = async () => {
        if (files.length === 0) return;

        setIsUploading(true);
        const uploadedUrls: string[] = [...existingImages];

        for (let i = 0; i < files.length; i++) {
            if (files[i].status === 'success') {
                uploadedUrls.push(files[i].url!);
                continue;
            }

            // Actualizar estado a "uploading"
            setFiles(prev => {
                const newFiles = [...prev];
                newFiles[i] = { ...newFiles[i], status: 'uploading' };
                return newFiles;
            });

            try {
                const formData = new FormData();
                formData.append('file', files[i].file);

                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });

                if (!res.ok) throw new Error('Error al subir imagen');

                const data = await res.json();
                const url = data.url;

                // Actualizar estado a "success"
                setFiles(prev => {
                    const newFiles = [...prev];
                    newFiles[i] = { ...newFiles[i], status: 'success', url };
                    return newFiles;
                });

                uploadedUrls.push(url);
            } catch (error: any) {
                // Actualizar estado a "error"
                setFiles(prev => {
                    const newFiles = [...prev];
                    newFiles[i] = { ...newFiles[i], status: 'error', error: error.message };
                    return newFiles;
                });
            }
        }

        setIsUploading(false);

        const successCount = files.filter(f => f.status === 'success').length;
        if (successCount > 0) {
            toast.success(`${successCount} imagen(es) subida(s) correctamente`);
            onUploadComplete(uploadedUrls);
        }
    };

    const pendingCount = files.filter(f => f.status === 'pending').length;
    const successCount = files.filter(f => f.status === 'success').length;
    const errorCount = files.filter(f => f.status === 'error').length;

    return (
        <div className="space-y-6">
            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`
                    border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                    ${isDragActive
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-300 hover:border-primary hover:bg-slate-50'
                    }
                `}
            >
                <input {...getInputProps()} />
                <Upload className={`h-12 w-12 mx-auto mb-4 ${isDragActive ? 'text-primary' : 'text-slate-400'}`} />
                <p className="text-lg font-medium text-slate-700">
                    {isDragActive
                        ? '¡Suelta las imágenes aquí!'
                        : 'Arrastra imágenes aquí o haz click para seleccionar'
                    }
                </p>
                <p className="text-sm text-slate-500 mt-2">
                    Máximo {maxFiles} imágenes • JPG, PNG, WebP, GIF
                </p>
            </div>

            {/* Preview Grid */}
            {files.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-600">
                            {files.length} imagen(es) seleccionada(s)
                            {successCount > 0 && <span className="text-green-600 ml-2">• {successCount} subida(s)</span>}
                            {errorCount > 0 && <span className="text-red-600 ml-2">• {errorCount} error(es)</span>}
                        </p>
                        <Button
                            onClick={uploadAllFiles}
                            disabled={isUploading || pendingCount === 0}
                            className="gap-2"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Subiendo...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4" />
                                    Subir Todas ({pendingCount})
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                        {files.map((file, index) => (
                            <div
                                key={index}
                                className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group"
                            >
                                <img
                                    src={file.preview}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />

                                {/* Status Overlay */}
                                <div className={`
                                    absolute inset-0 flex items-center justify-center
                                    ${file.status === 'uploading' ? 'bg-white/80' : ''}
                                    ${file.status === 'success' ? 'bg-green-500/20' : ''}
                                    ${file.status === 'error' ? 'bg-red-500/20' : ''}
                                `}>
                                    {file.status === 'uploading' && (
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    )}
                                    {file.status === 'success' && (
                                        <CheckCircle className="h-6 w-6 text-green-600" />
                                    )}
                                    {file.status === 'error' && (
                                        <AlertCircle className="h-6 w-6 text-red-600" />
                                    )}
                                </div>

                                {/* Remove Button */}
                                {file.status !== 'uploading' && (
                                    <button
                                        onClick={() => removeFile(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
