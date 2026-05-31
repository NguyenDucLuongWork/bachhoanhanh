import { useState, useEffect } from 'react';
import UserManagement from './UserManagement';
import DataManagement from './DataManagement';
import SortManagement from './SortManagement';
import { isAdmin, getUserInfo } from '../utils/auth';

export default function AdminDashboard({ token, onLogout }) {
  const [activeTab, setActiveTab] = useState('users');
  const [userInfo, setUserInfo] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check if user is admin
    const info = getUserInfo(token);
    setUserInfo(info);
    
    if (!isAdmin(token)) {
      setIsAuthorized(false);
    } else {
      setIsAuthorized(true);
    }
  }, [token]);

  const tabs = [
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'data', label: 'Data', icon: '📊' },
    { id: 'sort', label: 'Sort Script', icon: '🔀' },
  ];

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow max-w-md w-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-700 mb-6">
              You do not have the required <strong>ADMIN</strong> role to access this dashboard.
            </p>
            {userInfo && (
              <div className="text-left bg-gray-50 p-4 rounded mb-6">
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Username:</strong> {userInfo.username}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Roles:</strong> {userInfo.roles.length > 0 ? userInfo.roles.join(', ') : 'None'}
                </p>
              </div>
            )}
            <button
              onClick={onLogout}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Logout & Try Another Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            {userInfo && (
              <p className="text-sm text-gray-600 mt-1">
                Welcome, <strong>{userInfo.name || userInfo.username}</strong> 
                <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                  ADMIN
                </span>
              </p>
            )}
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'users' && <UserManagement token={token} />}
        {activeTab === 'data' && <DataManagement token={token} />}
        {activeTab === 'sort' && <SortManagement token={token} />}
      </main>
    </div>
  );
}
