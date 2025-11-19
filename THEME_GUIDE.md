# Hướng Dẫn Chức Năng Theme Sáng/Tối

## Tổng Quan

Ứng dụng Travel App hiện đã được tích hợp đầy đủ chức năng chuyển đổi giữa chế độ sáng (Light Mode) và chế độ tối (Dark Mode) cho toàn bộ hệ thống.

## Các Thay Đổi Đã Thực Hiện

### 1. Component Mới: `ThemeToggle`

- **File**: `frontend/components/theme-toggle.tsx`
- **Chức năng**: Nút toggle cho phép người dùng chuyển đổi giữa theme sáng/tối
- **Icon**: Mặt trời (☀️) cho chế độ tối, Mặt trăng (🌙) cho chế độ sáng
- **Vị trí**: Hiển thị ở góc trên bên phải hoặc trong header của mỗi trang

### 2. Cập Nhật Layout (`frontend/app/layout.tsx`)

- Wrap toàn bộ app với `ThemeProvider` từ `next-themes`
- Cấu hình:
  - `attribute="class"`: Sử dụng class để áp dụng theme
  - `defaultTheme="system"`: Mặc định theo theme hệ thống
  - `enableSystem`: Cho phép tự động theo theme hệ điều hành
  - `disableTransitionOnChange`: Tắt animation khi chuyển theme (tránh nhấp nháy)

### 3. Các Trang Đã Được Tích Hợp Theme Toggle

#### Trang Đăng Nhập (`auth-page.tsx`)

- Nút toggle ở góc trên bên phải

#### Trang Chủ (`home-page.tsx`)

- Nút toggle trong header, bên cạnh search bar

#### Chi Tiết Khách Sạn (`hotel-detail-page.tsx`)

- Nút toggle ở góc trên bên phải (cùng với nút favorite)

#### Chi Tiết Phòng (`room-detail-page.tsx`)

- Nút toggle ở góc trên bên phải (cùng với nút favorite)

#### Chi Tiết Property (`property-detail-page.tsx`)

- Nút toggle ở góc trên bên phải (cùng với nút favorite)

#### Trang Yêu Thích (`favorites-page.tsx`)

- Nút toggle trong header

#### Đơn Đặt Phòng (`my-bookings-page.tsx`)

- Nút toggle trong header
- Đã cập nhật các class để hỗ trợ dark mode (dark:bg-gray-800, dark:text-gray-100, etc.)

#### Xác Nhận Thanh Toán (`booking-confirmation-page.tsx`)

- Nút toggle trong header

#### Thanh Toán Thành Công (`payment-success-page.tsx`)

- Nút toggle ở góc trên bên phải

#### Chat Khách Sạn (`hotel-chat-page.tsx`)

- Nút toggle trong header

## Cách Sử Dụng

### Đối với Người Dùng

1. Tìm icon mặt trời/mặt trăng ở góc màn hình hoặc trong header
2. Click vào để chuyển đổi theme
3. Theme sẽ được lưu và tự động áp dụng lại khi quay lại ứng dụng

### Đối với Developer

Nếu cần thêm theme toggle vào trang mới:

```tsx
import { ThemeToggle } from "@/components/theme-toggle";

// Trong component JSX:
<ThemeToggle />;
```

### Sử Dụng Theme trong Component

```tsx
import { useTheme } from "next-themes";

export function MyComponent() {
  const { theme, setTheme } = useTheme();

  // Lấy theme hiện tại
  console.log(theme); // "light" hoặc "dark"

  // Đổi theme
  setTheme("dark"); // hoặc "light" hoặc "system"
}
```

## CSS Variables Đã Có Sẵn

File `frontend/app/globals.css` đã định nghĩa đầy đủ CSS variables cho cả light và dark mode:

### Light Mode (`:root`)

- Background, foreground, card, muted, accent, etc.

### Dark Mode (`.dark`)

- Tự động áp dụng khi có class `dark` trên thẻ `<html>`

## Tailwind Dark Mode Classes

Tailwind CSS hỗ trợ prefix `dark:` cho dark mode:

```tsx
<div className="bg-white dark:bg-gray-800 text-black dark:text-white">
  Nội dung
</div>
```

## Các Package Đã Sử Dụng

- **next-themes** (v0.4.6): Quản lý theme với Next.js
- **lucide-react**: Icons (Sun, Moon)

## Lưu Ý Kỹ Thuật

1. **Hydration Warning**: Đã thêm `suppressHydrationWarning` vào thẻ `<html>` để tránh warning khi SSR
2. **Mounted State**: ThemeToggle sử dụng `mounted` state để tránh mismatch giữa server và client
3. **LocalStorage**: Theme được lưu tự động vào localStorage bởi `next-themes`
4. **System Theme**: Tự động detect theme của hệ điều hành khi chọn "system"

## Testing

### Kiểm Tra Chức Năng

1. Mở ứng dụng
2. Click vào nút theme toggle
3. Kiểm tra tất cả trang đã chuyển theme đúng
4. Refresh trang - theme nên được giữ nguyên
5. Thử thay đổi theme hệ thống - nếu chọn "system", app nên theo

### Kiểm Tra Responsive

- Theme toggle hoạt động tốt trên mọi kích thước màn hình
- Icon hiển thị rõ ràng
- Không bị che bởi các element khác

## Kết Luận

Chức năng theme đã được tích hợp hoàn chỉnh vào toàn bộ ứng dụng, cung cấp trải nghiệm người dùng tốt hơn với khả năng tùy chỉnh giao diện theo sở thích cá nhân hoặc điều kiện ánh sáng.
