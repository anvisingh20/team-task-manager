import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Projects = () => {
  const { user }                   = useAuth();
  const navigate                    = useNavigate();
  const [projects, setProjects]     = useState([]);
  const [showForm, setShowForm]     = useState(false);
  const [formData, setFormData]     = useState({ name: '', description: '' });
  const [loading, setLoading]       = useState(true);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', formData);
      toast.success('Project created!');
      setFormData({ name: '', description: '' });
      setShowForm(false);
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating project');
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
        >
          + New Project
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3">New Project</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <input
              type="text" placeholder="Project name" value={formData.name} required
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <textarea
              placeholder="Description (optional)" value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              rows={2}
            />
            <div className="flex gap-2">
              <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
                Create
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 px-4 py-2 rounded-lg text-sm hover:bg-gray-100">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <div
            key={project._id}
            onClick={() => navigate(`/tasks?projectId=${project._id}&projectName=${project.name}`)}
            className="bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:shadow-md hover:border-indigo-300 transition"
          >
            <h3 className="font-semibold text-gray-800 mb-1">{project.name}</h3>
            <p className="text-gray-500 text-sm mb-3">{project.description || 'No description'}</p>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Admin: {project.admin?.name}</span>
              <span>{project.members?.length} members</span>
            </div>
            {project.admin?._id === user?._id && (
              <span className="mt-2 inline-block bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full">
                You're admin
              </span>
            )}
          </div>
        ))}
        {projects.length === 0 && (
          <p className="text-gray-400 col-span-3 text-center py-10">No projects yet. Create your first one!</p>
        )}
      </div>
    </div>
  );
};

export default Projects;