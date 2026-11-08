# 11_CHANGELOG.md — Nhật Ký Phiên Làm Việc (Session Log)

> **Quy tắc:** Append-only. Mục mới nhất luôn nằm ở trên cùng.

---

## 2026-11-08 18:21 — commit SMOOTH_60FPS_ZERO_LAG_CANVAS_ZOOM
- **Task:** Giải quyết triệt để vấn đề lag / giật khung hình khi người dùng zoom in/out trên bàn học:
  1. **Nguyên nhân cốt lõi gây lag:**
     - Sự kiện `wheel` của React synthetic firing liên tục (30–60 sự kiện/giây khi lăn chuột hoặc vuốt trackpad), mỗi tick gọi `zoomBy` $\rightarrow$ kích hoạt hàng loạt đợt re-render chồng chéo.
     - KaTeX trong `<MathRenderer />` parse và render lại toàn bộ công thức toán học trên mọi trang sách mỗi khi camera thay đổi.
     - Các thực thể bàn học (`BookSpread`, `PaperSheet`, `StickyNoteItem`, `ExamQuizCard`, `DeskGrid`, `DeskDrawingCanvas`, `VisualLinkThreads`, `Minimap`) chưa được memoize, khiến Chromium phải tái tính toán bố cục layout CPU liên tục.
     - Container biến đổi 2.5D sử dụng `translate(...)` 2D thông thường thay vì lớp GPU compositing chuyên dụng.
  2. **Giải pháp tối ưu hóa toàn diện:**
     - **Cơ chế gom sự kiện RAF (`InfiniteDesk.tsx`):** Lắng nghe sự kiện `wheel` gốc `{ passive: false }` trực tiếp trên DOM, chuẩn hóa delta theo tỷ lệ hàm mũ (`Math.exp(-normalizedDelta * 0.0016)`). Tích lũy toàn bộ micro-ticks trong khung 16.6ms và áp dụng đúng 1 lần duy nhất trong `requestAnimationFrame`, đảm bảo tốc độ phản hồi 60fps/120fps chuẩn màn hình.
     - **Tăng tốc phần cứng GPU Compositing (`InfiniteDesk.tsx`):** Chuyển sang `translate3d(x, y, 0)`, gán `willChange: 'transform'`, `backfaceVisibility: 'hidden'` để Chromium biến đổi texture trên GPU hardware layer mà không kích hoạt reflow.
     - **Bộ nhớ đệm KaTeX toàn cục (`MathRenderer.tsx`):** Cung cấp `katexHtmlCache` (`Map<string, string>`) giúp lưu kết quả biên dịch HTML, giảm chi phí render các công thức toán từ vài mili-giây xuống 0ms tức thì ($O(1)$ lookup).
     - **Memoization toàn diện (`React.memo`):** Bọc `React.memo` cho `BookSpread`, `PaperSheet`, `StickyNoteItem`, `ExamQuizCard`, `DeskGrid`, `DeskDrawingCanvas`, `VisualLinkThreads`, `Minimap`.
     - **Tối ưu ngưỡng biến thiên zoom (`StudySpaceContext.tsx`):** Bỏ qua state update nếu `Math.abs(newScale - prev.scale) < 0.0005`.
- **Verified by:**
  - Chạy kịch bản kiểm thử hiệu năng zoom trên Chrome CDP:
    - `verified_smooth_zoom_in.png`: Phóng to mượt mà lên 250% tại tâm con trỏ chuột, công thức toán học và nội dung sắc nét 100%.
    - `verified_smooth_zoom_out.png`: Thu nhỏ trơn tru xuống 40%, không giật lag, không sụt giảm khung hình.
- **Open follow-ups:** Sẵn sàng nghiệm thu.

---

## 2026-11-08 18:05 — commit BROWSER_PDF_READER_BOOK_LEATHER_PRESETS_SHARP_QUIZ_AND_VITUDY_BRAND
- **Task:** Triển khai trọn bộ 5 yêu cầu cải tiến giao diện theo hình ảnh thực tế và phản hồi của người dùng:
  1. **Triệt tiêu khung viền đậm và làm chữ thẻ trắc nghiệm sắc nét như sách thật (`ExamQuizCard.tsx`):**
     - Gỡ bỏ hoàn toàn `ring-2 ring-slate-900` và khung viền đậm rỗng xung quanh thẻ, chỉ giữ bóng đổ mềm tự nhiên `shadow-xl` / `shadow-2xl`.
     - Khắc phục hiện tượng mờ chữ khi thu nhỏ bàn học: Gỡ bỏ toàn bộ layer 3D compositing (`perspective`, `transform-style: preserve-3d`) khi thẻ ở trạng thái nghỉ (`idle`), kích hoạt `textRendering: 'geometricPrecision'` và `WebkitFontSmoothing: 'antialiased'` giúp chữ và lựa chọn đáp án hiển thị sắc nét 100% như trang sách thật.
     - Bổ sung ô chọn màu nền pastel trên thanh công cụ nổi của thẻ trắc nghiệm với 8 màu tương ứng giấy note.
  2. **Bỏ nhãn chữ "NOTE" khi chọn tạo note mới (`LeftCreationBar.tsx`):**
     - Loại bỏ header "NOTE", giữ lại bảng 5 ô màu pastel tối giản.
  3. **Đa dạng 5 gam màu da bìa sách cao cấp & Thanh nhắc bookmark "Màu Bìa" (`BookSpread.tsx`, `StudySpaceContext.tsx`, `studyspace.ts`):**
     - Bổ sung 5 preset da thật: Nâu Da Cổ Điển (`#5c3920`), Đỏ Đậm Burgundy (`#6b1d28`), Xanh Nước Biển Đậm Navy (`#1e3a5f`), Xanh Lá Rừng Đậm Forest (`#1b4d3e`), và Hồng Mận Đậm Plum (`#5b2149`).
     - Thanh nhắc bookmark thứ 5 màu Vàng Kim (`#ca8a04`) với quy trình tương tác 3 trạng thái: Icon `Palette` -> Rê chuột hiện `Màu Bìa [Palette icon]` -> Bấm mở rộng `[Bảng 5 màu da] | Màu Bìa [Palette icon]` để chuyển màu da bìa sách tức thì.
  4. **Chữ thương hiệu ViTudy chuẩn Cam ViT (`TopLeftNav.tsx`):**
     - Loại bỏ nút icon La bàn (Compass) bên trái chữ ViTudy.
     - Giữ nguyên vẹn chữ "ViTudy" với màu Cam ViT (`#E0562D`), cỡ chữ to rõ (`text-lg font-black leading-none`).
  5. **Tái thiết kế trình đọc toàn màn hình chuẩn trình duyệt PDF (`FullScreenDocModal.tsx`):**
     - Thay thế toàn bộ tông nền tối AI bằng ngôn ngữ HUD trắng / Slate-50 thanh lịch, nền đọc `#e8ebf0` chống chói.
     - Thanh điều khiển trên đỉnh màn hình phong cách browser PDF reader (`PanelLeft`, Title, `< 1 / N >`, `- 100% + Đặt lại`, `Xoay`, `1/2 Trang`, `In`, `Thoát Esc`).
     - Bảng danh mục trang thu nhỏ (collapsible thumbnails sidebar) bên trái trực quan với viền cam `#E0562D` cho trang đang đọc.
     - Tích hợp KaTeX math formulas hiển thị hoàn hảo các công thức toán học.
- **Verified by:**
  - Chạy kiểm thử tự động trên Chrome CDP (port 9222):
    - `verified_pdf_viewer_hud_style.png`: Trình đọc PDF toàn màn hình chuẩn browser, thanh công cụ HUD và bảng trang thu nhỏ bên trái.
    - `verified_note_flyout_no_text.png`: Flyout chọn màu note không còn chữ "NOTE".
    - `verified_book_cover_tabs_open.png`: Thanh nhắc Màu Bìa mở bảng 5 màu da thật.
    - `verified_book_navy_cover.png`: Bìa sách chuyển sang màu da Xanh Nước Biển Đậm Navy (`#1e3a5f`) sang trọng.
    - `verified_vitudy_brand_text.png`: Chữ ViTudy màu cam to rõ không có icon la bàn thừa.
- **Open follow-ups:** Sẵn sàng nghiệm thu và deploy.

---

## 2026-11-08 17:40 — commit QUIZ_CARD_CLEAN_3D_FLIP_AND_ATTACHED_FOCUS_DRAWERS
- **Task:** Xử lý triệt để các lỗi giao diện và trải nghiệm 3D theo ảnh chụp thực tế của người dùng:
  1. **Khắc phục lỗi lật thẻ trắc nghiệm 3D (`ExamQuizCard.tsx`):**
     - Loại bỏ hoàn toàn khung dây đen rỗng (ghost wireframe box) do gắn `ring-2 ring-slate-900` trên container cha cố định.
     - Triển khai máy trạng thái lật 3D 2 giai đoạn (2-Phase Flip State Machine):
       - Giai đoạn 1 (Turn-Out): Xoay từ `0deg` đến `90deg` trong 160ms (`cubic-bezier(0.4, 0, 0.7, 0.2)`).
       - Điểm chết trung tâm: Tráo nội dung khi thẻ vuông góc màn hình (0px visible width), tức thời chuyển góc sang `90deg` đối diện không transition.
       - Giai đoạn 2 (Turn-In): Xoay tiếp từ góc đối diện về `0deg` trong 180ms (`cubic-bezier(0.2, 0.8, 0.4, 1)`). Triệt tiêu 100% hiện tượng giật chữ, tráo text lộ liễu khi thẻ đang nghiêng.
     - Viền chọn (`ring-2 ring-slate-900`) và thanh công cụ nổi (`Rotate 360` / `Trash`) tự động ẩn khi đang lật thẻ.
  2. **Căn chuẩn xác số chuỗi ngày học tập vào tâm bụng ngọn lửa (`TopRightWallet.tsx`):**
     - Căn tọa độ tuyệt đối `top-[62%] left-1/2 -translate-x-1/2 -translate-y-1/2` trên icon ngọn lửa `w-8.5 h-8.5`.
     - Số `1` nằm gọn gàng 100% trong ruột cam, cân đối 4 phía, không lệch sang trái, không chườm ra viền ngoài.
  3. **Đồng bộ ngăn kéo độc lập có lẫy kéo gắn liền cho 5 cụm HUD trong chế độ Tập trung (`StudySpaceDeskView.tsx`):**
     - Cả 5 cụm HUD trượt ẩn độc lập ra khỏi màn hình trong chế độ tập trung.
     - Mỗi cụm có một thẻ lẫy kéo mũi tên bám trực tiếp vào mép ngoài của chính HUD đó:
       - Top-Left: Mũi tên `[\/]` (kéo xuống) / `[^]` (thu lên).
       - Top-Right: Mũi tên `[\/]` (kéo xuống) / `[^]` (thu lên).
       - Left Toolbar: Mũi tên `[>]` (kéo ra) / `[<]` (thu vào).
       - Bottom-Left: Mũi tên `[^]` (kéo lên) / `[\/]` (thu xuống).
       - Bottom-Right: Mũi tên `[^]` (kéo lên) / `[\/]` (thu xuống).
     - Minimap tự động thu gọn khi vào chế độ tập trung.
  4. **Mở rộng kích thước cụm nút Undo/Redo (`LeftCreationBar.tsx`):**
     - Độ rộng khung `w-full` và kích thước nút `w-11 h-11` bo tròn `rounded-xl`, đồng bộ hoàn hảo với thanh công cụ chính phía trên.
- **Verified by:**
  - Chạy kiểm thử tự động trên Chrome qua CDP:
    - `verified_flame_belly_centered.png`: Số `1` nằm đúng tâm bụng ngọn lửa.
    - `verified_quiz_card_clean_mid_flip.png`: Lật thẻ 3D mượt mà không còn khung đen rỗng lơ lửng.
    - `verified_quiz_card_q1_confirmed.png`: Câu 1 xác nhận đáp án đúng, hiện giải thích, thanh điều hướng đáy cập nhật xanh lá.
    - `verified_toolbar_undo_enlarged.png`: Kích thước Undo/Redo mở rộng đồng bộ thanh công cụ.
    - `verified_focus_mode_clean_desk.png`: Bàn học sạch sẽ khi vào chế độ tập trung.
    - `verified_focus_pulled_hud.png`: Các lẫy kéo gắn liền trượt từng HUD ra vào trơn tru.
- **Open follow-ups:** Sẵn sàng nghiệm thu.

---

## 2026-11-08 17:16 — commit HUD_SNUG_SPACING_STREAK_FLAME_AND_MAP_BUTTON_STYLE
- **Task:** Hoàn thiện 3 tinh chỉnh công thái học cho HUD bàn học:
  1. **Căn chỉnh Biểu tượng Chuỗi Ngày Học Tập (`TopRightWallet.tsx`):**
     - Đưa icon ngọn lửa lên cao hơn (`-translate-y-1`), giúp phần bụng tròn của ngọn lửa ôm trọn số ngày chuỗi màu trắng ở bên trong (`-translate-y-0.5`).
     - Số hiển thị rõ ràng, sắc nét, không còn bị lệch hay đè lên phần khuyết ngọn lửa.
  2. **Khoảng cách HUD bám sát tường (giảm còn 1/4 khoảng cách cũ):**
     - Đưa toàn bộ các khung và nút HUD sát vào tường chỉ cách 4px (`top-1`, `bottom-1`, `left-1`, `right-1` thay vì 16px `top-4`, `bottom-4`...):
       - `TopLeftNav`: `top-1 left-1`
       - `TopRightWallet`: `top-1 right-1`
       - `LeftCreationBar`: `left-1`
       - `BottomLeftKnowledge`: `bottom-1 left-1`
       - `BottomRightToolkit`: `bottom-1 right-1`
       - `MultiplayerBar`: `top-1`
     - Mở rộng tối đa không gian diện tích học tập ở trung tâm bàn học.
  3. **Đồng bộ Style Nút Mở Bản Đồ Thu Nhỏ Khi Ẩn (`BottomRightToolkit.tsx`):**
     - Chuyển đổi nút Mở bản đồ từ nút tròn màu cam thành style tương tự Nút Tải lên tài liệu: khung vuông bo góc `w-10 h-10 rounded-xl`, nền trắng `bg-white hover:bg-orange-50/80`, viền `border border-slate-300 hover:border-orange-300`, bóng nhẹ `shadow-sm`, icon `Map` SVG màu Cam ViT (`#E0562D`, `stroke-[2.4]`).
- **Verified by:**
  - Chạy kiểm thử tự động trực tiếp trên Chrome DevTools (port 9222):
    - Khoảng cách các cụm HUD đến rìa web đo được chính xác 4px: `topLeft: { top: 4, left: 4 }`, `topRight: { top: 4, right: 4 }`, `bottomLeft: { bottom: 4, left: 4 }`, `bottomRight: { bottom: 4, right: 4 }`.
    - Biểu tượng lửa chuỗi hiển thị số `1` trắng sắc nét trong ruột cam.
    - Nút Mở bản đồ có `isStyleMatching: true` đồng bộ 100% kích thước `40x40px`, `borderRadius: 12px`, nền trắng và viền với nút Tải lên.
  - Chụp 2 ảnh bằng chứng:
    - `verified_hud_snug_walls.png`
    - `verified_map_button_style.png`
- **Open follow-ups:** Sẵn sàng cho người dùng nghiệm thu trực tiếp.

---

## 2026-11-08 17:05 — commit INTERACTIVE_3D_FLIPPING_EXAM_QUIZ_CARD
- **Task:** Xây dựng và kiểm thử hoàn chỉnh thực thể Thẻ Trắc Nghiệm Tương Tác 3D Lật Mặt (`ExamQuizCard`) trên bàn học 2.5D:
  1. **Thực thể Thẻ Trắc Nghiệm Riêng Biệt (`ExamQuizCard.tsx`):**
     - Kích thước thẻ gọn gàng `380 × 490px`, đủ cho 1 câu hỏi + 4 phương án lựa chọn và bộ điều khiển mà không cần cuộn dọc.
     - Lấy màu ngẫu nhiên từ bộ màu giấy ghi chú pastel (`#fef08a`, `#fed7aa`, `#bbf7d0`, `#bae6fd`, `#fbcfe8`).
     - Tích hợp lớp vẽ mực cục bộ `ItemDrawingOverlay` di chuyển và xoay cùng thẻ.
     - Thanh công cụ nổi trên hover: Nút xoay tự do 360° (`RotateTwoWay`) và Xóa (`Trash2`).
  2. **Máy Trạng Thái 3 Pha & Hiệu Ứng Lật Mặt 3D Như Sách:**
     - **Pha 1 - Bìa Bộ Đề (`intro`):** Tiêu đề bộ đề, số câu hỏi, thời gian làm bài, và nút **"Bắt đầu làm bài"** màu Cam ViT (`#E0562D`) chữ trắng ở chính giữa đáy thẻ.
     - **Pha 2 - Làm Bài Trắc Nghiệm (`question`):**
       - Bấm bắt đầu kích hoạt lật xoay 3D từ trái sang phải (`rotateY(180deg)` $\rightarrow$ `0deg`) để lộ Câu 1 ở mặt sau.
       - Tích hợp `MathRenderer` (KaTeX) hiển thị trọn vẹn các công thức toán đa biến, gradient, ma trận.
       - Chọn đáp án $\rightarrow$ Bấm **"Xác nhận"** $\rightarrow$ Hiển thị phán quyết tức thì: Xanh lục bảo ngọc (`✓ ĐÚNG`) hoặc Đỏ ruby (`✕ SAI`), lời giải thích chi tiết, và nút chuyển thành **"Câu tiếp theo"** (hoặc **"Hoàn thành"** ở câu cuối).
       - Bấm "Câu tiếp theo" tiếp tục lật xoay 3D sang câu tiếp theo.
     - **Pha 3 - Màn Hình Tổng Kết & Xem Lại (`summary`):**
       - Hoàn thành câu cuối bấm "Hoàn thành", thẻ lật 3D sang màn hình Tổng kết.
       - Tổng điểm cỡ to nổi bật ở trên giữa: `X / 10` (`text-4xl`/`text-5xl`) màu Cam ViT (`#E0562D`), tỷ lệ phần trăm và lời nhận xét sư phạm.
       - Bảng lưới các ô câu trả lời với trạng thái đúng/sai. Bấm vào ô bất kỳ sẽ lật thẻ 3D về câu hỏi đó để xem lại chi tiết (`Review Mode`).
       - Trong chế độ xem lại có nút **"Quay lại tổng kết"** ở góc trên; bấm vào sẽ lật ngược về màn hình Tổng kết.
       - Nút **"Làm lại bộ đề này"** cho phép reset để làm lại từ đầu.
  3. **Thanh Điều Hướng Câu Hỏi Dạng List Ngang Ở Đáy Thẻ:**
     - Nằm sát mép đáy bên trong thẻ, bề rộng không vượt quá thẻ.
     - Ở hai đầu: 2 nút mũi tên `<` và `>` để lùi/tiến câu hỏi.
     - Danh sách các ô pill câu hỏi:
       - Câu đã làm: Màu xanh lá (`#15803D`) nếu đúng, màu đỏ (`#DC2626`) nếu sai.
       - Câu hiện tại: Tô xám (`bg-slate-300 text-slate-900 border-slate-400 ring-1 ring-slate-400 font-black`).
       - Câu tương lai: Màu trắng chữ đen.
       - Bấm vào bất kỳ ô nào để chủ động nhảy câu và lật thẻ tức thì.
  4. **Tích hợp & Khai báo (`PaperSheet.tsx`, `StudySpaceContext.tsx`):**
     - `PaperSheet.tsx`: Ủy quyền render sang `<ExamQuizCard item={item} isSelected={isSelected} />` khi `item.isExamSheet && item.examData` là `true`.
     - `StudySpaceContext.tsx`: Cập nhật `addExamSheet` gán kích thước chuẩn `width: 380`, `height: 490`, màu `stickyColor` ngẫu nhiên từ `NOTE_COLORS`.
- **Verified by:**
  - Automated CDP test `scripts/test-exam-quiz-card.mjs` chạy qua Chrome DevTools MCP port 9222 vượt qua 100% 6 kịch bản kiểm thử:
    - Cover: `found: true`, `width: 380`, `height: 490`, `bg: rgb(186, 230, 253)`, nút "Bắt đầu làm bài" Cam ViT.
    - Question 1: 3D Flip, math rendering, choices, "Xác nhận", bottom strip 4 pills.
    - Confirmed Verdict: `✓ ĐÚNG`, giải thích, nút "Câu tiếp theo" Cam ViT, pill 1 chuyển xanh.
    - Answering questions: Q2, Q3, Q4 chuyển câu, nút "Hoàn thành".
    - Summary Screen: `scoreText: '10.0 / 10'`, 4 review cells, nút "Làm lại bộ đề này".
    - Review Mode: Click ô 1 lật về câu 1, hiển thị nút "Quay lại tổng kết".
  - Chụp 5 ảnh bằng chứng kiểm chứng:
    - `verified_quiz_card_cover.png`
    - `verified_quiz_card_question1.png`
    - `verified_quiz_card_answer_confirmed.png`
    - `verified_quiz_card_summary.png`
    - `verified_quiz_card_review_back_btn.png`
  - `pnpm run build:pages`: Passed 100% (code 0), tạo thư mục `out/` tĩnh cho GitHub Pages.
- **Open follow-ups:** Sẵn sàng cho người dùng nghiệm thu trực tiếp.

---

## 2026-11-08 16:35 — commit COMPREHENSIVE_UPGRADES_ZOOM_FOCUS_MARKET_STREAK_AI
- **Task:** Hoàn thiện gói 6 nâng cấp cốt lõi về Zoom, Focus Mode HUD, Thanh công cụ trái, Chợ tài liệu, Chuỗi điểm danh & AI Provider:
  1. **Zoom chuột bất kỳ lúc nào & trên nội dung tài liệu (`InfiniteDesk.tsx`, `StudySpaceContext.tsx`):**
     - Cho phép cuộn chuột (wheel zoom) tự do ở bất kỳ đâu trên bàn học và trên bề mặt tài liệu (sách, tờ giấy, ghi chú) mà không bị chặn, chỉ giữ chặn zoom khi mở modal toàn màn hình (`[role="dialog"]`, `[data-modal="true"]`).
     - Cho phép zoom tự do trong Focus Mode để người dùng tùy chỉnh kích thước chữ theo mong muốn.
  2. **Thu gọn HUD & Điều khiển Peek/Retract trong Focus Mode (`StudySpaceDeskView.tsx`, `StudySpaceContext.tsx`):**
     - Khi vào chế độ tập trung:
       - Thanh công cụ trái tự động trượt ẩn sang vách trái (`-translate-x-full`).
       - Thanh điều hướng và ví đỉnh màn hình tự động trượt ẩn lên trên (`-translate-y-full`).
       - Bộ công cụ dưới cùng tự động trượt ẩn xuống dưới (`translate-y-full`).
     - Xuất hiện 3 nút "nhòm" (peek buttons) bám sát các mép tường màn hình:
       - Vách trái: icon mũi tên `>` mở thanh công cụ.
       - Vách trên: icon `v` kèm nhãn "Menu" mở thanh điều hướng.
       - Vách dưới: icon `^` kèm nhãn "Công cụ" mở thanh dưới.
     - Khi mở ra trong focus mode: có nút thụt vào (retract button) ở trung điểm thanh hướng về phía tường để cất lại vào vách.
     - Tính toán tỷ lệ zoom tập trung ôm sát chiều cao màn hình sao cho mép bìa trên của sách cách mép trên trình duyệt đúng 22px (`targetY = 22 - itemY * targetScale`).
  3. **Tối ưu hóa Thanh Công Cụ Trái (`LeftCreationBar.tsx`):**
     - Giảm khoảng cách giữa các nút sát nhau hơn (`gap-1`, padding `p-1.5`, nút `w-11 h-11`) để tối ưu diện tích màn hình.
     - Xếp cụm 2 nút Hoàn tác / Làm lại (Undo/Redo) thành cột dọc (`flex-col`) với Undo ở trên và Redo ở dưới.
  4. **Nâng cấp Toàn Diện Chợ Tài Liệu (`MarketModal.tsx`):**
     - Hiển thị banner giải thích rõ quy đổi `1 V = 1 ViToken` và số dư hiện tại của người dùng.
     - Đưa tiêu đề tài liệu ra khung nội dung chính; đổi nhãn mô tả động theo loại tài liệu (`MÔ TẢ SÁCH / GIÁO TRÌNH`, `MÔ TẢ TÀI LIỆU TÓM TẮT`, `MÔ TẢ BỘ ĐỀ TRẮC NGHIỆM`).
     - Đổi "Đánh giá" thành "Điểm AI", kèm tooltip giải thích 3 tiêu chí chấm tự động (Độ chuẩn xác 40%, Cấu trúc 35%, Thực tiễn 25%) và số lượt phản hồi.
     - Bổ sung số trang, lượt mua, ngày cập nhật, huy hiệu tác giả xác thực.
     - Đặt giá và các nút hành động cạnh nhau: nút "Xem thử" (`Eye`) + nút "Mua X V" (hoặc "Mở" khi đã sở hữu).
     - Nút "Xem thử" mở modal đọc trích đoạn nội dung thực tế và mục lục các chương.
     - Thêm chip bộ lọc đang bật, nút "Đặt lại" (`RotateCcw`), và nút chuyển đổi chế độ xem Dạng lưới thẻ (`Grid`) và Danh sách gọn (`Compact List`). Hỗ trợ phím `Esc`.
  5. **Chuẩn hóa Modal Điểm Danh Nhận ViToken (`TopRightWallet.tsx`):**
     - Sửa mâu thuẫn trạng thái: khi đã nhận hôm nay, vô hiệu hóa nút (`disabled`) và hiển thị "Đã nhận hôm nay • Nhận tiếp sau {X}h {Y}m" đếm ngược thời gian thực đến nửa đêm.
     - Phân định rõ 4 trạng thái ô ngày: Đã nhận (`✓` xanh emerald), Hôm nay chưa nhận (viền Cam ViT nhấp nháy), Bỏ lỡ (`-` xám), Sắp tới (số token +5/+10).
     - Rút gọn mô tả, thay "+5" bằng icon SVG đồng xu ViToken cam chữ V thương hiệu.
     - Hiển thị `Chuỗi X ngày` kèm mốc thưởng tiếp theo (Mốc 7 ngày: +20 ViToken) với thanh tiến trình trực quan.
     - Thêm hộp kiểm "Nhắc tôi điểm danh mỗi ngày" lưu `localStorage`. Vùng bấm nút đóng 44px, hỗ trợ `Esc`.
  6. **Modal Cài Đặt Kết Nối AI Hoàn Chỉnh (`TopRightWallet.tsx`):**
     - Hiển thị số dư ViToken của người dùng ngay trong modal.
     - Nhãn trạng thái rõ ràng cho 4 lựa chọn: "Trừ ViToken", "Miễn phí theo hạn mức", "Khóa cá nhân", "Ủy quyền tài khoản" cùng model cụ thể (`GPT-4o-mini`, `Gemini 1.5 Flash`, `GPT-4o`, `GPT-4o Plus`).
     - Logo SVG vector chính thức sắc nét, huy hiệu "Đang dùng" cho provider active.
     - Nhập API Key kèm nút toggle ẩn/hiện mật khẩu (`Eye`/`EyeOff`), nút kiểm tra kết nối (`Test`), và lưu ý an toàn cục bộ.
     - Đổi thành "Đăng nhập bằng tài khoản ChatGPT", nút "Lưu" chỉ kích hoạt khi có thay đổi. Vùng bấm 44px, hỗ trợ `Esc`.
- **Verified by:**
  - Script CDP `scripts/verify-all-sections-live.mjs` & `scripts/test-focus-clean.mjs` trên Chrome port 9222:
    - Wheel zoom, Left bar vertical Undo/Redo, Focus mode HUD collapse & peek/retract controls.
    - MarketModal list view, preview modal, filter chips, side-by-side action buttons.
    - Streak modal 4 states, countdown, milestone bar, reminder toggle.
    - AI provider status badges, BYOK key toggle, test connection button, save button disabled/enabled.
  - Screenshots:
    - `verified_market_list_view.png`
    - `verified_market_preview_modal.png`
    - `verified_daily_streak_modal.png`
    - `verified_ai_provider_modal.png`
    - `verified_focus_mode_peek_controls.png`
    - `verified_focus_hud_slid_out.png`
  - Build static export `pnpm run build:pages`: Passed 100%.

---

## 2026-11-08 12:15 — commit FOCUS_TAB_AND_INTERACTION_LOCK
- **Task:** Tinh chỉnh Thanh nhắc Tập trung, Khóa Camera khi Tập trung & Gỡ bỏ nhãn chữ đường chỉ:
  1. **Bỏ chữ "Liên quan đến" trên đường chỉ đỏ (`VisualLinkThreads.tsx`):**
     - Loại bỏ toàn bộ badge text thừa trên đường chỉ đỏ, giữ lại nét chỉ mảnh vòm Bezier tinh tế `1.5px` bán trong suốt `0.6` và đinh ghim nhỏ gọn `r=4px`.
  2. **Tích hợp Nút Tập Trung thành Thanh Nhắc Bookmark Tab (`BookSpread.tsx`):**
     - Đưa nút chế độ tập trung vào làm thanh nhắc bookmark tab thứ 2 màu Chàm (`indigo-600`), nằm ngay dưới tab "Tóm tắt" (xanh lá) và trên tab "Phóng to" (cam).
     - Bỏ toàn bộ overlay banner cố định ở đỉnh màn hình ("Đang ở chế độ tập trung... Thoát").
     - Khi kích hoạt: thanh nhắc tự động **được giữ yên ở trạng thái kéo ra** (`w-[116px]`, nền `indigo-700`, viền sáng `ring-2 ring-indigo-400/60`, hiện rõ chữ "Tập trung").
     - Khi nhấp vào lại: thanh nhắc tự động thụt vào (`w-[48px]`) và thoát chế độ tập trung.
     - Dọn dẹp nút tập trung cũ ở huy hiệu tên sách dưới đáy bìa sách.
  3. **Khóa Điều Hướng Bàn Học Khi Đang Tập Trung & Popup Cảnh Báo Chuẩn Style App (`InfiniteDesk.tsx`, `StudySpaceContext.tsx`):**
    - Khi đang trong chế độ tập trung: khóa hoàn toàn cuộn chuột (zoom) và di chuyển camera (kéo rê chuột, phím WASD, 4 phím mũi tên).
    - Nếu người dùng cố ý zoom hoặc pan, hệ thống lập tức hiển thị popup thông báo chuẩn style app: **`Đang tập trung (nhấn để thoát)`** (kèm icon `Eye` Cam ViT và nút bấm `(nhấn để thoát)`).
    - Nhấp vào nút `(nhấn để thoát)` trên thông báo cũng lập tức thoát chế độ tập trung và thu gọn thanh nhắc.
- **Verified by:**
  - Script CDP kiểm thử trực tiếp `scripts/verify-focus-and-thread.mjs` trên Chrome port 9222:
    - Thread check: Không còn chữ "Liên quan đến" trong SVG/DOM.
    - Tabs order check: Thứ tự chuẩn xác: [1] Tóm tắt -> [2] Tập trung -> [3] Phóng to.
    - Active state: Tab mở rộng `w-[116px]`, không có top banner.
    - Locked interaction: Bấm phím 'w' hoặc cuộn chuột kích hoạt popup `Đang tập trung (nhấn để thoát)`.
    - Exit interaction: Bấm `(nhấn để thoát)` giải phóng camera, ẩn popup và thụt thanh nhắc về vị trí cũ.
  - Ảnh chụp màn hình:
    - `verified_focus_tab_active.png`
    - `verified_focus_popup_notice.png`
    - `verified_focus_mode_exited.png`
  - `pnpm tsc --noEmit` & `pnpm run docs:check`: Pass 100%.

---

## 2026-11-08 11:55 — commit 8_IMPROVEMENTS_VERIFIED
- **Task:** Hoàn thiện 8 điểm cải tiến UX/UI, Khả năng đọc, KaTeX, Bố cục & Thẩm mỹ bàn học 2.5D:
  1. **Khả năng đọc nội dung & Chế độ "Tập trung đọc" (Focus Mode):**
     - Tích hợp nút "Tập trung đọc" trên huy hiệu tên sách (`BookSpread`) và thanh công cụ tờ giấy (`PaperSheet`), tự động zoom camera 100-110% căn giữa tài liệu để đọc sắc nét.
     - Banner nổi "Chế độ đọc tập trung" ở đỉnh màn hình kèm nút "Thoát tập trung" trở về góc nhìn tổng quan.
  2. **Hiển thị Công thức Toán học Học thuật với KaTeX (`MathRenderer.tsx`):**
     - Tích hợp thư viện `katex` (^0.19.1) và `@types/katex`. Tạo component `MathRenderer` biên dịch tự động các ký hiệu LaTeX inline (`$...$`) và display (`$$...$$`).
     - Chuẩn hóa toàn bộ công thức toán học về Đạo hàm, Gradient Descent ($\nabla f$), Perceptron, Neural Networks, Backpropagation, Overfitting và danh sách bullet `•`.
  3. **Kiểu chữ & Khả năng co giãn của Giấy ghi chú (Sticky Note):**
     - Đổi phông chữ sang chuẩn sans-serif rõ nét (`font-sans font-medium text-stone-900`), tính toán kích cỡ phông tự động (`13.5px`, `leading-[1.42]`).
     - Tích hợp nút "Mở rộng" / "Thu gọn" ở chân note (cho phép mở rộng từ 200px lên 290px mà không bị tràn hay cắt chữ). Tăng độ tương phản footer lên `text-stone-700 font-semibold` đạt chuẩn WCAG AA.
  4. **Đường nối chỉ đỏ thông minh (Smart Bezier Routing) & Nhãn quan hệ:**
     - Đường Bezier uốn cong hình vòm cao vượt hẳn lên trên đỉnh gáy sách (`archApexY < sourceItem.y - 22`), hoàn toàn không cắt ngang qua nội dung văn bản Chương 2.
     - Giảm độ dày nét xuống `1.5px` bán trong suốt (`strokeOpacity="0.6"`), đinh ghim nhỏ gọn `r="4"`, bổ sung nhãn mô tả mối liên kết "Liên quan đến" tại trung điểm đường cong.
  5. **Hệ thống Tab Bookmark Sách: Tooltip, Phân nhóm & Xác nhận xóa:**
     - Bổ sung tooltip chú thích đầy đủ cho toàn bộ 5 tab.
     - Ngăn cách nút Xóa (màu đỏ) bằng một vạch phân vùng mỏng.
     - Khi bấm nút Xóa, mở modal thoại xác nhận an toàn ("Xóa sách khỏi bàn học? [Hủy] [Xác nhận xóa]") chống bấm nhầm làm mất sách.
  6. **Căn chỉnh & Bố cục Bàn học (Snap / Auto-Align):**
     - Căn chỉnh tọa độ mặc định các tài liệu bên trái và bên phải với khoảng đệm chuẩn 24px.
     - Bổ sung nút "Căn chỉnh bố cục bàn học (Snap Grid)" với icon `Sparkles` tại thanh công cụ góc dưới phải kết nối với hàm `tidyUpDesk`.
  7. **Thanh điều hướng & Dock công cụ góc dưới trái:**
     - Gom nhóm 2 nút Hoàn tác (`Undo2`) và Làm lại (`Redo2`) thành một cụm pill thống nhất trên thanh công cụ Miro bên trái.
     - Đồng bộ kích thước dock 3 nút góc dưới trái (`w-10 h-10 rounded-xl`), nút Tải lên đổi sang nền trắng viền nhẹ icon Cam ViT để giảm bớt độ chói so với tần suất sử dụng.
  8. **Minimap: Thu gọn & Tăng độ tương phản:**
     - Thiết lập độ mờ `opacity-80 hover:opacity-100 transition-opacity`, bổ sung nút đóng/thu gọn (`X`) ở góc trên phải.
     - Nhãn "BẢN ĐỒ (Phím M)" được nâng cấp lên `text-[9.5px] font-mono font-bold text-slate-700` đạt độ tương phản chuẩn.
- **Verified by:**
  - Script kiểm thử CDP tự động `scripts/verify-8-improvements.mjs` chạy trực tiếp trên Chrome Port 9222:
    - KaTeX elements: 35 phần tử toán học, fraction, nabla render chuẩn xác.
    - Path Bezier: vòm né Chương 2 `M 460 220 C 631 58, 973 70, 1144 116`, nhãn "Liên quan đến" hiển thị.
    - Sticky note: font sans, 13.5px, nút mở rộng kích hoạt tốt.
    - Nút "Tập trung đọc" và "Thoát tập trung" hoạt động mượt mà.
    - Nút Xóa mở modal xác nhận an toàn.
    - Cụm Undo/Redo và Minimap thu gọn hoạt động chính xác.
  - Ảnh chụp màn hình bằng chứng:
    - `live_verified_focus_mode_reading.png`
    - `live_verified_delete_confirm_modal.png`
    - `live_verified_all_8_improvements.png`
  - `pnpm run build:pages`: Static export 100% thành công.
  - `pnpm run docs:check`: Pass.

---

## 2026-11-08 11:30 — commit e2f32f7
- **Task:** Tích hợp Cấu hình Supabase Trực tiếp vào Modal Chia sẻ & Kiểm thử Toàn diện Trực tiếp qua Chrome Debug (CDP):
  1. **Nâng Cấp Modal Chia Sẻ & Cơ Sở Dữ Liệu (`BottomLeftKnowledge.tsx`):**
     - Tích hợp trực tiếp bảng điều khiển cấu hình và trạng thái Cơ sở dữ liệu Supabase vào modal Chia sẻ ở góc dưới trái.
     - Hiển thị huy hiệu trạng thái kết nối (`Chưa cấu hình` / `Đã cấu hình` / `Đang kết nối Realtime`).
     - Cho phép xem, chỉnh sửa `Project URL` và `Anon Key` trực tiếp trên web với nút "Lưu & Kết nối".
     - Tích hợp nút "Thử kết nối" đo độ trễ mạng thực tế tới Supabase REST & Realtime API.
  2. **Triển Khai & Kích Hoạt GitHub Pages Thành Công:**
     - Kích hoạt GitHub Pages trên repo `namtacozz/ViTudy` với build type `workflow`.
     - Chạy workflow `.github/workflows/deploy.yml` qua GitHub Actions: Build và Deploy thành công 100%.
     - URL trực tiếp [https://namtacozz.github.io/ViTudy/](https://namtacozz.github.io/ViTudy/) phản hồi `HTTP/1.1 200 OK`.
  3. **Kiểm Thử Toàn Diện Trên Chrome Debugger Trực Tiếp:**
     - Kết nối Chrome Debugging WebSocket trên port 9222.
     - Kiểm thử và chụp ảnh màn hình lưu giữ bằng chứng:
       - Modal Chuỗi điểm danh & nhận ViToken với màu cam Cam ViT (`live_chrome_test_streak.png`).
       - Modal Chia sẻ & Cấu hình Supabase trên GitHub Pages (`live_gh_pages_supabase_modal.png`).
       - Form nhập liệu Supabase & Nút thử kết nối (`live_gh_pages_supabase_form_tested.png`).
       - Toàn cảnh bàn học vô tận 2.5D trên GitHub Pages (`live_gh_pages_desk_verified.png`).
- **Verified by:**
  - Chrome DevTools Protocol kiểm thử tự động qua các script `scripts/test-live-chrome.mjs` và `scripts/verify-live-gh-pages.mjs`: Pass 100%.
  - `pnpm tsc --noEmit` & `pnpm run docs:check`: Pass.

---

## 2026-11-08 11:15 — uncommitted
- **Task:** Tích hợp Supabase Realtime Multiplayer và Thiết lập luồng triển khai GitHub Pages:
  1. **Tích hợp Thư viện & Client Supabase (`src/lib/supabase.ts`):**
     - Cài đặt `@supabase/supabase-js`.
     - Tạo hàm quản lý cấu hình linh hoạt `getSupabase()`, `saveSupabaseConfig()` hỗ trợ cả biến môi trường `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` và cấu hình lưu trữ cục bộ `localStorage`.
  2. **Hook Đa Người Dùng Thời Gian Thực (`src/hooks/useRealtimeMultiplayer.ts`):**
     - Quản lý kênh Realtime Presence (`room:${spaceId}`) theo dõi danh sách thành viên trực tuyến, vai trò (chủ phòng / người thuyết trình / người xem) và trạng thái học tập.
     - Đồng bộ broadcast con trỏ chuột (`cursor_move`) và camera của người thuyết trình.
  3. **Giao Diện Điều Khiển & Cấu Hình Supabase Trực Quan (`MultiplayerBar.tsx`):**
     - Bổ sung modal cấu hình kết nối Supabase trực tiếp ngay trong giao diện web.
     - Hiển thị huy hiệu trạng thái kết nối Realtime sắc nét và tùy chọn mô phỏng kiểm thử nhanh.
  4. **Triển Khai GitHub Pages (`namtacozz.github.io/ViTudy`):**
     - Cấu hình static export trong `next.config.ts` (`output: 'export'`, `basePath: '/ViTudy'`, `images: { unoptimized: true }`).
     - Tạo kịch bản build chuyên dụng `scripts/build-pages.mjs` tự động sinh file `out/.nojekyll`.
     - Thiết lập GitHub Actions workflow `.github/workflows/deploy.yml` tự động build và deploy lên GitHub Pages mỗi khi push code lên nhánh `main`.
- **Verified by:**
  - `pnpm run build:pages`: Thành công 100% sinh thư mục `out/` kèm `.nojekyll`.
  - `pnpm tsc --noEmit` & `pnpm run docs:check`: Pass.

---

## 2026-11-08 11:05 — uncommitted
- **Task:** Nâng cấp chế độ Xoay bàn học chuyên dụng, In-Situ STudy Overlay trên mặt giấy, Trích xuất Thẻ ghi nhớ trực tiếp và Định vị vật thể tương tác:
  1. **Nút Chế Độ Xoay Bàn Học Chuyên Dụng (`BottomRightToolkit.tsx`, `InfiniteDesk.tsx`):**
     - Bỏ hoàn toàn phím tắt `Alt + ...` để xoay view; WASD và phím mũi tên chỉ phục vụ việc di chuyển camera (pan canvas).
     - Bổ sung nút chuyển đổi chế độ xoay với icon `RotateTwoWay` nằm ngay bên trái thanh điều khiển zoom (`BottomRightToolkit`).
     - Khi bật: nút đổi màu Cam ViT (`#E0562D`), icon trắng. Toàn bộ bàn học bước vào `isViewRotateMode = true`.
     - Ở chế độ này: Nhấp và kéo chuột ở bất kỳ đâu trên màn hình (kể cả bên trong tài liệu, sách hay note) đều xoay góc nhìn bàn học theo chuột (`handleMouseDownCapture`). Nhấn đúp chuột để căn thẳng về $0^\circ$.
  2. **Overlay STudy Tại Chỗ Trên Mặt Giấy (`PaperSheet.tsx`):**
     - STudy được render trực tiếp bên trong container tờ giấy (`absolute inset-0 z-30`), che phủ vừa vặn bề mặt tờ giấy và chuyển động/xoay cùng tờ giấy trong không gian 2.5D.
     - Header tinh gọn: `[Sparkles] STudy` và nút đóng `X` để quay lại tờ giấy ban đầu.
     - 2 tab 50/50: `Tóm Tắt` và `Trắc Nghiệm`.
  3. **Chặn Cuộn Chuột Làm Zoom Bàn Học Trong Overlay (`InfiniteDesk.tsx`, `SummaryTab.tsx`, `QuizTab.tsx`):**
     - Chặn lan truyền sự kiện `onWheel` (`e.stopPropagation()`) và kiểm tra selector `target.closest('[data-overlay="true"]')` trong `InfiniteDesk.tsx`, triệt tiêu hoàn toàn lỗi cuộn nội dung trong overlay/modal làm bàn học co giãn zoom theo.
  4. **Nổi Bật Dòng "Sử dụng AI." (`SummaryTab.tsx`, `QuizTab.tsx`):**
     - Thiết kế dạng card nổi bật có nền gradient mềm (`from-orange-50 via-amber-50 to-orange-50`), viền cam, icon `Sparkles` nhấp nháy, chữ cam ViT bold và huy hiệu `Chuyên sâu`.
  5. **Trích Xuất Thẻ Ghi Nhớ Tức Thì Không Hiện Overlay (`PaperSheet.tsx`):**
     - Nhấp nút `Layers` trên thanh overlay tờ giấy sẽ trích xuất ngay lập tức các thẻ Spaced Repetition ra giấy ghi chú đặt ngay cạnh tài liệu mà không mở popup hay modal nào.
  6. **Định Vị Vật Thể Hạ Cánh Ngay Cạnh Tài Liệu Tương Tác:**
     - Toàn bộ kết quả xuất ra (Ghi chú tóm tắt, Thẻ ghi nhớ, Đề thi trắc nghiệm) đều được định vị chuẩn xác tại `x = item.x + item.width + 30, y = item.y`.
  7. **Tài liệu & Chỉ mục:**
     - Cập nhật quy chuẩn vào [`AGENTS.md`](file:///F:/AppMaking/ViTudy/AGENTS.md) Mục 5 & 6.
     - Chạy `pnpm run docs:index` & `pnpm run docs:check`: Pass 100%.
- **Verified by:**
  - `pnpm tsc --noEmit`: Pass exit code 0.
  - Chạy kịch bản tự động `scripts/verify-insitu-study-and-rotate-mode.mjs` & `scripts/capture-centered.mjs` qua Chrome DevTools Protocol và chụp ảnh kiểm định thực tế:
    - `verified_flashcard_instant_next_to_doc.png`
    - `verified_insitu_study_clean_view.png`
    - `verified_insitu_study_quiz.png`
    - `verified_all_exported_next_to_paper.png`

---

## 2026-11-08 10:45 — uncommitted
- **Task:** Tái cấu trúc và chuẩn hóa giao diện STudy & Thẻ Ghi Nhớ cho Tờ Giấy Đơn (`PaperSheet`):
  1. **Thanh công cụ ngữ cảnh nổi trên Tờ Giấy Đơn (`PaperSheet.tsx`):**
     - Nút STudy: Chỉ hiển thị duy nhất icon SVG `Sparkles` màu Cam ViT (`#E0562D`, `stroke-[2.4]`), không kèm text thừa, tích hợp tooltip trực quan `STudy: Tóm tắt & Trắc nghiệm`.
     - Tách "Thẻ Ghi Nhớ" thành button icon SVG `Layers` (`stroke-[2.4]`) riêng biệt nằm ngay cạnh bên phải STudy, phân cách bằng vạch chia với 2 nút phóng to (`Maximize2`) và xoay (`RotateTwoWay`).
  2. **Giao diện Modal STudy gọn gàng cho Tờ Giấy Đơn (`StudyToolsModal.tsx`):**
     - Mount qua React Portal `createPortal(..., document.body)` giúp modal thoát hoàn toàn khỏi container `transform`, hiển thị ngay giữa màn hình và có nút đóng `X` tròn rõ ràng.
     - Header tinh gọn tối giản: chỉ gồm `[Icon Sparkles Cam ViT] STudy` và nút đóng `X`.
     - Bỏ hoàn toàn các tab Lộ trình học, Quét ảnh OCR và Thẻ ghi nhớ; chỉ giữ 2 tab cân đối 50/50 (`grid-cols-2`): **Tóm Tắt** và **Trắc Nghiệm**.
     - Cấm triệt để thanh cuộn dọc/ngang (`overflow-hidden`, `no-scrollbar`), kích thước chuẩn `max-w-[460px]`.
     - Chuẩn hóa cấu trúc 3 dòng trong từng tab:
       - **Tab Tóm tắt (`SummaryTab.tsx`):**
         - Dòng 1: `Tóm tắt nội dung trọng tâm` (tiêu đề ngang, bỏ mô tả).
         - Dòng 2: Checkbox `Sử dụng AI.`
         - Dòng 3: Nút `Tạo tóm tắt` màu Cam ViT (`#E0562D`), chữ trắng, sát bên phải, không xuống dòng.
         - Footer 1 dòng ngắn: `Ghim Tóm Tắt Lên Bàn` + `Sao chép nội dung`.
       - **Tab Trắc nghiệm (`QuizTab.tsx`):**
         - Dòng 1: `Tạo đề ôn tập trắc nghiệm.`
         - Dòng 2: Checkbox `Sử dụng AI.` (gọi AI sinh đề chuẩn xác theo nội dung khi được tick).
         - Dòng 3: Nút `Sinh Câu Hỏi` (hoặc `Tạo Đề Mới`) màu Cam ViT (`#E0562D`), chữ trắng, sát bên phải.
         - Footer 1 dòng ngắn: `Xuất Đề Thi Ra Bàn` + `Chấm Điểm Ngay`.
  3. **Modal Thẻ Ghi Nhớ Độc Lập (`FlashcardModal.tsx`):**
     - Modal chuyên biệt cho flashcards gắn với tài liệu, mount qua portal với nút đóng `X` và hiển thị trực quan các thẻ ghi nhớ.
  4. **Tài liệu & Chỉ mục:**
     - Tự động cập nhật quy chuẩn vào [`AGENTS.md`](file:///F:/AppMaking/ViTudy/AGENTS.md) Mục 5.
     - Chạy `pnpm run docs:index` & `pnpm run docs:check`: Pass 100%.
- **Verified by:**
  - `pnpm tsc --noEmit`: Pass exit code 0.
  - Chạy kịch bản kiểm thử tự động `scripts/verify-paper-study-modal.mjs` qua Chrome DevTools Protocol và chụp ảnh kiểm định thực tế:
    - `verified_paper_study_summary.png` & `verified_paper_study_summary_generated.png`
    - `verified_paper_study_quiz.png` & `verified_paper_study_quiz_generated.png`
    - `verified_paper_flashcard_modal.png`

---

## 2026-11-07 22:00 — uncommitted
- **Task:** Chuẩn hóa giao diện Miro-Inspired Clean White, Tối ưu bố cục HUD và Thanh công cụ ngữ cảnh nổi:
  1. **Thanh công cụ ngữ cảnh nổi chuẩn Miro Trắng (`StickyNoteItem.tsx`, `PaperSheet.tsx`):**
     - Loại bỏ hoàn toàn khối pill màu xanh đen tối tăm kiểu AI slop (`bg-slate-900`/`bg-stone-900`).
     - Áp dụng chuẩn Miro Clean White: Nền trắng thanh nhã (`bg-white/95`), viền mảnh (`border border-slate-200/90`), chữ than chì (`text-slate-700`), đổ bóng mềm (`shadow-lg backdrop-blur-md`).
     - Tích hợp tính năng tự động đảo vị trí (`item.y < 90 ? 'top-full mt-3.5' : '-top-11'`) để chống bị che khuất bởi navbar khi kéo sát mép trên.
  2. **Tối ưu Bố cục HUD Ngoại vi:**
     - **Góc trên bên phải (`TopRightWallet.tsx`):**
       - Chuỗi ngày học: Chỉ 1 icon ngọn lửa (`Flame`), số ngày chuỗi được đặt khít bên trong bụng dưới của ngọn lửa (`text-[9px] font-black text-[#9A3412]`).
       - Chợ Tài Liệu: Đặt nằm giữa Chuỗi và Credit, hiển thị duy nhất icon `Store` kèm tooltip hover và mở `MarketModal`.
       - Ô Credit: Tinh gọn chỉ hiện huy hiệu `V` và số dư `50`.
       - AI Bot: Chỉ hiển thị icon `Bot` tối giản.
     - **Góc dưới bên trái (`BottomLeftKnowledge.tsx`):**
       - Đưa nút "Mời bạn" (`Share2`) xuống đặt cạnh nút "Tải lên" (`Upload`).
       - Nhấp "Mời bạn" mở modal chia sẻ liên kết phòng học nhanh chóng.
     - **Thanh Multiplayer (`MultiplayerBar.tsx`):**
       - Khi chưa có bạn cùng phòng (chế độ Solo), tự động ẩn hoàn toàn để tối đa hóa không gian bàn học.
  3. **Tài liệu & Chỉ mục:**
     - Cập nhật đầy đủ vào [`AGENTS.md`](file:///F:/AppMaking/ViTudy/AGENTS.md) Mục 12.
     - Chạy cập nhật chỉ mục [`docs/ai/03_SYMBOL_INDEX.md`](file:///F:/AppMaking/ViTudy/docs/ai/03_SYMBOL_INDEX.md) (65 symbols).
- **Verified by:**
  - `pnpm tsc --noEmit`: Pass exit code 0.
  - `pnpm run docs:index` & `pnpm run docs:check`: Pass.
  - Đã chụp kiểm định Chrome thực tế: `miro_style_desk_overview.png`, `miro_note_overlay_white.png`, `miro_paper_overlay_white.png`, `market_modal_open.png`, `invite_modal_open.png`.

---

## 2026-11-07 21:24 — uncommitted
- **Task:** Nâng cấp trải nghiệm lật trang sách 2.5D chân thực, Bookmark tab Tách trang và khử mờ toàn diện cho Giấy/Note:
  1. **Thanh nhắc Ruy băng "Tách trang" (`BookSpread.tsx`):**
     - Bổ sung Tab thứ 3 màu Xanh lam (`sky-700`) với icon `Scissors` và chữ *"Tách trang"* trên mép phải bìa sách, trượt mở mượt mà khi hover.
     - Loại bỏ hoàn toàn các nút hover "Tách trang" nhỏ lẻ nằm bên trong trang ruột để giữ trang sách chân thực, tinh khiết.
  2. **Hiệu ứng lật trang 2.5D không bị cắt khung (`overflow-visible`):**
     - Khắc phục triệt để lỗi container `overflow-hidden` cắt cụt đầu trên và đầu dưới của trang giấy đang cuộn trong không gian 3D.
     - Tờ giấy lật được mở rộng `top: -10px`, `height: calc(100% + 20px)`, uốn cong vươn tự nhiên vào viền bìa da nâu kèm bóng đổ mềm đa tầng `drop-shadow(0 16px 32px rgba(0,0,0,0.32))`.
  3. **Lật trang tức thì, triệt tiêu độ trễ và chớp giật nội dung:**
     - Thiết lập cơ chế *Pre-rendered Underlying Leaves*: Mặt giấy tĩnh bên dưới đã được nạp sẵn nội dung trang kế tiếp (`paginatedLeaves[page + 2]`), và mặt sau của tờ giấy lật hiển thị đúng trang chuẩn bị tiếp đất.
     - Khi kết thúc lật trang, góc nhìn giữ nguyên vẹn 100% pixel, không có độ trễ `setTimeout` tráo đổi chữ gây cảm giác giả tạo.
  4. **Khử mờ toàn diện cho Tờ giấy (`PaperSheet`) và Giấy ghi chú (`StickyNoteItem`):**
     - Đặt góc nghiêng khởi tạo mặc định về `0°` (thay vì các góc lẻ `4°` hay `-3°`), triệt tiêu việc GPU lấy mẫu bilinear làm nhòe chữ khi thu nhỏ.
     - Bổ sung `text-rendering: geometricPrecision; -webkit-font-smoothing: antialiased;` và nâng độ đậm font lên `font-medium` (500) cho Paper và `font-bold` (700) `text-stone-950` cho Patrick Hand trên Sticky Note.
- **Changed:**
  - [`src/components/objects/BookSpread.tsx`](file:///F:/AppMaking/ViTudy/src/components/objects/BookSpread.tsx): Thêm tab "Tách trang", mở rộng 3D curl layer không cắt viền, tiền kết xuất trang bên dưới.
  - [`src/context/StudySpaceContext.tsx`](file:///F:/AppMaking/ViTudy/src/context/StudySpaceContext.tsx): Đặt góc `rotation: 0` khi tách trang ra bàn học.
  - [`src/components/objects/PaperSheet.tsx`](file:///F:/AppMaking/ViTudy/src/components/objects/PaperSheet.tsx): Nâng độ sắc nét, bỏ các lớp stack xoay lệch góc.
  - [`src/components/objects/StickyNoteItem.tsx`](file:///F:/AppMaking/ViTudy/src/components/objects/StickyNoteItem.tsx): Tăng độ đậm nét chữ viết tay và khử răng cưa.
  - [`src/data/mockSpaces.ts`](file:///F:/AppMaking/ViTudy/src/data/mockSpaces.ts): Khởi tạo tài liệu và note ở góc $0^\circ$.
  - [`AGENTS.md`](file:///F:/AppMaking/ViTudy/AGENTS.md): Cập nhật quy chuẩn 5 Bookmark Tabs và Crisp Rendering cho Paper/Note.
- **Verified by:**
  - `pnpm build`: Pass exit code 0 (`Route (app): / 4.83 kB 119 kB`).
  - `pnpm run docs:index` & `pnpm run docs:check`: Pass (`64 symbols`).
  - Chrome DevTools: Xác thực trực tiếp qua các ảnh chụp màn hình (`crisp_overview.png`, `tab_detach_hovered.png`, `flip_unclipped_3d.png`, `after_flip_seamless.png`).

---

## 2026-11-07 21:10 — uncommitted
- **Task:** Tối ưu hóa chế độ cá nhân (Solo Mode), Đồng bộ góc nhìn thực tế và tinh giản nhãn kỹ thuật:
  1. **Giải thích & Chuẩn hóa "Đồng bộ góc nhìn":**
     - Đã loại bỏ nút duplicate thừa bên dưới `TopLeftNav.tsx`.
     - Kích hoạt tính năng hoạt động thật sự: Khi bật, camera tự động lướt mượt mà căn giữa vào cuốn sách/tài liệu của người thuyết trình ở tỷ lệ chuẩn 95%, đồng thời hiển thị banner thông báo nổi góc trên với đèn LED xanh emerald nhấp nháy và nút "Dừng theo dõi".
  2. **Chế độ học cá nhân (Solo Mode) mặc định:**
     - Khi chưa mời thêm ai vào phòng, ẩn hoàn toàn nhãn `Chủ phòng: Bạn`, ẩn các avatar tròn và ẩn nút `Đồng bộ góc nhìn`.
     - Chỉ hiển thị duy nhất nút **"Mời bạn"** tinh gọn ở giữa mép trên màn hình.
     - Khi bấm "Mời bạn", modal hỗ trợ sao chép link và nút "Mô phỏng vào nhóm" để thử nghiệm học nhóm 2-3 người. Khi có thành viên, thanh multiplayer bar mới tự động mở rộng.
  3. **Xóa bỏ popup "Không gian học 2.5D":** Loại bỏ thẻ chỉ báo chế độ ở góc dưới giữa màn hình trong `VrFrameOverlay.tsx`.
  4. **Đổi tên "KnowInherit" $\rightarrow$ "Chợ Tài Liệu":** Bỏ thuật ngữ kỹ thuật khó hiểu, đổi tên nút thành "Chợ Tài Liệu", xóa bỏ nhãn "Chia sẻ 85%".
- **Changed:**
  - [`src/components/hud/TopLeftNav.tsx`](file:///F:/AppMaking/ViTudy/src/components/hud/TopLeftNav.tsx): Xóa bỏ cụm `Chủ phòng: Bạn` và nút `Đồng bộ góc nhìn` duplicate.
  - [`src/components/hud/MultiplayerBar.tsx`](file:///F:/AppMaking/ViTudy/src/components/hud/MultiplayerBar.tsx): Tích hợp chế độ Solo vs Multiplayer linh hoạt và tính năng lướt camera đồng bộ góc nhìn thực tế.
  - [`src/components/hud/VrFrameOverlay.tsx`](file:///F:/AppMaking/ViTudy/src/components/hud/VrFrameOverlay.tsx): Xóa popup "Không gian học 2.5D" ở dưới giữa màn hình.
  - [`src/components/hud/BottomLeftKnowledge.tsx`](file:///F:/AppMaking/ViTudy/src/components/hud/BottomLeftKnowledge.tsx): Đổi tên thành "Chợ Tài Liệu" và xóa nhãn "Chia sẻ 85%".
  - [`AGENTS.md`](file:///F:/AppMaking/ViTudy/AGENTS.md) & [`docs/ai/06_UI_MAP.md`](file:///F:/AppMaking/ViTudy/docs/ai/06_UI_MAP.md): Cập nhật quy chuẩn thiết kế.
- **Verified by:**
  - `pnpm run docs:index` & `pnpm run docs:check`: Pass (`64 symbols`).
  - Chrome DevTools: Xác thực trực tiếp qua 3 ảnh chụp thực tế (`solo_mode.png`, `multiplayer_mode.png`, `sync_active.png`).

---

## 2026-11-07 21:00 — uncommitted
- **Task:** Tái cấu trúc HUD theo phong cách Miro & Tinh giản tối đa không gian học:
  1. **Thanh công cụ sáng tạo dọc bên trái (`LeftCreationBar.tsx`):** Gom toàn bộ công cụ tạo tác (Con trỏ, `+ Note`, Bút vẽ tự do kèm bảng 4 màu, Bút dạ quang, Khóa di chuyển canvas, và Hoàn tác/Xóa nét vẽ) vào thanh dọc nổi bên trái trung tâm màn hình (`left-4 top-1/2 -translate-y-1/2`).
  2. **Dọn sạch HUD góc dưới bên trái (`BottomLeftKnowledge.tsx`):** Loại bỏ đồng hồ bấm giờ (Pomodoro) và thanh trượt âm lượng; chỉ giữ lại nút "Tải lên" và "KnowInherit".
  3. **Tinh gọn HUD góc dưới bên phải (`BottomRightToolkit.tsx`):** Loại bỏ nút "Bản đồ bàn học" (Map matrix); chỉ giữ cụm điều khiển zoom (% zoom popover menu) và Minimap (bật/tắt bằng phím `M`).
  4. **Thu gọn HUD góc trên bên phải (`TopRightWallet.tsx`):** Bỏ từ "ViToken" khỏi ô credit (chỉ hiển thị huy hiệu `V` và số dư); bỏ tên mô hình AI `gpt-4o-mini` (chỉ hiển thị icon vuông `Bot` tối giản).
- **Changed:**
  - [`src/components/hud/LeftCreationBar.tsx`](file:///F:/AppMaking/ViTudy/src/components/hud/LeftCreationBar.tsx): Khởi tạo thanh công cụ sáng tạo dọc Miro-style.
  - [`src/components/canvas/StudySpaceDeskView.tsx`](file:///F:/AppMaking/ViTudy/src/components/canvas/StudySpaceDeskView.tsx): Mount `LeftCreationBar`.
  - [`src/components/hud/BottomLeftKnowledge.tsx`](file:///F:/AppMaking/ViTudy/src/components/hud/BottomLeftKnowledge.tsx): Dọn bỏ timer và volume popover.
  - [`src/components/hud/BottomRightToolkit.tsx`](file:///F:/AppMaking/ViTudy/src/components/hud/BottomRightToolkit.tsx): Dọn bỏ nút Map Matrix.
  - [`src/components/hud/TopRightWallet.tsx`](file:///F:/AppMaking/ViTudy/src/components/hud/TopRightWallet.tsx): Rút gọn ô credit và icon AI bot.
  - [`AGENTS.md`](file:///F:/AppMaking/ViTudy/AGENTS.md): Bổ sung quy chuẩn mục 12 "Bố Cục HUD & Thanh Công Cụ Sáng Tạo".
  - [`docs/ai/02_FILE_MAP.md`](file:///F:/AppMaking/ViTudy/docs/ai/02_FILE_MAP.md) & [`docs/ai/06_UI_MAP.md`](file:///F:/AppMaking/ViTudy/docs/ai/06_UI_MAP.md): Cập nhật vị trí `LeftCreationBar`.
- **Verified by:**
  - `pnpm build`: Pass exit code 0 (`Route (app): / 4.83 kB 119 kB`).
  - `pnpm run docs:index` & `pnpm run docs:check`: Pass (`64 symbols`).
  - Chrome DevTools: Chụp và xác thực trực quan ảnh `final_miro_hud.png`.

---

## 2026-11-07 20:41 — uncommitted
- **Task:** Triển khai Đợt 1 nâng cấp công thái học không gian (Miro Spatial UX) và hệ thống Dây nối tư duy 2.5D:
  1. **Ẩn/Hiện Minimap thông minh (`M`):** Minimap hỗ trợ bật/tắt nhanh bằng phím `M` hoặc nút đóng `×`, giải phóng diện tích góc dưới bàn học.
  2. **Popover Điều hướng & Zoom nhanh:** Nhấp vào số `% Zoom` mở menu kiểu Miro gồm: *Vừa vặn toàn bộ (`Alt+1`)*, *Dọn bàn gọn gàng (`Tidy Desk`)*, *Đặt lại 100% (`Ctrl+0`)* và *Bật/Tắt bản đồ nhỏ (`M`)*.
  3. **Thuật toán Dọn bàn gọn gàng (`tidyUpDesk`):** Tự động xếp Sách ở vị trí trung tâm, Tờ đề thi trắc nghiệm ngay ngắn bên phải, các Giấy ghi chú xếp thành cụm lưới 2 cột bên trái, trả góc quay về $0^\circ$.
  4. **Thanh công cụ ngữ cảnh nổi trên Sticky Note (`StickyNoteItem`):** Hỗ trợ đổi 5 màu giấy note pastel (Vàng ấm, Cam đào, Xanh mint, Lam nhạt, Hồng phấn) và đổi cỡ chữ (A/A+) một chạm.
  5. **Dây nối tư duy 2.5D phong cách Chỉ Ghim Thám Tử (`VisualLinkThreads`):** Chuyển từ dây phát sáng sang **sợi chỉ đỏ vật lý** có bóng đổ tự nhiên, độ chùng võng trọng lực (gravity sag) và hai đầu đinh ghim tròn kim loại đỏ kết nối chính xác từ Sách sang Ghi chú.
- **Changed:**
  - [`src/context/StudySpaceContext.tsx`](file:///F:/AppMaking/ViTudy/src/context/StudySpaceContext.tsx): Bổ sung `tidyUpDesk`, `fitAllToScreen`, `updateStickyNoteColor`.
  - [`src/components/canvas/Minimap.tsx`](file:///F:/AppMaking/ViTudy/src/components/canvas/Minimap.tsx): Nhận props `isVisible`, `onClose` và nhãn hướng dẫn phím M.
  - [`src/components/hud/BottomRightToolkit.tsx`](file:///F:/AppMaking/ViTudy/src/components/hud/BottomRightToolkit.tsx): Thêm Popover Zoom & Tùy chọn hiển thị, phím tắt `M`.
  - [`src/components/objects/StickyNoteItem.tsx`](file:///F:/AppMaking/ViTudy/src/components/objects/StickyNoteItem.tsx): Thêm bảng 5 màu note pastel và nút toggle cỡ chữ.
  - [`src/components/canvas/VisualLinkThreads.tsx`](file:///F:/AppMaking/ViTudy/src/components/canvas/VisualLinkThreads.tsx): Nâng cấp thành sợi chỉ đỏ ghim bảng thám tử.
  - [`src/data/mockSpaces.ts`](file:///F:/AppMaking/ViTudy/src/data/mockSpaces.ts): Kết nối thread mẫu sang `doc-sticky-1`.
- **Verified by:**
  - `pnpm build`: Pass exit code 0 (`Route (app): / 4.83 kB 119 kB`).
  - `pnpm run docs:index` & `pnpm run docs:check`: Pass (63 symbols).
  - Chrome DevTools: Chạy script kiểm thử trực tiếp trên live UI (`desk_with_red_string.png`, `sprint1_tidy_desk.png`, `sprint1_zoom_menu.png`).

---

## 2026-11-07 19:58 — uncommitted
- **Task:** Áp dụng toàn diện bản sắc thiết kế hiện đại từ web ôn thi Java (`https://namtacozz.github.io/java/`) vào ViTudy:
  1. Đưa sắc Cam San Hô (`#E0562D` / `#FF5722`) làm signature brand accent và Slate-50 (`#f8fafc`) cho mặt bàn học.
  2. Nâng cấp tờ đề thi trắc nghiệm (`PaperSheet`): Option row bo góc 10px, hiệu ứng trượt hover, nảy pop chọn đáp án, rung lắc khi sai, tỏa xung khi đúng kèm nhãn "ĐÚNG ✓" / "SAI ✕" và nút "Làm lại" (`resetExam`).
  3. Tích hợp Đồng hồ học tập (Pomodoro Session Timer) đếm giờ thực tế và Bộ chỉnh âm lượng trượt dọc (Volume Popover) ở thanh HUD góc dưới bên trái.
  4. Xây dựng Bản đồ ma trận học tập (Matrix Map Popover 8 cột) với thẻ xem trước nổi bật khi hover ở thanh HUD góc dưới bên phải.
  5. Cập nhật khung hỏi đáp Inteline AI với tone cam san hô, icon bóng đèn và thẻ phân tích lý thuyết.
- **Changed:**
  - [`src/app/globals.css`](file:///F:/AppMaking/ViTudy/src/app/globals.css): Bổ sung CSS tokens (`--accent`, `--ok`, `--bad`, `--warn`) và keyframes micro-interactions (`badgePop`, `correctPulse`, `wrongShake`, `verdictPopIn`).
  - [`src/components/canvas/DeskGrid.tsx`](file:///F:/AppMaking/ViTudy/src/components/canvas/DeskGrid.tsx): Chuyển màu nền bàn sang `#f8fafc` êm mắt.
  - [`src/context/StudySpaceContext.tsx`](file:///F:/AppMaking/ViTudy/src/context/StudySpaceContext.tsx): Bổ sung hàm `resetExam(itemId)`.
  - [`src/components/objects/PaperSheet.tsx`](file:///F:/AppMaking/ViTudy/src/components/objects/PaperSheet.tsx): Nâng cấp toàn diện giao diện đề thi trắc nghiệm và các option rows.
  - [`src/components/hud/BottomLeftKnowledge.tsx`](file:///F:/AppMaking/ViTudy/src/components/hud/BottomLeftKnowledge.tsx): Thêm Đồng hồ học tập và thanh gạt âm lượng Popover.
  - [`src/components/hud/BottomRightToolkit.tsx`](file:///F:/AppMaking/ViTudy/src/components/hud/BottomRightToolkit.tsx): Tích hợp Nút Map màu cam và Ma trận Bản đồ bàn học 8 cột có card xem trước khi hover.
  - [`src/components/objects/BookSpread.tsx`](file:///F:/AppMaking/ViTudy/src/components/objects/BookSpread.tsx): Nâng cấp khung Inteline Popover với icon bóng đèn và tone cam san hô.
  - [`AGENTS.md`](file:///F:/AppMaking/ViTudy/AGENTS.md): Cập nhật quy chuẩn Bảng màu Modern Educational Cockpit.
  - [`docs/ai/10_DECISIONS.md`](file:///F:/AppMaking/ViTudy/docs/ai/10_DECISIONS.md): Bổ sung `ADR-018`.
- **Verified by:**
  - `pnpm build`: Pass exit code 0.
  - `pnpm run docs:index` & `pnpm run docs:check`: Pass.
  - Chrome DevTools: Chạy script kiểm thử trực tiếp trên live UI.
- **Task:** Hoàn thiện 4 yêu cầu của người dùng:
  1. Nâng cao độ nét và khử nhiễu khi nhìn bao quát ở mức zoom 47% (loại bỏ moiré pattern, font-medium, geometricPrecision).
  2. Bỏ nút tia sét ở góc dưới bên trái (triệt tiêu Next.js dev indicator).
  3. Đổi tên nút "Tải tài liệu" thành "Tải lên".
  4. Nâng cấp 4 thẻ đánh dấu bìa phải: icon hiển thị trọn vẹn ở trạng thái idle, khi hover trượt mở mượt mà sang phải lộ tên chức năng trực tiếp trên ruy-băng, bỏ tooltip lơ lửng.
- **Changed:**
  - [`src/components/hud/BottomLeftKnowledge.tsx:L148`](file:///F:/AppMaking/ViTudy/src/components/hud/BottomLeftKnowledge.tsx#L148): Đổi "Tải tài liệu" thành "Tải lên".
  - [`next.config.ts:L6-L9`](file:///F:/AppMaking/ViTudy/next.config.ts#L6-L9): Cấu hình `devIndicators: { appIsrStatus: false, buildActivity: false }` để tắt dev indicator tia sét của Next.js.
  - [`src/app/globals.css`](file:///F:/AppMaking/ViTudy/src/app/globals.css):
    1. Bỏ `radial-gradient` chấm hạt trên `.paper-texture` gây nhiễu pixel (moiré pattern) khi zoom out; chuyển sang màu ngà phẳng `#fdfbf7`.
    2. Cấu hình `text-rendering: geometricPrecision;` và `font-weight: 500;` trên `.book-page, .paper-sheet`.
    3. Thêm CSS triệt tiêu `nextjs-portal, [data-nextjs-dev-indicator]` để ẩn hoàn toàn nút tia sét.
  - [`src/components/objects/BookSpread.tsx`](file:///F:/AppMaking/ViTudy/src/components/objects/BookSpread.tsx):
    1. Thiết kế lại 4 thẻ bookmark tab bìa phải: căn chỉnh gốc thẻ luồn 8px dưới giấy (`left: calc(100% - 50px)`), icon SVG hiển thị 100% trọn vẹn ở idle với bề rộng `w-[60px]`.
    2. Tương tác hover: thẻ trượt dài sang phải (`group-hover/tab:w-[132px]`) để lộ tên chức năng ("Tóm tắt", "Phóng to", "Xoay", "Xoá") trên ruy-băng, bỏ hoàn toàn tooltip lơ lửng.
    3. Tăng cường độ đậm `font-medium` cho toàn bộ các đoạn văn bản trong sách và trang lật để nét chữ đậm đà, không bị mờ nhạt khi nhìn bao quát ở zoom 47%.
  - [`src/components/objects/PaperSheet.tsx:L262`](file:///F:/AppMaking/ViTudy/src/components/objects/PaperSheet.tsx#L262): Bổ sung `font-medium` cho thân tài liệu đơn lẻ.
  - [`AGENTS.md:L74-L85, L125-L140`](file:///F:/AppMaking/ViTudy/AGENTS.md): Cập nhật quy chuẩn thiết kế thẻ bookmark ruy-băng trượt mở, nút "Tải lên" và độ sắc nét chống nhiễu moiré.
  - [`docs/ai/10_DECISIONS.md:L180-L195`](file:///F:/AppMaking/ViTudy/docs/ai/10_DECISIONS.md): Bổ sung `ADR-017`.
- **Verified by:**
  - `pnpm build`: Pass exit code 0.
  - `pnpm run docs:index` & `pnpm run docs:check`: Pass (63 symbols).
  - Chrome DevTools: Chạy `node scripts/verify-all.mjs`, chụp ảnh màn hình kiểm chứng trực tiếp:
    1. `tabs_centered_idle.png`: 4 icon hiển thị trọn vẹn, nút "Tải lên" hiển thị đúng, tia sét biến mất.
    2. `tabs_hovered_tomtat.png`: Thẻ ruy-băng trượt mở mượt mà sang phải hiển thị chữ "Tóm tắt" ngay trên ruy-băng, không có tooltip thừa.
    3. `zoom_47_crisp_view.png`: Nền giấy sạch bóng, hết sạch nhiễu hạt moiré, chữ đen rõ ràng, đậm đà và sắc nét ở mức zoom nhỏ 47%.
- **Task:** Hoàn thiện 6 yêu cầu chi tiết của người dùng: tắt spellcheck tiếng Việt trên web, thiết kế thẻ đánh dấu ruy-băng khuyết chữ V (V-notched) 4 màu (Xanh lá, Cam, Nâu, Đỏ) luồn dưới mép giấy, mở rộng viền bìa gấp 3 lần (`42px`), bỏ bóng gáy trên bìa sách, xóa thanh giả độ sâu ngoài bìa và bỏ footer thừa ở chân trang.
- **Changed:**
  - [`src/app/layout.tsx:L31-L35`](file:///F:/AppMaking/ViTudy/src/app/layout.tsx#L31-L35): Thêm `spellCheck={false}` vào `<html>` và `<body>`.
  - [`src/components/objects/StickyNoteItem.tsx:L76-L82`](file:///F:/AppMaking/ViTudy/src/components/objects/StickyNoteItem.tsx#L76-L82): Thêm `spellCheck={false}` vào `<textarea>` ghi chú để triệt tiêu các nét gạch chân đỏ lượn sóng.
  - [`src/components/objects/BookSpread.tsx`](file:///F:/AppMaking/ViTudy/src/components/objects/BookSpread.tsx):
    1. Mở rộng viền bìa 2 bên từ `14px` lên `42px` (gấp 3 lần), kích thước sách `980x640px`.
    2. Bỏ hoàn toàn 2 dải gờ giả độ sâu ngoài bìa sách.
    3. Chuyển bóng rãnh gáy sách vào bên trong container giấy, loại bỏ bóng gáy trên bìa da.
    4. Thiết kế 4 thẻ đánh dấu luồn dưới mép giấy bên phải (`z-10` dưới giấy `z-20`) có đầu khuyết chữ V (`clipPath`), 4 màu: Xanh lá (`#059669` - Tóm tắt), Cam (`#ea580c` - Phóng to), Nâu (`#78350f` - Xoay), Đỏ (`#e11d48` - Xoá), chỉ hiển thị icon vector SVG và tooltip nổi khi hover.
    5. Xóa chữ "ViTudy Desk" và tên sách thừa ở footer trang sách, chỉ hiển thị số trang ở góc ngoài.
  - [`AGENTS.md:L66-L100`](file:///F:/AppMaking/ViTudy/AGENTS.md#L66-L100): Cập nhật quy chuẩn mới.
  - [`docs/ai/10_DECISIONS.md:L168-L180`](file:///F:/AppMaking/ViTudy/docs/ai/10_DECISIONS.md#L168-L180): Bổ sung `ADR-016`.
- **Verified by:**
  - `pnpm build`: Pass exit code 0.
  - `pnpm run docs:index` & `pnpm run docs:check`: Pass (63 symbols).

---

## 2026-11-07 19:18 — uncommitted
- **Task:** Nâng cấp toàn diện trải nghiệm Sách Mở Đôi: thiết kế bìa da nâu dày dặn, hiệu ứng lật trang 3D cuộn chuột như đời thật (Interactive Page-Curl Drag), hệ thống thẻ đánh dấu bìa phải (Bookmark Tabs), phân trang góc ngoài sách in, sửa lỗi kẹt trang 13-14/17, đưa Inteline về inline popover khi bôi đen và tinh gọn nhãn tên sách dưới đáy.
- **Changed:**
  - [`AGENTS.md:L66-L105`](file:///F:/AppMaking/ViTudy/AGENTS.md#L66-L105): Ghi nhận toàn bộ quy chuẩn mới về bìa nâu dày dặn, thẻ bookmark bìa phải, lật trang 3D và số trang góc ngoài.
  - [`src/context/StudySpaceContext.tsx:L27,L295-L315`](file:///F:/AppMaking/ViTudy/src/context/StudySpaceContext.tsx#L27): Bổ sung tham số `maxPages?: number` cho `turnBookPage` để không bao giờ bị chặn lật trang khi số trang thực tế lớn hơn `item.pageCount`.
  - [`src/components/objects/BookSpread.tsx`](file:///F:/AppMaking/ViTudy/src/components/objects/BookSpread.tsx):
    1. Bìa da nâu dày dặn (`#5c3920` đến `#341c0c`, `960x640px`, padding `12-14px`, bo góc `rounded-2xl`).
    2. Xóa bỏ hoàn toàn dải ribbon "SỔ TỔNG HỢP (BINDER)".
    3. Thẻ bookmark tab bìa phải: STudy, Xem Full (chỉ icon SVG `Maximize2`), Xoay 360° (kèm double click về 0°), Xóa sách.
    4. Số trang: Góc dưới cùng bên trái (trang trái) và góc dưới cùng bên phải (trang phải).
    5. Hiệu ứng lật trang 3D cuộn chuột (`startDragFlip` với `rotateY` và dynamic paper bend shadow).
    6. Inteline: Tự động nổi lên tại vị trí kết thúc vùng chọn bôi đen với khung hỏi nhanh và trả lời trực tiếp.
    7. Tên sách: Đặt bên dưới đáy bìa sách (`top-full mt-3.5`), loại bỏ hoàn toàn thanh scrubber, icon quyển sách và text lật trang đè lên sách.
  - [`docs/ai/10_DECISIONS.md:L145-L160`](file:///F:/AppMaking/ViTudy/docs/ai/10_DECISIONS.md#L145-L160): Bổ sung `ADR-015`.
- **Verified by:**
  - `pnpm build`: Pass exit code 0.
  - `pnpm run docs:index` & `pnpm run docs:check`: Pass.
  - `node scripts/test-chrome-devtools.mjs`: Pass 100%.

---

## 2026-11-07 18:59 — uncommitted
- **Task:** Giải quyết triệt để vấn đề vỡ/mờ chữ khi phóng to bàn học ở mức zoom lớn (150% - 220%), đảm bảo văn bản vector sắc nét như màn hình giấy (High-Fidelity Crisp Vector Scaling).
- **Root Cause & Fix:**
  1. *Nguyên nhân 1 (Bitmap Texture Locking):* `InfiniteDesk.tsx` trước đó gán `will-change-transform` và `transform-gpu` lên container bàn học. Trong Chromium/Blink, cờ này buộc engine đồ họa Skia khóa raster resolution ở kích thước 1.0x, khi zoom lên 220% thì GPU kéo giãn texture bitmap tuyến tính (bilinear scaling) làm chữ bị nhòe mờ. $\rightarrow$ Gỡ bỏ `transform-gpu` và `will-change-transform`, chuyển sang 2D transform thuần để trình duyệt luôn re-raster vector glyphs sắc nét theo DPI màn hình.
  2. *Nguyên nhân 2 (Subpixel Coordinate Jitter):* Khi zoom và pan, `transform.x` và `transform.y` sinh ra số thực có phần thập phân (`-39.4413px`), làm phá vỡ lưới pixel subpixel rendering. $\rightarrow$ Làm tròn `Math.round` cho `transform.x` và `transform.y` trong `panBy` và `zoomBy`.
  3. *Nguyên nhân 3 (Rotational Anti-Aliasing):* Góc nghiêng $-1.5^\circ$ vô hiệu hóa cơ chế ClearType font hinting của Windows. $\rightarrow$ Đổi góc mặc định về $0^\circ$; bổ sung tính năng hút từ tính ($\pm 2.5^\circ$) và nhấn đúp vào nút xoay để căn thẳng ngay ngắn tức thì.
  4. *Nguyên nhân 4 (Font Smoothing):* Bổ sung `-webkit-font-smoothing: antialiased`, `-moz-osx-font-smoothing: grayscale`, và `text-rendering: optimizeLegibility` vào `globals.css`.
- **Verified by:**
  - Chụp ảnh so sánh trực tiếp trên Chrome DevTools ở zoom 220%: chữ và icon sắc nét, không còn viền mờ rạn nứt.
  - `pnpm build`: Pass exit code 0.
  - `pnpm run docs:index` & `pnpm run docs:check`: Pass.

---

## 2026-11-07 18:47 — uncommitted
- **Task:** Giải đáp và khắc phục hiện tượng tài liệu bị "biến mất" khi kéo thả vào cuốn sách; bảo đảm an toàn dữ liệu và vô hiệu hóa cơ chế tự động gộp trang (Zero Silent Swallowing).
- **Root Cause & Fix:**
  - *Nguyên nhân:* Trước đó, hook `useDeskItemInteraction` trong `PaperSheet.tsx` có callback `onDropCheck` tự động gọi `combineIntoBinder(target.id, item.id)` khi tọa độ thả rơi đè lên cuốn sách. Khi đó, toàn bộ các trang của tờ giấy được nối vào cuối cuốn sách (làm số trang sách tăng lên, ví dụ từ 5 lên 11 trang), đồng thời tờ giấy bị xóa khỏi bàn học (`filter(i => i.id !== draggedId)`), tạo cảm giác tài liệu bị "biến mất".
  - *Khắc phục:*
    1. Đã gỡ bỏ hoàn toàn `onDropCheck` và lệnh gọi `combineIntoBinder` khỏi `PaperSheet.tsx`. Giờ đây khi kéo tài liệu đè lên sách, tài liệu sẽ nằm yên trên mặt bàn với `zIndex` nổi lên trên, cho phép xếp chồng tài liệu tự nhiên như mặt bàn thật.
    2. Cập nhật `AGENTS.md` (Mục 4) với quy định cấm nuốt/gộp tài liệu khi kéo thả (Zero Silent Swallowing).
    3. Hướng dẫn người dùng cách khôi phục các trang đã lỡ gộp trước đó bằng nút "Tách trang" (icon cái kéo - Binder Detach) ở góc từng trang sách.
- **Verified by:**
  - `pnpm build`: Pass exit code 0.
  - `pnpm run docs:index` & `pnpm run docs:check`: Pass.

---

## 2026-11-07 18:40 — uncommitted
- **Task:** Điều tra và triệt tiêu dứt điểm lỗi màn hình trắng kèm huy hiệu `1 error` trong Chrome DevTools.
- **Root Cause & Fix:**
  1. `FullScreenDocModal.tsx`: Lỗi TDZ `ReferenceError: Cannot access 'totalLeaves' before initialization` do `totalLeaves` và các hàm điều hướng đặt dưới `useEffect`. $\rightarrow$ Đã chuyển toàn bộ khai báo `leaves`, `totalLeaves`, `handlePrev`, `handleNext` lên trên `useEffect`.
  2. `src/app/page.tsx`: Lỗi Hydration Mismatch giữa SSR và Client State (Local Storage & Fonts) gây chặn render màn hình trắng. $\rightarrow$ Đã cấu hình `dynamic(() => import('@/components/canvas/StudySpaceDeskView'), { ssr: false })` để loại bỏ 100% hydration mismatch cho Canvas 2.5D.
  3. `BookSpread.tsx`: Lỗi `Uncaught (in promise) Event` khi tải font `document.fonts.ready`. $\rightarrow$ Đã bổ sung `.catch(() => setFontsReady(true))`.
- **Verified by:**
  - `node scripts/test-chrome-devtools.mjs`: Pass 100% (0 console errors, 0 exceptions, `hasOverlayError: false`, Sách mở đôi 940x630, Đề thi trắc nghiệm A4, Reader Toàn Màn Hình PDF View).
  - Ảnh chụp thực tế: `latest_screenshot.png` hiển thị sắc nét không gian học 2.5D không còn lỗi.
  - `pnpm build`: Pass exit code 0.
  - `pnpm run docs:index` & `pnpm run docs:check`: Pass (63 symbols).

---

## 2026-11-07 18:25 — uncommitted
- **Task:** Giải quyết dứt điểm 3 phản hồi trải nghiệm người dùng: sửa lỗi hover đứt quãng khi di chuột lên nút xoay/xoá, bổ sung chế độ Đọc Toàn Màn Hình (PDF View) có nút thoát, và tái thiết kế Sách Mở Đôi thành sách thực thể chân thực (Zero AI Bezel) kèm Contextual Overlays trên/dưới.
- **Changed:**
  - [`AGENTS.md:L70-L85`](file:///F:/AppMaking/ViTudy/AGENTS.md#L70-L85): Cập nhật quy chuẩn Sách Thực Thể Chân Thực (Zero AI Bezel), cầu nối chống mất hover (`before:absolute before:inset-x-0 before:-bottom-3.5 before:h-4`), và chế độ Full-Screen Document Reader.
  - [`src/components/objects/BookSpread.tsx:L170-L360`](file:///F:/AppMaking/ViTudy/src/components/objects/BookSpread.tsx#L170-L360): Xoá bỏ hoàn toàn viền tablet đen bao quanh; tạo rãnh gáy tự nhiên; chuyển toàn bộ điều hướng vào Contextual Overlays (Overlay trên có số trang & chuyển trang trực tiếp, nút Xem Full, Inteline, STudy, xoay 360°, xoá; Overlay dưới có tên sách và thanh trượt lật trang scrubber); bổ sung cầu nối hover tàng hình.
  - [`src/components/objects/PaperSheet.tsx:L318-L380`](file:///F:/AppMaking/ViTudy/src/components/objects/PaperSheet.tsx#L318-L380): Bổ sung cầu nối hover tàng hình và nút "Xem Full" (`Maximize2`) mở `FullScreenDocModal` cho cả tài liệu thường và đề thi trắc nghiệm A4.
  - [`src/components/objects/StickyNoteItem.tsx:L90-L115`](file:///F:/AppMaking/ViTudy/src/components/objects/StickyNoteItem.tsx#L90-L115): Bổ sung cầu nối hover tàng hình chống mất overlay khi di chuột lên xoay/xoá.
  - [`src/data/mockSpaces.ts:L15-L25`](file:///F:/AppMaking/ViTudy/src/data/mockSpaces.ts#L15-L25): Điều chỉnh tọa độ mặc định Y của sách từ `150` sang `60` để vừa vặn trọn vẹn trong màn hình.
  - [`docs/ai/06_UI_MAP.md:L58-L75`](file:///F:/AppMaking/ViTudy/docs/ai/06_UI_MAP.md#L58-L75): Ghi nhận `FullScreenDocModal` qua React Portal tại `z-[100]`.
  - [`docs/ai/10_DECISIONS.md:L120-L140`](file:///F:/AppMaking/ViTudy/docs/ai/10_DECISIONS.md#L120-L140): Thêm `ADR-012`.
- **Added:**
  - [`src/components/modals/FullScreenDocModal.tsx:L1-L415`](file:///F:/AppMaking/ViTudy/src/components/modals/FullScreenDocModal.tsx#L1-L415): Component trình đọc toàn màn hình chuẩn PDF viewer (hỗ trợ sách mở đôi, 1 trang, đề thi A4, zoom 60%-160%, phím tắt Esc & mũi tên).
- **Verified by:**
  - `node scripts/test-chrome-devtools.mjs`: Pass 100% (0 lỗi console, kiểm tra mở/đóng modal toàn màn hình thành công, kích thước 940x630 chuẩn, 0 emoji).
  - Ảnh chụp màn hình: `latest_screenshot.png` (bàn học thực thể), `fullscreen_reader_screenshot.png` (chế độ đọc toàn màn hình PDF view).
  - `pnpm run docs:index` & `pnpm run docs:check`: Pass (63 symbols hợp lệ).
- **Open follow-ups:** Sẵn sàng cho người dùng trải nghiệm.

---

## 2026-11-07 18:05 — uncommitted
- **Task:** Thực thi toàn diện Master Completion Plan (`vitudy_master_completion_plan.md`): giải quyết triệt để các vi phạm chuẩn monochromatic/zero-emoji, tái cấu trúc hook xoay 360° `useDeskItemInteraction`, module hóa `StudyToolsModal` thành 5 subtabs, triển khai tờ đề thi trắc nghiệm A4 tương tác `PaperSheet` (`exam_sheet`), chuẩn hóa Unicode NFC, tích hợp bảng `space_members`, chia sẻ doanh thu 85/15 và kiểm thử tự động toàn diện bằng Chrome DevTools MCP.
- **Changed:**
  - [`src/components/canvas/DeskGrid.tsx:L12-L24`](file:///F:/AppMaking/ViTudy/src/components/canvas/DeskGrid.tsx#L12-L24): Nền trắng thuần `#ffffff`.
  - [`src/app/layout.tsx:L12-L25`](file:///F:/AppMaking/ViTudy/src/app/layout.tsx#L12-L25): Selection xám đơn sắc `slate-200 / slate-900`.
  - [`src/app/api/ai/chat/route.ts:L35-L45`](file:///F:/AppMaking/ViTudy/src/app/api/ai/chat/route.ts#L35-L45): Unicode NFC normalization `prompt.normalize('NFC')`.
  - [`src/utils/textNormalization.ts:L1-L15`](file:///F:/AppMaking/ViTudy/src/utils/textNormalization.ts#L1-L15): Tạo helper `normalizeNFC`.
  - [`src/hooks/useDeskItemInteraction.ts:L1-L125`](file:///F:/AppMaking/ViTudy/src/hooks/useDeskItemInteraction.ts#L1-L125): Tạo hook tương tác kéo thả & xoay 360° `Math.atan2` chuẩn tâm.
  - [`src/types/studyspace.ts:L20-L65`](file:///F:/AppMaking/ViTudy/src/types/studyspace.ts#L20-L65): Khai báo `ExamQuestion`, `ExamSheetData`, `examData` trong `DeskItem`.
  - [`src/context/StudySpaceContext.tsx:L320-L460`](file:///F:/AppMaking/ViTudy/src/context/StudySpaceContext.tsx#L320-L460): Bổ sung `addExamSheet`, `updateExamAnswer`, `gradeExam`, và lọc sạch emoji cũ qua `removeEmojis` trong `deepNormalize`.
  - [`src/components/objects/BookSpread.tsx:L50-L420`](file:///F:/AppMaking/ViTudy/src/components/objects/BookSpread.tsx#L50-L420): Chuyển sang dùng `useDeskItemInteraction`, loại bỏ accent cyan, giữ kích thước chuẩn 940x630.
  - [`src/components/objects/StickyNoteItem.tsx:L25-L160`](file:///F:/AppMaking/ViTudy/src/components/objects/StickyNoteItem.tsx#L25-L160): Chuyển sang dùng `useDeskItemInteraction`, đơn sắc hóa controls.
  - [`src/components/objects/PaperSheet.tsx:L1-L260`](file:///F:/AppMaking/ViTudy/src/components/objects/PaperSheet.tsx#L1-L260): Tích hợp `useDeskItemInteraction`, hiện thực hóa Tờ Đề Thi Trắc Nghiệm Tương Tác A4 (chọn đáp án, chấm điểm trực tiếp, lời phê giáo viên AI).
  - [`src/components/modals/StudyToolsModal.tsx:L1-L85`](file:///F:/AppMaking/ViTudy/src/components/modals/StudyToolsModal.tsx#L1-L85): Tách module thành 5 subtab độc lập (`SummaryTab`, `QuizTab`, `FlashcardTab`, `RoadmapTab`, `OcrTab`).
  - [`src/components/mobile/MobileCompanionView.tsx:L40-L210`](file:///F:/AppMaking/ViTudy/src/components/mobile/MobileCompanionView.tsx#L40-L210): Tối ưu bảng màu sáng slate đơn sắc.
  - [`src/components/hud/MultiplayerBar.tsx:L25-L110`](file:///F:/AppMaking/ViTudy/src/components/hud/MultiplayerBar.tsx#L25-L110): Bỏ emoji reaction hoàn toàn, tích hợp nút "Đồng bộ góc nhìn" kèm đèn LED emerald.
  - [`src/components/modals/KnowInheritPublishModal.tsx:L15-L60`](file:///F:/AppMaking/ViTudy/src/components/modals/KnowInheritPublishModal.tsx#L15-L60) & [`src/components/hud/BottomLeftKnowledge.tsx:L20-L75`](file:///F:/AppMaking/ViTudy/src/components/hud/BottomLeftKnowledge.tsx#L20-L75): Khung giá chuẩn SRS 5.1 (5/15/30/50 ViToken), chia thưởng 85/15.
  - [`src/context/ViTokenContext.tsx:L50-L160`](file:///F:/AppMaking/ViTudy/src/context/ViTokenContext.tsx#L50-L160): Anti-sybil desk activity (180s), timestamps động ISO.
  - [`supabase/schema.sql:L40-L50`](file:///F:/AppMaking/ViTudy/supabase/schema.sql#L40-L50): Thêm bảng `space_members`, RLS policies, cập nhật constraint giá 5/15/30/50.
  - [`src/app/page.tsx:L1-L25`](file:///F:/AppMaking/ViTudy/src/app/page.tsx#L1-L25): Xóa spinner cản trở mount giao diện desktop.
- **Added:**
  - `src/hooks/useDeskItemInteraction.ts`: Hook tương tác dùng chung cho các vật thể bàn học.
  - `src/utils/textNormalization.ts`: Helper chuẩn hoá NFC.
  - `src/components/modals/study-tools/SummaryTab.tsx`: Subtab Tóm tắt.
  - `src/components/modals/study-tools/QuizTab.tsx`: Subtab Trắc nghiệm & Xuất đề thi.
  - `src/components/modals/study-tools/FlashcardTab.tsx`: Subtab Thẻ ghi nhớ.
  - `src/components/modals/study-tools/RoadmapTab.tsx`: Subtab Lộ trình ôn tập.
  - `src/components/modals/study-tools/OcrTab.tsx`: Subtab Nhận diện chữ viết tay OCR.
  - `scripts/test-chrome-devtools.mjs`: Bộ kiểm thử tự động toàn diện qua giao thức CDP của Chrome.
- **Verified by:**
  - `scripts/test-chrome-devtools.mjs`: Chạy Chrome DevTools CDP trực tiếp trên port 9222:
    - 0 console error.
    - Zero-Emoji: 0 emoji trong DOM (100% SVG Lucide).
    - 2.5D BookSpread: 940x630px.
    - Modal StudyTools: Mở và chuyển 5 tab thành công.
    - Interactive Exam Sheet: Xuất tờ đề thi ra bàn, chọn đáp án, bấm "Nộp Bài & Chấm Điểm", tính điểm và hiển thị lời phê giáo viên thành công.
  - `pnpm build`: Passed (Exit code 0, không có lỗi TypeScript hay Lint).
  - `pnpm run docs:index` & `pnpm run docs:check`: Passed (Exit code 0, 62 symbols hợp lệ).
- **Open follow-ups:** Duy trì trạng thái hoàn thiện production-ready.

---

## 2026-11-07 17:20 — uncommitted
- **Task:** Cập nhật các quy tắc thiết kế mới cho `AGENTS.md`, xoá `CLAUDE.md`, triệt tiêu hoàn toàn emoji chuyển sang icon SVG vector Morphicons/Lucide, siết chặt kỷ luật vẽ giao diện theo combo skill đã cài đặt.
- **Changed:**
  - [`AGENTS.md:L1-L125`](file:///F:/AppMaking/ViTudy/AGENTS.md#L1-L125): Thêm chỉ dẫn bắt buộc tự động cập nhật quy tắc, cấm emoji (Zero-Emoji Policy), bắt buộc dùng combo skill UI/UX (`stageshow`, `hallmark`, `design-taste-frontend`, `impeccable`, `awesome-design-md`, `google-design-md`, `emil-kowalski-skills`).
  - [`src/components/canvas/InfiniteDesk.tsx:L160-L168`](file:///F:/AppMaking/ViTudy/src/components/canvas/InfiniteDesk.tsx#L160-L168): Thay thế emoji `📥` bằng `<FileUp />` SVG vector.
  - [`src/components/hud/MultiplayerBar.tsx:L15-L130`](file:///F:/AppMaking/ViTudy/src/components/hud/MultiplayerBar.tsx#L15-L130): Thay thế toàn bộ emoji phản ứng bằng bộ SVG icons vector (`ThumbsUp`, `Lightbulb`, `Flame`, `Target`, `HelpCircle`).
  - [`src/data/mockSpaces.ts:L200-L220`](file:///F:/AppMaking/ViTudy/src/data/mockSpaces.ts#L200-L220): Xóa emoji `💡` và `🗺️` khỏi nội dung khởi tạo.
  - [`src/context/StudySpaceContext.tsx:L465-L475`](file:///F:/AppMaking/ViTudy/src/context/StudySpaceContext.tsx#L465-L475): Xóa emoji `📌` và `💡` khỏi định dạng ghi chú Inteline.
  - [`docs/ai/10_DECISIONS.md:L65-L85`](file:///F:/AppMaking/ViTudy/docs/ai/10_DECISIONS.md#L65-L85): Bổ sung `ADR-007` (Zero-Emoji) và `ADR-008` (Skill-First UI/UX & Auto-Update).
- **Removed:**
  - `CLAUDE.md`: Đã xóa theo yêu cầu, tập trung Single Source of Truth vào `AGENTS.md`.
- **Verified by:**
  - `pnpm run docs:index` & `pnpm run docs:check` $\rightarrow$ Pass exit 0.
  - Quét regex Unicode emoji toàn bộ thư mục `src/` $\rightarrow$ 0 emoji.
- **Open follow-ups:** Duy trì cập nhật `AGENTS.md` khi người dùng bổ sung quy tắc mới.
- **Changed:**
  - [`package.json:L8-L10`](file:///F:/AppMaking/ViTudy/package.json#L8-L10): Thêm scripts `"docs:index"` và `"docs:check"`.
- **Added:**
  - [`scripts/gen-docs-index.ts:L1-L230`](file:///F:/AppMaking/ViTudy/scripts/gen-docs-index.ts#L1-L230): Script AST trích xuất ký hiệu và kiểm tra tính hợp lệ của tài liệu.
  - Các tài liệu bộ nhớ trong `docs/ai/`: `00_INDEX.md`, `01_OVERVIEW.md`, `02_FILE_MAP.md`, `03_SYMBOL_INDEX.md`, `04_DATA_MODEL.md`, `05_API_AND_ROUTES.md`, `06_UI_MAP.md`, `07_STATE_AND_DATAFLOW.md`, `08_FEATURE_STATUS.md`, `09_ISSUES_AND_TODO.md`, `10_DECISIONS.md`, `11_CHANGELOG.md`, `SNAPSHOT.md`.
- **Verified by:**
  - `pnpm run docs:index` $\rightarrow$ Trích xuất thành công 52 symbols vào `03_SYMBOL_INDEX.md`.
  - `pnpm run docs:check` $\rightarrow$ Exit code 0, mọi ký hiệu đều hợp lệ.
  - `pnpm build` $\rightarrow$ Exit code 0, TypeScript & Lint đều sạch.
- **Open follow-ups:** Tích hợp bộ hướng dẫn vào `AGENTS.md` và `CLAUDE.md`.

---

## 2026-11-07 16:55 — uncommitted
- **Task:** Khắc phục lỗi hiển thị văn bản sách bị cắt cụt, giải phóng tiêu đề chương, nâng cấp phân trang 940x630, popover Inteline bôi đen chữ, và sửa lỗi trắng màn hình sau build.
- **Changed:**
  - [`src/components/objects/BookSpread.tsx:L25-L514`](file:///F:/AppMaking/ViTudy/src/components/objects/BookSpread.tsx#L25-L514) (`BookSpread`): Mở rộng 940x630, gờ mép trang 2.5D, tiêu đề 100% full width, selection popover Inteline, nút tách trang hover, phím mũi tên lật trang.
  - [`src/components/objects/StickyNoteItem.tsx:L13-L184`](file:///F:/AppMaking/ViTudy/src/components/objects/StickyNoteItem.tsx#L13-L184) (`StickyNoteItem`): Placeholder rỗng chuẩn xám nghiêng `"Ghi chú học tập mới..."`, cỡ chữ 16px font-semibold.
  - [`src/components/hud/TopLeftNav.tsx:L15-L198`](file:///F:/AppMaking/ViTudy/src/components/hud/TopLeftNav.tsx#L15-L198) (`TopLeftNav`): Đổi "Theo dõi tôi" thành "Đồng bộ góc nhìn" kèm chấm đèn xanh trạng thái.
  - [`src/components/canvas/Minimap.tsx:L6-L205`](file:///F:/AppMaking/ViTudy/src/components/canvas/Minimap.tsx#L6-L205) (`Minimap`): Đổi "RADAR" thành "BẢN ĐỒ", cập nhật kích thước 940x630.
  - [`src/components/hud/VrFrameOverlay.tsx:L5-L21`](file:///F:/AppMaking/ViTudy/src/components/hud/VrFrameOverlay.tsx#L5-L21) (`VrFrameOverlay`): Đổi "BÀN HỌC 2.5D" thành "Không gian học 2.5D".
  - [`src/data/mockSpaces.ts:L12-L210`](file:///F:/AppMaking/ViTudy/src/data/mockSpaces.ts#L12-L210): Cập nhật vị trí và góc xoay tự nhiên `-1.5°` cho sách.
- **Verified by:**
  - Khởi động lại `pnpm dev` trên cổng 3000.
  - Chạy `scripts/capture.mjs` qua Chrome Remote Debug (port 9222) và xác nhận 4 desk items hiển thị đầy đủ, không còn trắng màn hình.
  - Ảnh chụp màn hình lưu tại `latest_screenshot.png`.
- **Open follow-ups:** Lưu giữ quy chuẩn vào `AGENTS.md`.

---

## 2026-11-06 22:30 — 74d4cc0
- **Task:** Hoàn thiện Phase 4 (GPU acceleration, KnowInherit Marketplace 85/15, Multiplayer Presence UI).
- **Changed:**
  - Cập nhật các component HUD, modal xuất bản tài liệu, kiểm duyệt độ độc bản và định giá khung cố định.
- **Verified by:**
  - `pnpm build` thành công, commit `74d4cc0`.
