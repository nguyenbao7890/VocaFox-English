# VocaFox: Supabase + Render

## 1. Tạo Supabase database
1. Tạo project Supabase.
2. Vào SQL Editor, chạy toàn bộ `supabase/schema.sql`.
3. Vào Project Settings -> API, lấy:
   - Project URL
   - anon public key
   - service_role key

## 2. Chạy local
Tạo `.env` từ `.env.example`, điền Supabase và Gemini key.

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`.

## 3. Deploy Render qua GitHub
Render Web Service:
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Environment variables: dùng đúng các biến trong `.env.example`.

Frontend và backend đã được gộp chung trong `server.ts`: Express phục vụ API `/api/*` và khi production sẽ serve thư mục `dist` của Vite.

## 4. Ghi chú dữ liệu thật
Các dashboard thống kê lấy từ bảng thật:
- `profiles`: người dùng, role, completed_units, usage_time_seconds
- `exam_attempts`: bài thi đã nộp
- `activity_events`: login, học bài, nộp đề, ping thời gian học
- `classes`, `class_members`: liên kết giáo viên - học sinh qua mã lớp

Không có dữ liệu demo/bịa trong dashboard Admin. Nếu database mới chưa có hoạt động, biểu đồ sẽ trống hoặc bằng 0.

## Cập nhật mới: lớp học, chat nội bộ, học online/kiểm tra online

Bản này bổ sung các bảng Supabase mới:

- `class_messages`: lưu chat nội bộ lớp.
- `class_assignments`: lưu hoạt động giáo viên giao cho lớp, gồm bài học online, kiểm tra online hoặc buổi học live.

Nếu bạn đã từng chạy schema cũ, hãy mở `supabase/schema.sql` và chạy lại phần cuối từ dòng `-- Classroom collaboration` trở xuống trong Supabase SQL Editor. Nếu tạo project Supabase mới, chạy toàn bộ file schema như bình thường.
