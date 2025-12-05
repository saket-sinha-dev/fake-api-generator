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
    const [enableConditional, setEnableConditional] = useState(false);
    const [conditionalData, setConditionalData] = useState({
        conditionType: 'query',
        conditionKey: '',
        conditionOperator: 'equals',
        conditionValue: '',
        dependentApiId: '',
        dependentApiPath: '',
        responseIfTrue: '',
        responseIfFalse: '',
        statusCodeIfTrue: '',
        statusCodeIfFalse: ''
    });
    const [availableApis, setAvailableApis] = useState<MockApi[]>([]);

    useEffect(() => {
        // Fetch available APIs for dependent API selection
        fetch(`/api/apis?projectId=${projectId}`)
            .then(res => res.json())
            .then(data => setAvailableApis(data))
            .catch(console.error);
    }, [projectId]);

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
            if (initialData.conditionalResponse) {
                setEnableConditional(true);
                const cond = initialData.conditionalResponse;
                setConditionalData({
                    conditionType: cond.condition.type,
                    conditionKey: cond.condition.key || '',
                    conditionOperator: cond.condition.operator,
                    conditionValue: cond.condition.value !== undefined ? String(cond.condition.value) : '',
                    dependentApiId: cond.condition.dependentApiId || '',
                    dependentApiPath: cond.condition.dependentApiPath || '',
                    responseIfTrue: JSON.stringify(cond.responseIfTrue, null, 2),
                    responseIfFalse: JSON.stringify(cond.responseIfFalse, null, 2),
                    statusCodeIfTrue: cond.statusCodeIfTrue ? String(cond.statusCodeIfTrue) : '',
                    statusCodeIfFalse: cond.statusCodeIfFalse ? String(cond.statusCodeIfFalse) : ''
                });
            }
        }
    }, [initialData, projectId]);

    const prettifyJson = (jsonString: string): string => {
        try {
            const parsed = JSON.parse(jsonString);
            return JSON.stringify(parsed, null, 2);
        } catch {
            return jsonString;
        }
    };

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

            // Validate and prettify JSON if provided
            let parsedResponseBody = null;
            let prettifiedResponseBody = formData.responseBody;
            if (formData.responseBody.trim()) {
                try {
                    parsedResponseBody = JSON.parse(formData.responseBody);
                    prettifiedResponseBody = JSON.stringify(parsedResponseBody, null, 2);
                } catch (err) {
                    throw new Error('Invalid JSON in Response Body. Check for syntax errors, missing commas, or quotes.');
                }
            }

            let parsedRequestBody = null;
            let prettifiedRequestBody = formData.requestBody;
            if (formData.requestBody.trim()) {
                try {
                    parsedRequestBody = JSON.parse(formData.requestBody);
                    prettifiedRequestBody = JSON.stringify(parsedRequestBody, null, 2);
                } catch (err) {
                    throw new Error('Invalid JSON in Request Body. Check for syntax errors, missing commas, or quotes.');
                }
            }

            // Update state with prettified JSON
            setFormData(prev => ({
                ...prev,
                responseBody: prettifiedResponseBody,
                requestBody: prettifiedRequestBody
            }));

            // Parse and prettify conditional response if enabled
            let conditionalResponse = null;
            if (enableConditional) {
                let parsedResponseIfTrue, parsedResponseIfFalse;
                let prettifiedResponseIfTrue, prettifiedResponseIfFalse;
                
                try {
                    parsedResponseIfTrue = JSON.parse(conditionalData.responseIfTrue || '{}');
                    prettifiedResponseIfTrue = JSON.stringify(parsedResponseIfTrue, null, 2);
                } catch (err) {
                    throw new Error('Invalid JSON in "Response If True"');
                }
                
                try {
                    parsedResponseIfFalse = JSON.parse(conditionalData.responseIfFalse || '{}');
                    prettifiedResponseIfFalse = JSON.stringify(parsedResponseIfFalse, null, 2);
                } catch (err) {
                    throw new Error('Invalid JSON in "Response If False"');
                }

                // Update state with prettified conditional responses
                setConditionalData(prev => ({
                    ...prev,
                    responseIfTrue: prettifiedResponseIfTrue,
                    responseIfFalse: prettifiedResponseIfFalse
                }));

                conditionalResponse = {
                    condition: {
                        type: conditionalData.conditionType,
                        key: conditionalData.conditionKey || undefined,
                        operator: conditionalData.conditionOperator,
                        value: conditionalData.conditionValue || undefined,
                        dependentApiId: conditionalData.dependentApiId || undefined,
                        dependentApiPath: conditionalData.dependentApiPath || undefined
                    },
                    responseIfTrue: parsedResponseIfTrue,
                    responseIfFalse: parsedResponseIfFalse,
                    statusCodeIfTrue: conditionalData.statusCodeIfTrue ? parseInt(conditionalData.statusCodeIfTrue) : undefined,
                    statusCodeIfFalse: conditionalData.statusCodeIfFalse ? parseInt(conditionalData.statusCodeIfFalse) : undefined
                };
                console.log('🔵 CLIENT: Sending conditional response:', JSON.stringify(conditionalResponse, null, 2));
            }

            const url = initialData ? `/api/apis/${initialData.id}` : '/api/apis';
            const method = initialData ? 'PUT' : 'POST';

            const payload = {
                ...formData,
                responseBody: parsedResponseBody,
                requestBody: parsedRequestBody,
                projectId,
                queryParams: queryParams.filter(q => q.key.trim() !== ''),
                conditionalResponse
            };
            
            console.log('🔵 CLIENT: Full payload being sent:', payload);
            console.log('🔵 CLIENT: Has conditionalResponse?', !!conditionalResponse);

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const data = await res.json();
                console.error('❌ CLIENT: Server error:', data);
                throw new Error(data.error || 'Failed to save API');
            }

            const savedApi = await res.json();
            console.log('✅ CLIENT: API saved successfully');
            console.log('🔍 CLIENT: Saved API has conditionalResponse?', !!savedApi.conditionalResponse);
            if (savedApi.conditionalResponse) {
                console.log('📦 CLIENT: Saved conditionalResponse:', savedApi.conditionalResponse);
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

                <div className="border rounded-lg p-4 bg-surface">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">📥</span>
                            <label className="label mb-0">Request Body (JSON) - Optional</label>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, requestBody: prettifyJson(formData.requestBody) })}
                            className="text-xs px-3 py-1 bg-primary text-white rounded hover:opacity-90"
                        >
                            ✨ Prettify
                        </button>
                    </div>
                    <textarea
                        className="input font-mono text-sm"
                        rows={6}
                        placeholder='{\n  "name": "John Doe",\n  "email": "john@example.com"\n}'
                        value={formData.requestBody}
                        onChange={e => setFormData({ ...formData, requestBody: e.target.value })}
                    />
                    <p className="text-xs text-muted mt-2">Expected request body format for POST/PUT/PATCH requests</p>
                </div>

                <div className="border rounded-lg p-4 bg-surface">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">📤</span>
                            <label className="label mb-0">Response Body (JSON) - Optional</label>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, responseBody: prettifyJson(formData.responseBody) })}
                            className="text-xs px-3 py-1 bg-primary text-white rounded hover:opacity-90"
                        >
                            ✨ Prettify
                        </button>
                    </div>
                    <textarea
                        className="input font-mono text-sm"
                        rows={8}
                        placeholder='{\n  "message": "Success"\n}'
                        value={formData.responseBody}
                        onChange={e => setFormData({ ...formData, responseBody: e.target.value })}
                    />
                    <p className="text-xs text-muted mt-2">Leave empty for no response body (e.g., 204 No Content)</p>
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

                {/* Conditional Response Section */}
                <div className="border-t pt-4 mt-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <label className="label flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={enableConditional}
                                    onChange={e => setEnableConditional(e.target.checked)}
                                />
                                Enable Conditional Response
                            </label>
                            <p className="text-xs text-muted mt-1">
                                Return different responses based on request conditions or dependent API calls
                            </p>
                        </div>
                    </div>

                    {enableConditional && (
                        <div className="bg-surface p-4 rounded space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Condition Type</label>
                                    <select
                                        className="input"
                                        value={conditionalData.conditionType}
                                        onChange={e => setConditionalData({ ...conditionalData, conditionType: e.target.value })}
                                    >
                                        <option value="header">HTTP Header</option>
                                        <option value="query">Query Parameter</option>
                                        <option value="body">Request Body Field</option>
                                        <option value="dependentApi">Dependent API Call</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="label">Operator</label>
                                    <select
                                        className="input"
                                        value={conditionalData.conditionOperator}
                                        onChange={e => setConditionalData({ ...conditionalData, conditionOperator: e.target.value })}
                                    >
                                        <option value="equals">Equals</option>
                                        <option value="notEquals">Not Equals</option>
                                        <option value="contains">Contains</option>
                                        <option value="greaterThan">Greater Than</option>
                                        <option value="lessThan">Less Than</option>
                                        <option value="exists">Exists</option>
                                    </select>
                                </div>
                            </div>

                            {conditionalData.conditionType === 'dependentApi' ? (
                                <>
                                    <div>
                                        <label className="label">Dependent API (Call this API first)</label>
                                        <select
                                            className="input"
                                            value={conditionalData.dependentApiId}
                                            onChange={e => setConditionalData({ ...conditionalData, dependentApiId: e.target.value })}
                                        >
                                            <option value="">Select an API...</option>
                                            {availableApis.map(api => (
                                                <option key={api.id} value={api.id}>
                                                    {api.name} ({api.method} {api.path})
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-muted mt-1">
                                            This API will be called first to check eligibility
                                        </p>
                                    </div>

                                    <div>
                                        <label className="label">Response Path to Check</label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="e.g., data.isEligible or status"
                                            value={conditionalData.dependentApiPath}
                                            onChange={e => setConditionalData({ ...conditionalData, dependentApiPath: e.target.value })}
                                        />
                                        <p className="text-xs text-muted mt-1">
                                            Dot notation to access nested values (e.g., "data.account.status")
                                        </p>
                                    </div>

                                    <div>
                                        <label className="label">Expected Value</label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="e.g., true or active"
                                            value={conditionalData.conditionValue}
                                            onChange={e => setConditionalData({ ...conditionalData, conditionValue: e.target.value })}
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="label">
                                            {conditionalData.conditionType === 'header' && 'Header Name'}
                                            {conditionalData.conditionType === 'query' && 'Query Parameter Name'}
                                            {conditionalData.conditionType === 'body' && 'Body Field Path'}
                                        </label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder={
                                                conditionalData.conditionType === 'header' ? 'e.g., Authorization' :
                                                conditionalData.conditionType === 'query' ? 'e.g., account_id' :
                                                'e.g., user.accountStatus'
                                            }
                                            value={conditionalData.conditionKey}
                                            onChange={e => setConditionalData({ ...conditionalData, conditionKey: e.target.value })}
                                        />
                                    </div>

                                    {conditionalData.conditionOperator !== 'exists' && (
                                        <div>
                                            <label className="label">Expected Value</label>
                                            <input
                                                type="text"
                                                className="input"
                                                placeholder="e.g., 559 or active"
                                                value={conditionalData.conditionValue}
                                                onChange={e => setConditionalData({ ...conditionalData, conditionValue: e.target.value })}
                                            />
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="border-2 border-success rounded-lg p-3 bg-white">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">✅</span>
                                            <label className="label mb-0 text-success">Response If Condition True (JSON)</label>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setConditionalData({ ...conditionalData, responseIfTrue: prettifyJson(conditionalData.responseIfTrue) })}
                                            className="text-xs px-2 py-1 bg-success text-white rounded hover:opacity-90"
                                        >
                                            ✨
                                        </button>
                                    </div>
                                    <textarea
                                        className="input font-mono text-sm"
                                        rows={6}
                                        placeholder='{\n  "eligible": true,\n  "data": {...}\n}'
                                        value={conditionalData.responseIfTrue}
                                        onChange={e => setConditionalData({ ...conditionalData, responseIfTrue: e.target.value })}
                                    />
                                    <input
                                        type="number"
                                        className="input mt-2"
                                        placeholder="Status Code (optional, defaults to main status)"
                                        value={conditionalData.statusCodeIfTrue}
                                        onChange={e => setConditionalData({ ...conditionalData, statusCodeIfTrue: e.target.value })}
                                    />
                                </div>

                                <div className="border-2 border-error rounded-lg p-3 bg-white">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">❌</span>
                                            <label className="label mb-0 text-error">Response If Condition False (JSON)</label>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setConditionalData({ ...conditionalData, responseIfFalse: prettifyJson(conditionalData.responseIfFalse) })}
                                            className="text-xs px-2 py-1 bg-error text-white rounded hover:opacity-90"
                                        >
                                            ✨
                                        </button>
                                    </div>
                                    <textarea
                                        className="input font-mono text-sm"
                                        rows={6}
                                        placeholder='{\n  "eligible": false,\n  "message": "Not eligible"\n}'
                                        value={conditionalData.responseIfFalse}
                                        onChange={e => setConditionalData({ ...conditionalData, responseIfFalse: e.target.value })}
                                    />
                                    <input
                                        type="number"
                                        className="input mt-2"
                                        placeholder="Status Code (optional, defaults to main status)"
                                        value={conditionalData.statusCodeIfFalse}
                                        onChange={e => setConditionalData({ ...conditionalData, statusCodeIfFalse: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="bg-primary-light p-3 rounded text-sm">
                                <strong>💡 Example Use Case:</strong>
                                <p className="text-muted mt-1">
                                    1. Create API A: <code>/check-eligibility</code> that returns <code>{'{"isEligible": true}'}</code>
                                </p>
                                <p className="text-muted">
                                    2. Create API B with Dependent API = API A, Path = "isEligible", Value = "true"
                                </p>
                                <p className="text-muted">
                                    3. When API B is called, it first calls API A to check eligibility, then returns appropriate response
                                </p>
                            </div>
                        </div>
                    )}
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
