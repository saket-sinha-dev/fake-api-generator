'use client';

import { useState, useEffect } from 'react';
import { Trash2, Shield, User } from 'lucide-react';

interface UserWithStats {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: 'user' | 'admin';
  projectCount: number;
  collaboratingCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminUserManagement() {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch users');
      }
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteUser(email: string) {
    if (!confirm(`Are you sure you want to delete user ${email} and all their projects? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(email)}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete user');
      }

      const result = await res.json();
      alert(`${result.message}\n\nDeleted:\n- ${result.deletedCounts.projects} projects\n- ${result.deletedCounts.resources} resources\n- ${result.deletedCounts.apis} APIs\n- ${result.deletedCounts.databases} database records`);
      fetchUsers();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  }

  async function handleToggleRole(email: string, currentRole: 'user' | 'admin') {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    if (!confirm(`Change ${email} role from "${currentRole}" to "${newRole}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(email)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update user role');
      }

      fetchUsers();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  }

  if (loading) {
    return <div className="admin-loading">Loading users...</div>;
  }

  if (error) {
    return <div className="admin-error">Error: {error}</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>User Management</h2>
        <p className="admin-subtitle">Total Users: {users.length}</p>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Projects</th>
              <th>Collaborations</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(users) && users.map((user) => (
              <tr key={user._id}>
                <td>
                  <div className="user-info">
                    <strong>{user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Unnamed User'}</strong>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge role-${user.role || 'user'}`}>
                    {user.role === 'admin' ? <Shield size={14} /> : <User size={14} />}
                    {user.role || 'user'}
                  </span>
                </td>
                <td>{user.projectCount}</td>
                <td>{user.collaboratingCount}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => handleToggleRole(user.email, user.role || 'user')}
                      className="btn-role"
                      title={`Change to ${user.role === 'admin' ? 'user' : 'admin'}`}
                    >
                      {user.role === 'admin' ? <User size={16} /> : <Shield size={16} />}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.email)}
                      className="btn-delete"
                      title="Delete user and all projects"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
