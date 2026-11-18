# Mỹ Miều Quiz — Frontend

Next.js (App Router) + TypeScript + Ant Design.

## Chạy local

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api

npm install
npm run dev
```

Mở `http://localhost:3000`. Backend phải chạy ở cổng 5000.

## Luồng chính

1. Đăng ký / Đăng nhập  
2. Tải PDF/DOCX + cấu hình số câu / thời gian (+ case lâm sàng)  
3. Màn quiz: báo cáo mode/bank → **Bắt đầu ôn luyện** / **Tạo phòng thi**  
4. Ôn luyện: khóa đáp án → feedback ngay → tổng kết  
5. Phòng thi: timer, không lộ đáp án, nộp / hết giờ  
6. Kết quả: ôn câu sai · làm lại · xem lại đáp án  

## Cấu trúc `src/`

`@types/` · `api/` · `components/` · `hooks/` · `templates/` · `themes/` · `utils/` · `validators/` · `app/`
