"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { documentStorage, MeetingNote } from '@/lib/document-storage';
import { CalendarIcon, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface MeetingNoteFormProps {
    projectId: string;
    onSave: () => void;
    onCancel: () => void;
    initialData?: MeetingNote;
}

export function MeetingNoteForm({ projectId, onSave, onCancel, initialData }: MeetingNoteFormProps) {
    const [title, setTitle] = useState(initialData?.title || '');
    const [date, setDate] = useState<Date | undefined>(initialData ? new Date(initialData.date) : new Date());
    const [content, setContent] = useState(initialData?.content || '');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!title || !date || !content) return;

        setSaving(true);
        try {
            if (initialData) {
                await documentStorage.updateMeetingNote({
                    ...initialData,
                    title,
                    date: date.toISOString(),
                    content,
                });
            } else {
                await documentStorage.saveMeetingNote({
                    projectId,
                    title,
                    date: date.toISOString(),
                    type: 'minutes',
                    content,
                });
            }
            onSave();
        } catch (error) {
            console.error('Failed to save meeting note:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="title">Meeting Title</Label>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Weekly Status Update"
                />
            </div>

            <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="space-y-2">
                <Label htmlFor="content">Minutes / Notes</Label>
                <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter meeting minutes here..."
                    className="min-h-[200px]"
                />
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={onCancel} disabled={saving}>
                    Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving || !title || !date || !content} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Minutes'}
                </Button>
            </div>
        </div>
    );
}
