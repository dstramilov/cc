import React from 'react';
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Todo } from "@/lib/todo-storage";
import { cn } from "@/lib/utils";

interface TodoItemProps {
    todo: Todo;
    onToggle: (todo: Todo) => void;
    onDelete: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
    return (
        <div className="flex items-center justify-between p-2 rounded-md hover:bg-white/5 group transition-colors">
            <div className="flex items-center gap-3 flex-1">
                <input
                    type="checkbox"
                    checked={todo.status === 'completed'}
                    onChange={() => onToggle(todo)}
                    id={`todo-${todo.id}`}
                    className="h-4 w-4 rounded border-primary text-primary focus:ring-primary cursor-pointer accent-primary"
                />
                <label
                    htmlFor={`todo-${todo.id}`}
                    className={cn(
                        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1 select-none",
                        todo.status === 'completed' && "line-through text-muted-foreground"
                    )}
                >
                    {todo.title}
                </label>
            </div>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(todo.id)}
                className="opacity-0 group-hover:opacity-100 h-8 w-8 text-muted-foreground hover:text-red-500 transition-opacity"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}
