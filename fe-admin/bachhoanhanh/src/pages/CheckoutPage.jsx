import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { order } = location.state || {}; // Nhận dữ liệu đơn hàng vừa tạo từ ProductsPage chuyển sang
  const [method, setMethod] = useState('MOMO');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const GATEWAY_URL = 'http://localhost:9000';

  if (!order) {
    return <div className="section"><h3>Không tìm thấy thông tin đơn hàng để thanh toán!</h3></div>;
  }

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${GATEWAY_URL}/payments/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, paymentMethod: method })
      });

      const data = await res.json();
      if (res.ok && data.status === 'SUCCESS') {
        alert("Thanh toán thành công!");
        navigate('/orders'); // Di chuyển sang trang lịch sử đơn hàng sau khi thanh toán thành công
      } else {
        setMsg(`Thanh toán thất bại: ${data.message || data}`);
      }
    } catch (err) {
      setMsg("Không thể kết nối đến hệ thống thanh toán!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section" style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h2>Trang Thanh Toán (Checkout)</h2>
      <div className="card" style={{ padding: '20px', lineHeight: '1.8' }}>
        <p><strong>Mã Đơn Hàng:</strong> {order.id}</p>
        <p><strong>Sản Phẩm:</strong> {order.productName}</p>
        <p><strong>Số Lượng:</strong> {order.quantity}</p>
        <p><strong>Tổng Tiền:</strong> <span style={{ color: 'red', fontWeight: 'bold' }}>{order.totalPrice.toLocaleString()} VND</span></p>
        
        <label style={{ display: 'block', marginTop: '15px', fontWeight: 'bold' }}>Chọn phương thức thanh toán:</label>
        <select value={method} onChange={(e) => setMethod(e.target.value)} style={{ width: '100%', padding: '8px', margin: '10px 0' }}>
          <option value="MOMO">Ví Điện Tử MoMo</option>
          <option value="VNPAY">Cổng Thanh Toán VNPAY</option>
          <option value="CASH">Thanh toán khi nhận hàng (COD)</option>
        </select>

        {msg && <p style={{ color: 'red' }}>{msg}</p>}

        <button 
          onClick={handlePayment} 
          disabled={loading}
          style={{ width: '100%', background: '#007bff', color: 'white', border: 'none', padding: '12px', cursor: 'pointer', borderRadius: '4px', fontSize: '1rem' }}
        >
          {loading ? "Đang xử lý..." : "Xác Nhận Thanh Toán"}
        </button>
      </div>
    </div>
  );
}

export default CheckoutPage;