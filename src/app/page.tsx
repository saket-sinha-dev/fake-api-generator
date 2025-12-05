'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { MockApi, Resource, Project } from '@/types';
import ApiForm from '@/components/ApiForm';
import ApiList from '@/components/ApiList';
import ResourceForm from '@/components/ResourceForm';
import ResourceList from '@/components/ResourceList';
import ProjectForm from '@/components/ProjectForm';
import ProjectList from '@/components/ProjectList';
import ProfileForm from '@/components/ProfileForm';
import { Plus, ArrowLeft, LogOut, User } from 'lucide-react';

type Tab = 'apis' | 'resources';

export default function Home() {
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
  const [showProfile, setShowProfile] = useState(false);
  const [userProfile, setUserProfile] = useState<{firstName?: string; lastName?: string} | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>('apis');
  const [apis, setApis] = useState<MockApi[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingApi, setEditingApi] = useState<MockApi | undefined>(undefined);
  const [editingResource, setEditingResource] = useState<Resource | undefined>(undefined);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApis = async () => {
    if (!selectedProject) return;
    try {
      const res = await fetch('/api/apis');
      const data = await res.json();
      // Filter by project
      setApis(data.filter((api: MockApi) => api.projectId === selectedProject.id));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchResources = async () => {
    if (!selectedProject) return;
    try {
      const res = await fetch('/api/resources');
      const data = await res.json();
      // Filter by project
      setResources(data.filter((r: Resource) => r.projectId === selectedProject.id));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setUserProfile({ firstName: data.firstName, lastName: data.lastName });
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    }
  };

  useEffect(() => {
    if (selectedProject) {
      fetchApis();
      fetchResources();
    }
  }, [selectedProject]);

  const handleDeleteProject = async (id: string) => {
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (selectedProject?.id === id) {
      setSelectedProject(null);
    }
    fetchProjects();
  };

  const handleDeleteApi = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API?')) return;
    await fetch(`/api/apis/${id}`, { method: 'DELETE' });
    fetchApis();
  };

  const handleDeleteResource = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    await fetch(`/api/resources/${id}`, { method: 'DELETE' });
    fetchResources();
  };

  const handleEditApi = (api: MockApi) => {
    setEditingApi(api);
    setEditingResource(undefined);
    setShowForm(true);
  };

  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource);
    setEditingApi(undefined);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingApi(undefined);
    setEditingResource(undefined);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingApi(undefined);
    setEditingResource(undefined);
    if (activeTab === 'apis') {
      fetchApis();
    } else {
      fetchResources();
    }
  };

  const handleCreateNew = () => {
    setEditingApi(undefined);
    setEditingResource(undefined);
    setShowForm(true);
  };

  const handleProjectCreated = (project: Project) => {
    setShowProjectForm(false);
    setEditingProject(undefined);
    setSelectedProject(project);
    fetchProjects();
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  // Project selection view
  if (!selectedProject) {
    return (
      <>
        <header className="app-header">
          <div className="container">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div className="logo">FakeAPI</div>
                <nav className="flex gap-1">
                  <button className="tab active">Projects</button>
                </nav>
              </div>
              <div className="flex items-center gap-3">
                {session?.user && (
                  <>
                    {userProfile?.firstName && (
                      <span className="user-greeting">
                        Hi, <strong>{userProfile.firstName} {userProfile.lastName}</strong>!
                      </span>
                    )}
                    <button
                      onClick={() => setShowProfile(true)}
                      className="icon-btn"
                      title="Profile"
                    >
                      {session.user.image ? (
                        <img
                          src={session.user.image}
                          alt={`${userProfile?.firstName || session.user.name || 'User'}`}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <User size={18} />
                      )}
                    </button>
                  </>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                  className="icon-btn"
                  title="Sign out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="py-12">
          <div className="container">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold mb-2">Your Projects</h1>
                <p className="text-muted">Create and manage your mock API projects</p>
              </div>
              <button
                onClick={() => {
                  setEditingProject(undefined);
                  setShowProjectForm(true);
                }}
                className="btn btn-primary"
                disabled={showProjectForm}
              >
                <Plus size={18} className="mr-2" />
                New Project
              </button>
            </div>

            {showProfile && (
              <div className="mb-8">
                <ProfileForm
                  onSuccess={() => {
                    setShowProfile(false);
                    fetchUserProfile();
                  }}
                  onCancel={() => setShowProfile(false)}
                />
              </div>
            )}

            {showProjectForm && (
              <div className="mb-8">
                <ProjectForm
                  initialData={editingProject}
                  onSuccess={handleProjectCreated}
                  onCancel={() => {
                    setShowProjectForm(false);
                    setEditingProject(undefined);
                  }}
                />
              </div>
            )}

            {loading ? (
              <div className="empty-state">
                <div className="text-lg">Loading...</div>
              </div>
            ) : (
              <ProjectList
                projects={projects}
                onSelect={setSelectedProject}
                onDelete={handleDeleteProject}
                onEdit={handleEditProject}
                onUpdate={fetchProjects}
              />
            )}
          </div>
        </main>
      </>
    );
  }

  // Project workspace view
  return (
    <>
      <header className="app-header">
        <div className="container">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="logo">FakeAPI</div>
              <nav className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setSelectedProject(null);
                    setShowForm(false);
                  }}
                  className="btn-ghost flex items-center gap-2"
                >
                  <ArrowLeft size={16} />
                  Projects
                </button>
                <span className="text-muted">/</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="font-medium">{selectedProject.name}</span>
                </div>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              {session?.user && (
                <>
                  {userProfile?.firstName && (
                    <span className="user-greeting">
                      Hi, <strong>{userProfile.firstName} {userProfile.lastName}</strong>!
                    </span>
                  )}
                  <button
                    onClick={() => setShowProfile(true)}
                    className="icon-btn"
                    title="Profile"
                  >
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={`${userProfile?.firstName || session.user.name || 'User'}`}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <User size={18} />
                    )}
                  </button>
                </>
              )}
              <button
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                className="icon-btn"
                title="Sign out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="py-12">
        <div className="container">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-1">{selectedProject.name}</h1>
              {selectedProject.description && (
                <p className="text-muted text-sm">{selectedProject.description}</p>
              )}
            </div>
            <button
              onClick={handleCreateNew}
              className="btn btn-primary"
              disabled={showForm}
            >
              <Plus size={18} className="mr-2" />
              {activeTab === 'apis' ? 'New Endpoint' : 'New Resource'}
            </button>
          </div>

          {/* Tabs */}
          <div className="tabs">
            <button
              onClick={() => { setActiveTab('apis'); setShowForm(false); }}
              className={`tab ${activeTab === 'apis' ? 'active' : ''}`}
            >
              Custom APIs ({apis.length})
            </button>
            <button
              onClick={() => { setActiveTab('resources'); setShowForm(false); }}
              className={`tab ${activeTab === 'resources' ? 'active' : ''}`}
            >
              Resources ({resources.length})
            </button>
          </div>

          {showForm && (
            <div className="mb-8">
              {activeTab === 'apis' ? (
                <ApiForm
                  initialData={editingApi}
                  onSuccess={handleSuccess}
                  onCancel={handleCancel}
                  projectId={selectedProject.id}
                />
              ) : (
                <ResourceForm
                  initialData={editingResource}
                  onSuccess={handleSuccess}
                  onCancel={handleCancel}
                  projectId={selectedProject.id}
                />
              )}
            </div>
          )}

          <>
            {activeTab === 'apis' && (
              <ApiList apis={apis} onDelete={handleDeleteApi} onEdit={handleEditApi} />
            )}
            {activeTab === 'resources' && (
              <ResourceList resources={resources} onDelete={handleDeleteResource} onEdit={handleEditResource} />
            )}
          </>
        </div>
      </main>
    </>
  );
}
