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
        responseBody: '',
        requestBody: ''
    });
    const [queryParams, setQueryParams] = useState<{ key: string; value: string; required: boolean }[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                path: initialData.path,
                method: initialData.method,
                statusCode: initialData.statusCode,
                responseBody: initialData.responseBody ? JSON.stringify(initialData.responseBody, null, 2) : '',
                requestBody: initialData.requestBody ? JSON.stringify(initialData.requestBody, null, 2) : ''
            });
            if (initialData.queryParams) {
                setQueryParams(initialData.queryParams);
            }
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validate required fields
            if (!formData.name.trim()) {
                throw new Error('Missing required field: API Name');
            }
            if (!formData.path.trim()) {
                throw new Error('Missing required field: Path');
            }

            // Validate JSON if provided
            let parsedResponseBody = null;
            if (formData.responseBody.trim()) {
                try {
                    parsedResponseBody = JSON.parse(formData.responseBody);
                } catch (err) {
                    throw new Error('Invalid JSON in Response Body. Check for syntax errors, missing commas, or quotes.');
                }
            }

            let parsedRequestBody = null;
            if (formData.requestBody.trim()) {
                try {
                    parsedRequestBody = JSON.parse(formData.requestBody);
                } catch (err) {
                    throw new Error('Invalid JSON in Request Body. Check for syntax errors, missing commas, or quotes.');
                }
            }

            const url = initialData ? `/api/apis/${initialData.id}` : '/api/apis';
            const method = initialData ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    responseBody: parsedResponseBody,
                    requestBody: parsedRequestBody,
                    projectId,
                    queryParams: queryParams.filter(q => q.key.trim() !== '')
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
                    <label className="label">Request Body (JSON) - Optional</label>
                    <textarea
                        className="input font-mono text-sm"
                        rows={6}
                        placeholder='{\n  "name": "John Doe",\n  "email": "john@example.com"\n}'
                        value={formData.requestBody}
                        onChange={e => setFormData({ ...formData, requestBody: e.target.value })}
                    />
                    <p className="text-xs text-muted mt-1">Expected request body format for POST/PUT/PATCH requests</p>
                </div>

                <div>
                    <label className="label">Response Body (JSON) - Optional</label>
                    <textarea
                        className="input font-mono text-sm"
                        rows={8}
                        placeholder='{\n  "message": "Success"\n}'
                        value={formData.responseBody}
                        onChange={e => setFormData({ ...formData, responseBody: e.target.value })}
                    />
                    <p className="text-xs text-muted mt-1">Leave empty for no response body (e.g., 204 No Content)</p>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="label">Query Parameters (Optional)</label>
                        <button
                            type="button"
                            onClick={() => setQueryParams([...queryParams, { key: '', value: '', required: false }])}
                            className="text-sm text-primary hover:underline"
                        >
                            + Add Parameter
                        </button>
                    </div>
                    {queryParams.length === 0 ? (
                        <p className="text-xs text-muted">No query parameters defined. Click "Add Parameter" to add one.</p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {queryParams.map((param, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        className="input flex-1"
                                        placeholder="Parameter name (e.g., account_id)"
                                        value={param.key}
                                        onChange={e => {
                                            const updated = [...queryParams];
                                            updated[index].key = e.target.value;
                                            setQueryParams(updated);
                                        }}
                                    />
                                    <input
                                        type="text"
                                        className="input flex-1"
                                        placeholder="Example value (e.g., 559)"
                                        value={param.value}
                                        onChange={e => {
                                            const updated = [...queryParams];
                                            updated[index].value = e.target.value;
                                            setQueryParams(updated);
                                        }}
                                    />
                                    <label className="flex items-center gap-1 text-sm whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={param.required}
                                            onChange={e => {
                                                const updated = [...queryParams];
                                                updated[index].required = e.target.checked;
                                                setQueryParams(updated);
                                            }}
                                        />
                                        Required
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setQueryParams(queryParams.filter((_, i) => i !== index))}
                                        className="text-error hover:underline text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="text-xs text-muted mt-2">
                        Example: /devices/chart/assigned_dosimeters?account_id=559
                    </p>
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
