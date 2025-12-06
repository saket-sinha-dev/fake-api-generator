'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Project } from '@/types';
import { X, UserPlus, Trash2, Copy, Check, Users, Link as LinkIcon, Globe, Crown } from 'lucide-react';

interface ShareModalProps {
  project: Project;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ShareModal({ project, onClose, onUpdate }: ShareModalProps) {
  const { data: session } = useSession();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const isOwner = session?.user?.email === project.userId;
  const apiUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/v1`;

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/projects/${project.id}/collaborators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add collaborator');
      }

      setEmail('');
      onUpdate();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorEmail: string) => {
    if (!confirm(`Remove ${collaboratorEmail} from this project?`)) return;

    try {
      const res = await fetch(`/api/projects/${project.id}/collaborators`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: collaboratorEmail }),
      });

      if (!res.ok) {
        throw new Error('Failed to remove collaborator');
      }

      onUpdate();
    } catch (err) {
      alert('Failed to remove collaborator');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="share-modal-header">
          <div className="flex items-center gap-3">
            <div className="share-modal-icon">
              <Users size={24} />
            </div>
            <div>
              <h2 className="share-modal-title">Share Project</h2>
              <p className="share-modal-subtitle">{project.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="share-modal-close">
            <X size={20} />
          </button>
        </div>

        {/* Public API Access */}
        <div className="share-section">
          <div className="share-section-header">
            <Globe size={18} />
            <h3>Public API Access</h3>
          </div>
          <p className="share-section-desc">
            All generated APIs are publicly accessible. Anyone with the URL can use them.
          </p>
          <div className="share-url-box">
            <LinkIcon size={16} className="share-url-icon" />
            <code className="share-url-text">{apiUrl}</code>
            <button onClick={copyToClipboard} className="share-copy-btn">
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        {/* Collaborators Section */}
        <div className="share-section">
          <div className="share-section-header">
            <UserPlus size={18} />
            <h3>Manage Collaborators</h3>
          </div>
          <p className="share-section-desc">
            {isOwner 
              ? 'Invite team members to view and edit this project.'
              : 'You are a collaborator on this project. Only the owner can add or remove collaborators.'}
          </p>

          {/* Add Collaborator Form - Only show for owner */}
          {isOwner && (
            <form onSubmit={handleAddCollaborator} className="share-add-form">
              <input
                type="email"
                className="share-input"
                placeholder="Enter collaborator's email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
              <button type="submit" className="share-add-btn" disabled={loading}>
                {loading ? 'Adding...' : 'Add'}
              </button>
            </form>
          )}

          {error && (
            <div className="share-error">
              {error}
            </div>
          )}

          {/* Collaborators List */}
          <div className="share-collaborators-list">
            {/* Owner */}
            <div className="share-collaborator-item">
              <div className="share-collaborator-avatar" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                {project.userId.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <span className="share-collaborator-email">{project.userId}</span>
                <div style={{ fontSize: '11px', color: '#d97706', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <Crown size={12} />
                  Owner
                </div>
              </div>
            </div>

            {/* Collaborators */}
            {project.collaborators && project.collaborators.length > 0 ? (
              project.collaborators.map((collaborator) => (
                <div key={collaborator} className="share-collaborator-item">
                  <div className="share-collaborator-avatar">
                    {collaborator.charAt(0).toUpperCase()}
                  </div>
                  <span className="share-collaborator-email">{collaborator}</span>
                  {isOwner && (
                    <button
                      onClick={() => handleRemoveCollaborator(collaborator)}
                      className="share-remove-btn"
                      title="Remove collaborator"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))
            ) : (
              !isOwner && (
                <div className="share-empty-state" style={{ padding: '16px' }}>
                  <p style={{ fontSize: '13px' }}>No other collaborators</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
