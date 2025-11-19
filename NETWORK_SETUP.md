# Hướng Dẫn Cấu Hình Network API

## 📡 Thay Đổi API URL

Đã thay đổi tất cả các đường dẫn API từ `http://localhost:3001` sang `http://192.168.1.18:3001` để cho phép các thiết bị khác trong cùng mạng LAN truy cập được.

## 📝 Các File Đã Được Cập Nhật

### Frontend Components:

1. ✅ `frontend/app/page.tsx` - Main page API URL
2. ✅ `frontend/components/auth-page.tsx` - Authentication API
3. ✅ `frontend/components/home-page.tsx` - Home page API
4. ✅ `frontend/components/hotel-detail-page.tsx` - Hotel details API
5. ✅ `frontend/components/room-detail-page.tsx` - Room details API
6. ✅ `frontend/components/property-detail-page.tsx` - Property details API
7. ✅ `frontend/components/my-bookings-page.tsx` - Bookings API
8. ✅ `frontend/components/payment-success-page.tsx` - Payment API

### Backend Server:

9. ✅ `frontend/server.js` - JSON Server cấu hình lắng nghe trên `0.0.0.0` để accept connections từ mọi network interface

## 🔧 Cấu Hình JSON Server

File `server.js` đã được cập nhật để lắng nghe trên tất cả network interfaces:

```javascript
server.listen(3001, "0.0.0.0", () => {
  console.log("✅ JSON Server running at http://192.168.1.18:3001");
  console.log("📱 Access from other devices on the network");
});
```

## 🚀 Cách Chạy Ứng Dụng

### 1. Khởi động Backend (JSON Server)

Mở terminal trong thư mục `frontend`:

```powershell
cd frontend
node server.js
```

Hoặc nếu có script trong package.json:

```powershell
npm run server
```

Server sẽ chạy tại: `http://192.168.1.18:3001`

### 2. Khởi động Frontend (Next.js)

Mở terminal khác trong thư mục `frontend`:

```powershell
cd frontend
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3000` (hoặc port khác)

## 📱 Truy Cập Từ Thiết Bị Khác

### Yêu Cầu:

- ✅ Tất cả thiết bị phải kết nối cùng một mạng WiFi/LAN
- ✅ Tường lửa (Windows Firewall) phải cho phép kết nối đến port 3001
- ✅ IP máy chủ phải là `192.168.1.18` (hoặc cập nhật lại nếu IP thay đổi)

### Từ Điện Thoại/Tablet:

1. Kết nối vào cùng WiFi với máy tính chạy server
2. Mở trình duyệt hoặc ứng dụng
3. Truy cập: `http://192.168.1.18:3000` (cho Next.js frontend)
4. API sẽ tự động gọi tới: `http://192.168.1.18:3001`

### Từ Máy Tính Khác:

1. Kết nối cùng mạng LAN
2. Truy cập frontend: `http://192.168.1.18:3000`
3. API backend: `http://192.168.1.18:3001`

## 🔥 Cấu Hình Windows Firewall

Nếu không truy cập được từ thiết bị khác, cần mở port trong Windows Firewall:

### Cách 1: Qua Settings (Khuyến nghị)

1. Mở **Windows Security** → **Firewall & network protection**
2. Click **Advanced settings**
3. Chọn **Inbound Rules** → **New Rule**
4. Chọn **Port** → Next
5. Chọn **TCP** → Nhập port `3001` → Next
6. Chọn **Allow the connection** → Next
7. Đặt tên: "JSON Server - Port 3001" → Finish

### Cách 2: Qua PowerShell (Admin)

```powershell
New-NetFirewallRule -DisplayName "JSON Server Port 3001" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
```

### Kiểm Tra Port Đang Mở:

```powershell
netstat -an | findstr :3001
```

## 🔄 Thay Đổi IP Address

Nếu IP máy bạn khác `192.168.1.18`, cần cập nhật lại:

### 1. Kiểm tra IP hiện tại:

```powershell
ipconfig
```

Tìm dòng **IPv4 Address** trong phần **Wireless LAN adapter** hoặc **Ethernet adapter**

### 2. Cập nhật IP trong code:

Có thể dùng Find & Replace trong VS Code:

- Tìm: `http://192.168.1.18:3001`
- Thay bằng: `http://[IP_MỚI]:3001`

Hoặc tốt hơn, tạo file `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://192.168.1.18:3001
```

Sau đó sử dụng trong code:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.1.18:3001";
```

## 🧪 Test Kết Nối

### Test từ máy chủ:

```powershell
curl http://192.168.1.18:3001/hotels
```

### Test từ thiết bị khác (trình duyệt):

```
http://192.168.1.18:3001/hotels
```

Nếu thấy dữ liệu JSON → Kết nối thành công ✅

## ⚠️ Lưu Ý

1. **IP động**: Nếu router cấp IP động (DHCP), IP có thể thay đổi sau khi khởi động lại. Cần:

   - Đặt IP tĩnh cho máy tính trong router settings
   - Hoặc sử dụng hostname thay vì IP

2. **Production**: Không nên sử dụng cấu hình này cho production. Chỉ dùng trong môi trường phát triển/test.

3. **HTTPS**: API chỉ chạy HTTP (không có SSL). Nếu frontend chạy HTTPS, có thể gặp lỗi mixed content.

4. **CORS**: JSON Server mặc định cho phép CORS, không cần cấu hình thêm.

## 🐛 Troubleshooting

### Không kết nối được từ thiết bị khác:

1. ✅ Kiểm tra cùng mạng WiFi/LAN
2. ✅ Ping thử IP máy chủ:
   ```powershell
   ping 192.168.1.18
   ```
3. ✅ Kiểm tra firewall đã mở port 3001
4. ✅ Kiểm tra server đang chạy:
   ```powershell
   netstat -an | findstr :3001
   ```
5. ✅ Thử truy cập trực tiếp API từ browser thiết bị khác

### API trả về lỗi CORS:

Thêm vào `server.js`:

```javascript
server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
```

## ✅ Hoàn Tất

Giờ đây ứng dụng có thể được truy cập từ bất kỳ thiết bị nào trong cùng mạng LAN!
