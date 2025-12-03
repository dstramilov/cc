import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { Todo, todoStorage } from "@/lib/todo-storage";
import { useUser } from "@/lib/user-context";
import { TodoItem } from "@/components/todos/todo-item";

export const TodoWidget = React.memo(function TodoWidget() {
    const { user } = useUser();
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);
    const [newTodo, setNewTodo] = useState('');
    const [adding, setAdding] = useState(false);

    const loadTodos = useCallback(async () => {
        if (!user?.customerId) return;
        try {
            const data = await todoStorage.getTodos(user.customerId);
            setTodos(data);
        } catch (error) {
            console.error('Failed to load todos:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.customerId]);

    useEffect(() => {
        loadTodos();
    }, [loadTodos]);

    const handleAdd = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTodo.trim() || !user?.customerId) return;

        setAdding(true);
        try {
            const added = await todoStorage.addTodo({
                customer_id: user.customerId,
                title: newTodo,
                status: 'pending',
                created_by: user.id
            });
            setTodos(prev => [added, ...prev]);
            setNewTodo('');
        } catch (error) {
            console.error('Failed to add todo:', error);
            alert("Failed to add action item");
        } finally {
            setAdding(false);
        }
    }, [newTodo, user?.customerId, user?.id]);

    const handleToggle = useCallback(async (todo: Todo) => {
        const newStatus = todo.status === 'completed' ? 'pending' : 'completed';

        setTodos(prev => prev.map(t =>
            t.id === todo.id ? { ...t, status: newStatus } : t
        ));

        try {
            await todoStorage.updateTodo(todo.id, { status: newStatus });
        } catch (error) {
            console.error('Failed to update todo:', error);
            setTodos(prev => prev.map(t =>
                t.id === todo.id ? { ...t, status: todo.status } : t
            ));
        }
    }, []);

    const handleDelete = useCallback(async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        const previousTodos = todos;
        setTodos(prev => prev.filter(t => t.id !== id));

        try {
            await todoStorage.deleteTodo(id);
        } catch (error) {
            console.error('Failed to delete todo:', error);
            setTodos(previousTodos);
        }
    }, [todos]);

    if (!user?.customerId) return (
        <Card className="glass-card h-full flex flex-col items-center justify-center p-6 text-muted-foreground">
            <p>Please select a customer to view action items.</p>
        </Card>
    );

    return (
        <Card className="glass-card h-full flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    Action Items
                    <span className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                        {todos.filter(t => t.status !== 'completed').length}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
                <form onSubmit={handleAdd} className="flex gap-2">
                    <Input
                        placeholder="Add new item..."
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        className="bg-background/50"
                    />
                    <Button type="submit" size="icon" disabled={adding || !newTodo.trim()}>
                        {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    </Button>
                </form>

                <div className="flex-1 overflow-y-auto pr-1 space-y-1 min-h-[200px] max-h-[400px]">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : todos.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            No action items yet.
                        </div>
                    ) : (
                        todos.map(todo => (
                            <TodoItem
                                key={todo.id}
                                todo={todo}
                                onToggle={handleToggle}
                                onDelete={handleDelete}
                            />
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
});
