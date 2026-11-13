# AUDIT_FLOW_REPORT.md — Báo Cáo Kiểm Toán Logic & Luồng Hoạt Động Toàn Bộ ViTudy

> **Tiêu chuẩn kiểm toán:** Đối soát trực tiếp mã nguồn thực tế với Bản đặc tả yêu cầu phần mềm gốc [`SRS_ViTudy.md`](file:///F:/AppMaking/ViTudy/SRS_ViTudy.md).
> **Nguyên tắc bất biến:** Đọc mã độc lập, không tin các nhãn tự xưng `DONE` hay `Verified 100%` trong tài liệu cũ; mọi kết luận bắt buộc có dẫn chứng tệp và số dòng cụ thể (`path/to/file:L123-L145`).
> **Ngày thực hiện kiểm toán:** 13/11/2026.

---

## 1. Tóm Tắt Điều Hành (Executive Summary)

| Nhóm | Phân Hệ Nghiệp Vụ | Điểm Luồng | Lý Do & Hiện Trạng Cốt Lõi |
| :--- | :--- | :---: | :--- |
| **A** | ViToken & Nền kinh tế tiền tệ | **D** | Client tự ý sửa số dư qua `localStorage`; bỏ qua RPC trừ tiền khi gọi AI/Chợ; lộ khóa nạp thẻ Sepay và lỗ hổng đặc quyền tác giả client. |
| **B** | Cổng AI Đa Chế Độ | **C-** | Chế độ ChatGPT OAuth hoạt động; tuy nhiên khóa API lưu bản rõ tại `localStorage`, mô hình Gemini bị gửi nhầm sang endpoint OpenAI gây lỗi 400, Claude chưa có backend. |
| **C** | Inteline (Hỏi đáp tại dòng) | **D+** | Không có Vector Search (`pgvector`) hay Context Caching; chi phí hardcode 1 ViToken; chỉ đính kèm trang đầu tiên của tài liệu; xóa vật thể để lại thread mồ côi. |
| **D** | STudy (Học & Ôn luyện) | **C+** | Thuật toán SM-2, bóc tách DOCX/PPTX và OCR chạy tốt; tuy nhiên TextRank/Cloze là heuristic đếm tần suất đơn giản, lộ trình học chỉ là danh sách tĩnh, đề thi chỉ có trắc nghiệm 4 nút. |
| **E** | KnowInherit & Chợ tài liệu | **F** | 100% dữ liệu lấy từ mảng tĩnh `marketMockData.ts`; điểm AI chấm bằng `setTimeout` và công thức số trang; mua bán hoàn toàn ở client, không ghi nhận giao dịch vào CSDL. |
| **F** | StudySpace 2.5D & Multiplayer | **C** | Bàn học 2.5D và Viewport Culling hoạt động; nhưng tài liệu 2-4 trang bị biến thành Sách thay vì Giấy; con trỏ Multiplayer không hề render lên màn hình; tính năng Gộp Binder là mã chết. |
| **G** | Xác thực, Dữ liệu & Bảo mật | **D** | RLS không chặn tác giả tự cấp điểm AI/giá bán; lộ JWT Anon Key và URL Supabase thật trong mã nguồn; Webhook Sepay chứa API Key dự phòng cứng; xóa tài khoản xóa luôn tài liệu đã bán. |
| **H** | Điều hướng, Trạng thái & Luồng | **C-** | Tồn tại 4 tầng trạng thái bất đồng bộ (URL, Context, LocalStorage, Supabase); Mobile Companion là khung xem văn bản tối giản, thiếu toàn bộ Flashcard/Quiz/Chợ như SRS. |
| **I** | Chất lượng Kiểm thử & Tài liệu | **D** | 19 tệp test chỉ kiểm tra hàm thuần; 0 test cho mua bán, RLS, thanh toán; tài liệu 08_FEATURE_STATUS viện dẫn file đã xóa và tự bịa các mục SRS 8.x-9.x không có trong SRS gốc. |

---

## 2. Bảng Tổng Hợp Theo Chức Năng (Detailed Matrix)

### Nhóm A: ViToken & Nền Kinh Tế Tiền Tệ
| Chức Năng | Nhãn Kết Luận | Mức Độ | Bằng Chứng (File:Dòng) |
| :--- | :---: | :---: | :--- |
| **Cộng/trừ ViToken** | `MOCK/GIẢ LẬP` | **Nghiêm trọng** | [`src/context/ViTokenContext.tsx:L215-L256`](file:///F:/AppMaking/ViTudy/src/context/ViTokenContext.tsx#L215-L256) (`addTokens`, `spendTokens` cập nhật thẳng React State và `localStorage['vitudy_wallet']`, không gọi RPC `credit_vitoken`/`debit_vitoken`). |
| **Tỷ lệ quy đổi & giá** | `LỆCH TÀI LIỆU` | **Trung bình** | [`src/services/PaymentService.ts:L31-L36`](file:///F:/AppMaking/ViTudy/src/services/PaymentService.ts#L31-L36) (Gói nạp 1.000đ = 1V), nhưng [`src/components/modals/study-tools/SummaryTab.tsx:L51`](file:///F:/AppMaking/ViTudy/src/components/modals/study-tools/SummaryTab.tsx#L51) hardcode trừ 2V/lượt, khác biệt hoàn toàn với FAQ ghi ~0,05V. |
| **Điểm danh Streak 180s** | `SAI LUỒNG` | **Cao** | [`src/context/ViTokenContext.tsx:L172`](file:///F:/AppMaking/ViTudy/src/context/ViTokenContext.tsx#L172) (Bộ đếm 180s nằm ở `setInterval` client, server RPC [`0001_hardening.sql:L200-L264`](file:///F:/AppMaking/ViTudy/supabase/migrations/0001_hardening.sql#L200-L264) không hề kiểm tra thời gian học). |
| **Quà khởi tạo 50 ViToken** | `ĐÚNG MỘT PHẦN` | **Trung bình** | [`src/context/ViTokenContext.tsx:L23`](file:///F:/AppMaking/ViTudy/src/context/ViTokenContext.tsx#L23) (Cấp 50V vô điều kiện cho cả khách vãng lai, không yêu cầu xác thực Email trường hay SĐT như SRS 3.3). |
| **Cọc kiểm duyệt & Referral** | `THIẾU` | **Cao** | [`src/types/vitoken.ts:L3`](file:///F:/AppMaking/ViTudy/src/types/vitoken.ts#L3) (Chỉ có chuỗi định danh TypeScript, không có bảng cơ sở dữ liệu hay logic nghiệp vụ cọc kiểm duyệt/giới thiệu bạn bè). |
| **Đặc quyền 5.000V tác giả** | `SAI LUỒNG` | **Nghiêm trọng** | [`src/context/ViTokenContext.tsx:L68-L71`](file:///F:/AppMaking/ViTudy/src/context/ViTokenContext.tsx#L68-L71) & [`L86-L112`](file:///F:/AppMaking/ViTudy/src/context/ViTokenContext.tsx#L86-L112) (Kiểm tra chuỗi `namtacozz@gmail.com` ở `localStorage`, bất kỳ ai cũng có thể giả mạo để nhận 5.000 ViToken client). |
| **Nạp VietQR & Sepay Webhook** | `ĐÚNG MỘT PHẦN` | **Nghiêm trọng** | [`supabase/functions/sepay-webhook/index.ts:L4`](file:///F:/AppMaking/ViTudy/supabase/functions/sepay-webhook/index.ts#L4) (Chứa khóa API dự phòng tĩnh trong mã; nút nạp thử 0đ [`TopUpModal.tsx:L118`](file:///F:/AppMaking/ViTudy/src/components/payment/TopUpModal.tsx#L118) kích hoạt được trên production qua `?dev=true`). |

### Nhóm B: Cổng AI Đa Chế Độ
| Chức Năng | Nhãn Kết Luận | Mức Độ | Bằng Chứng (File:Dòng) |
| :--- | :---: | :---: | :--- |
| **Hỗ trợ nhà cung cấp AI** | `ĐÚNG MỘT PHẦN` | **Cao** | [`src/lib/aiClient.ts:L252-L295`](file:///F:/AppMaking/ViTudy/src/lib/aiClient.ts#L252-L295) (Chạy được `oauth_chatgpt`, `byok_gemini`, `byok_openai`, `system`; tuy nhiên `byok_claude` và `oauth_gemini` chỉ có giao diện, không có mã xử lý backend). |
| **Lệch tài liệu 05_API** | `LỆCH TÀI LIỆU` | **Trung bình** | [`docs/ai/05_API_AND_ROUTES.md:L62`](file:///F:/AppMaking/ViTudy/docs/ai/05_API_AND_ROUTES.md#L62) ghi nhận chỉ có 2 provider và model `gemini-1.5-flash`, trong khi mã [`AiConfigModal.tsx:L58-L85`](file:///F:/AppMaking/ViTudy/src/components/modals/AiConfigModal.tsx#L58-L85) cung cấp 5 provider và 10+ models. |
| **Bảo mật khóa API & OAuth** | `SAI LUỒNG` | **Nghiêm trọng** | [`src/lib/byokStore.ts:L19`](file:///F:/AppMaking/ViTudy/src/lib/byokStore.ts#L19) & [`src/lib/openaiOAuth.ts:L282`](file:///F:/AppMaking/ViTudy/src/lib/openaiOAuth.ts#L282) (Lưu token và API Key bản rõ vào `localStorage`; không có bảng `AI_CREDENTIALS` mã hóa AES-256-GCM như SRS 3.2). |
| **Model Gemini qua System** | `SAI LUỒNG` | **Cao** | [`supabase/functions/ai-chat/index.ts:L438-L450`](file:///F:/AppMaking/ViTudy/supabase/functions/ai-chat/index.ts#L438-L450) (Nếu chọn `system` + `gemini-2.5-flash`, Edge Function rơi vào nhánh `else` và gửi request sang OpenAI endpoint gây lỗi 400). |
| **Hoàn token khi lỗi** | `ĐÚNG` | **Thấp** | [`supabase/functions/ai-chat/index.ts:L476-L485`](file:///F:/AppMaking/ViTudy/supabase/functions/ai-chat/index.ts#L476-L485) & [`0001_hardening.sql:L97-L105`](file:///F:/AppMaking/ViTudy/supabase/migrations/0001_hardening.sql#L97-L105) (Tự động gọi `credit_vitoken` với `p_reference: refund:...` bảo đảm tính bất biến idempotency). |
| **Kiểm soát tần suất (Rate limit)** | `ĐÚNG` | **Trung bình** | [`supabase/functions/ai-chat/index.ts:L250-L285`](file:///F:/AppMaking/ViTudy/supabase/functions/ai-chat/index.ts#L250-L285) (Cưỡng chế giới hạn 20 lượt/giờ và 60 lượt/ngày phía server qua RPC `consume_rate_limit`). |

### Nhóm C: Inteline (Trí Tuệ Từng Dòng)
| Chức Năng | Nhãn Kết Luận | Mức Độ | Bằng Chứng (File:Dòng) |
| :--- | :---: | :---: | :--- |
| **Hybrid RAG & pgvector** | `MOCK/GIẢ LẬP` | **Nghiêm trọng** | [`src/components/modals/IntelineModal.tsx:L73-L75`](file:///F:/AppMaking/ViTudy/src/components/modals/IntelineModal.tsx#L73-L75) (Nối chuỗi thô `pages[0].text`, không hề gọi `match_document_pages` hay tạo vector embeddings). |
| **Đính kèm chéo đa tài liệu** | `ĐÚNG MỘT PHẦN` | **Cao** | [`src/components/modals/IntelineModal.tsx:L161-L177`](file:///F:/AppMaking/ViTudy/src/components/modals/IntelineModal.tsx#L161-L177) (Chỉ chọn được cả tài liệu, không có tính năng chọn khoảng trang X-Y của sách B như SRS 7.1). |
| **Công thức tính phí ViToken** | `MOCK/GIẢ LẬP` | **Cao** | [`src/components/modals/IntelineModal.tsx:L61`](file:///F:/AppMaking/ViTudy/src/components/modals/IntelineModal.tsx#L61) (Hardcode `cost = 1`, không áp dụng công thức đầu vào/đầu ra và RAG token theo SRS 7.2). |
| **Sợi dây chỉ thị giác (Threads)** | `ĐÚNG MỘT PHẦN` | **Trung bình** | [`src/components/canvas/VisualLinkThreads.tsx:L78-L82`](file:///F:/AppMaking/ViTudy/src/components/canvas/VisualLinkThreads.tsx#L78-L82) (Vẽ được đường cong Bézier ghim note; nhưng khi xóa sách/note tại [`StudySpaceContext.tsx:L2448`](file:///F:/AppMaking/ViTudy/src/context/StudySpaceContext.tsx#L2448) không xóa threads, gây rò rỉ dữ liệu mồ côi). |

### Nhóm D: STudy (Học & Ôn Luyện)
| Chức Năng | Nhãn Kết Luận | Mức Độ | Bằng Chứng (File:Dòng) |
| :--- | :---: | :---: | :--- |
| **Động cơ Non-AI TextRank** | `SAI LUỒNG` | **Trung bình** | [`src/lib/nonAiEngine.ts:L92-L133`](file:///F:/AppMaking/ViTudy/src/lib/nonAiEngine.ts#L92-L133) (Đếm tần suất từ vựng thô sơ, không xây dựng đồ thị câu PageRank; tốc độ đọc ghi 200 từ nhưng chia 180; tách từ bằng dấu cách trắng không ghép từ tiếng Việt). |
| **Lộ trình học tương tác** | `MOCK/GIẢ LẬP` | **Cao** | [`src/components/modals/study-tools/RoadmapTab.tsx:L158-L180`](file:///F:/AppMaking/ViTudy/src/components/modals/study-tools/RoadmapTab.tsx#L158-L180) (Chỉ là danh sách tĩnh; không có deep link lật sách, không có nút tạo flashcard chặng hay kiểm tra 5 phút như SRS 4.2). |
| **Thuật toán lặp ngắt quãng SM-2** | `ĐÚNG MỘT PHẦN` | **Trung bình** | [`src/lib/sm2.ts:L21-L58`](file:///F:/AppMaking/ViTudy/src/lib/sm2.ts#L21-L58) & [`src/services/FlashcardService.ts:L18-L27`](file:///F:/AppMaking/ViTudy/src/services/FlashcardService.ts#L18-L27) (Công thức SM-2 toán học chuẩn xác; tuy nhiên `cardHash` băm nội dung chữ nên khi chỉnh sửa thẻ sẽ mất lịch sử ôn tập; timezone dùng UTC thay vì giờ Việt Nam). |
| **Hệ thống đề thi & Chế độ thi** | `ĐÚNG MỘT PHẦN` | **Cao** | [`src/components/objects/ExamQuizCard.tsx:L170-L242`](file:///F:/AppMaking/ViTudy/src/components/objects/ExamQuizCard.tsx#L170-L242) (Chỉ có trắc nghiệm chọn nút A/B/C/D; thiếu dạng Đúng/Sai nhiều mệnh đề, Điền từ, Tự luận ngắn; thiếu chế độ phòng thi khóa tra cứu; không khoanh được bằng bút). |
| **Ghi nhận điểm thi** | `SAI LUỒNG` | **Cao** | [`src/services/ActivityService.ts:L29-L44`](file:///F:/AppMaking/ViTudy/src/services/ActivityService.ts#L29-L44) & [`0008_learning.sql:L88-L113`](file:///F:/AppMaking/ViTudy/supabase/migrations/0008_learning.sql#L88-L113) (Client tự tính điểm và gửi `p_score, p_total, p_correct` lên server; server không chấm lại nên người dùng có thể gửi điểm giả tùy ý). |
| **Nạp đa định dạng tài liệu** | `ĐÚNG MỘT PHẦN` | **Cao** | [`src/services/OfficeParserService.ts:L95-L145`](file:///F:/AppMaking/ViTudy/src/services/OfficeParserService.ts#L95-L145) (Hỗ trợ tốt PDF, DOCX, PPTX; tuy nhiên không có chức năng nạp liên kết web URL hay video YouTube như SRS 4.1). |
| **Nhận diện chữ OCR** | `ĐÚNG` | **Thấp** | [`src/components/objects/PaperSheet.tsx:L77-L100`](file:///F:/AppMaking/ViTudy/src/components/objects/PaperSheet.tsx#L77-L100) (Nút ScanText trên tờ giấy ảnh nạp động `tesseract.js` và trích xuất chữ thành công). |

### Nhóm E: KnowInherit / Chợ Tài Liệu
| Chức Năng | Nhãn Kết Luận | Mức Độ | Bằng Chứng (File:Dòng) |
| :--- | :---: | :---: | :--- |
| **Kiểm duyệt AI & Chống spam** | `MOCK/GIẢ LẬP` | **Nghiêm trọng** | [`src/components/modals/KnowInheritPublishModal.tsx:L96-L115`](file:///F:/AppMaking/ViTudy/src/components/modals/KnowInheritPublishModal.tsx#L96-L115) (Giả lập kiểm duyệt bằng `setTimeout(1100ms)` và công thức số trang; không có AI chấm 4 tiêu chí hay quét trùng lặp). |
| **Nguồn dữ liệu Chợ** | `MOCK/GIẢ LẬP` | **Nghiêm trọng** | [`src/components/modals/MarketModal.tsx:L33-L48`](file:///F:/AppMaking/ViTudy/src/components/modals/MarketModal.tsx#L33-L48) (Nạp từ mảng tĩnh `marketMockData.ts`; không tải từ bảng Supabase `know_inherit_listings`; tài liệu người dùng đăng chỉ lưu tạm trong state rồi mất khi F5). |
| **Giao dịch mua bán & Chia 85/15** | `MOCK/GIẢ LẬP` | **Nghiêm trọng** | [`src/context/ViTokenContext.tsx:L259-L282`](file:///F:/AppMaking/ViTudy/src/context/ViTokenContext.tsx#L259-L282) & [`src/services/ViTokenService.ts:L111`](file:///F:/AppMaking/ViTudy/src/services/ViTokenService.ts#L111) (Hàm RPC `process_know_inherit_purchase` không hề được gọi; client tự trừ số dư React state; tác giả không nhận được tiền thực tế). |
| **Cơ chế Escrow & Khiếu nại** | `THIẾU` | **Cao** | Không tồn tại bất kỳ dòng mã hay bảng cơ sở dữ liệu nào cho cơ chế giữ tiền 24 giờ hay nút khiếu nại chất lượng. |
| **Bảo vệ bản quyền DRM & Xem trước** | `MOCK/GIẢ LẬP` | **Cao** | [`src/components/modals/MarketModal.tsx:L875-L885`](file:///F:/AppMaking/ViTudy/src/components/modals/MarketModal.tsx#L875-L885) (Chỉ hiển thị chuỗi văn bản trích dẫn thông thường; không có Watermark ẩn ID, không làm mờ trang sách PDF 10-15%). |

### Nhóm F: StudySpace 2.5D & Multiplayer
| Chức Năng | Nhãn Kết Luận | Mức Độ | Bằng Chứng (File:Dòng) |
| :--- | :---: | :---: | :--- |
| **Quy tắc Paper vs Book** | `SAI LUỒNG` | **Cao** | [`src/context/StudySpaceContext.tsx:L2184`](file:///F:/AppMaking/ViTudy/src/context/StudySpaceContext.tsx#L2184) (`pageCount <= 1 ? 'paper' : 'book'` khiến tài liệu 2-4 trang bị biến thành Sách mở đôi thay vì Tờ giấy A4 theo SRS 6.1). |
| **Gộp Binder & Tách trang** | `THIẾU` | **Trung bình** | [`src/context/StudySpaceContext.tsx:L1772`](file:///F:/AppMaking/ViTudy/src/context/StudySpaceContext.tsx#L1772) (`combineIntoBinder` không có bất kỳ nút hay thao tác UI nào gọi đến; tách trang tạo file mới nhưng không thể khôi phục về sách gốc). |
| **Lưu trữ Bàn học & Xung đột** | `SAI LUỒNG` | **Cao** | [`src/context/StudySpaceContext.tsx:L169`](file:///F:/AppMaking/ViTudy/src/context/StudySpaceContext.tsx#L169) (Tọa độ Camera `transform` hoàn toàn không được lưu, reset về 0 khi F5; xung đột ghi đè Last-Write-Wins không cảnh báo). |
| **Chuyển dữ liệu Guest sang Account** | `ĐÚNG MỘT PHẦN` | **Trung bình** | [`src/services/SyncService.ts:L97-L115`](file:///F:/AppMaking/ViTudy/src/services/SyncService.ts#L97-L115) (Di chuyển tài liệu và threads tốt; nhưng bỏ quên nét vẽ `strokes`, dẫn đến việc nét vẽ bút bị mất trắng khi đăng nhập). |
| **Cộng tác Multiplayer Realtime** | `MOCK/GIẢ LẬP` | **Nghiêm trọng** | [`src/components/canvas/MultiplayerCursorsLayer.tsx`](file:///F:/AppMaking/ViTudy/src/components/canvas/MultiplayerCursorsLayer.tsx) (Không được nhúng vào `InfiniteDesk.tsx`; con trỏ bạn học không xuất hiện; thao tác kéo thả và nét vẽ không đồng bộ giữa 2 máy; không có Yjs/CRDT; không kiểm tra quyền Viewer/Editor). |
| **Host Sponsor Toggle** | `THIẾU` | **Trung bình** | Không tồn tại bất kỳ dòng mã nào hiện thực quỹ tài trợ AI chung của chủ phòng theo SRS 6.3. |
| **Viewport Culling** | `ĐÚNG` | **Thấp** | [`src/lib/viewportCulling.ts:L20-L46`](file:///F:/AppMaking/ViTudy/src/lib/viewportCulling.ts#L20-L46) & [`src/components/canvas/InfiniteDesk.tsx:L444`](file:///F:/AppMaking/ViTudy/src/components/canvas/InfiniteDesk.tsx#L444) (Thuật toán bounding sphere culling loại bỏ vật thể ngoài màn hình hiệu quả; tuy nhiên chưa có bài đo tự động 50 vật thể ở 60 FPS). |

### Nhóm G: Xác Thực, Dữ Liệu & Bảo Mật
| Chức Năng | Nhãn Kết Luận | Mức Độ | Bằng Chứng (File:Dòng) |
| :--- | :---: | :---: | :--- |
| **Chính sách RLS cơ sở dữ liệu** | `SAI LUỒNG` | **Nghiêm trọng** | [`supabase/migrations/0001_hardening.sql:L624-L635`](file:///F:/AppMaking/ViTudy/supabase/migrations/0001_hardening.sql#L624-L635) (Cho phép `authenticated` tự insert/update vào `know_inherit_listings` mà không kiểm tra cột giá tiền hay điểm AI). |
| **Thống nhất bảng desk_documents** | `ĐÚNG` | **Thấp** | [`supabase/migrations/0002_desk_items_alignment.sql:L1-L70`](file:///F:/AppMaking/ViTudy/supabase/migrations/0002_desk_items_alignment.sql#L1-L70) (Bảng `desk_sticky_notes` đã deprecated thành công; toàn bộ vật thể bàn học gom về `desk_documents`). |
| **Bảo mật Supabase Edge Functions** | `SAI LUỒNG` | **Nghiêm trọng** | [`supabase/functions/sepay-webhook/index.ts:L4`](file:///F:/AppMaking/ViTudy/supabase/functions/sepay-webhook/index.ts#L4) (Lộ khóa API cứng trong mã nguồn; so sánh chuỗi không an toàn trước tấn công timing). |
| **Rò rỉ khóa môi trường Client Bundle** | `SAI LUỒNG` | **Cao** | [`src/lib/supabase.ts:L7-L8`](file:///F:/AppMaking/ViTudy/src/lib/supabase.ts#L7-L8) (Hardcode trực tiếp URL và Anon Key của dự án Supabase production thật vào tệp TypeScript tĩnh). |
| **Chính sách bảo mật CSP** | `THIẾU` | **Trung bình** | [`src/app/layout.tsx:L43-L74`](file:///F:/AppMaking/ViTudy/src/app/layout.tsx#L43-L74) & [`next.config.ts`](file:///F:/AppMaking/ViTudy/next.config.ts) (Hoàn toàn không cấu hình Content-Security-Policy dù tài liệu 08_FEATURE_STATUS ghi nhận là có). |
| **Xóa tài khoản vĩnh viễn** | `SAI LUỒNG` | **Cao** | [`supabase/functions/delete-user/index.ts:L37`](file:///F:/AppMaking/ViTudy/supabase/functions/delete-user/index.ts#L37) & [`0000_initial_schema.sql:L114`](file:///F:/AppMaking/ViTudy/supabase/migrations/0000_initial_schema.sql#L114) (Xóa tức thì không có ân hạn 3 ngày; kích hoạt `ON DELETE CASCADE` xóa sạch tài liệu tác giả đã bán trên Chợ, vi phạm cam kết FAQ). |

### Nhóm H: Điều Hướng, Trạng Thái & Trải Nghiệm Luồng
| Chức Năng | Nhãn Kết Luận | Mức Độ | Bằng Chứng (File:Dòng) |
| :--- | :---: | :---: | :--- |
| **Sơ đồ định tuyến & URL Params** | `ĐÚNG MỘT PHẦN` | **Trung bình** | [`src/app/page.tsx:L34-L65`](file:///F:/AppMaking/ViTudy/src/app/page.tsx#L34-L65) (Định tuyến `?view=desk` và `?space=` hoạt động; nhưng khách vãng lai bấm link `?room=` thì không gọi được `joinSpace` vì thiếu `user.id`). |
| **Phân tán nguồn sự thật (State)** | `SAI LUỒNG` | **Cao** | [`src/context/StudySpaceContext.tsx:L450-L650`](file:///F:/AppMaking/ViTudy/src/context/StudySpaceContext.tsx#L450-L650) (Dữ liệu bị lưu phân tán ở 4 nơi: React state, LocalStorage thường, LocalStorage theo user, và Supabase, dễ ghi đè mất nét vẽ khi tải lại). |
| **Chế độ Mobile Companion** | `THIẾU` | **Cao** | [`src/components/mobile/MobileCompanionView.tsx:L78-L150`](file:///F:/AppMaking/ViTudy/src/components/mobile/MobileCompanionView.tsx#L78-L150) (Chỉ là danh sách tài liệu đọc văn bản đơn giản; thiếu sạch các tính năng Flashcard, Trắc nghiệm, Inteline, Chợ theo SRS 6.4). |

### Nhóm I: Chất Lượng Kiểm Thử & Tài Liệu
| Chức Năng | Nhãn Kết Luận | Mức Độ | Bằng Chứng (File:Dòng) |
| :--- | :---: | :---: | :--- |
| **Độ bao phủ kiểm thử luồng (Coverage)** | `THIẾU` | **Nghiêm trọng** | 19 tệp test hiện có chỉ test các hàm logic thuần nhỏ; 0 kiểm thử cho quy trình thanh toán, trừ ViToken, mua bán Chợ, bảo mật RLS hay Multiplayer. |
| **Tính xác thực của 08_FEATURE_STATUS** | `LỆCH TÀI LIỆU` | **Nghiêm trọng** | [`docs/ai/08_FEATURE_STATUS.md:L18-L46`](file:///F:/AppMaking/ViTudy/docs/ai/08_FEATURE_STATUS.md#L18-L46) (Dẫn chứng các file đã bị xóa như `src/app/api/ai/chat/route.ts` và tự sáng tác các mục SRS 8.1-9.6 không tồn tại trong `SRS_ViTudy.md`). |
| **Mã chết không sử dụng (Dead code)** | `THIẾU` | **Trung bình** | Có ít nhất 9 tệp component/dịch vụ hoàn toàn không được import ở đâu (điển hình: [`MultiplayerCursorsLayer.tsx`](file:///F:/AppMaking/ViTudy/src/components/canvas/MultiplayerCursorsLayer.tsx), [`LandingPage.tsx`](file:///F:/AppMaking/ViTudy/src/components/landing/LandingPage.tsx), [`OcrTab.tsx`](file:///F:/AppMaking/ViTudy/src/components/modals/study-tools/OcrTab.tsx)). |

---

## 3. Danh Sách "Agent Hiểu Sai / Làm Sai Luồng"

### 1. Luồng mua tài liệu trên Chợ KnowInherit
- **SRS nói gì (SRS 5.2):** Mua tài liệu phải gọi RPC nguyên tử (`process_know_inherit_purchase`), kiểm tra số dư tại server, ghi nhận giao dịch sổ cái, trừ tiền người mua, cộng 85% cho tác giả và 15% cho sàn.
- **Mã làm gì:** Trong [`src/components/modals/MarketModal.tsx:L206`](file:///F:/AppMaking/ViTudy/src/components/modals/MarketModal.tsx#L206), hệ thống gọi hàm client `purchaseKnowledgeItem` trong [`ViTokenContext.tsx:L259`](file:///F:/AppMaking/ViTudy/src/context/ViTokenContext.tsx#L259). Hàm này chỉ tính nhẩm số học trong React State và lưu vào `localStorage`. Hàm RPC `process_know_inherit_purchase` trong [`ViTokenService.ts:L111`](file:///F:/AppMaking/ViTudy/src/services/ViTokenService.ts#L111) không hề được gọi ở bất kỳ đâu.
- **Hệ quả với người dùng:** Người mua không bị trừ ViToken thực tế trên cơ sở dữ liệu; tác giả tài liệu không nhận được tiền; tài liệu mua xong chỉ lưu tạm trong trình duyệt, chuyển máy tính hoặc đổi trình duyệt là mất toàn bộ.

### 2. Luồng trừ ViToken khi sử dụng AI
- **SRS nói gì (SRS 3.2 & 7.2):** Khi sử dụng AI hệ thống, ViToken phải được khấu trừ trực tiếp trên cơ sở dữ liệu thông qua RPC `debit_vitoken`, tự động khóa và cập nhật bảng `profiles`.
- **Mã làm gì:** Các tab học tập ([`SummaryTab.tsx:L51`](file:///F:/AppMaking/ViTudy/src/components/modals/study-tools/SummaryTab.tsx#L51), [`QuizTab.tsx:L126`](file:///F:/AppMaking/ViTudy/src/components/modals/study-tools/QuizTab.tsx#L126), [`FlashcardTab.tsx:L62`](file:///F:/AppMaking/ViTudy/src/components/modals/study-tools/FlashcardTab.tsx#L62), [`RoadmapTab.tsx:L53`](file:///F:/AppMaking/ViTudy/src/components/modals/study-tools/RoadmapTab.tsx#L53), [`IntelineModal.tsx:L66`](file:///F:/AppMaking/ViTudy/src/components/modals/IntelineModal.tsx#L66)) gọi trực tiếp hàm client `spendTokens(...)`. Hàm này chỉ trừ số dư trong React State và `localStorage['vitudy_wallet']`, hoàn toàn không gửi yêu cầu trừ tiền lên Supabase Cloud.
- **Hệ quả với người dùng:** Người dùng có thể F5 tải lại trang để hồi lại toàn bộ số dư ViToken đã tiêu; số dư hiển thị trên giao diện hoàn toàn lệch pha với số dư thực trong CSDL Supabase.

### 3. Phân loại tài liệu Paper (Tờ giấy) vs Book (Cuốn sách)
- **SRS nói gì (SRS 6.1 & Changelog):** Tài liệu từ 1 đến 4 trang là Tờ giấy A4 (`PaperSheet`). Tài liệu từ 5 trang trở lên mới đóng thành Cuốn sách mở đôi 3D (`BookSpread`).
- **Mã làm gì:** Trong [`src/context/StudySpaceContext.tsx:L2184`](file:///F:/AppMaking/ViTudy/src/context/StudySpaceContext.tsx#L2184), mã viết:
  ```ts
  const type: 'paper' | 'book' = pageCount <= 1 ? 'paper' : 'book';
  ```
- **Hệ quả với người dùng:** Các tài liệu bài tập hoặc tóm tắt ngắn từ 2, 3 đến 4 trang đều bị ép mở thành Cuốn sách bìa da cồng kềnh, làm vỡ trải nghiệm trực quan và công thái học của mặt bàn học.

### 4. Luồng xử lý Model Gemini trong AI hệ thống
- **SRS nói gì (SRS 3.2):** Cổng AI hệ thống hỗ trợ cả GPT-4o mini lẫn Gemini 2.5 Flash thông qua các gateway tương ứng của nhà cung cấp.
- **Mã làm gì:** Trong [`supabase/functions/ai-chat/index.ts:L398-L440`](file:///F:/AppMaking/ViTudy/supabase/functions/ai-chat/index.ts#L398-L440), hàm chỉ kiểm tra:
  ```ts
  if (provider === 'byok_gemini' || provider === 'oauth_gemini') { ... }
  else { // Mặc định chuyển sang fetch api.openai.com }
  ```
  Khi người dùng dùng AI hệ thống (`provider: 'system'`) và chọn model `gemini-2.5-flash`, Edge Function rơi vào nhánh `else` và gửi `model: 'gemini-2.5-flash'` sang máy chủ OpenAI.
- **Hệ quả với người dùng:** Yêu cầu bị OpenAI từ chối với mã lỗi 400 (Invalid Model). Hệ thống kích hoạt cơ chế hoàn token tự động và thông báo lỗi kết nối nhà cung cấp AI.

### 5. Xóa tài khoản người dùng và bảo lưu tài liệu
- **SRS nói gì (SRS 5.2 & FAQ):** Xóa tài khoản có thời gian ân hạn 3 ngày; các tài liệu đã bán trên Chợ tri thức cộng đồng vẫn được bảo lưu quyền truy cập cho những sinh viên đã bỏ tiền mua.
- **Mã làm gì:** Trong [`supabase/functions/delete-user/index.ts:L37`](file:///F:/AppMaking/ViTudy/supabase/functions/delete-user/index.ts#L37), hàm gọi ngay `auth.admin.deleteUser(userId)`. Do khóa ngoại `author_id` trong [`0000_initial_schema.sql:L114`](file:///F:/AppMaking/ViTudy/supabase/migrations/0000_initial_schema.sql#L114) đặt `ON DELETE CASCADE`, toàn bộ tài liệu đã niêm yết trên Chợ bị xóa sạch ngay lập tức.
- **Hệ quả với người dùng:** Không có thời gian ân hạn 3 ngày để khôi phục; người mua tài liệu bị mất quyền truy cập tài liệu mình đã trả tiền sở hữu.

---

## 4. Danh Sách "Giả Lập Được Trình Bày Như Thật" (Mock / Hardcoded)

| STT | Tính Năng Giả Lập | Vị Trí Mã Nguồn | Hiện Trạng Thực Tế Trong Mã |
| :---: | :--- | :--- | :--- |
| **1** | **Chấm điểm kiểm duyệt AI tài liệu Chợ** | [`src/components/modals/KnowInheritPublishModal.tsx:L96-L115`](file:///F:/AppMaking/ViTudy/src/components/modals/KnowInheritPublishModal.tsx#L96-L115) | Dùng `setTimeout(1100ms)` giả vờ quét, tính điểm bằng công thức: `Math.floor(70 + (pageCount * 3) + (words / 250))`. Hoàn toàn không có AI hay quét trùng lặp semantic. |
| **2** | **Danh sách sản phẩm trên Chợ KnowInherit** | [`src/components/modals/MarketModal.tsx:L33-L48`](file:///F:/AppMaking/ViTudy/src/components/modals/MarketModal.tsx#L33-L48) | Nạp từ tệp dữ liệu tĩnh [`src/data/marketMockData.ts`](file:///F:/AppMaking/ViTudy/src/data/marketMockData.ts). Người dùng đăng tài liệu mới chỉ lưu vào React state, tải lại trang là biến mất. |
| **3** | **Truy vấn ngữ cảnh thông minh Hybrid RAG** | [`src/components/modals/IntelineModal.tsx:L73-L75`](file:///F:/AppMaking/ViTudy/src/components/modals/IntelineModal.tsx#L73-L75) | Nối trực tiếp chuỗi text của trang đầu tiên (`pages[0].text`). Không hề có pgvector embeddings, không có vector search $K$ đoạn, không có Context Caching. |
| **4** | **Lộ trình học tập tương tác (Roadmap)** | [`src/components/modals/study-tools/RoadmapTab.tsx:L158-L180`](file:///F:/AppMaking/ViTudy/src/components/modals/study-tools/RoadmapTab.tsx#L158-L180) | Hiển thị danh sách card tĩnh với thời gian ước tính; không có chức năng deep link lật trang sách, không tạo được flashcard chặng, không tích xanh hoàn thành. |
| **5** | **Hàng chờ ngoại tuyến OfflineQueue** | [`src/services/OfflineQueue.ts:L37`](file:///F:/AppMaking/ViTudy/src/services/OfflineQueue.ts#L37) | Hàm `enqueue` không được gọi ở bất kỳ vị trí nào trong dự án; hàng đợi luôn luôn rỗng. |
| **6** | **Chế độ mô phỏng AI khi chưa có khóa** | [`supabase/functions/ai-chat/index.ts:L441-L444`](file:///F:/AppMaking/ViTudy/supabase/functions/ai-chat/index.ts#L441-L444) & [`src/lib/aiClient.ts:L300-L310`](file:///F:/AppMaking/ViTudy/src/lib/aiClient.ts#L300-L310) | Trả về chuỗi văn bản cứng định dạng sẵn `[ViTudy Trợ Lý Học Tập - Chế độ Trải nghiệm]` thay vì báo lỗi thiếu khóa máy chủ. |
| **7** | **Cộng tác con trỏ thời gian thực (Multiplayer)** | [`src/components/canvas/MultiplayerCursorsLayer.tsx`](file:///F:/AppMaking/ViTudy/src/components/canvas/MultiplayerCursorsLayer.tsx) | Tệp component chứa mã vẽ con trỏ nhưng không bao giờ được render lên màn hình; người dùng trong cùng phòng không thấy chuột của nhau. |

---

## 5. Rủi Ro Tiền Tệ Và Bảo Mật (Vulnerabilities & Exploits)

### 1. Tự do sửa số dư ViToken phía Client (Mức độ: Rất Cao)
- **Cơ chế:** Toàn bộ việc tiêu dùng ViToken cho AI (STudy, Inteline) và mua tài liệu Chợ đều chỉ trừ vào biến state của `ViTokenContext` và lưu trữ tại `localStorage.getItem('vitudy_wallet')`.
- **Cách tái hiện:**
  1. Mở DevTools Console trên trình duyệt.
  2. Chạy lệnh: `localStorage.setItem('vitudy_wallet', JSON.stringify({ balance: 999999, streakDays: 30, lastClaimDate: null, history: [] })); location.reload();`
  3. Sau khi tải lại trang, ví người dùng lập tức có 999.999 ViToken và có thể thoải mái gọi AI hoặc mở khóa tài liệu trên máy khách mà không cần nạp tiền.

### 2. Khai thác đặc quyền 5.000 ViToken của tài khoản tác giả (Mức độ: Rất Cao)
- **Cơ chế:** Trong [`src/context/ViTokenContext.tsx:L68-L71`](file:///F:/AppMaking/ViTudy/src/context/ViTokenContext.tsx#L68-L71), mã kiểm tra email tác giả trực tiếp từ `localStorage`:
  ```ts
  const storedEmail = localStorage.getItem('vitudy_user_email');
  if (storedEmail === 'namtacozz@gmail.com' && parsed.balance < 5000) {
    parsed.balance = 5000;
  }
  ```
- **Cách tái hiện:**
  1. Mở Console trình duyệt.
  2. Gõ lệnh: `localStorage.setItem('vitudy_user_email', 'namtacozz@gmail.com'); location.reload();`
  3. Người dùng lập tức nhận được 5.000 ViToken vào tài khoản mà không cần mật khẩu hay đăng nhập Google.

### 3. Nạp thử nghiệm 0đ trên môi trường Production (Mức độ: Cao)
- **Cơ chế:** Nút "Nạp thử nghiệm 0đ" trong [`src/components/payment/TopUpModal.tsx:L117-L121`](file:///F:/AppMaking/ViTudy/src/components/payment/TopUpModal.tsx#L117-L121) được kích hoạt nếu URL chứa tham số `dev=true`:
  ```ts
  const isDevMode = typeof window !== 'undefined' && (window.location.search.includes('dev=true') || ...);
  ```
- **Cách tái hiện:**
  1. Truy cập trang web chính thức trên GitHub Pages với URL: `https://<domain>/?view=desk&dev=true`
  2. Bấm vào biểu tượng ví ViToken góc trên bên phải để mở Modal Nạp tiền.
  3. Chọn một gói nạp và bấm "Tiếp tục quét mã". Nút "Nạp thử nghiệm 0đ kiểm thử đồ án" màu xám sẽ xuất hiện phía dưới mã QR.
  4. Bấm vào nút đó, hệ thống sẽ tự động cộng ngay 5 ViToken vào ví người dùng.

### 4. Lộ khóa bí mật Webhook Sepay trong mã nguồn (Mức độ: Nghiêm trọng)
- **Cơ chế:** Trong [`supabase/functions/sepay-webhook/index.ts:L4`](file:///F:/AppMaking/ViTudy/supabase/functions/sepay-webhook/index.ts#L4), Edge Function thiết lập khóa dự phòng cứng:
  ```ts
  const EXPECTED_API_KEY = Deno.env.get('SEPAY_API_KEY') || 'KDF8FCOKEG3KPUF890MHNXJHG1PW0VPYWJU6NNBRODVGZKS6MOAZMLJCLO5SRG2S';
  ```
  Nếu môi trường Supabase chưa gán biến `SEPAY_API_KEY`, bất kỳ ai cũng có thể gửi request giả mạo tới Webhook với header `Authorization: Apikey KDF8FCOKEG3KPUF890MHNXJHG1PW0VPYWJU6NNBRODVGZKS6MOAZMLJCLO5SRG2S` để nạp ViToken không giới hạn vào bất kỳ tài khoản nào.

### 5. Đăng bán tài liệu với điểm số AI và giá tiền giả mạo (Mức độ: Cao)
- **Cơ chế:** Chính sách RLS trên bảng `know_inherit_listings` ([`0001_hardening.sql:L624-L635`](file:///F:/AppMaking/ViTudy/supabase/migrations/0001_hardening.sql#L624-L635)) cho phép người dùng đăng nhập tự do `INSERT` và `UPDATE` các dòng có `author_id = auth.uid()` mà không có ràng buộc cột (column privilege) hay trigger kiểm tra tính hợp lệ của `ai_quality_score` hoặc `status`.
- **Cách tái hiện:**
  1. Người dùng đăng nhập tài khoản bình thường.
  2. Dùng Supabase Client gửi lệnh: `supabase.from('know_inherit_listings').insert({ title: 'Rác', ai_quality_score: 100, price_vitoken: 50000, status: 'published' })`.
  3. Lệnh này được CSDL chấp nhận 100% mà không qua bất kỳ kiểm duyệt nào.

---

## 6. Bảng Lệch Tài Liệu (Documentation Drift)

| Tài Liệu Dự Án Ghi Nhận | Sự Thật Trong Mã Nguồn Thực Tế | Bằng Chứng Mã Nguồn |
| :--- | :--- | :--- |
| **08_FEATURE_STATUS.md (Dòng 18-20):** Cổng AI Đa Chế Độ nằm tại `src/app/api/ai/chat/route.ts:L23-L144`. | Tệp `src/app/api/ai/chat/route.ts` **hoàn toàn không tồn tại** trong dự án (đã bị xóa bỏ do chuyển sang kiến trúc Static Export). | Thư mục `src/app/api` không tồn tại; mã AI thực tế nằm tại `src/lib/aiClient.ts` và Supabase Edge Function `ai-chat`. |
| **08_FEATURE_STATUS.md (Dòng 37-46):** Báo cáo đạt 100% cho các mục `SRS 8.1`, `SRS 8.4`, `SRS 8.5`, `SRS 9.1-9.6`. | Tài liệu gốc `SRS_ViTudy.md` chỉ có Phân hệ 0 đến Phân hệ 4 (mục 3 đến mục 7); **mục 8 là Schema SQL và mục 9 là Yêu cầu phi chức năng**, không hề có các mục tính năng này. | [`SRS_ViTudy.md:L284-L418`](file:///F:/AppMaking/ViTudy/SRS_ViTudy.md#L284-L418) |
| **08_FEATURE_STATUS.md (Dòng 46):** Thẻ meta CSP siết chặt an toàn kết nối nằm tại `src/app/layout.tsx`. | Tệp `src/app/layout.tsx` **hoàn toàn không có thẻ meta hay cấu hình Content-Security-Policy nào**. | [`src/app/layout.tsx:L1-L74`](file:///F:/AppMaking/ViTudy/src/app/layout.tsx#L1-L74) |
| **08_FEATURE_STATUS.md (Dòng 46):** PWA Web App Manifest nằm tại `src/app/manifest.ts`. | Tệp `src/app/manifest.ts` **không tồn tại**; dự án sử dụng tệp tĩnh `public/manifest.json`. | [`public/manifest.json`](file:///F:/AppMaking/ViTudy/public/manifest.json) |
| **08_FEATURE_STATUS.md (Dòng 38):** Đồng bộ dữ liệu ngoại tuyến qua `src/services/OfflineQueue.ts`. | Hàm `enqueue` của `OfflineQueue` **không bao giờ được gọi** ở bất kỳ đâu; hàng chờ hoàn toàn không hoạt động. | [`src/services/OfflineQueue.ts:L37`](file:///F:/AppMaking/ViTudy/src/services/OfflineQueue.ts#L37) |
| **05_API_AND_ROUTES.md (Dòng 62 & 95):** Provider chỉ có `'system' \| 'oauth_chatgpt'` và model `gemini-1.5-flash`. | Giao diện và client hỗ trợ 5 provider (`system`, `oauth_chatgpt`, `byok_gemini`, `byok_openai`, `byok_claude`) và danh sách model `gemini-2.5-flash`, `gpt-4o-mini`, v.v. | [`src/components/modals/AiConfigModal.tsx:L80-L85`](file:///F:/AppMaking/ViTudy/src/components/modals/AiConfigModal.tsx#L80-L85) |
| **04_DATA_MODEL.md (Dòng 78-88):** Bảng `public.desk_sticky_notes` là bảng đang hoạt động cho ghi chú và threads. | Bảng `desk_sticky_notes` **đã bị deprecated hoàn toàn** từ migration 0002; toàn bộ ghi chú chuyển sang lưu ở `desk_documents`. | [`supabase/migrations/0002_desk_items_alignment.sql:L67`](file:///F:/AppMaking/ViTudy/supabase/migrations/0002_desk_items_alignment.sql#L67) |

---

## 7. Các Kiểm Tra Chưa Thể Chạy & Lý Do

1. **Kiểm thử trực tiếp luồng Webhook Sepay qua ngân hàng thật:**
   - *Lý do:* Cần giao dịch chuyển khoản tiền thật qua tài khoản MBBank với mã nội dung chuyển khoản động (`VTxxxxxxxx`).
2. **Kiểm thử Discord Embedded Activity SDK:**
   - *Lý do:* Yêu cầu chạy trong ngữ cảnh `iframe` của Voice Channel trên ứng dụng Discord Client với Discord Client ID hợp lệ.
3. **Kiểm thử gọi trực tiếp Anthropic Claude API:**
   - *Lý do:* Chưa có khóa API `sk-ant-...` và backend Edge Function `ai-chat` chưa hỗ trợ endpoint của Anthropic.

---

## 8. Top 10 Việc Cần Sửa (Theo Thứ Tự Ưu Tiên)

1. **Khắc phục lỗ hổng tiền tệ ViToken phía Client (Ưu tiên: Khẩn cấp - Size: M):**
   - Loại bỏ việc cập nhật số dư tùy tiện trong `ViTokenContext.tsx`. Chuyển toàn bộ thao tác trừ tiền của AI và Chợ sang gọi RPC `debit_vitoken` hoặc xử lý thông qua Supabase Edge Function có xác thực JWT.
2. **Xóa bỏ các backdoor và khóa dự phòng cứng (Ưu tiên: Khẩn cấp - Size: S):**
   - Xóa bỏ việc kiểm tra email `namtacozz@gmail.com` ở `localStorage`; xóa bỏ khóa API fallback cứng `KDF8FCOKEG3...` trong `sepay-webhook/index.ts`; loại bỏ nút nạp thử 0đ qua tham số `?dev=true` trên production.
3. **Sửa lỗi gửi nhầm Model Gemini sang endpoint OpenAI (Ưu tiên: Cao - Size: S):**
   - Trong `supabase/functions/ai-chat/index.ts`, bổ sung điều kiện kiểm tra nếu `model.includes('gemini')` khi dùng `provider: 'system'` thì điều hướng gọi Google Generative Language API với `GEMINI_API_KEY` của hệ thống.
4. **Kết nối Chợ KnowInherit với CSDL Supabase thật (Ưu tiên: Cao - Size: L):**
   - Chuyển `MarketModal.tsx` từ nạp mock data `marketMockData.ts` sang truy vấn bảng `know_inherit_listings`; gọi RPC `process_know_inherit_purchase` khi nhấn Mua tài liệu; lưu tài liệu đăng bán mới vào CSDL thay vì chỉ lưu tạm trong state.
5. **Sửa quy tắc phân loại Paper vs Book (Ưu tiên: Cao - Size: S):**
   - Sửa dòng 2184 trong `src/context/StudySpaceContext.tsx` từ `pageCount <= 1 ? 'paper' : 'book'` thành `pageCount < 5 ? 'paper' : 'book'` đúng chuẩn SRS 6.1 để tài liệu 2-4 trang hiển thị dạng Tờ giấy A4.
6. **Kích hoạt hiển thị con trỏ và đồng bộ Multiplayer (Ưu tiên: Cao - Size: M):**
   - Nhúng `MultiplayerCursorsLayer` vào trong `InfiniteDesk.tsx`; kết nối sự kiện di chuột và cập nhật nét vẽ/vật thể vào kênh Supabase Realtime Broadcast để hiển thị con trỏ bạn học cùng phòng.
7. **Lưu trữ vị trí Camera (Transform) của bàn học (Ưu tiên: Trung bình - Size: S):**
   - Bổ sung việc lưu `transform` (`x, y, scale, rotation`) vào `localStorage` hoặc metadata của `study_spaces` để khi người dùng F5 tải lại trang không bị văng góc nhìn về tọa độ mặc định.
8. **Dọn dẹp liên kết và Threads mồ côi khi xóa vật thể (Ưu tiên: Trung bình - Size: S):**
   - Trong hàm `removeDeskItem` của `StudySpaceContext.tsx`, bổ sung logic lọc bỏ các `threads` có `sourceItemId === id` hoặc `targetStickyId === id`, đồng thời gọi RPC xóa thread mồ côi trên CSDL.
9. **Bổ sung di chuyển nét vẽ (Strokes) khi Guest đăng nhập (Ưu tiên: Trung bình - Size: M):**
   - Trong `SyncService.migrateToCloud`, bổ sung logic chuyển đổi mảng nét vẽ `strokes` từ `localStorage` lên bảng `desk_drawings` trên Supabase để sinh viên không bị mất nét vẽ bút chì/bút dạ khi tạo tài khoản.
10. **Làm sạch tài liệu 08_FEATURE_STATUS & Xóa mã chết (Ưu tiên: Trung bình - Size: S):**
    - Cập nhật lại toàn bộ bảng ma trận tiến độ trong `docs/ai/08_FEATURE_STATUS.md` cho khớp với thực tế; xóa bỏ các tệp component không được sử dụng (`MultiplayerCursorsLayer.tsx`, `LandingPage.tsx`, `OcrTab.tsx`).

---

> [!NOTE]
> Audit hoàn tất: 5/45 chức năng khớp SRS.
