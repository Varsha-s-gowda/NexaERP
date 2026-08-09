import { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import Navbar from '../components/dashboard/Navbar';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Account modal
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Application settings state
  type AppSettings = {
    companyName: string;
    currency: string;
    dateFormat: string;
    theme: string;
  };

  const defaultApp: AppSettings = {
    companyName: 'NexaERP',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    theme: 'Light',
  };

  const [appSettings, setAppSettings] = useState<AppSettings>({ ...defaultApp });

  // Notifications
  const defaultNotifications = {
    emailNotifications: true,
    lowStockAlerts: true,
    salesNotifications: true,
  };

  const [notifications, setNotifications] = useState(defaultNotifications);

  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }

    // Simulate success
    setShowChangePassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    toast.success('Password updated successfully');
  };

  const handleReset = () => {
    setAppSettings({ ...defaultApp });
    setNotifications({ ...defaultNotifications });
    toast.success('Settings reset to defaults');
  };

  const handleSave = () => {
    // For now, only show toast
    toast.success('Settings saved successfully');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-600">Manage your account and application preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Account card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#16213e] flex items-center justify-center text-white text-lg font-medium">S</div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">System Administrator</p>
                    <p className="text-sm text-gray-500">Role: ADMIN</p>
                    <p className="text-sm text-gray-500">admin@nexaerp.com</p>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => setShowChangePassword(true)}
                    className="bg-[#1a1a2e] text-white px-4 py-2 rounded-lg hover:bg-[#16213e] transition-colors"
                  >
                    Change Password
                  </button>
                </div>
              </div>

              {/* Application card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 lg:col-span-2">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Application</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Company Name</label>
                    <input
                      className="w-full border border-gray-200 rounded px-3 py-2 bg-white"
                      value={appSettings.companyName}
                      onChange={(e) => setAppSettings({ ...appSettings, companyName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Currency</label>
                    <select
                      value={appSettings.currency}
                      onChange={(e) => setAppSettings({ ...appSettings, currency: e.target.value })}
                      className="w-full border border-gray-200 rounded px-3 py-2 bg-white"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Date Format</label>
                    <select
                      value={appSettings.dateFormat}
                      onChange={(e) => setAppSettings({ ...appSettings, dateFormat: e.target.value })}
                      className="w-full border border-gray-200 rounded px-3 py-2 bg-white"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Theme</label>
                    <select
                      value={appSettings.theme}
                      onChange={(e) => setAppSettings({ ...appSettings, theme: e.target.value })}
                      className="w-full border border-gray-200 rounded px-3 py-2 bg-white"
                    >
                      <option>Light</option>
                      <option>Dark</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications card */}
            <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>

              <div className="grid grid-cols-1 gap-4">
                {[
                  {
                    key: 'emailNotifications',
                    title: 'Email Notifications',
                    desc: 'Receive important account and system notifications.',
                  },
                  {
                    key: 'lowStockAlerts',
                    title: 'Low Stock Alerts',
                    desc: 'Receive alerts when products reach their minimum stock level.',
                  },
                  {
                    key: 'salesNotifications',
                    title: 'Sales Notifications',
                    desc: 'Receive notifications about sales challans and sales activity.',
                  },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={(notifications as any)[item.key]}
                        onChange={() =>
                          setNotifications({ ...notifications, [item.key]: !(notifications as any)[item.key] })
                        }
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-[#1a1a2e] peer-focus:ring-2 peer-focus:ring-[#1a1a2e] transition-colors" />
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transform peer-checked:translate-x-5 transition-transform" />
                    </label>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700"
                >
                  Reset
                </button>

                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-lg bg-[#1a1a2e] text-white hover:bg-[#16213e] transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
              <button
                onClick={() => setShowChangePassword(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full border border-gray-200 rounded px-3 py-2 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-gray-200 rounded px-3 py-2 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border border-gray-200 rounded px-3 py-2 bg-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 mt-2">
                  <button
                    onClick={() => setShowChangePassword(false)}
                    className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleUpdatePassword}
                    className="px-4 py-2 rounded-lg bg-[#1a1a2e] text-white hover:bg-[#16213e] transition-colors"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
