import { useState, useEffect } from 'react';
import { fetchData, createData, updateData, deleteData } from '../utils/api';

export default function UserManagement({ token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    phone: '',
    role: 'user',
    status: 'active',
  });

  useEffect(() => {
    loadUsers();
  }, [token]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchData('/api/users', token);
      setUsers(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      // Demo: show mock data on error
      setUsers([
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          username: 'johndoe',
          phone: '+1 (555) 123-4567',
          role: 'admin',
          status: 'active',
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          username: 'janesmith',
          phone: '+1 (555) 234-5678',
          role: 'user',
          status: 'active',
        },
        {
          id: 3,
          name: 'Bob Wilson',
          email: 'bob@example.com',
          username: 'bobwilson',
          phone: '+1 (555) 345-6789',
          role: 'user',
          status: 'inactive',
        },
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
      resetForm();
    } catch (err) {
      setUsers([...users, { id: Date.now(), ...formData }]);
      resetForm();
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await updateData('/api/users', editingId, formData, token);
      setUsers(users.map((u) => (u.id === editingId ? { ...u, ...formData } : u)));
      resetForm();
    } catch (err) {
      setUsers(users.map((u) => (u.id === editingId ? { ...u, ...formData } : u)));
      resetForm();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteData('/api/users', id, token);
      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  const handleEditClick = (user) => {
    setEditingId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      username: user.username || '',
      phone: user.phone || '',
      role: user.role,
      status: user.status,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      email: '',
      username: '',
      phone: '',
      role: 'user',
      status: 'active',
    });
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (userId) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-cyan-500',
    ];
    return colors[userId % colors.length];
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-8 rounded-lg shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2">👥 User Management</h2>
            <p className="text-purple-100">
              Total Users: <strong>{users.length}</strong> | Active:{' '}
              <strong>{users.filter((u) => u.status === 'active').length}</strong> | Admins:{' '}
              <strong>{users.filter((u) => u.role === 'admin').length}</strong>
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition shadow-md"
          >
            + Add New User
          </button>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Users
            </label>
            <input
              type="text"
              placeholder="Search by name, email or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Role
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 flex justify-between items-center">
              <h3 className="text-xl font-semibold">
                {editingId ? '✏️ Edit User' : '➕ Add New User'}
              </h3>
              <button
                onClick={resetForm}
                className="text-2xl hover:text-purple-200 transition"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={editingId ? handleEdit : handleAdd}
              className="p-6 space-y-4"
            >
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  required
                />
              </div>

              {/* Email & Username */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              {/* Role & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-lg transition shadow-md"
                >
                  {editingId ? 'Update User' : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
            </div>
            <p className="text-gray-500 mt-4">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-md text-center">
            <p className="text-2xl">👤</p>
            <p className="text-gray-500 mt-2">No users found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-50 to-purple-100 border-b-2 border-purple-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-900">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-900">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-900">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-900">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-purple-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-purple-50 transition">
                    {/* User Info with Avatar */}
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full ${getAvatarColor(
                            user.id
                          )} flex items-center justify-center text-white font-bold text-sm`}
                        >
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          {user.username && (
                            <p className="text-xs text-gray-500">@{user.username}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>

                    {/* Phone */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.phone || '—'}
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                          user.role === 'admin'
                            ? 'bg-gradient-to-r from-red-500 to-red-600'
                            : 'bg-gradient-to-r from-blue-500 to-blue-600'
                        }`}
                      >
                        {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${
                          user.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.status === 'active' ? '🟢' : '🔴'} {user.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition shadow-sm"
                          title="Edit user"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition shadow-sm"
                          title="Delete user"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
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
