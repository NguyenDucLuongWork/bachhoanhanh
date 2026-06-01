import { useState, useEffect } from 'react';
import { fetchData, createData, updateData, deleteData } from '../utils/api';

export default function ProductManagement({ token }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCatalog, setFilterCatalog] = useState('all');
  const [error, setError] = useState(null);

  // --- DỮ LIỆU ĐỘNG TỪ DATABASE ---
  const [dbPrototypes, setDbPrototypes] = useState([]); // Lấy từ GET /prototypes
  const [dbCatalogs, setDbCatalogs] = useState([]);     // Tự động gom nhóm từ dữ liệu prototypes thực tế

  // Form State map chính xác 100% với cấu trúc class ProductRequest.java của Backend
  const [formData, setFormData] = useState({
    barcode: '',
    name: '',
    image: '',
    description: '',
    catalogId: '',   // Sẽ tự động lấy id đầu tiên sau khi fetch dữ liệu thật
    originalPrice: 0,
    prototypeId: '', // Sẽ tự động lấy id đầu tiên sau khi fetch dữ liệu thật
    attributes: {}   // Khởi tạo dynamic attributes nếu cần mở rộng
  });

  // Chạy duy nhất một lần khi component được nạp để lấy toàn bộ dữ liệu cấu hình từ DB
  useEffect(() => {
    if (token) {
      loadInitialMetadata();
      loadProducts();
    }
  }, [token]);

  // Hàm gọi API lấy danh sách cấu hình (Meta-data) thực tế từ database
  const loadInitialMetadata = async () => {
    try {
      // Gọi API thật đến PrototypeController.java
      const prototypesData = await fetchData('/prototypes', token);
      const prototypeList = Array.isArray(prototypesData) ? prototypesData : prototypesData.data || [];
      setDbPrototypes(prototypeList);

      // Tự động trích xuất danh sách Catalog duy nhất (Unique) từ dữ liệu Prototype thực tế của database
      const uniqueCatalogIds = [...new Set(prototypeList.map(p => p.catalogId))].filter(Boolean);
      
      // Định dạng lại danh sách catalog để hiển thị lên dropdown chọn lựa
      const formattedCatalogs = uniqueCatalogIds.map(id => ({
        id: id,
        name: id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) // Đổi dạng 'fresh-food' thành 'Fresh Food' cho đẹp
      }));
      setDbCatalogs(formattedCatalogs);

      // Cập nhật giá trị mặc định cho form dựa trên bản ghi đầu tiên trong Database
      if (prototypeList.length > 0) {
        setFormData(prev => ({
          ...prev,
          prototypeId: prototypeList[0].productId || prototypeList[0].id,
          catalogId: prototypeList[0].catalogId
        }));
      }
    } catch (err) {
      console.error('Không thể tải metadata từ database:', err);
    }
  };

  // Hàm gọi API lấy danh sách sản phẩm thật từ Database
  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchData('/products', token);
      setProducts(Array.isArray(result) ? result : result.data || []);
    } catch (err) {
      console.error('Database connection error:', err);
      setError('Không thể kết nối đến cơ sở dữ liệu hệ thống. Vui lòng kiểm tra lại Backend Service.');
      setProducts([]); 
    } finally {
      setLoading(false);
    }
  };

  // Đồng bộ catalogId tự động khi người dùng thay đổi Prototype trong form chọn
  const handlePrototypeChange = (selectedProtoId) => {
    const selectedProto = dbPrototypes.find(p => (p.productId || p.id) === selectedProtoId);
    setFormData(prev => ({
      ...prev,
      prototypeId: selectedProtoId,
      catalogId: selectedProto ? selectedProto.catalogId : prev.catalogId
    }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const submitData = {
        ...formData,
        originalPrice: parseFloat(formData.originalPrice || 0)
      };

      const newProduct = await createData('/products', submitData, token);
      
      if (newProduct && (newProduct.productId || newProduct.id)) {
        setProducts([...products, newProduct]);
      } else {
        await loadProducts();
      }
      resetForm();
    } catch (err) {
      console.error('Error post data to DB:', err);
      alert('Thêm sản phẩm thất bại. Hãy kiểm tra định dạng dữ liệu.');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const submitData = {
        ...formData,
        originalPrice: parseFloat(formData.originalPrice || 0)
      };

      await updateData('/products', editingId, submitData, token);
      
      setProducts(
        products.map((p) => (p.productId === editingId ? { ...p, ...submitData } : p))
      );
      resetForm();
    } catch (err) {
      console.error('Error update data to DB:', err);
      alert('Cập nhật thông tin sản phẩm thất bại.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn XÓA sản phẩm này ra khỏi Hệ thống Cơ sở dữ liệu?')) return;
    setError(null);
    try {
      await deleteData('/products', id, token);
      setProducts(products.filter((p) => p.productId !== id));
    } catch (err) {
      console.error('Error delete data from DB:', err);
      alert('Không thể xóa sản phẩm. Có thể sản phẩm đang dính ràng buộc dữ liệu.');
    }
  };

  const handleEditClick = (product) => {
    setEditingId(product.productId);
    setFormData({
      barcode: product.barcode || '',
      name: product.name || '',
      image: product.image || '',
      description: product.description || '',
      catalogId: product.catalogId || (dbCatalogs[0]?.id || ''),
      originalPrice: product.originalPrice || 0,
      prototypeId: product.prototypeId || (dbPrototypes[0]?.productId || dbPrototypes[0]?.id || ''),
      attributes: product.attributes || {}
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      barcode: '',
      name: '',
      image: '',
      description: '',
      catalogId: dbCatalogs[0]?.id || '',
      originalPrice: 0,
      prototypeId: dbPrototypes[0]?.productId || dbPrototypes[0]?.id || '',
      attributes: {}
    });
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = 
      (product.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (product.barcode?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesCatalog = filterCatalog === 'all' || product.catalogId === filterCatalog;
    
    return matchesSearch && matchesCatalog;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-wide">📦 Hệ thống Quản lý Sản phẩm</h2>
            <p className="text-emerald-100 text-sm mt-1">
              Kết nối trực tiếp: <span className="underline font-mono">ProductService (MariaDB)</span>. Đang hiển thị: <strong>{filteredProducts.length}</strong> sản phẩm.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-5 py-2.5 bg-white text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 transition shadow duration-200 text-sm"
          >
            + Thêm Sản Phẩm Mới
          </button>
        </div>
      </div>

      {/* Hiển thị Error Banner nếu kết nối API sập */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg text-red-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold">⚠️ Mất kết nối API Database:</p>
              <p className="text-xs mt-0.5">{error}</p>
            </div>
            <button onClick={loadProducts} className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 transition">
              Thử kết nối lại
            </button>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Tìm kiếm thông minh
            </label>
            <input
              type="text"
              placeholder="Nhập tên sản phẩm hoặc mã vạch Barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Lọc theo Danh mục thật từ DB
            </label>
            <select
              value={filterCatalog}
              onChange={(e) => setFilterCatalog(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition bg-white"
            >
              <option value="all">Tất cả danh mục sản phẩm</option>
              {dbCatalogs.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid Render Products */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-100 border-t-emerald-600 mb-3"></div>
          <p className="text-sm text-gray-400 font-medium">Đang truy vấn dữ liệu từ Realtime Database...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white p-16 rounded-xl text-center border border-dashed border-gray-200">
          <span className="text-4xl block mb-2">📥</span>
          <p className="text-gray-500 font-medium">Kho dữ liệu trống hoặc không tìm thấy sản phẩm trùng khớp.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.productId}
              className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 overflow-hidden transition flex flex-col justify-between"
            >
              {/* Ảnh sản phẩm */}
              <div className="relative h-44 bg-gray-50">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=Bach+Hoa+Nhanh';
                  }}
                />
                <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide text-white bg-emerald-600 uppercase shadow-sm">
                    {product.catalogId}
                  </span>
                  {product.barcode && (
                    <span className="px-2 py-0.5 rounded bg-gray-900 bg-opacity-75 font-mono text-[9px] text-white">
                      {product.barcode}
                    </span>
                  )}
                </div>
              </div>

              {/* Thông tin sản phẩm */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-gray-800 text-base line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                    {product.description || 'Không có mô tả chi tiết cho sản phẩm này.'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-2 font-mono">Prototype: {product.prototypeId}</p>
                </div>

                {/* Giá tiền */}
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-medium">GIÁ BÁN GỐC</span>
                    <span className="text-lg font-black text-emerald-600">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.originalPrice || 0)}
                    </span>
                  </div>
                </div>

                {/* Chức năng */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleEditClick(product)}
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition text-xs shadow-sm"
                  >
                    ✏️ Sửa sản phẩm
                  </button>
                  <button
                    onClick={() => handleDelete(product.productId)}
                    className="px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-lg transition text-xs shadow-sm"
                  >
                    🗑️ Xóa khỏi DB
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Dialog Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto transform transition-all">
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-base">
                {editingId ? `✏️ Cập nhật Sản phẩm (ID: ${editingId})` : '➕ Tạo Sản phẩm mới vào Database'}
              </h3>
              <button onClick={resetForm} className="text-lg font-bold hover:text-gray-200 transition">✕</button>
            </div>

            <form onSubmit={editingId ? handleEdit : handleAdd} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Mã vạch Barcode *</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    placeholder="Ví dụ: 89345631231"
                    required
                    disabled={editingId !== null}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tên sản phẩm *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    placeholder="Nhập tên hiển thị..."
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Mô tả ngắn</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  rows="2"
                  placeholder="Thông tin chi tiết về sản phẩm..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Giá bán gốc (VND) *</label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nhóm thuộc tính (Prototype từ DB) *</label>
                  <select
                    value={formData.prototypeId}
                    onChange={(e) => handlePrototypeChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                    required
                  >
                    {dbPrototypes.map((proto) => {
                      const protoId = proto.productId || proto.id;
                      return (
                        <option key={protoId} value={protoId}>
                          {proto.name} ({protoId})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Danh mục hệ thống (Tự động theo Prototype)</label>
                <input
                  type="text"
                  value={formData.catalogId}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm outline-none cursor-not-allowed"
                  disabled
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Đường dẫn hình ảnh (URL)</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm shadow transition"
                >
                  {editingId ? 'Xác nhận Cập nhật DB' : 'Lưu dữ liệu vào Database'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-sm transition"
                >
                  Hủy bỏ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}