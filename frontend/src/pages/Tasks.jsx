import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_COLUMNS = ['todo', 'inprogress', 'done'];
const STATUS_LABELS  = { todo: 'To Do', inprogress: 'In Progress', done: 'Done' };
const PRIORITY_COLOR = { low: 'bg-green-100 text-green-700', medium: 'bg-amber-100 text-amber-700', high: 'bg-red-100 text-red-700' };

const Tasks = () => {
  const { user }               = useAuth();
  const [searchParams]          = useSearchParams();
  const projectId               = searchParams.get('projectId');
  const projectName             = searchParams.get('projectName');
  const [tasks, setTasks]       = useState([]);
  const [users, setUsers]       = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading]   = useState(true);
  const [formData, setFormData] = useState({
    title: '', description: '', dueDate: '', priority: 'medium', assignedTo: '',
  });

  const fetchTasks = async () => {
    try {
      const { data } = await api.get(`/tasks?projectId=${projectId}`);
      setTasks(data);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchTasks();
    api.get('/users').then(({ data }) => setUsers(data)).catch(() => {});
  }, [projectId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...formData, projectId });
      toast.success('Task created!');
      setShowForm(false);
      setFormData({ title: '', description: '', dueDate: '', priority: 'medium', assignedTo: '' });
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks((prev) => prev.map((t) => t._id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading tasks...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{projectName}</h1>
          <p className="text-gray-500 text-sm">{tasks.length} tasks total</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
        >
          + Add Task
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3">New Task</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text" placeholder="Task title" required value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 col-span-2"
            />
            <textarea
              placeholder="Description" value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 col-span-2 resize-none"
              rows={2}
            />
            <input
              type="date" value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="low">Low priority</option>
              <option value="medium">Medium priority</option>
              <option value="high">High priority</option>
            </select>
            <select
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 col-span-2"
            >
              <option value="">Assign to...</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>{u.name}</option>
              ))}
            </select>
            <div className="col-span-2 flex gap-2">
              <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
                Create Task
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 px-4 py-2 rounded-lg text-sm hover:bg-gray-100">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STATUS_COLUMNS.map((status) => (
          <div key={status} className="bg-gray-50 rounded-xl p-4">
            <h2 className="font-semibold text-gray-600 mb-3 text-sm uppercase tracking-wide">
              {STATUS_LABELS[status]}
              <span className="ml-2 bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                {tasks.filter((t) => t.status === status).length}
              </span>
            </h2>
            <div className="space-y-3">
              {tasks.filter((t) => t.status === status).map((task) => (
                <div key={task._id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                  <p className="font-medium text-gray-800 text-sm mb-1">{task.title}</p>
                  {task.description && (
                    <p className="text-gray-500 text-xs mb-2 line-clamp-2">{task.description}</p>
                  )}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLOR[task.priority]}`}>
                      {task.priority}
                    </span>
                    {task.dueDate && (
                      <span className={`text-xs ${new Date(task.dueDate) < new Date() && task.status !== 'done' ? 'text-red-500' : 'text-gray-400'}`}>
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {task.assignedTo && (
                    <p className="text-xs text-gray-400 mb-2">👤 {task.assignedTo.name}</p>
                  )}
                  <div className="flex gap-1 mt-2">
                    {STATUS_COLUMNS.filter((s) => s !== status).map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(task._id, s)}
                        className="text-xs text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded border border-indigo-200 transition"
                      >
                        → {STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {tasks.filter((t) => t.status === status).length === 0 && (
                <p className="text-gray-400 text-xs text-center py-6">No tasks here</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tasks;