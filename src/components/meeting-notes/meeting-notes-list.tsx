"use client"

import React, { useEffect, useState } from 'react';
import { FileText, Download, Trash2, Edit, FileType, Calendar as CalendarIcon } from 'lucide-react';
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
import { documentStorage, MeetingNote, downloadDocument } from '@/lib/document-storage';
import { useUser } from '@/lib/user-context';
import { format } from 'date-fns';
import { exportMeetingNotes } from '@/lib/export-utils';

interface MeetingNotesListProps {
    projectId: string;
    refreshTrigger?: number;
    onEdit: (note: MeetingNote) => void;
}

export function MeetingNotesList({ projectId, refreshTrigger, onEdit }: MeetingNotesListProps) {
    const [notes, setNotes] = useState<MeetingNote[]>([]);
    const [loading, setLoading] = useState(true);
    const { canManageMeetingNotes } = useUser();

    const loadNotes = async () => {
        setLoading(true);
        try {
            // Add a small delay to ensure DB is ready
            await new Promise(resolve => setTimeout(resolve, 500));
            const data = await documentStorage.getMeetingNotesByProject(projectId);
            // Sort by date descending
            data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setNotes(data);
        } catch (error) {
            console.error('Failed to load meeting notes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotes();
    }, [projectId, refreshTrigger]);

    const handleDelete = async (id: string) => {
        try {
            await documentStorage.deleteMeetingNote(id);
            await loadNotes();
        } catch (error) {
            console.error('Failed to delete meeting note:', error);
        }
    };

    const handleDownload = (note: MeetingNote) => {
        if (note.type === 'transcript' && note.fileData) {
            // Download file
            downloadDocument({
                ...note,
                name: note.fileName || 'transcript',
                fileType: note.fileType || '.txt',
                fileSize: 0, // Not stored for notes currently
            } as any);
        } else {
            // Download content as text file
            const blob = new Blob([note.content || ''], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = window.document.createElement('a');
            a.href = url;
            a.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
            window.document.body.appendChild(a);
            a.click();
            window.document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    if (loading) {
        return <div className="text-center p-8 text-muted-foreground">Loading notes...</div>;
    }

    if (notes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 space-y-2 border rounded-lg border-dashed">
                <FileText className="h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">No meeting notes found</p>
                <p className="text-sm text-muted-foreground">
                    Create minutes or upload a transcript to get started
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => exportMeetingNotes(notes)}>
                    <Download className="h-4 w-4 mr-2" />
                    Export List to Excel
                </Button>
            </div>

            <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {notes.map((note) => (
                            <TableRow key={note.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                <TableCell className="whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                        {format(new Date(note.date), 'MMM d, yyyy')}
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">{note.title}</TableCell>
                                <TableCell>
                                    {note.type === 'minutes' ? (
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                            Minutes
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                            Transcript
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDownload(note)}
                                            title="Download"
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>

                                        {canManageMeetingNotes && (
                                            <>
                                                {note.type === 'minutes' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onEdit(note)}
                                                        title="Edit"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                )}

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Meeting Note</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete "{note.title}"? This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDelete(note.id)}
                                                                className="bg-red-600 hover:bg-red-700"
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
