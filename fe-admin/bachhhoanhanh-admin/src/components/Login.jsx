import { useState, useEffect } from 'react';
import { loginWithPassword } from '../utils/api';
import { testConnection } from '../utils/connection';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const demoAccounts = [
    { username: 'admin', role: 'ADMIN', description: 'System Administrator' },
    { username: 'teststaff', role: 'STAFF', description: 'Staff Member' },
    { username: 'testcustomer', role: 'CUSTOMER', description: 'Customer' },
  ];

  useEffect(() => {
    // Test connection on mount
    checkConnection();
  }, []);

  const checkConnection = async () => {
    const result = await testConnection();
    setConnectionStatus(result);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = await loginWithPassword(username, password);
      localStorage.setItem('auth_token', token);
      onLoginSuccess(token);
    } catch (err) {
      setError(`Login failed: ${err.message || 'Invalid credentials or server error'}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (account) => {
    setUsername(account.username);
    setPassword('123456');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Bạch Hoàn Anh</h1>
        <p className="text-center text-gray-600 mb-8">Admin Portal</p>
        
        {/* Connection Status */}
        {connectionStatus && (
          <div
            className={`mb-4 p-3 rounded text-sm ${
              connectionStatus.success
                ? 'bg-green-100 border border-green-400 text-green-800'
                : 'bg-yellow-100 border border-yellow-400 text-yellow-800'
            }`}
          >
            <div className="font-medium">
              {connectionStatus.success ? '✓ Connected' : '⚠ Connection Issue'}
            </div>
            <div className="text-xs mt-1">{connectionStatus.message}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter username"
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter password"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 space-y-3 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm font-semibold text-blue-900">Quick Login (Demo Accounts):</p>
          <div className="space-y-2">
            {demoAccounts.map((account) => (
              <button
                key={account.username}
                type="button"
                onClick={() => setDemoAccount(account)}
                disabled={loading}
                className="w-full p-2 text-left text-sm bg-white border border-blue-300 rounded hover:bg-blue-100 transition text-gray-700 disabled:opacity-50"
              >
                <div className="font-medium">{account.username}</div>
                <div className="text-xs text-gray-600">{account.role} - {account.description}</div>
              </button>
            ))}
          </div>
          <p className="text-xs text-blue-800 mt-2">All passwords: <strong>123456</strong></p>
        </div>

        {/* Advanced Settings */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs text-gray-600 hover:text-gray-900 font-medium"
          >
            {showAdvanced ? '▼' : '▶'} Advanced Settings
          </button>
          {showAdvanced && (
            <div className="mt-3 p-3 bg-gray-50 rounded text-xs space-y-2 text-gray-700">
              <div>
                <strong>API Base URL:</strong> <code className="bg-white p-1 rounded">http://bachhoanhanh</code>
              </div>
              <div>
                <strong>Status:</strong>{' '}
                {connectionStatus?.success ? (
                  <span className="text-green-600">Connected ✓</span>
                ) : (
                  <span className="text-yellow-600">Not Connected</span>
                )}
              </div>
              <button
                type="button"
                onClick={checkConnection}
                className="mt-2 text-blue-600 hover:text-blue-900 underline"
              >
                Test Connection
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
