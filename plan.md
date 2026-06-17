# Kế hoạch triển khai Module Auth (Có tối ưu hóa Enterprise)

Để xây dựng một module Authentication hoàn chỉnh, bảo mật và hiệu năng cao, chúng ta sẽ áp dụng các kỹ thuật Advanced (Redis, Queue) cho luồng đăng ký. Dưới đây là lộ trình chi tiết:

## 1. Local Authentication (Đăng ký OTP tối ưu với Redis)

Thay vì lưu user nháp (isActive = false) vào Database, chúng ta sẽ lưu thông tin đăng ký tạm thời vào Redis. Điều này giúp Database hoàn toàn sạch, không chứa các tài khoản rác nếu người dùng không bao giờ nhập OTP.

- **`POST /auth/register`**: Gửi yêu cầu đăng ký.
  - Client gửi: `email`, `password`, `name`.
  - Server hash password (bcrypt).
  - Sinh mã OTP ngẫu nhiên (VD: 6 chữ số).
  - Đóng gói `(email, hashed_password, name, OTP)` và lưu vào **Redis** với thời gian hết hạn (TTL) là 5 phút.
  - Đẩy Job gửi Email chứa OTP vào **BullMQ / RabbitMQ** để xử lý nền (không bắt API phải chờ).
  - API trả về `200 OK` ngay lập tức.
- **`POST /auth/verify-otp`**: Xác thực OTP và hoàn tất đăng ký.
  - Client gửi `email` và `otp`.
  - Server tra cứu email này trong Redis.
  - Nếu mã OTP khớp và chưa hết hạn: Tiến hành lệnh `INSERT` dữ liệu (email, password, name, isActive = true) vào bảng `users` trong PostgreSQL.
  - Xóa key tương ứng trong Redis.
  - Cấp phát **Access Token** & **Refresh Token** (Đăng nhập thành công ngay sau khi đăng ký).
- **`POST /auth/resend-otp`**: Gửi lại OTP.
  - Có áp dụng Rate Limiting (VD: Tối đa 3 lần / giờ) để chống Spam.
- **`POST /auth/login`**: Đăng nhập.
  - Client gửi `email` và `password`.
  - Kiểm tra mật khẩu.
  - Tạo `UserSession` (lưu IP, User-Agent) vào Database.
  - Trả về `accessToken` và `refreshToken`.
- **`GET /auth/profile`**: Lấy thông tin user hiện tại.
  - Sử dụng `JwtAuthGuard` (passport-jwt) để bảo vệ route.

## 2. Session & Token Management

- **`POST /auth/refresh`**: Gia hạn Token.
  - Client gửi lên Refresh Token cũ.
  - Server kiểm tra tính hợp lệ và trạng thái `isRevoked` trong bảng `refresh_tokens`.
  - Nếu hợp lệ: Cấp Access Token mới (có thể kết hợp Refresh Token Rotation - cấp luôn Refresh Token mới).
- **`POST /auth/logout`**: Đăng xuất.
  - Đánh dấu Refresh Token là `isRevoked = true`.
  - Đánh dấu Session là `isActive = false`.

## 3. OAuth Authentication (Phase tiếp theo)

- Tích hợp đăng nhập bằng mạng xã hội (Google, Facebook, Github, Apple).
- Ánh xạ tài khoản OAuth vào bảng `users` hiện tại (sử dụng cột `provider` và `providerId`).

---

## 🛠 Các bước chuẩn bị (Chuẩn bị Code)

1. **Thư viện cần cài đặt**:
   - `redis` và `@nestjs/cache-manager` (để kết nối Redis).
   - `@nestjs/bull` và `bull` (để chạy Queue gửi mail).
   - `@nestjs-modules/mailer` hoặc `nodemailer` (gửi mail).
   - `nestjs-zod` hoặc `class-validator` (để validate dữ liệu đầu vào).
2. **Setup Hạ tầng**: Cần chạy Redis server ở local (qua Docker hoặc cài trực tiếp).
3. **Môi trường**: Bổ sung các biến `REDIS_HOST`, `REDIS_PORT`, `SMTP_USER`, `SMTP_PASS`, `JWT_SECRET` vào file `.env`.
