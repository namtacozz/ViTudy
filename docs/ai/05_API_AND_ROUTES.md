# 05_API_AND_ROUTES.md — Tuyến Điều Hướng & Cổng API ViTudy

> **Commit Hash:** `74d4cc0`  
> **Cập nhật lần cuối:** `2026-11-07`

---

## 1. Tuyến Giao Diện (Application Pages)

### 1. `GET /` — Trang Chính Bàn Học Tương Tác 2.5D
* **Vị trí file:** [`src/app/page.tsx:L27-L59`](file:///F:/AppMaking/ViTudy/src/app/page.tsx#L27-L59) (`StudySpacePage`)
* **Loại Route:** Client Page (với Next.js dynamic import `ssr: false`).
* **Yêu cầu xác thực:** Không bắt buộc (cho phép khách trải nghiệm ngay trên bàn học demo).
* **Hành vi đáp ứng:**
  * Nếu màn hình $\ge 768\text{px}$: Tải giao diện bàn học vô cực 2.5D [`StudySpaceDeskView`](file:///F:/AppMaking/ViTudy/src/components/canvas/StudySpaceDeskView.tsx).
  * Nếu màn hình $< 768\text{px}$: Chuyển sang chế độ xem phụ trợ di động [`MobileCompanionView`](file:///F:/AppMaking/ViTudy/src/components/mobile/MobileCompanionView.tsx).
* **Dịch vụ ngoài gọi đến:** Không.

---

## 2. Tuyến API Backend & AI Gateway

### 1. `POST /api/ai/chat` — Cổng Xử Lý AI Đa Chế Độ (Multi-Mode AI Gateway)
* **Vị trí file:** [`src/app/api/ai/chat/route.ts:L3-L148`](file:///F:/AppMaking/ViTudy/src/app/api/ai/chat/route.ts#L3-L148) (`POST`)
* **Yêu cầu xác thực:** Kiểm tra Token/API Key động theo chế độ truyền vào:
  * `oauth_chatgpt`: Cần `accessToken` hoặc `apiKey`.
  * `byok_gemini`: Cần `apiKey` (Gemini API Key).
  * `byok_openai`: Cần `apiKey` (OpenAI Key).
  * `system`: Sử dụng `process.env.OPENAI_API_KEY` của máy chủ (có fallback mô phỏng nếu chưa cấu hình key trên dev).

#### Định Dạng Dữ Liệu Đầu Vào (Request Payload)
```typescript
{
  provider: 'system' | 'byok_openai' | 'byok_gemini' | 'oauth_chatgpt';
  model?: string;        // Ví dụ: 'gpt-4o-mini', 'gpt-4o', 'gemini-1.5-flash'
  prompt: string;        // Câu hỏi hoặc yêu cầu của người học (Bắt buộc)
  context?: string;       // Đoạn trích dẫn tài liệu đang bôi đen hoặc nội dung trang sách
  apiKey?: string;        // Khoá cá nhân khi dùng chế độ BYOK
  accessToken?: string;   // Token xác thực OAuth khi dùng ChatGPT Plus/Team
}
```

#### Định Dạng Dữ Liệu Trả Về (Success Response)
```typescript
{
  reply: string;          // Lời giải thích, tóm tắt hoặc câu trả lời từ mô hình AI
  provider: string;       // Nhà cung cấp đã xử lý yêu cầu
  isSimulation?: boolean; // true nếu đang chạy ở chế độ dev mô phỏng không tốn key
}
```

#### Định Dạng Lỗi (Error Responses)
* `400 Bad Request`: `{"error": "Thiếu nội dung câu hỏi (prompt)"}`.
* `401 Unauthorized`: `{"error": "Chưa có Token đăng nhập ChatGPT OAuth..."}` hoặc `{"error": "Chưa nhập Google Gemini API Key"}`.
* `502 Bad Gateway`: Lỗi kết nối tới endpoint bên thứ ba (`ChatGPT Codex Gateway`, `Gemini API`, `OpenAI API`).
* `500 Internal Server Error`: Lỗi ngoại lệ hệ thống gateway.

#### Dịch Vụ Bên Ngoài Được Gọi (External Endpoints)
1. **ChatGPT Codex Backend (SRS 3.2 Chế độ 3):**
   * URL: `https://chatgpt.com/backend-api/codex/responses`
   * Headers: `Authorization: Bearer <token>`, `originator: codex_cli_rs`, `User-Agent: codex-cli/0.1.0`
   * Model: `gpt-4o`
2. **Google Gemini REST API (SRS 3.2 Chế độ 2):**
   * URL: `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}`
   * Model: `gemini-1.5-flash`
3. **OpenAI Official API (SRS 3.2 Chế độ 1 & BYOK):**
   * URL: `https://api.openai.com/v1/chat/completions`
   * Model: `gpt-4o-mini` hoặc theo yêu cầu
