"use client"

import React, { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Papa from 'papaparse';

interface CSVRow {
    ProjectID: string;
    TaskID: string;
    TaskName: string;
    Phase: string;
    StartDate: string;
    EndDate: string;
    Status: string;
    Progress: string;
    Dependencies?: string;
    ParallelGroup?: string;
}

interface CSVUploadProps {
    onDataParsed: (data: CSVRow[]) => void;
}

export function CSVUpload({ onDataParsed }: CSVUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [previewData, setPreviewData] = useState<CSVRow[]>([]);

    const validateCSV = (data: any[]): boolean => {
        if (data.length === 0) {
            setErrorMessage('CSV file is empty');
            return false;
        }

        const requiredColumns = ['ProjectID', 'TaskID', 'TaskName', 'Phase', 'StartDate', 'EndDate', 'Status', 'Progress'];
        const firstRow = data[0];
        const missingColumns = requiredColumns.filter(col => !(col in firstRow));

        if (missingColumns.length > 0) {
            setErrorMessage(`Missing required columns: ${missingColumns.join(', ')}`);
            return false;
        }

        return true;
    };

    const handleFile = useCallback((file: File) => {
        if (!file.name.endsWith('.csv')) {
            setStatus('error');
            setErrorMessage('Please upload a CSV file');
            return;
        }

        setFile(file);
        setStatus('parsing');

        Papa.parse<CSVRow>(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (validateCSV(results.data)) {
                    setPreviewData(results.data);
                    setStatus('success');
                    setErrorMessage('');
                } else {
                    setStatus('error');
                }
            },
            error: (error) => {
                setStatus('error');
                setErrorMessage(`Error parsing CSV: ${error.message}`);
            }
        });
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            handleFile(droppedFile);
        }
    }, [handleFile]);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            handleFile(selectedFile);
        }
    };

    const handleImport = () => {
        if (previewData.length > 0) {
            onDataParsed(previewData);
            setStatus('idle');
            setFile(null);
            setPreviewData([]);
        }
    };

    const handleCancel = () => {
        setStatus('idle');
        setFile(null);
        setPreviewData([]);
        setErrorMessage('');
    };

    return (
        <Card className="border-none shadow-md bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Upload className="h-5 w-5" />
                    Import Project Timeline
                </CardTitle>
                <CardDescription>Upload a CSV file with your project tasks and dependencies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {status === 'idle' && (
                    <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        className={`relative rounded-xl border-2 border-dashed transition-all ${isDragging
                                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                                : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                            }`}
                    >
                        <label className="flex flex-col items-center justify-center py-12 cursor-pointer">
                            <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-4 mb-4">
                                <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Drop your CSV file here, or click to browse
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                CSV files only • Max 10MB
                            </p>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileInput}
                                className="hidden"
                            />
                        </label>
                    </div>
                )}

                {status === 'parsing' && (
                    <div className="flex items-center justify-center py-8">
                        <div className="flex items-center gap-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Parsing CSV file...</span>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <Alert variant="destructive" className="border-red-200 dark:border-red-800">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                )}

                {status === 'success' && (
                    <div className="space-y-4">
                        <Alert className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <AlertDescription className="text-green-800 dark:text-green-200">
                                Successfully parsed {previewData.length} tasks from {file?.name}
                            </AlertDescription>
                        </Alert>

                        <div className="rounded-lg border bg-white dark:bg-gray-900 p-4 max-h-64 overflow-auto">
                            <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Preview (First 5 rows)</h4>
                            <div className="space-y-2">
                                {previewData.slice(0, 5).map((row, idx) => (
                                    <div key={idx} className="text-xs border-b pb-2 last:border-0">
                                        <div className="font-medium text-gray-900 dark:text-gray-100">{row.TaskName}</div>
                                        <div className="text-gray-600 dark:text-gray-400">
                                            {row.ProjectID} • {row.Phase} • {row.StartDate} - {row.EndDate}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button onClick={handleImport} className="flex-1 bg-blue-600 hover:bg-blue-700">
                                Import {previewData.length} Tasks
                            </Button>
                            <Button onClick={handleCancel} variant="outline">
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}

                {status === 'idle' && (
                    <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/10">
                        <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>Expected format:</strong> ProjectID, TaskID, TaskName, Phase, StartDate, EndDate, Status, Progress, Dependencies, ParallelGroup
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
}
