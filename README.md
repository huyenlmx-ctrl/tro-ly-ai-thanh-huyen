# Trợ Lý AI của Thanh Huyền

Website trợ lý học tập tiếng Việt với màn hình chào `Hello Thanh Huyền`, nút `Start♡`, giao diện hồng pastel, chat Gemini, gửi ảnh bài tập và chọn nhạc từ thiết bị.

## Chạy trên máy tính

1. Giải nén file ZIP.
2. Mở thư mục dự án và mở `index.html` bằng Chrome hoặc Edge.
3. Nhấn **Start♡** để vào không gian học tập.
4. Chọn **Cài đặt AI**, dán Gemini API key và lưu.
5. Nhập câu hỏi hoặc nhấn **Gửi ảnh** để chọn ảnh bài tập rồi gửi cho AI.
6. Trong mục **Góc âm nhạc**, chọn một file âm thanh trên thiết bị để phát khi học.

## Đưa lên GitHub Pages

1. Giải nén ZIP.
2. Mở repository GitHub của bạn.
3. Chọn **Add file → Upload files**.
4. Kéo các file bên trong thư mục dự án vào trang upload (không tải nguyên file ZIP lên): `index.html`, `style.css`, `app.js`, `README.md`, `.nojekyll`.
5. Nhấn **Commit changes**.
6. Vào **Settings → Pages**, chọn `Deploy from a branch`, branch `main`, folder `/(root)`, rồi nhấn **Save**.
7. Chờ triển khai xong và mở đường link GitHub Pages.

## Gemini API

Tạo API key trong Google AI Studio: https://aistudio.google.com/app/apikey

Trên website, vào **Cài đặt AI**, dán key và lưu. Key được lưu trong localStorage của trình duyệt hiện tại, không được nhúng vào các file của dự án. Khi mở trên thiết bị/trình duyệt khác, cần cài key lại.

**Lưu ý bảo mật:** đây là dự án frontend cho học tập cá nhân. Với website công khai, người dùng có thể tự nhập key của họ; không chia sẻ API key cá nhân. Nếu muốn tất cả khách truy cập dùng AI mà không cần nhập key, hãy triển khai backend/serverless function để giữ key ở phía máy chủ. Không commit key lên GitHub.

## Gửi ảnh

Nhấn **Gửi ảnh**, chọn ảnh JPG/PNG/WEBP (tối đa 10 MB), có thể nhập câu hỏi bổ sung rồi nhấn **Gửi**. AI phân tích ảnh qua Gemini, vì vậy cần API key và mô hình Gemini được cấp quyền hỗ trợ nội dung hình ảnh.

## Nhạc

Nhấn **Chọn nhạc từ thiết bị** trong mục **Góc âm nhạc**. Tệp nhạc được phát trực tiếp trong trình duyệt; file nhạc không được tải lên GitHub hoặc gửi đến AI. Khi tải lại trang, bạn có thể cần chọn lại file.

## Cấu trúc dự án

```text
tro-ly-ai-thanh-huyen/
├── index.html
├── style.css
├── app.js
├── README.md
└── .nojekyll
```
