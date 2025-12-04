'use client';

import { useState, useEffect } from 'react';
import { MockApi } from '@/types';

interface ApiFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    initialData?: MockApi;
    projectId: string;
}

export default function ApiForm({ onSuccess, onCancel, initialData, projectId }: ApiFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        path: '',
        method: 'GET',
        statusCode: 200,
        responseBody: '{\n  "message": "Hello World"\n}'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                path: initialData.path,
                method: initialData.method,
                statusCode: initialData.statusCode,
                responseBody: JSON.stringify(initialData.responseBody, null, 2)
            });
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validate JSON
            let parsedBody;
            try {
                parsedBody = JSON.parse(formData.responseBody);
            } catch (err) {
                throw new Error('Invalid JSON in Response Body');
            }

            const url = initialData ? `/api/apis/${initialData.id}` : '/api/apis';
            const method = initialData ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    responseBody: parsedBody,
                    projectId
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save API');
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
            <h2 className="text-xl mb-4">{initialData ? 'Edit Mock API' : 'Create New Mock API'}</h2>

            {error && (
                <div className="mb-4 p-3 bg-error-light rounded text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label className="label">API Name</label>
                    <input
                        type="text"
                        className="input"
                        placeholder="e.g. Get Users"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="label">Path</label>
                        <div className="flex items-center">
                            <span className="text-muted mr-2">/api/v1</span>
                            <input
                                type="text"
                                className="input"
                                placeholder="/users"
                                value={formData.path}
                                onChange={e => setFormData({ ...formData, path: e.target.value })}
                                required
                            />
                        </div>
                        <p className="text-xs text-muted mt-1">Supports dynamic segments like /users/:id</p>
                    </div>

                    <div className="w-32">
                        <label className="label">Method</label>
                        <select
                            className="input"
                            value={formData.method}
                            onChange={e => setFormData({ ...formData, method: e.target.value })}
                        >
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="DELETE">DELETE</option>
                            <option value="PATCH">PATCH</option>
                            <option value="OPTIONS">OPTIONS</option>
                            <option value="HEAD">HEAD</option>
                        </select>
                    </div>

                    <div className="w-24">
                        <label className="label">Status</label>
                        <input
                            type="number"
                            className="input"
                            value={formData.statusCode}
                            onChange={e => setFormData({ ...formData, statusCode: parseInt(e.target.value) })}
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="label">Response Body (JSON)</label>
                    <textarea
                        className="input font-mono text-sm"
                        rows={8}
                        value={formData.responseBody}
                        onChange={e => setFormData({ ...formData, responseBody: e.target.value })}
                        required
                    />
                </div>

                <div className="flex justify-end gap-2 mt-2">
                    <button type="button" onClick={onCancel} className="btn btn-secondary">
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : (initialData ? 'Update API' : 'Create API')}
                    </button>
                </div>
            </form>
        </div>
    );
}
