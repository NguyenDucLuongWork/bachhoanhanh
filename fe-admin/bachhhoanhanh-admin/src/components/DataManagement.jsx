import { useState, useEffect } from 'react';
import { fetchData, createData, updateData, deleteData } from '../utils/api';

export default function DataManagement({ token }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', status: 'active' });

  useEffect(() => {
    loadData();
  }, [token]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await fetchData('/api/data', token);
      setData(Array.isArray(result) ? result : result.data || []);
    } catch (err) {
      // Demo data
      setData([
        { id: 1, title: 'Project A', description: 'First project', status: 'active' },
        { id: 2, title: 'Project B', description: 'Second project', status: 'inactive' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const newItem = await createData('/api/data', formData, token);
      setData([...data, newItem]);
      resetForm();
    } catch (err) {
      // Demo: add locally
      setData([...data, { id: Date.now(), ...formData }]);
      resetForm();
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await updateData('/api/data', editingId, formData, token);
      setData(data.map((d) => (d.id === editingId ? { ...d, ...formData } : d)));
      resetForm();
    } catch (err) {
      // Demo: update locally
      setData(data.map((d) => (d.id === editingId ? { ...d, ...formData } : d)));
      resetForm();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await deleteData('/api/data', id, token);
      setData(data.filter((d) => d.id !== id));
    } catch (err) {
      // Demo: delete locally
      setData(data.filter((d) => d.id !== id));
    }
  };

  const handleEdit_Click = (item) => {
    setEditingId(item.id);
    setFormData({ title: item.title, description: item.description, status: item.status });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ title: '', description: '', status: 'active' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Data Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
        >
          + Add Data
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h3 className="text-lg font-semibold">
            {editingId ? 'Edit Data' : 'Add New Data'}
          </h3>
          <form onSubmit={editingId ? handleEdit : handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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
                onClick={resetForm}
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : data.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No data found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {item.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {item.description}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button
                      onClick={() => handleEdit_Click(item)}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
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
