import { useState, useEffect } from 'react';
import { fetchData, createData, updateData, deleteData } from '../utils/api';

export default function BrandManagement({ token }) {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    logo: '',
    country: '',
    foundedYear: '',
    status: 'active',
  });

  useEffect(() => {
    loadBrands();
  }, [token]);

  const loadBrands = async () => {
    setLoading(true);
    try {
      const result = await fetchData('/api/brands', token);
      setBrands(Array.isArray(result) ? result : result.data || []);
    } catch (err) {
      // Demo data
      setBrands([
        {
          id: 1,
          name: 'Apple',
          description: 'Premium technology products and services',
          website: 'www.apple.com',
          logo: 'https://images.unsplash.com/photo-1505228395891-9a51e7e86e81?w=400&h=400&fit=crop',
          country: 'USA',
          foundedYear: 1976,
          status: 'active',
        },
        {
          id: 2,
          name: 'Nike',
          description: 'Sports equipment and athletic apparel',
          website: 'www.nike.com',
          logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
          country: 'USA',
          foundedYear: 1964,
          status: 'active',
        },
        {
          id: 3,
          name: 'Samsung',
          description: 'Electronics and consumer appliances',
          website: 'www.samsung.com',
          logo: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
          country: 'South Korea',
          foundedYear: 1938,
          status: 'active',
        },
        {
          id: 4,
          name: 'Adidas',
          description: 'Sportswear and athletic footwear',
          website: 'www.adidas.com',
          logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
          country: 'Germany',
          foundedYear: 1949,
          status: 'active',
        },
        {
          id: 5,
          name: 'Sony',
          description: 'Electronics and entertainment',
          website: 'www.sony.com',
          logo: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
          country: 'Japan',
          foundedYear: 1946,
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
      const newBrand = await createData('/api/brands', formData, token);
      setBrands([...brands, newBrand]);
      resetForm();
    } catch (err) {
      setBrands([...brands, { id: Date.now(), ...formData }]);
      resetForm();
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await updateData('/api/brands', editingId, formData, token);
      setBrands(
        brands.map((b) => (b.id === editingId ? { ...b, ...formData } : b))
      );
      resetForm();
    } catch (err) {
      setBrands(
        brands.map((b) => (b.id === editingId ? { ...b, ...formData } : b))
      );
      resetForm();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;
    try {
      await deleteData('/api/brands', id, token);
      setBrands(brands.filter((b) => b.id !== id));
    } catch (err) {
      setBrands(brands.filter((b) => b.id !== id));
    }
  };

  const handleEditClick = (brand) => {
    setEditingId(brand.id);
    setFormData({
      name: brand.name,
      description: brand.description,
      website: brand.website,
      logo: brand.logo,
      country: brand.country,
      foundedYear: brand.foundedYear,
      status: brand.status,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      website: '',
      logo: '',
      country: '',
      foundedYear: '',
      status: 'active',
    });
  };

  const filteredBrands = brands.filter((brand) => {
    const matchesSearch = brand.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || brand.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getCountryFlag = (country) => {
    const flags = {
      USA: '🇺🇸',
      'South Korea': '🇰🇷',
      Germany: '🇩🇪',
      Japan: '🇯🇵',
      China: '🇨🇳',
      UK: '🇬🇧',
      France: '🇫🇷',
      India: '🇮🇳',
      Vietnam: '🇻🇳',
      Thailand: '🇹🇭',
    };
    return flags[country] || '🌍';
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-pink-600 text-white p-8 rounded-lg shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2">🏢 Brand Management</h2>
            <p className="text-indigo-100">
              Total Brands: <strong>{brands.length}</strong> | Active:{' '}
              <strong>{brands.filter((b) => b.status === 'active').length}</strong>
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition shadow-md"
          >
            + Add New Brand
          </button>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Brands
            </label>
            <input
              type="text"
              placeholder="Search by brand name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
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
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-pink-600 text-white p-6 flex justify-between items-center">
              <h3 className="text-xl font-semibold">
                {editingId ? '✏️ Edit Brand' : '➕ Add New Brand'}
              </h3>
              <button
                onClick={resetForm}
                className="text-2xl hover:text-pink-200 transition"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={editingId ? handleEdit : handleAdd}
              className="p-6 space-y-4"
            >
              {/* Brand Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  rows="3"
                  placeholder="Enter brand description..."
                />
              </div>

              {/* Website & Founded Year */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="www.example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Founded Year
                  </label>
                  <input
                    type="number"
                    value={formData.foundedYear}
                    onChange={(e) =>
                      setFormData({ ...formData, foundedYear: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="1976"
                  />
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="USA"
                />
              </div>

              {/* Logo URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo URL
                </label>
                <input
                  type="url"
                  value={formData.logo}
                  onChange={(e) =>
                    setFormData({ ...formData, logo: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="https://example.com/logo.jpg"
                />
                {formData.logo && (
                  <div className="mt-2">
                    <img
                      src={formData.logo}
                      alt="Logo Preview"
                      className="h-24 w-24 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/96?text=No+Logo';
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-semibold rounded-lg transition shadow-md"
                >
                  {editingId ? 'Update Brand' : 'Create Brand'}
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

      {/* Brands Grid */}
      <div>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
            </div>
            <p className="text-gray-500 mt-4">Loading brands...</p>
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-md text-center">
            <p className="text-2xl">🏢</p>
            <p className="text-gray-500 mt-2">No brands found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBrands.map((brand) => (
              <div
                key={brand.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden group"
              >
                {/* Logo Section */}
                <div className="relative h-40 bg-gradient-to-br from-indigo-50 to-pink-50 flex items-center justify-center overflow-hidden">
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : null}

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                        brand.status === 'active'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                          : 'bg-gradient-to-r from-red-500 to-red-600'
                      }`}
                    >
                      {brand.status === 'active' ? '✓ Active' : '✗ Inactive'}
                    </span>
                  </div>

                  {/* Default Logo Placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-10 pointer-events-none">
                    🏢
                  </div>
                </div>

                {/* Brand Details */}
                <div className="p-4 space-y-3">
                  {/* Brand Name */}
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      {brand.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {brand.description || 'No description provided'}
                    </p>
                  </div>

                  {/* Meta Info */}
                  <div className="pt-2 border-t border-gray-200 space-y-1">
                    {brand.country && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{getCountryFlag(brand.country)}</span>
                        <span>{brand.country}</span>
                      </div>
                    )}
                    {brand.foundedYear && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>📅</span>
                        <span>Founded {brand.foundedYear}</span>
                      </div>
                    )}
                    {brand.website && (
                      <div className="flex items-center gap-2 text-sm text-indigo-600 truncate">
                        <span>🌐</span>
                        <a
                          href={`https://${brand.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate hover:underline"
                        >
                          {brand.website}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleEditClick(brand)}
                      className="flex-1 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg transition"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(brand.id)}
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
