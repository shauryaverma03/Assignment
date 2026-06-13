import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Users, Home } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
      <Link to="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
        <span>💸</span> SplitWise
      </Link>
      {user && (
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 text-sm">
            <Home size={16} /> Home
          </Link>
          <span className="text-slate-400 text-sm">|</span>
          <span className="text-slate-600 text-sm font-medium">{user.username}</span>
          <button onClick={handleLogout} className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm">
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </nav>
  );
}
