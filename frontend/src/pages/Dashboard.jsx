import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Dashboard = () => {
  const { user }              = useAuth();
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await api.get('/tasks');
        setTasks(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const total   = tasks.length;
  const todo    = tasks.filter((t) => t.status === 'todo').length;
  const inprog  = tasks.filter((t) => t.status === 'inprogress').length;
  const done    = tasks.filter((t) => t.status === 'done').length;
  const overdue = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
  ).length;

  const chartData = [
    { name: 'To Do',       value: todo,  color: '#6366f1' },
    { name: 'In Progress', value: inprog,color: '#f59e0b' },
    { name: 'Done',        value: done,  color: '#10b981' },
  ];

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Dashboard</h1>
      <p className="text-gray-500 mb-6">Welcome back, {user?.name}!</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Tasks',  value: total,  color: 'bg-indigo-50 text-indigo-700' },
          { label: 'To Do',        value: todo,   color: 'bg-purple-50 text-purple-700' },
          { label: 'In Progress',  value: inprog, color: 'bg-amber-50  text-amber-700'  },
          { label: 'Overdue',      value: overdue,color: 'bg-red-50    text-red-700'    },
        ].map((s) => (
          <div key={s.label} className={`${s.color} rounded-xl p-4`}>
            <p className="text-sm font-medium opacity-75">{s.label}</p>
            <p className="text-3xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Tasks by status</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;