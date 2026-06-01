import { useState, useEffect } from 'react';
import { fetchData, createData, updateData, deleteData } from '../utils/api';

export default function CategoryManagement({ token }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📦',
    image: '',
    status: 'active',
  });

  const availableIcons = ['📦', '👕', '🏠', '💄', '⚽', '📚', '🎮', '🍔', '💻', '👟'];

  useEffect(() => {
    loadCategories();
  }, [token]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const result = await fetchData('/api/categories', token);
      setCategories(Array.isArray(result) ? result : result.data || []);
    } catch (err) {
      // Demo data
      setCategories([
        {
          id: 1,
          name: 'Electronics',
          description: 'Electronic devices and gadgets',
          icon: '💻',
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
          status: 'active',
        },
        {
          id: 2,
          name: 'Fashion',
          description: 'Clothing and accessories',
          icon: '👕',
          image: 'https://images.unsplash.com/photo-1595607707860-a139d7a89f5d?w=400&h=400&fit=crop',
          status: 'active',
        },
        {
          id: 3,
          name: 'Home & Garden',
          description: 'Home decor and garden items',
          icon: '🏠',
          image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
          status: 'active',
        },
        {
          id: 4,
          name: 'Beauty',
          description: 'Beauty and personal care products',
          icon: '💄',
          image: 'https://images.unsplash.com/photo-1596462502278-af3c41144e5f?w=400&h=400&fit=crop',
          status: 'active',
        },
        {
          id: 5,
          name: 'Sports',
          description: 'Sports equipment and gear',
          icon: '⚽',
          image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=400&fit=crop',
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
      const newCategory = await createData('/api/categories', formData, token);
      setCategories([...categories, newCategory]);
      resetForm();
    } catch (err) {
      setCategories([...categories, { id: Date.now(), ...formData }]);
      resetForm();
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await updateData('/api/categories', editingId, formData, token);
      setCategories(
        categories.map((c) => (c.id === editingId ? { ...c, ...formData } : c))
      );
      resetForm();
    } catch (err) {
      setCategories(
        categories.map((c) => (c.id === editingId ? { ...c, ...formData } : c))
      );
      resetForm();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await deleteData('/api/categories', id, token);
      setCategories(categories.filter((c) => c.id !== id));
    } catch (err) {
      setCategories(categories.filter((c) => c.id !== id));
    }
  };

  const handleEditClick = (category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description,
      icon: category.icon,
      image: category.image,
      status: category.status,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      icon: '📦',
      image: '',
      status: 'active',
    });
  };

  const filteredCategories = categories.filter((category) => {
    const matchesSearch = category.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || category.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-800 text-white p-8 rounded-lg shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2">🏷️ Category Management</h2>
            <p className="text-emerald-100">
              Total Categories: <strong>{categories.length}</strong> | Active:{' '}
              <strong>{categories.filter((c) => c.status === 'active').length}</strong>
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition shadow-md"
          >
            + Add New Category
          </button>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Categories
            </label>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-800 text-white p-6 flex justify-between items-center">
              <h3 className="text-xl font-semibold">
                {editingId ? '✏️ Edit Category' : '➕ Add New Category'}
              </h3>
              <button
                onClick={resetForm}
                className="text-2xl hover:text-emerald-200 transition"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={editingId ? handleEdit : handleAdd}
              className="p-6 space-y-4"
            >
              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  rows="3"
                  placeholder="Enter category description..."
                />
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Icon
                </label>
                <div className="grid grid-cols-5 gap-2 p-4 bg-gray-50 rounded-lg border border-gray-300">
                  {availableIcons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`text-3xl py-2 rounded-lg transition ${
                        formData.icon === icon
                          ? 'bg-emerald-500 scale-110'
                          : 'bg-white hover:bg-gray-100'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.image && (
                  <div className="mt-2">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="h-32 w-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/128?text=No+Image';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-semibold rounded-lg transition shadow-md"
                >
                  {editingId ? 'Update Category' : 'Create Category'}
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

      {/* Categories Grid */}
      <div>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
            </div>
            <p className="text-gray-500 mt-4">Loading categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-md text-center">
            <p className="text-2xl">🏷️</p>
            <p className="text-gray-500 mt-2">No categories found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden group relative"
              >
                {/* Background Image */}
                <div className="relative h-40 bg-gradient-to-br from-emerald-100 to-teal-100 overflow-hidden">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : null}
                  {/* Large Icon in Background */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-10 text-8xl">
                    {category.icon}
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                        category.status === 'active'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                          : 'bg-gradient-to-r from-red-500 to-red-600'
                      }`}
                    >
                      {category.status === 'active' ? '✓ Active' : '✗ Inactive'}
                    </span>
                  </div>

                  {/* Icon Badge */}
                  <div className="absolute top-3 left-3 text-4xl bg-white rounded-lg p-2 shadow-md">
                    {category.icon}
                  </div>
                </div>

                {/* Category Details */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {category.description || 'No description provided'}
                    </p>
                  </div>

                  {/* Meta Info */}
                  <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
                    <span>ID: {category.id}</span>
                    <span className="flex items-center gap-1">
                      {category.status === 'active' ? '🟢' : '🔴'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleEditClick(category)}
                      className="flex-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
