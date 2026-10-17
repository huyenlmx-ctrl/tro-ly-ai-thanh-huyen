# Trợ Lý AI của Thanh Huyền

Website trợ lý học tập tiếng Việt, giao diện responsive cho máy tính và điện thoại. Dùng Google Gemini API để giải thích bài học, ôn tập, luyện tiếng Anh và hướng dẫn giải bài từng bước.

## Cách chạy thử trên máy tính

1. Tải và giải nén file ZIP.
2. Mở thư mục `tro-ly-ai-thanh-huyen`.
3. Nhấp đúp `index.html` để mở bằng Chrome hoặc Edge.
4. Chọn **Cài đặt AI** → nhập Gemini API key → **Lưu cài đặt**.
5. Nhập câu hỏi và nhấn **Gửi**.

Nếu trình duyệt chặn yêu cầu API khi mở bằng `file://`, hãy chạy website bằng máy chủ tĩnh. Có thể dùng VS Code và tiện ích Live Server, hoặc đăng lên GitHub Pages theo hướng dẫn dưới đây.

## Đưa website lên GitHub Pages

### 1. Tạo repository

1. Đăng nhập GitHub tại https://github.com.
2. Nhấn dấu **+** ở góc trên bên phải → **New repository**.
3. Đặt tên repository là `tro-ly-ai-thanh-huyen`.
4. Chọn **Public** (GitHub Pages miễn phí cho repository public) hoặc chọn gói phù hợp nếu muốn private.
5. Nhấn **Create repository**.

### 2. Tải mã nguồn lên GitHub

1. Giải nén ZIP trên máy tính.
2. Mở repository vừa tạo trên GitHub.
3. Nhấn **Add file** → **Upload files**.
4. Mở thư mục đã giải nén và kéo **các tệp bên trong** (`index.html`, `style.css`, `app.js`, `README.md`, `.nojekyll`) vào vùng tải lên. Đừng chỉ tải tệp ZIP lên.
5. Chờ tải xong, nhập nội dung commit nếu được yêu cầu, rồi nhấn **Commit changes**.

Lưu ý: `index.html` phải nằm ngay ở thư mục gốc repository, không nằm trong một thư mục con.

### 3. Bật GitHub Pages

1. Trong repository, mở **Settings**.
2. Ở thanh bên trái chọn **Pages**.
3. Trong phần **Build and deployment**, chọn **Deploy from a branch**.
4. Chọn branch `main` và folder `/(root)`.
5. Nhấn **Save**.
6. Chờ vài phút. Trang Pages sẽ hiện địa chỉ dạng `https://TEN-TAI-KHOAN.github.io/tro-ly-ai-thanh-huyen/`. Mở địa chỉ đó để sử dụng.

Tên tài khoản trong URL sẽ là tên GitHub của bạn, không phải tên website. Nếu Pages chưa hiện link ngay, tải lại trang Settings → Pages sau một lúc.

## Kết nối Gemini API

1. Mở Google AI Studio: https://aistudio.google.com/app/apikey
2. Đăng nhập tài khoản Google và tạo API key theo hướng dẫn hiện tại của Google.
3. Trên website, mở **Cài đặt AI**, dán key, chọn mô hình và nhấn **Lưu cài đặt**.
4. Gửi một câu hỏi thử nghiệm.

Quyền truy cập, hạn mức và chi phí (nếu có) phụ thuộc chính sách Google tại thời điểm sử dụng. Không chia sẻ API key.

## Quan trọng về bảo mật

- API key không được nhúng sẵn trong mã nguồn và không được tải lên GitHub cùng dự án.
- Website lưu key trong `localStorage` của trình duyệt đang dùng. Người khác sử dụng một trình duyệt/thiết bị khác sẽ cần nhập key riêng.
- Đây là bản phù hợp cho dự án cá nhân/học tập. Nếu muốn mở website công khai để nhiều người sử dụng mà không phải tự nhập key, hãy thêm backend/serverless function để giữ API key ở phía máy chủ. Không đưa key bí mật vào `app.js`, `index.html` hay repository.
- Không gửi thông tin riêng tư, mật khẩu hoặc dữ liệu nhạy cảm vào trợ lý.

## Cấu trúc dự án

```text
tro-ly-ai-thanh-huyen/
├── index.html
├── style.css
├── app.js
├── README.md
└── .nojekyll
```

## Khắc phục nhanh

- **Website hiện 404:** kiểm tra Settings → Pages đã chọn `main` và `/(root)` chưa; đảm bảo `index.html` nằm ở thư mục gốc.
- **AI báo key không hợp lệ:** tạo/kiểm tra lại key, quyền Gemini API và chọn mô hình khác trong Cài đặt AI.
- **AI báo giới hạn:** đợi rồi thử lại, kiểm tra hạn mức trong Google AI Studio.
- **Mở file trực tiếp nhưng không gọi được API:** dùng GitHub Pages hoặc máy chủ tĩnh như Live Server.
- **Sửa website sau này:** tải tệp đã sửa lên lại repository và commit changes; GitHub Pages tự triển khai lại sau ít phút.
