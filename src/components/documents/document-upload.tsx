"use client"

import React, { useState, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { documentStorage, ProjectDocument } from '@/lib/document-storage';

interface DocumentUploadProps {
    projectId: string;
    onUploadComplete: () => void;
}

const ACCEPTED_TYPES = {
    blueprint: ['.xlsx', '.xls'],
    requirements: ['.pdf'],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function DocumentUpload({ projectId, onUploadComplete }: DocumentUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const validateFile = (file: File): { valid: boolean; error?: string; docType?: 'blueprint' | 'requirements' } => {
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            return { valid: false, error: 'File size exceeds 10MB limit' };
        }

        // Determine document type based on extension
        const extension = '.' + file.name.split('.').pop()?.toLowerCase();

        if (ACCEPTED_TYPES.blueprint.includes(extension)) {
            return { valid: true, docType: 'blueprint' };
        } else if (ACCEPTED_TYPES.requirements.includes(extension)) {
            return { valid: true, docType: 'requirements' };
        } else {
            return {
                valid: false,
                error: 'Invalid file type. Please upload Excel (.xlsx, .xls) or PDF files only.'
            };
        }
    };

    const handleFileUpload = async (file: File) => {
        setError(null);
        setSuccess(null);
        setUploading(true);

        const validation = validateFile(file);
        if (!validation.valid) {
            setError(validation.error || 'Invalid file');
            setUploading(false);
            return;
        }

        try {
            // Read file as ArrayBuffer
            const arrayBuffer = await file.arrayBuffer();

            // Upload to IndexedDB
            await documentStorage.uploadDocument({
                projectId,
                name: file.name,
                type: validation.docType!,
                fileType: '.' + file.name.split('.').pop()?.toLowerCase(),
                fileSize: file.size,
                fileData: arrayBuffer,
            });

            setSuccess(`${file.name} uploaded successfully!`);
            setTimeout(() => {
                setSuccess(null);
                onUploadComplete();
            }, 2000);
        } catch (err) {
            setError('Failed to upload document. Please try again.');
            console.error('Upload error:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    }, [projectId]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileUpload(files[0]);
        }
    };

    return (
        <div className="space-y-4">
            <Card
                className={`border-2 border-dashed transition-all ${isDragging
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                        : 'border-gray-300 dark:border-gray-700'
                    }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <CardContent className="p-8">
                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                        <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Upload Project Documents</h3>
                            <p className="text-sm text-muted-foreground">
                                Drag and drop your files here, or click to browse
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Supported: Excel (.xlsx, .xls) for blueprints, PDF for requirements
                            </p>
                        </div>

                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            accept=".xlsx,.xls,.pdf"
                            onChange={handleFileSelect}
                            disabled={uploading}
                        />

                        <label htmlFor="file-upload">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={uploading}
                                className="cursor-pointer"
                                asChild
                            >
                                <span>
                                    <FileText className="h-4 w-4 mr-2" />
                                    {uploading ? 'Uploading...' : 'Select File'}
                                </span>
                            </Button>
                        </label>
                    </div>
                </CardContent>
            </Card>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-600 dark:text-green-400">
                        {success}
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
