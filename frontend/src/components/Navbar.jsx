import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-indigo-700 text-white px-6 py-3 flex items-center justify-between shadow-md">
      <Link to="/dashboard" className="text-xl font-bold tracking-tight">
        TaskFlow
      </Link>
      {user && (
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="hover:text-indigo-200 transition">Dashboard</Link>
          <Link to="/projects"  className="hover:text-indigo-200 transition">Projects</Link>
          <span className="text-indigo-300 text-sm">Hi, {user.name}</span>
          <button
            onClick={handleLogout}
            className="bg-white text-indigo-700 px-3 py-1 rounded-lg text-sm font-medium hover:bg-indigo-100 transition"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;