import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Package,
  Warehouse,
  ArrowRightLeft,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  X,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const allItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Customers', path: '/customers' },
    { icon: Package, label: 'Products', path: '/products' },
    { icon: Warehouse, label: 'Warehouses', path: '/warehouses' },
    { icon: ArrowRightLeft, label: 'Stock Movements', path: '/stock-movements' },
    { icon: FileText, label: 'Sales Challans', path: '/sales-challans' },
    { icon: BarChart3, label: 'Reports', path: '/reports' },
  ];

  const role = user?.role;

  
  const visibleItems = allItems.filter((item) => {
    if (role === 'ADMIN') return true;
    if (role === 'SALES') {
      return ['Dashboard', 'Customers', 'Sales Challans', 'Reports'].includes(item.label);
    }
    if (role === 'ACCOUNTS') {
      return ['Dashboard', 'Customers', 'Sales Challans', 'Reports'].includes(item.label);
    }
    if (role === 'WAREHOUSE') {
      return ['Dashboard', 'Products', 'Warehouses', 'Stock Movements', 'Reports'].includes(item.label);
    }
    return false;
  });

  const bottomItems = role === 'ADMIN' ? [{ icon: Settings, label: 'Settings', path: '/settings' }] : [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-[#1a1a2e] text-white
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex flex-col items-center p-6 border-b border-gray-700 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden absolute top-4 right-4 p-1 hover:bg-gray-700 rounded"
            >
              <X className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold">NexaERP</h1>
            <p className="text-sm text-gray-400 mt-1">Enterprise Management</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {visibleItems.map((item) => (
                <li key={item.path}>
                  <button
                    onClick={() => {
                      navigate(item.path);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${isActive(item.path)
                        ? 'bg-[#16213e] text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }
                    `}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                    {isActive(item.path) && <ChevronRight className="h-4 w-4 ml-auto" />}
                  </button>
                </li>
              ))}
            </ul>

            <ul className="space-y-1 mt-6 pt-6 border-t border-gray-700">
              {bottomItems.map((item) => (
                <li key={item.path}>
                  <button
                    onClick={() => {
                      navigate(item.path);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#16213e] flex items-center justify-center">
                <span className="text-sm font-medium">
                  {user?.fullName?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.fullName}</p>
                <p className="text-xs text-gray-400">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
