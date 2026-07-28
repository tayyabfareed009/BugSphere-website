import { useEffect, useState } from 'react';
import { FiPlus, FiX, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Button from '../../components/Buttons/Button.jsx';
import SearchBar from '../../components/SearchBar/SearchBar.jsx';
import api from '../../services/api.js';

export default function Projects() {
  const [query, setQuery] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loadingUsersTeams, setLoadingUsersTeams] = useState(false);

  // Form state for create & edit
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
    status: 'Active',
    priority: 'Medium',
    startDate: '',
    dueDate: '',
    members: [],
    teams: [],
  });

  // Fetch projects
  useEffect(() => {
    api
      .get('/projects', { params: { search: query || undefined } })
      .then(({ data }) => {
        console.log('[WorkSphere] Projects loaded');
        setProjects(data);
      })
      .catch((error) => console.error('[WorkSphere] Projects load failed', error))
      .finally(() => setLoading(false));
  }, [query]);

  // Fetch users & teams when any modal opens
  useEffect(() => {
    if (showCreateModal || showEditModal) {
      setLoadingUsersTeams(true);
      Promise.all([
        api.get('/users'),
        api.get('/teams'),
      ])
        .then(([usersRes, teamsRes]) => {
          setUsers(usersRes.data);
          setTeams(teamsRes.data);
        })
        .catch((err) => {
          console.error('Failed to load users/teams', err);
          setError('Could not load users or teams. Please try again.');
        })
        .finally(() => setLoadingUsersTeams(false));
    }
  }, [showCreateModal, showEditModal]);

  // Reset form to defaults (for create)
  const resetForm = () => {
    setFormData({
      name: '',
      key: '',
      description: '',
      status: 'Active',
      priority: 'Medium',
      startDate: '',
      dueDate: '',
      members: [],
      teams: [],
    });
    setError('');
  };

  // Open edit modal with project data
  const openEditModal = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      key: project.key,
      description: project.description || '',
      status: project.status,
      priority: project.priority,
      startDate: project.startDate ? project.startDate.split('T')[0] : '',
      dueDate: project.dueDate ? project.dueDate.split('T')[0] : '',
      members: project.members.map(m => m._id || m),
      teams: project.teams.map(t => t._id || t),
    });
    setShowEditModal(true);
  };

  // Handle text/select/date changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Toggle checkbox for members
  const toggleMember = (userId) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter(id => id !== userId)
        : [...prev.members, userId],
    }));
  };

  // Toggle checkbox for teams
  const toggleTeam = (teamId) => {
    setFormData(prev => ({
      ...prev,
      teams: prev.teams.includes(teamId)
        ? prev.teams.filter(id => id !== teamId)
        : [...prev.teams, teamId],
    }));
  };

  // Create project
  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/projects', formData);
      const { data } = await api.get('/projects', { params: { search: query || undefined } });
      setProjects(data);
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  // Update project
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.put(`/projects/${editingProject._id}`, formData);
      const { data } = await api.get('/projects', { params: { search: query || undefined } });
      setProjects(data);
      setShowEditModal(false);
      setEditingProject(null);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update project');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete project
  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
    try {
      await api.delete(`/projects/${projectId}`);
      const { data } = await api.get('/projects', { params: { search: query || undefined } });
      setProjects(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project');
    }
  };

  // Reusable modal content (create & edit use same form)
  const renderModalForm = (isEdit) => (
    <form onSubmit={isEdit ? handleUpdate : handleCreate} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Project Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Project Key *
        </label>
        <input
          type="text"
          name="key"
          value={formData.key}
          onChange={handleChange}
          required
          disabled={isEdit} // key shouldn't be changed after creation
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 uppercase dark:border-slate-700 dark:bg-slate-800 dark:text-white disabled:opacity-60"
        />
        {isEdit && <p className="mt-1 text-xs text-slate-500">Project key cannot be changed.</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="Planning">Planning</option>
            <option value="Active">Active</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Priority
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Start Date
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Due Date
          </label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>

      {/* Members - Checkbox list */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Members
        </label>
        {loadingUsersTeams ? (
          <p className="mt-1 text-sm text-slate-500">Loading users...</p>
        ) : (
          <div className="mt-1 max-h-40 overflow-y-auto rounded border border-slate-300 p-2 dark:border-slate-700">
            {users.length === 0 ? (
              <p className="text-sm text-slate-500">No users available</p>
            ) : (
              users.map((user) => (
                <label key={user._id} className="flex items-center gap-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.members.includes(user._id)}
                    onChange={() => toggleMember(user._id)}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm">{user.name} ({user.email})</span>
                </label>
              ))
            )}
          </div>
        )}
        <p className="mt-1 text-xs text-slate-500">
          Selected: {formData.members.length} user(s)
        </p>
      </div>

      {/* Teams - Checkbox list */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Teams
        </label>
        {loadingUsersTeams ? (
          <p className="mt-1 text-sm text-slate-500">Loading teams...</p>
        ) : (
          <div className="mt-1 max-h-40 overflow-y-auto rounded border border-slate-300 p-2 dark:border-slate-700">
            {teams.length === 0 ? (
              <p className="text-sm text-slate-500">No teams available</p>
            ) : (
              teams.map((team) => (
                <label key={team._id} className="flex items-center gap-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.teams.includes(team._id)}
                    onChange={() => toggleTeam(team._id)}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm">{team.name}</span>
                </label>
              ))
            )}
          </div>
        )}
        <p className="mt-1 text-xs text-slate-500">
          Selected: {formData.teams.length} team(s)
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            isEdit ? setShowEditModal(false) : setShowCreateModal(false);
            resetForm();
            setEditingProject(null);
          }}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Project' : 'Create Project')}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Projects"
        text="Create, edit, search, filter, and monitor product workspaces."
        action={
          <Button icon={FiPlus} onClick={() => { resetForm(); setShowCreateModal(true); }}>
            Create Project
          </Button>
        }
      />

      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search projects by name or key"
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {projects.map((project) => (
          <article
            key={project._id}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-700">
                  {project.key}
                </span>
                <h3 className="mt-4 text-xl font-black text-slate-950 dark:text-white">
                  {project.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Owner: {project.owner?.name || '—'}
                </p>
              </div>
              {/* Actions - only for owner (or anyone with permission) */}
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(project)}
                  className="text-slate-400 hover:text-sky-600 dark:hover:text-sky-400"
                  title="Edit project"
                >
                  <FiEdit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(project._id)}
                  className="text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                  title="Delete project"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-sm">
                <span>Project status</span>
                <span>{project.status}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-2 w-2/3 rounded-full bg-sky-500" />
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center text-sm">
              <Metric label="Members" value={project.members?.length || 0} />
              <Metric label="Status" value={project.status} />
              <Metric
                label="Due"
                value={
                  project.dueDate
                    ? new Date(project.dueDate).toLocaleDateString()
                    : '—'
                }
              />
            </div>
          </article>
        ))}
      </div>

      {!loading && !projects.length && (
        <p className="rounded-lg border border-dashed border-slate-300 p-10 text-center text-slate-500">
          No projects yet. Create your first project to begin.
        </p>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <Modal onClose={() => { setShowCreateModal(false); resetForm(); }}>
          <h2 className="mb-4 text-2xl font-bold text-slate-950 dark:text-white">
            Create New Project
          </h2>
          {error && <ErrorAlert message={error} />}
          {renderModalForm(false)}
        </Modal>
      )}

      {/* Edit Modal */}
      {showEditModal && editingProject && (
        <Modal onClose={() => { setShowEditModal(false); resetForm(); setEditingProject(null); }}>
          <h2 className="mb-4 text-2xl font-bold text-slate-950 dark:text-white">
            Edit Project
          </h2>
          {error && <ErrorAlert message={error} />}
          {renderModalForm(true)}
        </Modal>
      )}
    </div>
  );
}

// ===== Helper Components =====

export function PageHeader({ title, text, action }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-3xl font-black text-slate-950 dark:text-white">{title}</h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400">{text}</p>
      </div>
      {action}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
      <p className="font-black text-slate-950 dark:text-white">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-slate-900">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <FiX size={24} />
        </button>
        {children}
      </div>
    </div>
  );
}

function ErrorAlert({ message }) {
  return (
    <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
      {message}
    </div>
  );
}