'use client';

import { useState, useEffect } from 'react';
import { Resource, ResourceField, FieldType } from '@/types';
import { FAKER_METHODS } from '@/lib/dataGenerator';
import { Plus, Trash2 } from 'lucide-react';

interface ResourceFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    initialData?: Resource;
    projectId: string;
}

export default function ResourceForm({ onSuccess, onCancel, initialData, projectId }: ResourceFormProps) {
    const [name, setName] = useState('');
    const [fields, setFields] = useState<ResourceField[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resources, setResources] = useState<Resource[]>([]);

    useEffect(() => {
        fetchResources();
        if (initialData) {
            setName(initialData.name);
            setFields(initialData.fields);
        }
    }, [initialData]);

    const fetchResources = async () => {
        const res = await fetch('/api/resources');
        const data = await res.json();
        setResources(data);
    };

    const addField = () => {
        setFields([
            ...fields,
            {
                id: crypto.randomUUID(),
                name: '',
                type: 'string',
                required: false,
            },
        ]);
    };

    const updateField = (id: string, updates: Partial<ResourceField>) => {
        setFields(fields.map(f => (f.id === id ? { ...f, ...updates } : f)));
    };

    const removeField = (id: string) => {
        setFields(fields.filter(f => f.id !== id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!name || fields.length === 0) {
                throw new Error('Resource name and at least one field are required');
            }

            const url = initialData ? `/api/resources/${initialData.id}` : '/api/resources';
            const method = initialData ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, fields, projectId }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save resource');
            }

            onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card animate-fade-in">
            <h2 className="text-xl mb-4">{initialData ? 'Edit Resource' : 'Create New Resource'}</h2>

            {error && (
                <div className="mb-4 p-3 bg-error-light rounded text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label className="label">Resource Name (plural)</label>
                    <input
                        type="text"
                        className="input"
                        placeholder="e.g. users, products"
                        value={name}
                        onChange={e => setName(e.target.value.toLowerCase())}
                        required
                    />
                    <p className="text-xs text-muted mt-1">This will be your endpoint: /api/v1/{name || 'resource'}</p>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="label mb-0">Fields</label>
                        <button type="button" onClick={addField} className="btn btn-secondary text-sm">
                            <Plus size={14} className="mr-1" />
                            Add Field
                        </button>
                    </div>

                    {fields.map((field, index) => (
                        <div key={field.id} className="flex gap-2 mb-2 p-3 bg-dark-muted rounded">
                            <input
                                type="text"
                                className="input flex-1"
                                placeholder="Field name"
                                value={field.name}
                                onChange={e => updateField(field.id, { name: e.target.value })}
                                required
                            />

                            <select
                                className="input w-32"
                                value={field.type}
                                onChange={e => updateField(field.id, { type: e.target.value as FieldType })}
                            >
                                <option value="string">String</option>
                                <option value="number">Number</option>
                                <option value="boolean">Boolean</option>
                                <option value="date">Date</option>
                                <option value="email">Email</option>
                                <option value="uuid">UUID</option>
                                <option value="image">Image</option>
                                <option value="relation">Relation</option>
                            </select>

                            {field.type === 'string' && (
                                <select
                                    className="input w-40"
                                    value={field.fakerMethod || ''}
                                    onChange={e => updateField(field.id, { fakerMethod: e.target.value })}
                                >
                                    <option value="">Random text</option>
                                    {FAKER_METHODS.map(m => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                            )}

                            {field.type === 'relation' && (
                                <select
                                    className="input w-32"
                                    value={field.relationTo || ''}
                                    onChange={e => updateField(field.id, { relationTo: e.target.value })}
                                >
                                    <option value="">Select resource</option>
                                    {resources.map(r => (
                                        <option key={r.id} value={r.name}>{r.name}</option>
                                    ))}
                                </select>
                            )}

                            <label className="flex items-center gap-1 text-sm">
                                <input
                                    type="checkbox"
                                    checked={field.required}
                                    onChange={e => updateField(field.id, { required: e.target.checked })}
                                />
                                Required
                            </label>

                            <button
                                type="button"
                                onClick={() => removeField(field.id)}
                                className="text-red hover:text-red-400 p-2"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}

                    {fields.length === 0 && (
                        <p className="text-muted text-sm text-center py-4">No fields added yet. Click "Add Field" to start.</p>
                    )}
                </div>

                <div className="flex justify-end gap-2 mt-2">
                    <button type="button" onClick={onCancel} className="btn btn-secondary">
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : (initialData ? 'Update Resource' : 'Create Resource')}
                    </button>
                </div>
            </form>
        </div>
    );
}
