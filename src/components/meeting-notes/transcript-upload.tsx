"use client"

import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { documentStorage } from '@/lib/document-storage';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TranscriptUploadProps {
    projectId: string;
    onUploadComplete: () => void;
    onCancel: () => void;
}

const ACCEPTED_TYPES = ['.txt', '.pdf', '.docx'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function TranscriptUpload({ projectId, onUploadComplete, onCancel }: TranscriptUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [title, setTitle] = useState('');

    const validateFile = (file: File): { valid: boolean; error?: string } => {
        if (file.size > MAX_FILE_SIZE) {
            return { valid: false, error: 'File size exceeds 10MB limit' };
        }

        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!ACCEPTED_TYPES.includes(extension)) {
            return { valid: false, error: 'Invalid file type. Supported: .txt, .pdf, .docx' };
        }

        return { valid: true };
    };

    const handleFileUpload = async (file: File) => {
        if (!title) {
            setError('Please enter a title for the transcript');
            return;
        }

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
            const arrayBuffer = await file.arrayBuffer();

            await documentStorage.saveMeetingNote({
                projectId,
                title,
                date: new Date().toISOString(),
                type: 'transcript',
                fileName: file.name,
                fileType: '.' + file.name.split('.').pop()?.toLowerCase(),
                fileData: arrayBuffer,
            });

            setSuccess(`${file.name} uploaded successfully!`);
            setTimeout(() => {
                setSuccess(null);
                onUploadComplete();
            }, 2000);
        } catch (err) {
            setError('Failed to upload transcript. Please try again.');
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
    }, [projectId, title]);

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
            <div className="space-y-2">
                <Label htmlFor="transcript-title">Transcript Title</Label>
                <Input
                    id="transcript-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Client Kickoff Transcript"
                />
            </div>

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
                            <h3 className="font-semibold text-lg">Upload Transcript</h3>
                            <p className="text-sm text-muted-foreground">
                                Drag and drop your file here, or click to browse
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Supported: .txt, .pdf, .docx
                            </p>
                        </div>

                        <input
                            type="file"
                            id="transcript-upload"
                            className="hidden"
                            accept=".txt,.pdf,.docx"
                            onChange={handleFileSelect}
                            disabled={uploading}
                        />

                        <label htmlFor="transcript-upload">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={uploading || !title}
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

            <div className="flex justify-end pt-2">
                <Button variant="ghost" onClick={onCancel}>Cancel</Button>
            </div>
        </div>
    );
}
