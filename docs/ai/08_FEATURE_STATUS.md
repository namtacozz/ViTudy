# 08_FEATURE_STATUS.md — Ma Trận Tiến Độ Tính Năng ViTudy (SRS Audit)

> **Commit Hash:** `Current Working Tree (Production Ready)`  
> **Cập nhật lần cuối:** `2026-11-07`  
> **Tài liệu nguồn kiểm chứng:** [`SRS_ViTudy.md`](file:///F:/AppMaking/ViTudy/SRS_ViTudy.md)  
> **Trạng thái:** Đã kiểm thử tự động toàn diện qua Chrome DevTools (`http://127.0.0.1:9222`) đạt 100% tiêu chí.

---

## 1. Ma Trận Đối Soát Tính Năng Với SRS

| Mục SRS | Tính Năng Quy Chuẩn | Trạng Thái | Bằng Chứng Mã Nguồn (File:Lines) | Ghi Chú Đánh Giá Nghiệm Thu |
|---|---|---|---|---|
| **SRS 3.1** | Động cơ Non-AI cơ bản: Tóm tắt TextRank | `DONE` | [`src/lib/nonAiEngine.ts:L79-L120`](file:///F:/AppMaking/ViTudy/src/lib/nonAiEngine.ts#L79-L120) | Chạy 100% phía client, không tốn ViToken/API Key. |
| **SRS 3.1** | Động cơ Non-AI: Trắc nghiệm Cloze Deletion | `DONE` | [`src/lib/nonAiEngine.ts:L125-L207`](file:///F:/AppMaking/ViTudy/src/lib/nonAiEngine.ts#L125-L207) | Tự động sinh 4 phương án từ danh sách thuật ngữ bài học. |
| **SRS 3.1** | Động cơ Non-AI: Sinh Flashcard theo mẫu câu | `DONE` | [`src/lib/nonAiEngine.ts:L212-L267`](file:///F:/AppMaking/ViTudy/src/lib/nonAiEngine.ts#L212-L267) | Nhận diện mẫu định nghĩa "là", ":", "tập trung vào". |
| **SRS 3.1** | Động cơ Non-AI: Dựng lộ trình học tương tác | `DONE` | [`src/lib/nonAiEngine.ts:L272-L298`](file:///F:/AppMaking/ViTudy/src/lib/nonAiEngine.ts#L272-L298) | Tính thời lượng học dựa trên số từ chia tốc độ đọc 180 từ/phút. |
| **SRS 3.2** | Cổng AI Đa Chế Độ: ChatGPT Codex Backend | `DONE` | [`src/app/api/ai/chat/route.ts:L23-L65`](file:///F:/AppMaking/ViTudy/src/app/api/ai/chat/route.ts#L23-L65) | Kết nối endpoint codex với `originator: codex_cli_rs`, chuẩn NFC. |
| **SRS 3.2** | Cổng AI Đa Chế Độ: Google Gemini BYOK | `DONE` | [`src/app/api/ai/chat/route.ts:L67-L97`](file:///F:/AppMaking/ViTudy/src/app/api/ai/chat/route.ts#L67-L97) | Hỗ trợ nhập API Key cá nhân của Google, chuẩn NFC. |
| **SRS 3.2** | Cổng AI Đa Chế Độ: OpenAI System Managed | `DONE` | [`src/app/api/ai/chat/route.ts:L99-L144`](file:///F:/AppMaking/ViTudy/src/app/api/ai/chat/route.ts#L99-L144) | Có cơ chế fallback mô phỏng thông minh khi chưa gắn server key. |
| **SRS 3.3** | Nền kinh tế ViToken: Điểm danh Streak & Anti-Sybil | `DONE` | [`src/context/ViTokenContext.tsx:L74-L120`](file:///F:/AppMaking/ViTudy/src/context/ViTokenContext.tsx#L74-L120) | Thưởng 2-10 token, yêu cầu tối thiểu 180s học tập để chống gian lận. |
| **SRS 4.1** | STudy: Bộ công cụ ôn tập toàn diện Modal | `DONE` | [`src/components/modals/StudyToolsModal.tsx:L1-L150`](file:///F:/AppMaking/ViTudy/src/components/modals/StudyToolsModal.tsx#L1-L150) | Đã module hóa thành 5 sub-tabs độc lập, chuẩn monochromatic. |
| **SRS 4.3** | STudy: Tờ Giấy Đề Thi A4 2.5D & Tự Chấm Điểm | `DONE` | [`src/components/objects/PaperSheet.tsx:L120-L245`](file:///F:/AppMaking/ViTudy/src/components/objects/PaperSheet.tsx#L120-L245) | A4 Exam Sheet đặt trên bàn, chọn đáp án, đếm giờ, nút Chấm bài & Lời phê. |
| **SRS 4.4** | STudy: Thẻ Trắc Nghiệm 3D Lật Mặt Tương Tác | `DONE` | [`src/components/objects/ExamQuizCard.tsx:L1-L350`](file:///F:/AppMaking/ViTudy/src/components/objects/ExamQuizCard.tsx#L1-L350) | Thẻ compact 380x490 màu pastel, 3D flip xoay mặt, dải pill câu hỏi đáy thẻ, chấm điểm tức thì, màn hình tổng kết và chế độ xem lại câu. |
| **SRS 5.1** | Chợ KnowInherit: Danh mục tài liệu & Khung giá | `DONE` | [`src/components/hud/BottomLeftKnowledge.tsx:L38-L130`](file:///F:/AppMaking/ViTudy/src/components/hud/BottomLeftKnowledge.tsx#L38-L130) | Chuẩn hóa đúng 4 khung giá SRS: Hạng C (5V), B (15V), A (30V), S (50V). |
| **SRS 5.2** | Chợ KnowInherit: Xuất bản & Sổ cái kép 85/15 | `DONE` | [`src/components/modals/KnowInheritPublishModal.tsx:L50-L75`](file:///F:/AppMaking/ViTudy/src/components/modals/KnowInheritPublishModal.tsx#L50-L75) | Trừ tiền người mua, cộng tiền tác giả 85%, nền tảng 15%, ghi log ISO chuẩn. |
| **SRS 6.1** | Bàn học 2.5D: Pan, Zoom, Xoay tự do 360° | `DONE` | [`src/components/canvas/InfiniteDesk.tsx:L13-L206`](file:///F:/AppMaking/ViTudy/src/components/canvas/InfiniteDesk.tsx#L13-L206) | Tái sử dụng hook `useDeskItemInteraction`, xoay atan2 mượt mà. |
| **SRS 6.2** | Sách 2.5D: Mở đôi 940x630, phân trang thật | `DONE` | [`src/components/objects/BookSpread.tsx:L25-L480`](file:///F:/AppMaking/ViTudy/src/components/objects/BookSpread.tsx#L25-L480) | Không cắt cụt công thức, gờ mép trang 2.5D, điều hướng phím mũi tên. |
| **SRS 6.3** | Cơ chế Binder: Gộp tài liệu & Tách trang ra bàn | `DONE` | [`src/context/StudySpaceContext.tsx:L320-L425`](file:///F:/AppMaking/ViTudy/src/context/StudySpaceContext.tsx#L320-L425) | Nút "Tách trang" mỏng góc trang, tách thành `PaperSheet`. |
| **SRS 6.4** | Nét vẽ tự do & Bút dạ quang (Highlighter) | `DONE` | [`src/components/canvas/DeskDrawingCanvas.tsx:L6-L81`](file:///F:/AppMaking/ViTudy/src/components/canvas/DeskDrawingCanvas.tsx#L6-L81) | Cầm bút vẽ tự do khắp mặt bàn; giữ `Alt + Drag` để pan bàn. |
| **SRS 6.5** | Bản đồ thu nhỏ Radar / Minimap | `DONE` | [`src/components/canvas/Minimap.tsx:L6-L205`](file:///F:/AppMaking/ViTudy/src/components/canvas/Minimap.tsx#L6-L205) | Tự co giãn theo khung bao thế giới, click/drag lia camera. |
| **SRS 6.6** | Realtime Multiplayer Presence (Cộng tác nhóm) | `DONE` | [`src/components/hud/MultiplayerBar.tsx:L1-L150`](file:///F:/AppMaking/ViTudy/src/components/hud/MultiplayerBar.tsx#L1-L150) | Avatar thành viên online, nút "Đồng bộ góc nhìn" (Follow Me) đèn LED xanh. |
| **SRS 7.1** | Inteline: Popover bôi đen & Ghim note nối dây | `DONE` | [`src/components/objects/BookSpread.tsx:L310-L330`](file:///F:/AppMaking/ViTudy/src/components/objects/BookSpread.tsx#L310-L330), [`VisualLinkThreads.tsx:L6-L94`](file:///F:/AppMaking/ViTudy/src/components/canvas/VisualLinkThreads.tsx#L6-L94) | Bôi đen chữ hiện `[Hỏi Inteline]`, ghim note tạo đường cong SVG nối dây. |
| **SRS 8.1** | CSDL Supabase: 11 bảng, pgvector, RLS | `DONE` | [`supabase/schema.sql:L1-L240`](file:///F:/AppMaking/ViTudy/supabase/schema.sql#L1-L240) | Đầy đủ DDL, RLS, index ivfflat, bổ sung bảng `space_members`. |
| **SRS 9.1** | Chế độ Đồng hành Di động (Mobile Companion) | `DONE` | [`src/components/mobile/MobileCompanionView.tsx:L1-L128`](file:///F:/AppMaking/ViTudy/src/components/mobile/MobileCompanionView.tsx#L1-L128) | Chuẩn hóa đơn sắc light theme, đồng bộ Open Sans, tự kích hoạt <768px. |
