'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types';

interface ProjectFormProps {
    onSuccess: (project: Project) => void;
    onCancel: () => void;
    initialData?: Project;
}

export default function ProjectForm({ onSuccess, onCancel, initialData }: ProjectFormProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setDescription(initialData.description || '');
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!name.trim()) {
                throw new Error('Project name is required');
            }

            const url = initialData ? `/api/projects/${initialData.id}` : '/api/projects';
            const method = initialData ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to create project');
            }

            const project = await res.json();
            onSuccess(project);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card animate-fade-in">
            <h2 className="text-xl mb-4">{initialData ? 'Edit Project' : 'Create New Project'}</h2>

            {error && (
                <div className="mb-4 p-3 bg-error-light rounded text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label className="label">Project Name</label>
                    <input
                        type="text"
                        className="input"
                        placeholder="e.g. E-commerce API, Blog Platform"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        autoFocus
                    />
                </div>

                <div>
                    <label className="label">Description (Optional)</label>
                    <textarea
                        className="input"
                        rows={3}
                        placeholder="Brief description of your project..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                </div>

                <div className="flex justify-end gap-2 mt-2">
                    <button type="button" onClick={onCancel} className="btn btn-secondary">
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Update Project' : 'Create Project')}
                    </button>
                </div>
            </form>
        </div>
    );
}
