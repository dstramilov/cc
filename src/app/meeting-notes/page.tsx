"use client"

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Upload, FileText } from "lucide-react";
import { ProjectSelector } from "@/components/timeline/project-selector";
import { MOCK_PROJECTS, ProjectData } from "@/lib/project-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useUser } from "@/lib/user-context";
import { MeetingNoteForm } from "@/components/meeting-notes/meeting-note-form";
import { TranscriptUpload } from "@/components/meeting-notes/transcript-upload";
import { MeetingNotesList } from "@/components/meeting-notes/meeting-notes-list";
import { MeetingNote } from "@/lib/document-storage";

export default function MeetingNotesPage() {
    const [projects, setProjects] = useState<ProjectData[]>(MOCK_PROJECTS);
    const [selectedProjectId, setSelectedProjectId] = useState<string>(MOCK_PROJECTS[0].id);
    const [showCreate, setShowCreate] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [editingNote, setEditingNote] = useState<MeetingNote | undefined>(undefined);

    const { canManageMeetingNotes } = useUser();

    const currentProject = projects.find(p => p.id === selectedProjectId);

    const handleProjectChange = (projectId: string) => {
        setSelectedProjectId(projectId);
    };

    const handleSaveComplete = () => {
        setRefreshTrigger(prev => prev + 1);
        setShowCreate(false);
        setEditingNote(undefined);
    };

    const handleEdit = (note: MeetingNote) => {
        setEditingNote(note);
        setShowCreate(true);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Meeting Notes</h1>
                        <p className="text-muted-foreground">
                            Manage meeting minutes and transcripts for your projects.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ProjectSelector
                            projects={projects}
                            selectedProjectId={selectedProjectId}
                            onProjectChange={handleProjectChange}
                        />
                    </div>
                </div>

                {/* Actions */}
                {canManageMeetingNotes && (
                    <div className="flex gap-2">
                        <Dialog open={showCreate} onOpenChange={(open) => {
                            setShowCreate(open);
                            if (!open) setEditingNote(undefined);
                        }}>
                            <DialogTrigger asChild>
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Minutes
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>{editingNote ? 'Edit Meeting Minutes' : 'Create Meeting Minutes'}</DialogTitle>
                                </DialogHeader>
                                <MeetingNoteForm
                                    projectId={selectedProjectId}
                                    onSave={handleSaveComplete}
                                    onCancel={() => setShowCreate(false)}
                                    initialData={editingNote}
                                />
                            </DialogContent>
                        </Dialog>

                        <Dialog open={showUpload} onOpenChange={setShowUpload}>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Transcript
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Upload Meeting Transcript</DialogTitle>
                                </DialogHeader>
                                <TranscriptUpload
                                    projectId={selectedProjectId}
                                    onUploadComplete={() => {
                                        setRefreshTrigger(prev => prev + 1);
                                        setShowUpload(false);
                                    }}
                                    onCancel={() => setShowUpload(false)}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                )}

                {/* Content */}
                <Card className="border-none shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            {currentProject?.name} - Notes
                        </CardTitle>
                        <CardDescription>
                            All meeting minutes and transcripts for this project
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MeetingNotesList
                            projectId={selectedProjectId}
                            refreshTrigger={refreshTrigger}
                            onEdit={handleEdit}
                        />
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
