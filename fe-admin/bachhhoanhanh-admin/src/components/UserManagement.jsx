import { useState, useEffect } from 'react';
import { fetchData, createData, updateData, deleteData } from '../utils/api';

export default function UserManagement({ token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'user' });

  useEffect(() => {
    loadUsers();
  }, [token]);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      // Replace with your actual endpoint
      const data = await fetchData('/api/users', token);
      setUsers(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      // Demo: show mock data on error
      setUsers([
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const newUser = await createData('/api/users', formData, token);
      setUsers([...users, newUser]);
      setFormData({ name: '', email: '', role: 'user' });
      setShowForm(false);
    } catch (err) {
      // Demo: add locally
      setUsers([...users, { id: Date.now(), ...formData }]);
      setFormData({ name: '', email: '', role: 'user' });
      setShowForm(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await updateData('/api/users', editingId, formData, token);
      setUsers(users.map((u) => (u.id === editingId ? { ...u, ...formData } : u)));
      setEditingId(null);
      setFormData({ name: '', email: '', role: 'user' });
    } catch (err) {
      // Demo: update locally
      setUsers(users.map((u) => (u.id === editingId ? { ...u, ...formData } : u)));
      setEditingId(null);
      setFormData({ name: '', email: '', role: 'user' });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await deleteData('/api/users', id, token);
      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      // Demo: delete locally
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  const handleEdit_Click = (user) => {
    setEditingId(user.id);
    setFormData({ name: user.name, email: user.email, role: user.role });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', email: '', role: 'user' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">User Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
        >
          + Add User
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h3 className="text-lg font-semibold">
            {editingId ? 'Edit User' : 'Add New User'}
          </h3>
          <form onSubmit={editingId ? handleEdit : handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                {editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : users.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No users found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button
                      onClick={() => handleEdit_Click(user)}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
