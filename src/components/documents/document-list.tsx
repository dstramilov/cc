"use client"

import React, { useEffect, useState } from 'react';
import { FileText, Download, Trash2, FileSpreadsheet, FileType } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { documentStorage, ProjectDocument, downloadDocument, formatFileSize } from '@/lib/document-storage';
import { useUser } from '@/lib/user-context';

interface DocumentListProps {
    projectId: string;
    refreshTrigger?: number;
}

export function DocumentList({ projectId, refreshTrigger }: DocumentListProps) {
    const [documents, setDocuments] = useState<ProjectDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const { canManageDocuments } = useUser();

    const loadDocuments = async () => {
        setLoading(true);
        try {
            const docs = await documentStorage.getDocumentsByProject(projectId);
            setDocuments(docs);
        } catch (error) {
            console.error('Failed to load documents:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDocuments();
    }, [projectId, refreshTrigger]);

    const handleDownload = async (doc: ProjectDocument) => {
        try {
            downloadDocument(doc);
        } catch (error) {
            console.error('Failed to download document:', error);
        }
    };

    const handleDelete = async (docId: string) => {
        try {
            await documentStorage.deleteDocument(docId);
            await loadDocuments();
        } catch (error) {
            console.error('Failed to delete document:', error);
        }
    };

    const getDocumentIcon = (fileType: string) => {
        if (fileType === '.pdf') {
            return <FileType className="h-5 w-5 text-red-600" />;
        }
        return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
    };

    const getDocumentTypeBadge = (type: 'blueprint' | 'requirements') => {
        if (type === 'blueprint') {
            return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Blueprint</Badge>;
        }
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Requirements</Badge>;
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-8">
                    <div className="flex items-center justify-center text-muted-foreground">
                        Loading documents...
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (documents.length === 0) {
        return (
            <Card>
                <CardContent className="p-8">
                    <div className="flex flex-col items-center justify-center text-center space-y-2">
                        <FileText className="h-12 w-12 text-muted-foreground/50" />
                        <p className="text-muted-foreground">No documents uploaded yet</p>
                        <p className="text-sm text-muted-foreground">
                            Upload blueprints and requirements documents to get started
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-none shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
            <CardHeader>
                <CardTitle className="text-xl">Project Documents</CardTitle>
                <CardDescription>
                    Uploaded blueprints and requirements documents
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                            <TableRow>
                                <TableHead className="font-semibold">Document</TableHead>
                                <TableHead className="font-semibold">Type</TableHead>
                                <TableHead className="font-semibold">Size</TableHead>
                                <TableHead className="font-semibold">Uploaded</TableHead>
                                <TableHead className="font-semibold text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {documents.map((doc) => (
                                <TableRow key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            {getDocumentIcon(doc.fileType)}
                                            <span className="font-medium">{doc.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getDocumentTypeBadge(doc.type)}
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                                        {formatFileSize(doc.fileSize)}
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                                        {new Date(doc.uploadDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDownload(doc)}
                                                className="hover:bg-blue-50 dark:hover:bg-blue-950"
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>

                                            {canManageDocuments && (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="hover:bg-red-50 dark:hover:bg-red-950 text-red-600"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Document</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete "{doc.name}"? This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDelete(doc.id)}
                                                                className="bg-red-600 hover:bg-red-700"
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
