import { useNavigate } from 'react-router-dom';
import { ArrowRightLeft, FileText } from 'lucide-react';

export default function QuickActions() {
  const navigate = useNavigate();

  const Users = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );

  const Package = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );

  const actions = [
    {
      icon: Users,
      label: 'Add Customer',
      path: '/customers/new',
      color: 'bg-blue-500',
    },
    {
      icon: Package,
      label: 'Add Product',
      path: '/products/new',
      color: 'bg-green-500',
    },
    {
      icon: ArrowRightLeft,
      label: 'Stock Movement',
      path: '/stock-movements/new',
      color: 'bg-purple-500',
    },
    {
      icon: FileText,
      label: 'Create Sales Challan',
      path: '/sales-challans/new',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => navigate(action.path)}
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <div className={`p-3 ${action.color} rounded-lg`}>
              <action.icon className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
