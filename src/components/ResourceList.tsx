'use client';

import { Resource } from '@/types';
import { Trash2, Database, Play } from 'lucide-react';
import { useState } from 'react';

interface ResourceListProps {
    resources: Resource[];
    onDelete: (id: string) => void;
    onEdit: (resource: Resource) => void;
}

export default function ResourceList({ resources, onDelete, onEdit }: ResourceListProps) {
    const [generating, setGenerating] = useState<string | null>(null);

    const handleGenerate = async (resourceId: string) => {
        setGenerating(resourceId);
        try {
            const count = prompt('How many items to generate?', '10');
            if (!count) return;

            const res = await fetch(`/api/resources/${resourceId}/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count: parseInt(count) }),
            });

            if (res.ok) {
                alert('Data generated successfully!');
            } else {
                alert('Failed to generate data');
            }
        } catch (err) {
            alert('Error generating data');
        } finally {
            setGenerating(null);
        }
    };

    if (resources.length === 0) {
        return (
            <div className="text-center py-12 text-muted">
                <p>No resources created yet. Click "Create Resource" to get started.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4">
            {resources.map(resource => (
                <div key={resource.id} className="card animate-fade-in">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-semibold mb-1">{resource.name}</h3>
                            <p className="text-sm text-muted">
                                {resource.fields.length} field{resource.fields.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <div className="flex gap-1">
                            <button
                                onClick={() => handleGenerate(resource.id)}
                                className="btn btn-secondary text-sm"
                                disabled={generating === resource.id}
                                title="Generate fake data"
                            >
                                <Play size={14} className="mr-1" />
                                {generating === resource.id ? 'Generating...' : 'Generate'}
                            </button>
                            <button
                                onClick={() => onDelete(resource.id)}
                                className="text-gray-500 hover:text-red-500 transition-colors p-2"
                                title="Delete Resource"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="bg-dark-muted p-3 rounded">
                        <div className="text-xs text-muted mb-2 uppercase tracking-wider">Fields</div>
                        <div className="flex flex-wrap gap-2">
                            {resource.fields.map(field => (
                                <div key={field.id} className="text-xs px-2 py-1 bg-surface rounded border border-border">
                                    <span className="font-mono">{field.name}</span>
                                    <span className="text-muted ml-1">({field.type})</span>
                                    {field.required && <span className="text-red-400 ml-1">*</span>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-3 p-2 bg-dark-muted rounded text-xs">
                        <div className="text-muted mb-1">Endpoints:</div>
                        <div className="font-mono text-blue">
                            <div>GET /api/v1/{resource.name}</div>
                            <div>GET /api/v1/{resource.name}/:id</div>
                            <div>POST /api/v1/{resource.name}</div>
                            <div>PUT /api/v1/{resource.name}/:id</div>
                            <div>DELETE /api/v1/{resource.name}/:id</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
