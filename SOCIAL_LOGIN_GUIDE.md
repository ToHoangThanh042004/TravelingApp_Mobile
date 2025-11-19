# 🔐 Social Login Integration Guide

## Tổng Quan

Đã tích hợp đăng nhập bằng **Google** và **Facebook** vào màn hình đăng nhập của ứng dụng Travel App.

## ✨ Tính Năng Hiện Tại

### Mock Implementation (Development)

- ✅ Nút "Continue with Google" với icon Chrome màu xanh
- ✅ Nút "Continue with Facebook" với icon Facebook màu xanh đậm
- ✅ UI/UX đẹp với divider "Or continue with"
- ✅ Tự động tạo user mới hoặc đăng nhập user cũ
- ✅ Lưu thông tin user vào localStorage
- ✅ Chuyển hướng sau khi đăng nhập thành công

### Cách Hoạt Động (Mock)

1. User click vào nút Google/Facebook
2. System tạo mock user data với:
   - Email unique (dựa trên timestamp)
   - Name mặc định
   - Avatar placeholder
   - Provider (google/facebook)
3. Kiểm tra user đã tồn tại trong database
4. Tạo mới hoặc cập nhật lastLogin
5. Lưu vào localStorage và chuyển đến trang chủ

## 🚀 Tích Hợp OAuth Thực (Production)

### 1. Google OAuth Integration

#### A. Tạo Google Cloud Project

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Enable **Google+ API**
4. Tạo **OAuth 2.0 Client ID**:
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:3000`, `http://192.168.1.18:3000`
   - Authorized redirect URIs: `http://localhost:3000/auth/google/callback`

#### B. Cài Đặt Package

```bash
npm install @react-oauth/google
```

#### C. Cấu Hình Environment Variables

Tạo file `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

#### D. Cập Nhật Code

**`app/layout.tsx`** - Wrap app với GoogleOAuthProvider:

```tsx
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
```

**`components/auth-page.tsx`** - Replace handleGoogleLogin:

```tsx
import { useGoogleLogin } from '@react-oauth/google'

export function AuthPage({ onAuthenticate }: AuthPageProps) {
  // ... existing code ...

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Get user info from Google
        const userInfoResponse = await fetch(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        )
        const googleUser = await userInfoResponse.json()

        // Check if user exists
        const checkUser = await fetch(`${API_URL}/users?email=${googleUser.email}`)
        const users = await checkUser.json()
        let user

        if (users.length === 0) {
          // Create new user
          const newUser = {
            email: googleUser.email,
            name: googleUser.name,
            avatar: googleUser.picture,
            provider: 'google',
            googleId: googleUser.sub,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          }

          const res = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser),
          })
          user = await res.json()
        } else {
          // Update existing user
          user = users[0]
          await fetch(`${API_URL}/users/${user.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lastLogin: new Date().toISOString() }),
          })
        }

        localStorage.setItem('authUser', JSON.stringify(user))
        localStorage.setItem('user', JSON.stringify(user))
        onAuthenticate()
      } catch (error) {
        console.error('Google login error:', error)
        alert('Đăng nhập Google thất bại!')
      }
    },
    onError: () => {
      alert('Đăng nhập Google thất bại!')
    },
  })

  // In JSX, replace the Google button onClick:
  <Button onClick={() => googleLogin()}>
    <Chrome className="w-5 h-5 text-blue-500" />
    <span>Continue with Google</span>
  </Button>
}
```

### 2. Facebook OAuth Integration

#### A. Tạo Facebook App

1. Truy cập [Facebook Developers](https://developers.facebook.com/)
2. Tạo App mới → Consumer
3. Thêm sản phẩm: **Facebook Login**
4. Cấu hình OAuth Redirect URIs:
   - `http://localhost:3000/auth/facebook/callback`
   - `http://192.168.1.18:3000/auth/facebook/callback`
5. Copy **App ID** và **App Secret**

#### B. Cài Đặt Package

```bash
npm install react-facebook-login
```

#### C. Cấu Hình Environment Variables

Thêm vào `.env.local`:

```env
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id_here
```

#### D. Cập Nhật Code

**`components/auth-page.tsx`** - Replace handleFacebookLogin:

```tsx
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";

export function AuthPage({ onAuthenticate }: AuthPageProps) {
  // ... existing code ...

  const handleFacebookResponse = async (response: any) => {
    if (response.accessToken) {
      try {
        const checkUser = await fetch(
          `${API_URL}/users?email=${response.email}`
        );
        const users = await checkUser.json();
        let user;

        if (users.length === 0) {
          const newUser = {
            email: response.email,
            name: response.name,
            avatar: response.picture.data.url,
            provider: "facebook",
            facebookId: response.id,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          };

          const res = await fetch(`${API_URL}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newUser),
          });
          user = await res.json();
        } else {
          user = users[0];
          await fetch(`${API_URL}/users/${user.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lastLogin: new Date().toISOString() }),
          });
        }

        localStorage.setItem("authUser", JSON.stringify(user));
        localStorage.setItem("user", JSON.stringify(user));
        onAuthenticate();
      } catch (error) {
        console.error("Facebook login error:", error);
        alert("Đăng nhập Facebook thất bại!");
      }
    }
  };

  // In JSX, replace the Facebook button:
  <FacebookLogin
    appId={process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!}
    autoLoad={false}
    fields="name,email,picture"
    callback={handleFacebookResponse}
    render={(renderProps: any) => (
      <Button
        variant="outline"
        className="w-full py-3 font-medium flex items-center justify-center gap-2"
        onClick={renderProps.onClick}
      >
        <Facebook className="w-5 h-5 text-blue-600" />
        <span>Continue with Facebook</span>
      </Button>
    )}
  />;
}
```

## 🔒 Security Best Practices

### 1. Environment Variables

- ✅ Không commit `.env.local` lên Git
- ✅ Thêm `.env.local` vào `.gitignore`
- ✅ Sử dụng environment variables khác nhau cho dev/production

### 2. Backend Validation

```typescript
// Verify Google token on backend
const verifyGoogleToken = async (token: string) => {
  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
  );
  const data = await response.json();

  if (data.error) {
    throw new Error("Invalid token");
  }

  return data;
};
```

### 3. HTTPS trong Production

- ✅ Luôn sử dụng HTTPS cho production
- ✅ Update redirect URIs trong Google/Facebook console
- ✅ Secure cookies với `httpOnly` và `secure` flags

## 📱 Mobile App Integration

### Capacitor Native OAuth

Nếu build thành mobile app với Capacitor:

```bash
npm install @capacitor-community/google-auth
npm install @capacitor-community/facebook-login
```

**capacitor.config.ts:**

```typescript
{
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
    FacebookLogin: {
      appId: 'YOUR_FACEBOOK_APP_ID',
      appName: 'Travel App',
      permissions: ['email', 'public_profile'],
    },
  },
}
```

## 🧪 Testing

### Test Mock Login (Current)

1. Click "Continue with Google" → Tạo user mới với email random
2. Click "Continue with Facebook" → Tạo user mới với email random
3. Kiểm tra localStorage có `authUser` và `user`
4. Verify chuyển đến home page

### Test Real OAuth (After Setup)

1. Click "Continue with Google" → Popup Google OAuth
2. Chọn tài khoản → Authorize
3. Callback với user info
4. User được lưu vào database
5. Chuyển đến home page

## 📋 Database Schema Update

Cập nhật `db.json` để hỗ trợ social login:

```json
{
  "users": [
    {
      "id": "1",
      "phoneNumber": "0123456789",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": "https://...",
      "provider": "phone|google|facebook",
      "googleId": "optional_google_id",
      "facebookId": "optional_facebook_id",
      "createdAt": "2025-11-16T...",
      "lastLogin": "2025-11-16T..."
    }
  ]
}
```

## 🎨 UI/UX Features

### Current Implementation

- ✅ Beautiful divider với text "Or continue with"
- ✅ Icon màu sắc chuẩn brand (Google xanh lam, Facebook xanh đậm)
- ✅ Hover effects
- ✅ Responsive design
- ✅ Dark mode support
- ✅ Loading states (có thể thêm)
- ✅ Error handling với alerts

### Suggestions for Enhancement

- 🔄 Thêm loading spinner khi đang xử lý OAuth
- 🔄 Toast notifications thay vì alerts
- 🔄 Animation khi redirect
- 🔄 Remember me checkbox
- 🔄 Terms and conditions checkbox

## 🐛 Troubleshooting

### Issue: OAuth Popup bị chặn

**Solution:** Người dùng phải cho phép popup trong browser settings

### Issue: Redirect URI mismatch

**Solution:** Kiểm tra URI trong Google/Facebook console khớp với app URL

### Issue: CORS errors

**Solution:**

- Thêm domain vào authorized origins
- Sử dụng backend proxy cho OAuth requests

### Issue: Token expired

**Solution:** Implement refresh token logic

## 📚 Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/web)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [@react-oauth/google NPM](https://www.npmjs.com/package/@react-oauth/google)
- [react-facebook-login NPM](https://www.npmjs.com/package/react-facebook-login)

## ✅ Checklist

### Development (Current - Done ✅)

- [x] UI/UX cho social login buttons
- [x] Mock Google login
- [x] Mock Facebook login
- [x] User creation/update logic
- [x] LocalStorage integration
- [x] Theme support (dark/light)

### Production (To-Do 📝)

- [ ] Setup Google Cloud Project
- [ ] Setup Facebook App
- [ ] Install OAuth packages
- [ ] Implement real Google OAuth
- [ ] Implement real Facebook OAuth
- [ ] Backend token verification
- [ ] HTTPS setup
- [ ] Security hardening
- [ ] Error handling improvements
- [ ] Loading states
- [ ] Analytics tracking

## 🎯 Next Steps

1. **Development:**

   - Test current mock implementation
   - Verify user flow end-to-end
   - Check localStorage data

2. **Production Ready:**

   - Follow OAuth setup guides above
   - Replace mock functions with real OAuth
   - Test with real Google/Facebook accounts
   - Deploy with HTTPS

3. **Enhancement:**
   - Add email verification
   - Implement account linking (merge phone + social)
   - Add profile completion flow
   - Social sharing features
