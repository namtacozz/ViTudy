# AGENTS.md — Quy Chuẩn Thiết Kế & Phát Triển ViTudy

> ### ⚡ BỘ CHỈ DẪN BẮT BUỘC CHO MỌI AGENT (MANDATORY AGENT DIRECTIVES)
> 1. **Before any work:** Read `docs/ai/00_INDEX.md`, then only the files relevant to the task. Use `03_SYMBOL_INDEX.md` and `02_FILE_MAP.md` to locate code instead of scanning the repo.
> 2. **After any work:** Follow the UPDATE PROTOCOL in `docs/ai/00_INDEX.md` Step 4.
> 3. **If docs and code disagree:** Code wins; fix the docs and log it in the changelog.
> 4. **Auto-Update Directives:** Bất cứ khi nào người dùng đề cập, thảo luận hoặc đưa ra yêu cầu chỉnh sửa liên quan đến một quy tắc thiết kế hay kỹ thuật nào, Agent **BẮT BUỘC TỰ ĐỘNG CẬP NHẬT NGAY** vào file `AGENTS.md` này mà không cần đợi người dùng phải nhắc.
> 5. **Single Source of Truth:** Codebase này chỉ sử dụng duy nhất file `AGENTS.md` cho các chỉ dẫn của Agent. Tuyệt đối không tạo hay sử dụng file `CLAUDE.md`.

---

Tài liệu này lưu giữ toàn bộ các quy tắc, quyết định kiến trúc và tiêu chuẩn thiết kế bắt buộc cho dự án **ViTudy** (Không gian học thức tích hợp AI 2.5D). Mọi Agent và lập trình viên khi thao tác trên codebase này **BẮT BUỘC** tuân thủ tuyệt đối các quy tắc dưới đây.

---

## 1. Bảng Màu & Thẩm Mỹ Giao Diện (Modern Educational Cockpit)

* **Bảng màu HUD / Hệ thống:**
  * Nền tảng: Sử dụng **Trắng (`#ffffff`)**, **Slate-50 (`#f8fafc`)**, **Đen (`#0f172a`)** và dải thang độ xám (`slate-100` đến `slate-800`).
  * **Màu điểm nhấn nhận diện — Thống nhất mã màu Cam ViT (Signature Brand Accent):**
    * Tên chuẩn: **Cam ViT** — Mã màu chính thức: **`#E0562D`** (trạng thái hover: **`#c9451e`**).
    * Phạm vi áp dụng đồng bộ: Nút Tải lên, nút Mở bản đồ khi ẩn, nút "Nhận ViToken" điểm danh, nút "Mở tài liệu" ở Chợ, ngọn lửa chuỗi học tập khi có chuỗi, điểm tiến độ, nút nộp bài, các huy hiệu trạng thái chính.
    * Hệ sắc độ đệm: Nền mềm `--accent-soft: #FFF7ED`, viền `--accent-border: #FFEDD5`, chữ `--accent-text: #9A3412` (chuẩn WCAG AA).
  * **Khoảng Cách HUD Bám Sát Mép Tường Trình Duyệt (Snug HUD Wall Spacing — 4px Strict):**
    * Toàn bộ các khung, nút ở HUD được đưa sát vào tường trình duyệt: khoảng cách từ mép hướng ra ngoài của HUD đến rìa web chỉ còn **4px (`1/4` so với 16px mặc định cũ: `top-1`, `bottom-1`, `left-1`, `right-1`)**.
    * Áp dụng đồng bộ cho: `TopLeftNav` (`top-1 left-1`), `TopRightWallet` (`top-1 right-1`), `LeftCreationBar` (`left-1`), `BottomLeftKnowledge` (`bottom-1 left-1`), `BottomRightToolkit` (`bottom-1 right-1`), và `MultiplayerBar` (`top-1`).
    * Tối ưu hóa triệt để không gian học tập trung tâm của mặt bàn, triệt tiêu khoảng hở thừa không cần thiết.
  * **Biểu Tượng Chuỗi Ngày Học Tập (Streak Flame Icon):**
    * Biểu tượng ngọn lửa được căn đưa cao hơn một chút (`-translate-y-1`), giúp phần bụng tròn của ngọn lửa ôm trọn số ngày chuỗi học tập màu trắng ở bên trong (`-translate-y-0.5`), số hiển thị rõ ràng, sắc nét, hoàn toàn không bị lệch hay che khuất.
  * **Quy Chuẩn Nút Mở Bản Đồ Khi Ẩn (Minimap Reopen Button):**
    * Đồng bộ hoàn toàn style với Nút Tải lên tài liệu: khung vuông bo góc `rounded-xl`, kích thước chuẩn `w-10 h-10`, nền trắng `bg-white hover:bg-orange-50/80`, viền `border border-slate-300 hover:border-orange-300`, đổ bóng nhẹ `shadow-sm`, icon `Map` SVG màu Cam ViT (`#E0562D`, `stroke-[2.4]`). Tuyệt đối không dùng nút tròn nền cam độc lập.
  * **Hệ thống màu trạng thái ngữ nghĩa (Status Tokens):**
    * **Đúng (Success / Correct):** Xanh lục bảo ngọc (`#15803D`), nền `#ECFDF5`, viền `#A7F3D0`.
    * **Sai (Danger / Wrong):** Đỏ ruby thanh nhã (`#DC2626`), nền `#FEF2F2`, viền `#FECACA`.
    * **Gợi ý (Warning / Hint):** Vàng mật ong hổ phách (`#92400E`), nền `#FEF3C7`, viền `#FDE68A`.
* **Các vùng ngoại lệ có chủ đích (Màu sắc vật thể thực):**
  * **Giấy ghi chú (Sticky Note):** Giữ màu vàng ấm đặc trưng của giấy note (`#fef08a`, `#fed7aa`...).
  * **Bản đồ thu nhỏ (Minimap) & Ma trận (Matrix Map):** Cho phép màu nhận diện vật thể (sách xanh xám, tài liệu xanh ngọc, note vàng, ô xanh/đỏ bài thi).
  * **Nét vẽ bút / Bút dạ quang:** Giữ màu mực do người dùng chọn (vàng dạ quang, xanh, đen, đỏ).
  * **Đèn tín hiệu trạng thái:** Màu xanh lá (`emerald-400`) báo hiệu trạng thái hoạt động ("Đang đồng bộ góc nhìn").
* **Mặt bàn học (Desk Surface):**
  * Sử dụng nền **Slate xám nhạt thanh nhã (`#e8ebf0`)** kết hợp lưới ô kẻ caro mảnh nhẹ (`DeskGrid`), làm nổi bật các tài liệu thuần trắng hoặc các HUD trắng với độ tương phản cao, tạo cảm giác không gian học sáng sủa, tinh gọn, chống chói và chống mỏi mắt. Không dùng nền tối hay nền xanh chìm.
* **Thống Nhất Màu Sắc Icon HUD (Black & White Strict Icon Scheme):**
  * Toàn bộ biểu tượng icon trong HUD **chỉ sử dụng màu Đen (`text-slate-900`) trên nền trắng**, hoặc **Trắng (`text-white`) trên nền cam thương hiệu**. Tuyệt đối không phối màu đa dạng lung tung (xanh, đỏ, vàng...).
  * Khi người dùng nhấp chọn hoặc một công cụ/nút đang kích hoạt trên nền trắng: **phần nền chuyển sang xám đậm hơn (`bg-slate-200`)** để biểu thị trạng thái đang chọn.

---

## 2. Tuyệt Đối Cấm Emoji / Emote — Sử Dụng Icon SVG Chuẩn (Zero-Emoji Policy)

* **Nghiêm cấm tuyệt đối:** Không sử dụng bất kỳ ký tự emoji / emote Unicode nào (như 💡, 👏, 🔥, 🎯, ❓, ✨, ✂️, 📌, 🗺️, 📖, 🚀...) trên toàn bộ giao diện người dùng, nút bấm, HUD, nhãn trạng thái hay modal hệ thống.
* **Quy chuẩn thay thế:** Sử dụng 100% **Icon SVG vector** sắc nét, tối giản, lấy cảm hứng và phong cách chuẩn từ [Morphicons](https://www.morphicons.com/) hoặc bộ icon vector chuẩn mực như `lucide-react`. Các icon chuyển động phải mượt mà, đúng ngữ nghĩa công thái học.

---

## 3. Kỷ Luật Thiết Kế Giao Diện — Combo Skill Bắt Buộc (Skill-First UI/UX)

* **Cấm tuyệt đối tự ý vẽ mới giao diện ("Vibe Coding"):** Không tự tiện bịa đặt cấu trúc layout, khoảng cách hay hiệu ứng thị giác theo cảm tính.
* **Quy trình bắt buộc khi thiết kế, tạo mới hoặc tinh chỉnh UI:** Phải tự động kích hoạt và tuân thủ bộ combo skill giao diện cao cấp đã cài đặt:
  1. **`stageshow`**: Chuẩn mực thiết kế Faux UI, bố cục cận cảnh (hard crop), cửa sổ vệ tinh, loại bỏ text thừa (`standard fidelity`), chuyển động có nguyên nhân rõ ràng.
  2. **`hallmark` & `design-taste-frontend`**: Triệt tiêu các giao diện rập khuôn AI, chặn 3 card gradient tím / font Inter nhạt nhòa, định hướng thẩm mỹ chuẩn giải thưởng Awwwards / One Page Love.
  3. **`impeccable`**: Thanh tra và kiểm duyệt độ tương phản chuẩn WCAG 2.2 AA/AAA, phân cấp thị giác (visual hierarchy) chặt chẽ.
  4. **`awesome-design-md` & `google-design-md`**: Thiết lập và bám sát hợp đồng design tokens và triết lý thiết kế chuẩn mực.
  5. **`emil-kowalski-skills`**: Tối ưu vi tương tác (micro-interactions) phản hồi tức thì (<300ms), đường cong giảm tốc dứt khoát, loại bỏ animation rề rà hay giật lag.

---

## 4. Tương Tác Mặt Bàn Học (Infinite Desk Interaction)

* **Phân định thao tác Chuột & Công cụ Vẽ:**
  * **Khi ở chế độ con trỏ (`cursor`):** Kéo chuột trên mặt bàn dùng để di chuyển không gian bàn học (pan canvas).
  * **Điều Hướng Bàn Học Bằng Phím (WASD & Phím Mũi Tên):**
    * Khi người dùng không đang nhập liệu văn bản (`input`, `textarea`, `contenteditable`), có thể bấm giữ các phím `W`, `A`, `S`, `D` hoặc 4 phím mũi tên (`Up`, `Left`, `Down`, `Right`) để lia tầm nhìn camera mượt mà theo thời gian thực (60fps).
    * `W` / `Mũi tên lên`: Lia camera lên trên.
    * `S` / `Mũi tên xuống`: Lia camera xuống dưới.
    * `A` / `Mũi tên trái`: Lia camera sang trái (khi không giữ `Alt`).
    * `D` / `Mũi tên phải`: Lia camera sang phải (khi không giữ `Alt`).
  * **Khi cầm bút (`pen` hoặc `highlighter`):**
    * Kéo chuột ở bất kỳ đâu trên mặt bàn sẽ **tự động vẽ tự do nét mực**. Tuyệt đối không được kéo dịch bàn học làm nét bút bị co cụm thành một chấm.
    * Khi muốn di chuyển bàn học trong lúc đang chọn bút: Người dùng **giữ phím `Alt` và kéo chuột (`Alt + Drag`)** để pan canvas.
* **Hitbox của Tài liệu & Vật thể:**
  * Vùng click / hitbox của sách và tài liệu phải bám sát chính xác kích thước hiển thị của UI.
  * Tuyệt đối không để margin, padding vô hình hoặc vùng bắt sự kiện tràn ra ngoài che khuất mặt bàn trắng, gây kẹt thao tác kéo chuột của người dùng.
* **Cấm Tự Động Nuốt/Gộp Vật Thể Khi Kéo Thả (Zero Silent Swallowing):**
  * Mọi tài liệu khi kéo đè lên sách hoặc vật thể khác phải giữ nguyên vẹn vị trí và z-index đè lên trên, cho phép người dùng tự do sắp đặt chồng chéo tài liệu như mặt bàn học thực tế.
  * Tuyệt đối không tự động gộp trang hay xóa biến mất vật thể đang kéo khi thả chuột lên vật thể khác. Thao tác gom gộp chỉ được thực hiện khi người dùng chủ động chọn chức năng tương ứng.
* **Vùng Cầm Nắm & Kéo Di Chuyển Chuyên Biệt (Dedicated Drag Handles):**
  * **Sách (`BookSpread`):** Chỉ cho phép kéo di chuyển bằng **phần viền da nâu của bìa sách**, **phần tiêu đề chương (header)**, **phần số trang (footer)**, và **huy hiệu tên sách dưới bìa**. Phần thân đoạn văn (`<p>`) nghiêm cấm bắt sự kiện kéo để người dùng tự do bôi đen chọn chữ.
  * **Tờ giấy đơn (`PaperSheet`):** Kéo di chuyển bằng **phần thanh tiêu đề ở trên** và **chân trang**. Thân giấy phục vụ bôi đen chữ và tương tác.
  * **Giấy ghi chú (`StickyNoteItem`):** Kéo di chuyển bằng **dải băng dính keo dán phía trên** và **thanh đếm ký tự phía dưới (footer)**. Vùng soạn thảo ghi chú (`textarea`) không bắt sự kiện kéo.
* **Sợi Chỉ Đỏ Nối Đinh Ghim (`VisualLinkThreads`):**
  * Luôn render ở lớp trên cùng (`z-index: 100+`) đè lên trên tất cả sách, tài liệu và giấy ghi chú. Khi người dùng nhấp vào note hoặc sách, sợi chỉ và đinh ghim luôn hiển thị rõ ràng trên mặt giấy, không bao giờ bị chìm ra phía sau.
* **Vẽ Nét Mực In Lên Tài Liệu & Di Chuyển Theo Vật Thể (In-Document Ink Attachment):**
  * Khi người dùng vẽ bằng bút (`pen`) hoặc bút dạ quang (`highlighter`) lên bề mặt **Sách (`BookSpread`)**, **Tờ giấy đơn (`PaperSheet`)** hoặc **Giấy ghi chú (`StickyNote`)**:
    * Hệ thống tự động xác định tài liệu nằm ngay dưới nét vẽ và chuyển đổi tọa độ điểm vẽ sang hệ tọa độ cục bộ (`item-local coordinates`) của tài liệu đó (`attachedToItemId`).
    * Lớp hiển thị mực cục bộ `<ItemDrawingOverlay />` được render trực tiếp bên trong container của tài liệu.
    * Khi người dùng kéo di chuyển hoặc xoay tài liệu ở bất kỳ góc độ nào, các nét vẽ trên đó **luôn bám chặt và di chuyển/xoay chuẩn xác 100% cùng tài liệu** mà không bị lệch hay trôi nét.
    * Khi tài liệu bị xóa khỏi bàn học, toàn bộ nét mực gắn với tài liệu đó tự động được dọn dẹp sạch sẽ.

---

## 5. Quy Chuẩn Sách & Tài Liệu 2.5D (Book & Document Standards)

* **Hiển Thị Công Thức Toán Học Chuẩn Mực Bằng KaTeX (`MathRenderer`):**
  * Toàn bộ tài liệu, sách học thuật, công thức toán (đạo hàm, gradient $\nabla f$, ma trận, phân số, vector) bắt buộc render qua `<MathRenderer />` sử dụng thư viện `KaTeX` với cú pháp LaTeX inline (`$...$`) và display block (`$$...$$`).
  * Danh sách liệt kê học thuật chuẩn hóa bằng dấu bullet `•` rõ ràng, tiêu đề in đậm cho các định lý và khái niệm cốt lõi.
* **Chế Độ "Tập Trung Đọc" (Focus Reading Mode) & Khóa Điều Hướng Bàn Học:**
  * **Vị trí thanh nhắc chuẩn:** Nút chế độ tập trung được tích hợp trực tiếp thành **thanh nhắc (bookmark tab) màu Chàm (`indigo-600`)** nằm ngay dưới tab "Tóm tắt" và trên tab "Phóng to".
  * **Hành vi kéo ra / thụt vào:**
    * Khi kích hoạt chế độ tập trung: thanh nhắc tự động **được giữ yên ở trạng thái kéo ra** (`w-[116px]`, nền `indigo-700`, viền sáng `ring-2 ring-indigo-400/60`, hiện rõ chữ "Tập trung").
    * Khi nhấp vào lại: thanh nhắc tự động thụt vào (`w-[48px]`) và thoát chế độ tập trung.
    * Tuyệt đối không dùng overlay banner cố định ở đỉnh màn hình ("Đang ở chế độ tập trung... Thoát").
  * **Khóa thao tác camera & Popup cảnh báo:**
    * Trong lúc đang tập trung đọc: hệ thống **khóa hoàn toàn thao tác cuộn chuột (zoom) và di chuyển góc nhìn (kéo rê chuột, phím WASD, 4 phím mũi tên)**.
    * Khi người dùng cố gắng zoom hoặc lia camera, xuất hiện popup thông báo chuẩn style app: **`Đang tập trung (nhấn để thoát)`** kèm icon `Eye` Cam ViT.
    * Nhấp vào nút `(nhấn để thoát)` trên popup cũng lập tức giải phóng góc nhìn và thoát chế độ tập trung.
* **Xác Nhận An Toàn Khi Xóa Sách (Delete Confirmation Dialog):**
  * Nút Xóa (tab đỏ) trên thẻ bookmark sách được tách biệt bằng một vạch phân cách mỏng (`bg-amber-950/25`) và có tooltip rõ ràng.
  * Khi bấm nút Xóa, hệ thống bắt buộc mở modal xác nhận an toàn ("Xóa sách khỏi bàn học? [Hủy] [Xác nhận xóa]") để bảo vệ dữ liệu người dùng, tránh thao tác click nhầm.
* **Đường Nối Chỉ Đỏ Tránh Nội Dung Sách (Smart Bezier Routing):**
  * Khi sợi chỉ đỏ xuất phát từ một trang sách và nối sang tài liệu bên phải, đường cong Bezier tự động uốn cong dạng vòm bay vượt lên trên đỉnh gáy sách (`archApexY < sourceItem.y - 22`), hoàn toàn không đè lên nội dung văn bản Chương 2.
  * Nét chỉ mảnh tinh tế `1.5px`, bán trong suốt (`strokeOpacity="0.6"`), đinh ghim nhỏ gọn `r="4"`. Tuyệt đối không đính kèm nhãn chữ thừa (như "Liên quan đến") trên đường chỉ để giữ không gian học gọn gàng, thanh thoát.

* **Kích thước & Chiều sâu 2.5D:**
  * Sách dạng mở đôi (`BookSpread`) có kích thước chuẩn **`980 × 640px`**, chiếm khoảng 55–60% chiều ngang màn hình ở mức zoom 100%.
  * **Bìa Sách Dày Dặn Màu Nâu (Rich Brown Leather Hardcover):** Sử dụng tông màu nâu da ấm sang trọng (`#5c3920` đến `#341c0c`), viền bìa hai bên mở rộng gấp 3 lần (`42px`), bo góc lớn `rounded-2xl`, không dùng thanh giả độ sâu ngoài bìa và không đổ bóng lên bìa sách (chỉ giữ bóng rãnh gáy bên trong giấy).
  * Góc nghiêng mặc định: `0°` (ngay ngắn, thẳng thớm để triệt tiêu hiện tượng răng cưa/mờ viền chữ khi phóng to zoom-in trên lưới pixel màn hình).
  * **Xóa Bỏ Khái Niệm BINDER / Sổ Tổng Hợp:** Mọi cuốn sách đều là thực thể sách chuẩn mực, không hiển thị dải ruy-băng hay huy hiệu "SỔ TỔNG HỢP (BINDER)".
* **Thiết Kế Sách Thực Thể Chân Thực (Authentic Physical Book — Zero AI Bezel):**
  * Tuyệt đối không bọc viền đen/chassis dày kiểu tablet hay khung cửa sổ phần mềm xung quanh sách làm mất tính chân thực.
  * Sách mở đôi hiển thị trọn vẹn 2 trang giấy ngà (`#fdfbf7`), rãnh gáy sách trung tâm đổ bóng tự nhiên strictly bên trong ruột giấy.
  * **Thẻ Đánh Dấu Ruy Băng Chữ V (V-Notched Bookmark Index Tabs):**
    * Gắn luồn 8px phía dưới mép phải của trang giấy sách (`calc(100% - 50px)`, tờ giấy đè lên chân thanh nhắc).
    * **Trạng thái bình thường (idle - chưa kéo):** Thanh nhắc thu gọn tinh tế (`w-[48px]`, chỉ lộ ra ngoài giấy 40px), icon vector nằm sát mép giấy trắng (chỉ hở một khoảng đệm nhỏ 8px). Khoảng cách giữa icon và rìa phải khuyết chữ V được bảo toàn nguyên vẹn (`pr-4` kèm notch 10px).
    * **Hiệu ứng trượt mở khi hover (Compact Slide-out Ribbon on Hover):** Khi rê chuột, thanh nhắc trượt mở sang phải với chiều dài vừa khít nội dung (`w-[86px]` đến `w-[124px]`). Chữ cái đầu tiên (ví dụ chữ "T" của "Tóm tắt") nằm ngay sát hở 8px so với tờ giấy trắng, triệt tiêu hoàn toàn khoảng trống thừa ở giữa và không kéo thanh nhắc ra dài quá đà.
    * Đầu ngoài thanh nhắc có hình chữ V khuyết lõm vào trong (`polygon(0 0, 100% 0, calc(100% - 10px) 50%, 100% 100%, 0 100%)`).
    * Sử dụng 6 màu chuẩn theo thứ tự từ trên xuống dưới:
      1. **Màu Xanh Lá (`emerald-600`):** Icon `Sparkles` + Chữ **"Tóm tắt"** (Mở STudy).
      2. **Màu Chàm (`indigo-600`):** Icon `Eye` + Chữ **"Tập trung"** (Giữ yên kéo ra khi bật, nhấp lại để thoát).
      3. **Màu Cam (`orange-600`):** Icon `Maximize2` + Chữ **"Phóng to"** (Mở toàn màn hình PDF View).
      4. **Màu Xanh Lam (`sky-700`):** Icon `Scissors` + Chữ **"Tách trang"** (Tách trang đang mở ra tờ rời trên bàn học).
      5. **Màu Nâu (`#78350f`):** Icon `RotateTwoWay` + Chữ **"Xoay"** (Xoay tự do 360°, nhấn đúp căn $0^\circ$).
      6. **Màu Đỏ (`rose-600`):** Icon `Trash2` + Chữ **"Xoá"** (Xóa sách khỏi bàn học, có vạch ngăn cách & xác nhận an toàn).
  * **Số Trang Đặt Ở Góc Trang Như Sách Thật (Physical Corner Pagination):**
    * Trang bên trái: Chỉ hiển thị duy nhất số trang ở **góc dưới cùng bên trái** (không có chữ ViTudy Desk thừa).
    * Trang bên phải: Chỉ hiển thị duy nhất số trang ở **góc dưới cùng bên phải** (không có tên sách thừa ở chân trang).
  * **Tắt Kiểm Tra Chính Tả (Spellcheck Off):**
    * Toàn bộ hệ thống web và các trường nhập liệu ghi chú (Sticky Note), câu hỏi AI đều tắt cờ `spellCheck={false}` để triệt tiêu các gạch chân đỏ lượn sóng báo sai chính tả tiếng Việt.
  * **Hiệu Ứng Lật Trang Bằng Chuột Như Đời Thật (Interactive 3D Page-Curl & Drag Không Bị Cắt Khung):**
    * Khi rê chuột vào rìa ngoài bên trái hoặc bên phải trang sách, xuất hiện nếp gấp góc trang gợi ý (curled page hint).
    * Người dùng có thể **nhấp chuột hoặc đè chuột và kéo (drag-to-flip)**: tờ giấy sẽ cuộn uốn cong trong không gian 3D (`rotateY`) bám theo vị trí con trỏ chuột, để lộ trang tiếp theo bên dưới với bóng đổ nếp gấp giấy vật lý chân thực.
    * **Mở rộng không gian 2.5D (Unclipped 3D Bleed):** Container trang ruột áp dụng `overflow-visible`, tờ giấy lật mở rộng `top: -10px` và chiều cao `calc(100% + 20px)` uốn cong vươn tự nhiên vào phần viền da bìa sách màu nâu mà không bị ngắt cụt mép trên và mép dưới.
    * **Lật trang tức thì không trễ nội dung (Pre-rendered Underlying Leaves):** Trong lúc kéo lật, mặt giấy nằm bên dưới **đã được nạp sẵn nội dung của trang kế tiếp** (`underneathLeaf`), và mặt sau của tờ giấy lật hiển thị đúng trang chuẩn bị tiếp đất. Khi kết thúc hành trình lật trang, góc nhìn giữ nguyên vẹn 100% pixel, triệt tiêu hoàn toàn độ trễ hoặc hiện tượng chớp nháy tráo đổi nội dung sau khi lật.
    * Thả chuột quá 28% hành trình sẽ tự động hoàn tất lật trang; thả chuột khi chưa tới ngưỡng sẽ tự động đàn hồi trở lại vị trí cũ.
  * **Tên Sách Dưới Bìa (Bottom Title Badge):**
    * Chỉ hiển thị tên sách tinh gọn, không có icon quyển sách, không có thanh trượt tiến trình (scrubber) hay dòng chữ lật trang.
    * Nằm hở một khoảng cách bên dưới đáy bìa sách (`top-full mt-3.5`), tuyệt đối không đè lên trang sách hay bìa sách.
  * **Hỏi AI Inteline:**
    * Kích hoạt độc quyền theo cơ chế bôi đen văn bản: Khi người dùng **bôi đen đoạn văn bản trong sách**, một thẻ card hỏi nhanh nổi lên **ngay tại vị trí kết thúc của đoạn bôi đen** kèm khung đặt câu hỏi, các gợi ý câu hỏi nhanh (Giải thích, Ví dụ, Ý chính) và trả lời trực tiếp tại chỗ.
    * Không đặt nút bấm Inteline rời rạc trên bất kỳ thanh overlay nào.
* **Chế Độ Xem Toàn Màn Hình (Full-Screen Document Reader / PDF View):**
  * Nút "Xem Full" (`Maximize2`) trên thẻ bookmark tab bìa phải cho phép mở giao diện đọc toàn màn hình kiểu PDF reader, hỗ trợ chuyển trang, zoom (60%–160%), chuyển đổi 1 trang / 2 trang, và nút thoát rõ ràng (kèm phím tắt `Esc`).
* **Phân trang thật & Không kẹt số trang (Zero Text Clipping & Unbounded Navigation):**
  * `turnBookPage` luôn truyền và tiếp nhận tham số `totalPages` của tài liệu để người học có thể lật tới trang cuối cùng mà không bị chặn ở số trang thô.
  * Không dùng thanh cuộn dọc lộ liễu bên trong trang sách để giữ đúng ẩn dụ "tờ giấy", đồng thời tích hợp lớp bảo hiểm `overflow-y-auto no-scrollbar` để chống tràn sub-pixel.

* **Quy Chuẩn Tờ Giấy Đơn (`PaperSheet`):**
  * **Luôn là 1 trang duy nhất (Strictly Single-Page):** Nghiêm cấm phân trang trên mặt bàn. Nếu tài liệu có nhiều trang, phải tách thành các tờ rời độc lập hoặc gộp thành Sách.
  * **Không thanh cuộn & Tự co giãn phông chữ (Zero Scrollbars & Dynamic Font Scaling):** Tuyệt đối cấm xuất hiện thanh cuộn dọc/ngang trên tờ giấy đơn (`overflow-hidden`). Phông chữ tự động co giãn kích thước (từ `14.5px` xuống `10.5px`) dựa theo độ dài văn bản để nội dung luôn nằm gọn trọn vẹn trong trang.
  * **Tiêu đề tinh gọn & Cho phép chỉnh sửa trực tiếp:** Bỏ tiền tố `"TỜ TÓM TẮT NHANH:"`, chỉ hiển thị tên thực của tài liệu. Nhấp chuột vào tên tài liệu để chuyển sang chế độ gõ sửa tên trực tiếp (`updateItemTitle`).
  * **Thanh Công Cụ Nổi Tờ Giấy Đơn (PaperSheet Overlay Toolbar):**
    * Thứ tự chuẩn từ trái sang phải:
      1. **Nút STudy:** Chỉ hiển thị icon SVG `Sparkles` màu Cam ViT (`#E0562D`, `stroke-[2.4]`), không kèm text thừa, có tooltip trực quan `STudy: Tóm tắt & Trắc nghiệm`. Khi bấm, mở overlay STudy trực tiếp ngay trên mặt tờ giấy.
      2. **Nút Thẻ Ghi Nhớ:** Icon SVG `Layers` (`stroke-[2.4]`), tooltip `Trích xuất Thẻ Ghi Nhớ ra cạnh tài liệu`. Khi bấm, **hệ thống trích xuất ngay lập tức các thẻ Spaced Repetition ra giấy ghi chú đặt ngay cạnh tài liệu mà không hiện popup hay overlay nào**.
      3. **Vạch ngăn cách:** `<div className="w-[1px] h-4 bg-slate-200" />`.
      4. **Nút Đọc Toàn Màn Hình:** Icon `Maximize2`.
      5. **Nút Xoay 360°:** Icon `RotateTwoWay`.
      6. **Vạch ngăn cách:** `<div className="w-[1px] h-4 bg-slate-200" />`.
      7. **Nút Xóa Khỏi Bàn Học:** Icon `Trash2`.
  * **Quy Chuẩn Overlay STudy Tại Chỗ Cho Tờ Giấy Đơn (`In-Situ Paper STudy Overlay`):**
    * **Hiển thị trực tiếp che lên bề mặt tờ giấy:** Overlay STudy được render trực tiếp bên trong container tờ giấy (`absolute inset-0 z-30`), che phủ vừa vặn tờ giấy và di chuyển/xoay chuẩn xác 2.5D cùng tờ giấy thay vì mở modal giữa màn hình.
    * **Header siêu gọn gàng:** Chỉ gồm `[Icon Sparkles Cam ViT] STudy` và nút đóng tròn `X`, nhấp vào đóng overlay và hiển thị lại nội dung giấy ban đầu.
    * **Cân đối 2 tab 50/50 (Balanced Navigation):** Chia đều 2 tab **`Tóm Tắt` (50%)** và **`Trắc Nghiệm` (50%)** theo dạng `grid grid-cols-2`.
    * **Chặn hoàn toàn hiện tượng cuộn chuột làm zoom bàn học:** Thiết lập `data-overlay="true"` và chặn `onWheel` lan truyền (`e.stopPropagation()`), cho phép người dùng cuộn xem nội dung trong overlay mượt mà mà bàn học không bị zoom co giãn theo.
    * **Nổi bật dòng "Sử dụng AI.":** Hàng tùy chọn AI được đóng khung dạng thẻ badge nổi bật (`bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-orange-300`), icon `Sparkles` nhấp nháy, chữ cam ViT bold và nhãn `Chuyên sâu`.
    * **Cấu trúc 3 dòng chuẩn mực trong mỗi Tab:**
      * **Tab 1 — Tóm tắt:**
        * Dòng 1: Tiêu đề viết ngang trọn vẹn: `Tóm tắt nội dung trọng tâm` (không mô tả phụ).
        * Dòng 2: Thẻ tùy chọn nổi bật `Sử dụng AI.`
        * Dòng 3: Nút nằm sát bên phải: `Tạo tóm tắt` nền Cam ViT (`#E0562D`), chữ trắng, không wrap text.
        * Chân trang ngắn gọn: `Ghim Tóm Tắt Lên Bàn` (tự động xuất ra note ngay cạnh tài liệu tương tác) và `Sao chép nội dung`.
      * **Tab 2 — Trắc nghiệm:**
        * Dòng 1: Tiêu đề viết ngang hết dòng: `Tạo đề ôn tập trắc nghiệm.`
        * Dòng 2: Thẻ tùy chọn nổi bật `Sử dụng AI.` (gọi AI sinh đề bám sát nội dung khi bật).
        * Dòng 3: Nút nằm sát bên phải: `Sinh Câu Hỏi` (hoặc `Tạo Đề Mới`) nền Cam ViT (`#E0562D`), chữ trắng.
        * Chân trang ngắn gọn: `Xuất Đề Thi Ra Bàn` (tự động tạo tờ đề thi nằm ngay cạnh tài liệu tương tác) và `Chấm Điểm Ngay`.
    * **Vị trí xuất vật thể tương tác luôn cạnh tài liệu gốc:** Mọi tài liệu xuất ra từ STudy hoặc Thẻ ghi nhớ (Flashcard note, Summary note, Exam sheet) đều tự động định vị tại `x = item.x + item.width + 30`, `y = item.y`.
  * **Hỏi AI Inteline:** Bôi đen bất kỳ đoạn văn bản nào trên giấy để làm nổi thẻ card Inteline ngay tại vị trí con trỏ chuột.

* **Quy Chuẩn Thẻ Trắc Nghiệm Tương Tác 3D Lật Mặt (`ExamQuizCard`):**
  * **Kích thước & Màu sắc thẻ:**
    * Kích thước chuẩn: `380 × 490px`, đủ cho 1 câu hỏi + 4 đáp án và bảng điều khiển mà không cần cuộn dọc.
    * Màu nền: Lấy ngẫu nhiên từ bộ màu giấy ghi chú pastel (`#fef08a`, `#fed7aa`, `#bbf7d0`, `#bae6fd`, `#fbcfe8`), bo góc lớn `rounded-2xl`, bóng đổ thẻ vật lý 2.5D.
  * **Màn hình Bìa Bộ Đề (Intro Screen):**
    * Tiêu đề bộ đề, số lượng câu hỏi, thời gian làm bài dự kiến.
    * Ở giữa đáy thẻ: Nút **"Bắt đầu làm bài"** nổi bật với màu **Cam ViT (`#E0562D`)**, chữ trắng.
  * **Cơ Chế Lật Mặt 3D Như Trang Sách (Interactive 3D Page Flip):**
    * Khi bấm "Bắt đầu làm bài", thẻ lật xoay 3D từ trái sang phải (`rotateY(180deg)` $\rightarrow$ `0deg`) để lộ Câu 1 ở mặt sau.
    * Khi người dùng chọn đáp án và bấm **"Xác nhận"**: hiển thị phán quyết ngay lập tức (Xanh lá `✓ ĐÚNG` hoặc Đỏ `✕ SAI`), giải thích chi tiết, và nút chuyển thành **"Câu tiếp theo"** (hoặc **"Hoàn thành"** ở câu cuối cùng).
    * Bấm "Câu tiếp theo" sẽ tiếp tục lật xoay 3D sang câu tiếp theo.
  * **Thanh Điều Hướng Câu Hỏi Dạng List Ngang Ở Đáy Thẻ (Bottom Horizontal Strip):**
    * Nằm sát mép đáy bên trong thẻ, độ rộng được giới hạn nghiêm ngặt không vượt quá chiều rộng thẻ.
    * Hai đầu: 2 nút mũi tên chuyển câu `<` (Lùi) và `>` (Tiến).
    * Ở giữa: Danh sách các ô tròn/pill đại diện cho các câu hỏi:
      * **Câu đã làm:** Màu Xanh lá (`#15803D`) nếu trả lời đúng, Màu Đỏ (`#DC2626`) nếu trả lời sai.
      * **Câu hiện tại:** Tô xám đậm (`bg-slate-300 text-slate-900 border-slate-400 ring-1 ring-slate-400 font-black`) tương tự trạng thái công cụ HUD đang chọn.
      * **Câu tương lai / chưa làm:** Màu trắng chữ đen.
    * Người học có thể bấm vào bất kỳ ô nào để chủ động nhảy câu hoặc lật tới/lui tự do trong lúc làm bài.
  * **Màn hình Tổng Kết & Xem Lại Câu (Summary & Review Screen):**
    * Khi hoàn thành câu cuối và bấm "Hoàn thành", thẻ lật 3D sang màn hình Tổng kết.
    * **Tổng điểm cỡ to nổi bật ở trên giữa:** Render số điểm `X / 10` với cỡ chữ lớn (`text-4xl`/`text-5xl`) màu Cam ViT (`#E0562D`), kèm tỷ lệ phần trăm và lời nhận xét sư phạm.
    * **Bảng lưới các ô câu trả lời:** Hiển thị toàn bộ các câu hỏi kèm trạng thái đúng/sai.
    * **Chế độ Xem Lại Chi Tiết (Review Mode):** Nhấp vào ô câu hỏi bất kỳ trong bảng sẽ lật thẻ 3D từ trái sang phải về câu hỏi đó để xem lại đáp án và giải thích chi tiết.
    * Ở chế độ xem lại: Xuất hiện nút **"Quay lại tổng kết"** ở góc trên; bấm vào sẽ lật ngược từ phải sang trái về lại màn hình Tổng kết.
    * Nút **"Làm lại bộ đề này"** cho phép reset toàn bộ trạng thái để luyện tập lại từ đầu.

---

## 6. Cơ Chế Xoay Tự Do 360° & Chế Độ Xoay Bàn Học (View Rotation Mode)

* Thay vì đặt các nút quay cứng 90° rời rạc, mỗi vật thể (sách, tài liệu, note) sử dụng **một nút xoay chung**.
* **Biểu tượng Xoay Hai Chiều Trực Quan (`RotateTwoWay`):** Sử dụng icon hình vòng cung với 2 đầu mũi tên trái - phải đối xứng (`RotateTwoWay`), thay thế hoàn toàn icon quay 1 chiều `RotateCw` cũ, giúp người dùng nhìn vào là nhận biết ngay thao tác kéo xoay trái hoặc phải tự do.
* **Cơ chế tương tác trên vật thể:** 
  * Người dùng đè chuột vào nút xoay và rê theo hướng nào thì tài liệu/vật thể sẽ xoay mượt mà theo góc chuột hướng đó (tính góc qua `Math.atan2`).
  * **Hút từ tính về 0° (Magnetic Snap):** Khi góc xoay nằm trong khoảng $\pm 2.5^\circ$ so với trục thẳng đứng ($0^\circ$), hệ thống tự động hút về đúng $0^\circ$ giúp người dùng dễ dàng căn thẳng sách tài liệu để đọc sắc nét nhất.
  * **Nhấn đúp để căn thẳng tức thì:** Người dùng nhấn đúp chuột (`double-click`) vào nút xoay để lập tức trả tài liệu về góc $0^\circ$ ngay ngắn.
* **Chế Độ Xoay Toàn Bàn Học Qua Nút Bật Chuyên Dụng (Dedicated View Rotation Mode Button):**
  * **Loại bỏ hoàn toàn phím tắt `Alt + ...`:** Phím tắt WASD và mũi tên được bảo toàn 100% cho việc lia tầm nhìn camera (pan canvas) mượt mà.
  * **Nút kích hoạt bên trái thanh zoom:** Tích hợp 1 nút icon `RotateTwoWay` nằm ngay **bên trái thanh công cụ zoom** ở góc dưới bên phải (`BottomRightToolkit`).
  * **Trạng thái kích hoạt (Active):** Khi bật lên, nút chuyển sang màu Cam ViT (`#E0562D`) chữ trắng. Con trỏ chuột toàn bàn học đổi sang icon xoay hai chiều.
  * **Kéo xoay tự do bất kỳ đâu:** Khi đang ở chế độ xoay, **người dùng có thể nhấp và kéo chuột ở bất kỳ đâu trên màn hình (kể cả trên mặt bàn học, trong ruột sách, ruột giấy hay ghi chú) đều sẽ xoay góc nhìn bàn học theo chuột**.
  * **Căn thẳng tức thì:** Nhấn đúp chuột ở bất kỳ đâu trong chế độ xoay (hoặc nhấp kim La bàn ở góc trên bên trái) sẽ đưa góc nhìn trở về $0^\circ$.
  * Nhấp lại vào nút xoay ở thanh zoom để tắt chế độ xoay và trở về thao tác bình thường.

---

## 7. Giấy Ghi Chú (Sticky Notes)

* **Trạng thái Khởi tạo:** Ghi chú mới tạo có nội dung rỗng mặc định.
* **Placeholder & Cỡ Chữ Ban Đầu (1/3 Chiều Cao Note):**
  * Khi chưa viết gì hoặc chữ rất ngắn: Cỡ chữ hiển thị **ít nhất bằng 1/3 chiều cao của note** (`Math.round(height / 3.2)` $\approx 52\text{px}-60\text{px}$), tạo điểm nhấn thị giác lớn, đậm nét và rõ ràng.
* **Tự Động Co Nhỏ Chữ Sát Vạch Footer & Nghiêm Cấm Thanh Cuộn:**
  * Cho phép nội dung người dùng gõ mở rộng tiến sát tới vạch gạch phân cách với footer rồi mới bắt đầu co nhỏ dần để chữ vừa khít trọn vẹn trong khung note. Tuyệt đối không co chữ sớm khi mới gõ chưa đầy nửa trang. Nghiêm cấm xuất hiện thanh cuộn trên giấy note.
* **Dải Băng Dính Keo Dán Phóng To (Enlarged Tape Strip):** Tăng kích thước thêm 20% chiều cao (`h-6`, 24px) và 30% chiều rộng (`w-[84px]`). Dải keo đóng vai trò là điểm cầm nắm chính (`drag handle`) để kéo di chuyển ghi chú trên mặt bàn.
* **Đổi Tên Note Trực Tiếp Ở Chân Trang (Inline Editable Note Title):**
  * Nhấp chuột trực tiếp vào tên note ở footer (mặc định "Note") để chuyển sang ô nhập và đổi tên note ngay tại chỗ (`updateItemTitle`).
* **Bôi đen hỏi AI Inteline trên Ghi chú:** Khi người dùng bôi đen đoạn ghi chú, thẻ card Inteline ngay lập tức nổi lên hỗ trợ hỏi AI, giải thích nhanh hoặc mở rộng ý tưởng và ghim thành ghi chú mới.
* **Thanh Công Cụ Nổi Giấy Ghi Chú Chuẩn Miro (Miro-Standard Note Toolbar):**
  * **Vị trí cố định:** **Luôn luôn nằm ở PHÍA TRÊN note** (`bottom-full mb-3`), không đặt phía dưới để không che khuất nội dung note.
  * Thay vì trải ngang danh sách màu, chỉ hiển thị **1 ô tròn duy nhất là màu hiện tại của note**.
  * Khi bấm vào ô tròn, xổ ra **bảng màu Palette lưới 16 màu (4x4) chuẩn Miro** kèm dấu tích `✓` trên màu đang chọn.
  * Hỗ trợ đầy đủ bộ công cụ công thái học:
    * **In đậm toàn bộ văn bản (`B`):** Áp dụng toàn bộ văn bản trong note khi bật (`fontWeight: 800`, `font-black`, viền nét mực), và tắt toàn bộ văn bản trở về nét thường thanh mảnh (`fontWeight: 400`, `font-normal`) khi tắt. Nút `B` có nền `bg-slate-200` khi đang kích hoạt.
    * **Căn lề văn bản 3 chế độ (Left / Mid / Right):** Nhóm 3 nút căn lề: Căn lề trái (`AlignLeft`), Căn lề giữa (`AlignCenter`), và Căn lề phải (`AlignRight`), áp dụng chuẩn xác cho toàn bộ các dòng văn bản trong note.
    * **Bỏ nút A / A+ thủ công:** Cỡ chữ được quản lý 100% tự động qua thuật toán co giãn phông động (Dynamic Font Scaling), đảm bảo chữ to ít nhất 1/3 note khi ngắn và tự thu vừa khít khi nội dung tiến sát chân trang, không cần nút chỉnh cỡ chữ thủ công.
    * **Nhân bản nhanh:** Nút sao chép (`Copy`) tạo ngay một note giống hệt bên cạnh.
    * **Xoay tự do 360°** (`RotateTwoWay`) và nút **Xóa note** (`Trash2`).

---

## 8. Phông Chữ, Độ Nét & Chống Nhiễu Moiré (Crisp Rendering)

* **Toàn bộ UI và Thân sách/Tài liệu:** Bắt buộc sử dụng phông chữ **`Open Sans`** (`var(--font-ui)`), nạp đầy đủ các tập con `['latin', 'latin-ext', 'vietnamese']`. Tuyệt đối không dùng phông serif chân cứng.
* **Độ sắc nét khi zoom out:** Thân văn bản sách và tài liệu áp dụng độ đậm **`font-medium` (500)** và CSS `text-rendering: geometricPrecision; -webkit-font-smoothing: antialiased;` để đảm bảo khi thu nhỏ ở mức zoom 40%–50%, các nét chữ không bị mờ đục hoặc đứt gãy.
* **Căn ngay ngắn 0° mặc định cho Giấy và Ghi chú:** Mọi vật thể tài liệu (`PaperSheet`), đề thi và giấy note (`StickyNoteItem`) khởi tạo ở góc xoay `0°` (thay vì các góc lẻ như `4°` hay `-3°`), giúp bộ kết xuất phông chữ khớp hoàn hảo từng điểm ảnh phần cứng (subpixel rendering), loại bỏ hoàn toàn hiện tượng mờ đục hoặc nhòe nét khi thu nhỏ góc nhìn.
* **Triệt tiêu nhiễu Moiré:** Loại bỏ hoàn toàn các chấm hạt `radial-gradient` trên nền giấy `.paper-texture`; sử dụng nền ngà phẳng tự nhiên thuần khiết (`#fdfbf7`) giúp mắt không bị mỏi và không sinh nhiễu pixel.
* **Giấy ghi chú (Sticky Note):** Sử dụng phông viết tay **`Patrick Hand`** (`var(--font-note)`) có hỗ trợ tiếng Việt đầy đủ, áp dụng độ đậm `font-bold` (700) và `text-stone-950` để nét chữ viết tay luôn đậm đà, sắc bén ngay cả khi zoom nhỏ.
* **Chuẩn hóa Unicode NFC:** Toàn bộ chuỗi văn bản nạp vào hệ thống (tài liệu, sách, note, prompt AI) phải chạy qua `text.normalize('NFC')` để triệt tiêu hoàn toàn lỗi dấu rời (như *"Tuầ´n"*, *"trắ´c"*).

---

## 9. Nút "Tải lên" & Quy Trình Tải Tài Liệu Lên Bàn Học

* **Tên nút thao tác:** Sử dụng nhãn trực diện **"Tải lên"** (thay vì "Tải tài liệu") ở góc dưới bên trái HUD.
* **Triệt tiêu chỉ báo hệ thống thừa:** Ẩn hoàn toàn các biểu tượng tia sét hay chỉ báo dev indicator (`devIndicators: false`) của framework.
* Khi người dùng nhấn nút "Tải lên", hệ thống kích hoạt **hộp thoại chọn file gốc của hệ điều hành** (`<input type="file" />` mở Windows Explorer / macOS Finder / Linux File Manager).
* Sau khi người dùng đã chọn file thành công, mới hiển thị hộp thoại xác nhận để người dùng đặt tên tài liệu và nhập mô tả ngắn trước khi đưa lên mặt bàn.

---

## 10. Ngôn Ngữ & Giọng Văn Giao Diện (Humanized Vietnamese)

* Áp dụng nguyên tắc **Humanizer** cho toàn bộ các đoạn văn bản giao diện, tooltip, thông báo và nhãn hướng dẫn:
  * Viết bằng tiếng Việt tự nhiên, trực diện, dễ hiểu, đậm chất con người.
  * Loại bỏ hoàn toàn văn phong dịch máy, sáo rỗng hoặc rập khuôn kiểu AI.
  * Ví dụ chuẩn:
    * Đổi *"Theo dõi tôi"* $\rightarrow$ *"Đồng bộ góc nhìn"* (kèm đèn báo trạng thái rõ ràng).
    * Đổi *"RADAR"* $\rightarrow$ *"BẢN ĐỒ"*.
    * Đổi *"BÀN HỌC 2.5D"* $\rightarrow$ *"Không gian học 2.5D"*.
* **Ngoại lệ:** Nội dung trong sách, tài liệu học thuật và ghi chú của người dùng được giữ nguyên vẹn 100%, không tự ý thay đổi.

---

## 11. Kỷ Luật Kỹ Thuật (Anti-Bloat & Skill-First Protocol)

* **Surgical Changes:** Chỉ sửa đổi chính xác những dòng mã cần thiết, tôn trọng cấu trúc hiện có, không tái tạo mã nguồn bừa bãi hay thêm dependencies không rõ mục đích.
* **Kiểm định trước khi bàn giao:** Mọi chỉnh sửa mã nguồn đều phải vượt qua `pnpm build` (không có lỗi type hay lint) và chạy thử nghiệm mượt mà trên môi trường thực tế.

---

## 12. Bố Cục HUD & Thanh Công Cụ Sáng Tạo (Miro-Inspired Workspace Layout)

* **Thanh Công Cụ Sáng Tạo Dọc Bên Trái (`LeftCreationBar`):**
  * Tách biệt hoàn toàn công cụ sáng tạo (Creation Tools) sang thanh nổi dọc bên trái màn hình, **đặt sát vào mép trái màn hình** (giảm khoảng cách còn 1/3: `left-[5px] top-1/2 -translate-y-1/2`), lấy cảm hứng từ Miro nhưng giữ trọn bộ icon SVG và ngôn ngữ thẩm mỹ của ViTudy.
  * **Kích Thước Tăng 30% & Nét Icon Đậm Rõ (`stroke-[2.4]`):** Toàn bộ các nút công cụ tăng kích thước lên 30% (`w-12 h-12 rounded-xl`, nút đơn lẻ hoặc undo pill dùng `rounded-full`), biểu tượng SVG kích thước `w-5 h-5` nét đậm dày `stroke-[2.4]` rõ ràng.
  * **Nút Tạo Ghi Chú Kéo Thả Kích Thước (`create_note`):**
    * Khi bấm nút Ghi chú (`StickyNote`), xổ flyout bảng màu dọc (5 màu pastel), tiêu đề đổi thành **`NOTE`** (tinh gọn, không dùng "Màu note").
    * Chọn màu -> con trỏ chuột đổi sang icon ghi chú -> người dùng kéo thả chuột trên bàn học để sinh ra tờ ghi chú đúng kích thước vùng kéo thả.
    * Có ngưỡng giới hạn kích thước tối thiểu (`180 × 160px`) để đảm bảo không bị co cụm khi click nhấp chuột nhanh.
  * **Cụm Nút Bút Hợp Nhất Chuẩn Miro (`PenSubToolbar`):**
    * Gộp bút vẽ thường và bút dạ quang thành 1 nút Bút duy nhất.
    * Nhấp vào nút Bút mở flyout thanh công cụ phụ ngang chuẩn Miro, **được căn giữa trung điểm theo chiều dọc với thanh công cụ chính (`top-1/2 -translate-y-1/2`)** với chiều cao tối ưu không bao giờ bị lố khỏi màn hình hay bị che bởi các HUD. Bộ công cụ gồm:
      * **Bút vẽ thường (`pen`):** Nét mực mảnh rõ ràng.
      * **Bút dạ quang (`highlighter`):** Nét vẽ trong suốt bán nguyệt (opacity 0.4).
      * **Vẽ thông minh (`smart_shape`):** Tự động nhận diện nét vẽ phác thảo nguệch ngoạc và nắn thành hình học chuẩn xác (đường thẳng, hình tròn, elip, hình chữ nhật/vuông, hình tam giác).
      * **Tẩy nhấp chọn (`eraser`):** Nhấp trực tiếp vào nét vẽ nào để xóa nét đó.
      * **Tẩy vùng chọn (`area_eraser`):** Kéo thả khung chữ nhật trên mặt bàn để xóa toàn bộ các nét vẽ nằm bên trong hoặc giao với khung đó.
      * **3 Cỡ nét bút:** Nhỏ (`small`), Vừa (`medium`), Lớn (`large`).
      * **1 Ô Màu Hiện Tại & Bảng Màu Flyout:** Hiển thị **đúng 1 ô tròn là màu hiện tại của nét vẽ**. Nhấp vào ô tròn mới xổ ra bảng màu 6 màu (lưới 3x2) gọn gàng bên cạnh, triệt tiêu hoàn toàn tình trạng thanh bút quá dài tràn khung nhìn.
  * **Nút Thêm Công Cụ Mở Rộng (`+` More Tools):**
    * Vị trí: Đặt ngay **dưới nút Bút và trên nút Khóa bàn học**, có gạch phân cách mảnh nằm ở cả phía trên và phía dưới nút.
    * Khi bấm, mở flyout panel phong cách Miro hiển thị danh sách 6 công cụ mở rộng (không có thanh tìm kiếm):
      1. **Shapes and lines:** Vẽ hình học và đường kẻ thông minh.
      2. **Stickers:** Nhãn dán ghi chú trực quan.
      3. **Emojis and GIFs:** Biểu cảm và minh họa học tập.
      4. **Code block:** Khối mã nguồn lập trình có định dạng.
      5. **Table:** Bảng dữ liệu hàng và cột có cấu trúc.
      6. **Mind map:** Sơ đồ tư duy liên kết ý tưởng.
  * Danh mục công cụ thanh chính: Con trỏ di chuyển/chọn (`MousePointer`), Tạo ghi chú (`StickyNote`), Bút vẽ tích hợp (`PenTool`), Thêm công cụ mở rộng (`Plus`), Khóa góc nhìn (`Lock`), và cụm Hoàn tác/Xóa tròn (`Undo2` / `Trash2`).
* **Tinh Gọn Hệ Thống HUD Ngoại Vi & Quy Chuẩn Nút Tròn (Distraction-Free Workspace):**
  * **Quy chuẩn Hình Dạng Nút Riêng Lẻ (Circular Button Standard):** Mọi nút thao tác riêng lẻ không gộp thành bộ trên giao diện (như nút Tải lên, Mời bạn, nút Mở bản đồ) bắt buộc sử dụng **khung hình tròn (`rounded-full`)** cùng icon SVG nổi bật thay vì vuông bo góc.
  * **Độ Đậm Nét Toàn Bộ HUD/UI:** Toàn bộ icon áp dụng độ dày nét `stroke-[2.4]` (hoặc `strokeWidth={2.4}`), font chữ và số áp dụng độ đậm `font-bold` hoặc `font-black` (`text-slate-900`) để đảm bảo sắc nét tuyệt đối.
  * **HUD Góc Trên Bên Trái & Thanh Tìm Kiếm Trượt (`TopLeftNav`):**
    * Kích thước tăng 30% (`px-4 py-2.5 rounded-2xl`), logo `Compass` và icon điều hướng nét đậm `stroke-[2.4]`.
    * Thanh tìm kiếm ở trạng thái bình thường thu gọn tinh giản, chỉ hiển thị duy nhất icon kính lúp (`Search`).
    * Khi hover hoặc click, ô nhập trượt mượt sang phải (`w-52`).
    * Khi focus vào ô nhập, hiển thị dropdown danh sách tài liệu hiện có trên bàn học, giới hạn chiều cao tối đa hiển thị 3 tài liệu (`max-h-[142px]`) kèm thanh cuộn mượt nếu nhiều hơn.
    * **Tối Ưu Hiển Thị Danh Sách Tài Liệu (Zero Redundant Badges):** Bỏ hoàn toàn các badge text ở sau ("Sách • 8 trang", "Tờ giấy", "Ghi chú") do phía trước đã có icon vector nhận diện (`BookOpen`, `FileText`, `StickyNote`). Tên tài liệu chiếm trọn chiều rộng hàng, hiển thị đầy đủ, không bị co rút cắt chữ.
    * Tự động lọc tài liệu theo từ khóa tìm kiếm trong thời gian thực. Nhấp vào tài liệu lập tức lia camera và chọn tài liệu đó trên bàn học.
  * **HUD Góc Dưới Bên Trái (Cụm 3 Nút Tròn Tải Lên - Ghi Hình - Mời Bạn):**
    * Bỏ hoàn toàn chữ "Tải lên" và "Mời bạn".
    * Sử dụng 3 nút tròn riêng lẻ (`rounded-full w-12 h-12`):
      * Nút **"Tải lên"** (`Upload`): Nền cam thương hiệu (`bg-[#E0562D] hover:bg-[#c9451e]`), icon vector màu trắng tinh khiết (`text-white stroke-[2.4]`). Kích hoạt hộp thoại chọn file của OS.
      * Nút **"Ghi hình buổi học"** (`Video`): Nền trắng thanh nhã (`bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 shadow-md`), icon camera nét đậm (`text-slate-900 stroke-[2.4]`), **nằm ngay giữa nút Tải lên và Mời bạn**.
        * Hỗ trợ ghi lại toàn bộ màn hình bàn học trong lúc làm việc qua `getDisplayMedia`.
        * Tích hợp tùy chọn bật/tắt ghi âm micro giọng nói (`getUserMedia`), hòa trộn âm thanh hệ thống và micro qua Web Audio API (`AudioContext`).
        * Trạng thái đang ghi hình: Chuyển nút sang thanh trạng thái nhỏ gọn với đèn tròn đỏ nhấp nháy, đồng hồ đếm thời gian thực `00:00` font-mono và nút vuông dừng ghi hình (`Square`).
        * Kết thúc ghi hình: Mở modal xem trước video kèm thông tin dung lượng và nút **"Tải video về máy"** (`.webm`).
      * Nút **"Mời bạn"** (`Share2`): Nền trắng thanh nhã (`bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 shadow-md`), icon vector màu đen nét đậm (`text-slate-900 stroke-[2.4]`). Mở modal sao chép liên kết phòng học.
  * **HUD Góc Dưới Giữa Màn Hình:** Loại bỏ hoàn toàn nhãn/popup "Không gian học 2.5D" lơ lửng để giải phóng tầm nhìn giữa bàn.
  * **Chợ Tài Liệu (Library-Standard Book Catalog with Brown Covers & Multi-Filters):**
    * Nút hành động chính: `+ Chia sẻ tài liệu`.
    * **Banner Số Dư & Quy Đổi Đơn Vị:** Hiển thị rõ `Số dư của bạn: X ViToken (1 V = 1 ViToken)` cùng lời nhắc tích lũy ViToken từ Điểm danh hoặc Chia sẻ tài liệu.
    * Mô tả triết lý: *"Tài liệu được chia sẻ hoàn toàn từ mục đích học tập & nghiên cứu."*
    * **Kho Dữ Liệu Thư Viện Phong Phú:** Cung cấp 40 tài liệu học thuật đầy đủ 3 dạng: Sách giáo trình chuyên sâu, Tờ tóm tắt kiến thức cốt lõi, và Đề thi trắc nghiệm tương tác với đáp án và giải thích chi tiết.
    * **Chế Độ Xem Linh Hoạt (View Mode Toggle):** Hỗ trợ chuyển đổi giữa dạng lưới thẻ chi tiết (`Grid`) và dạng danh sách gọn (`Compact List`).
    * **Cấu trúc thẻ card tài liệu chuẩn phong cách thư viện:**
      * **Bên trái — Khung bìa cuốn sách màu nâu da sang trọng (`#4a2c17` đến `#2e1a0e`, gáy `#6b3e20`):**
        * Header bìa: `ViTudy` kèm loại tài liệu (`Sách`, `Tờ tóm tắt`, `Đề thi`). **Tuyệt đối không có phân hạng S, A**.
        * Thân bìa: Tên tài liệu viết to, đậm rõ ràng, tự động xuống dòng (word wrap) gọn gàng trong bìa sách.
        * Footer bìa: **Ngày chia sẻ** (`DD/MM/YYYY`) kèm icon lịch thanh nhã.
      * **Bên phải — Cột thông tin chi tiết:**
        * **Tiêu đề prominent:** Đưa tiêu đề tài liệu ra khung nội dung chính rõ nét, chữ đậm, hover đổi màu Cam ViT.
        * **Tác giả & Xác thực:** Tên tác giả kèm huy hiệu xác thực (`CheckCircle2 text-sky-600` với tooltip "Tác giả xác thực").
        * **Metadata đầy đủ:** Số trang (`X trang`), lượt tải/mua (`X lượt mua`), ngày cập nhật (`Cập nhật DD/MM/YYYY`).
        * **Điểm AI & Tooltip tiêu chí:** Thay "Đánh giá" thành **`Điểm AI: {score}/100`** (`text-[#E0562D]`), hover hiển thị tooltip giải thích 3 tiêu chí chấm điểm tự động (Độ chuẩn xác 40%, Cấu trúc 35%, Thực tiễn 25%) và số lượt phản hồi.
        * **Mô tả theo loại tài liệu:** Nhãn động theo định dạng: `MÔ TẢ SÁCH / GIÁO TRÌNH:`, `MÔ TẢ TÀI LIỆU TÓM TẮT:`, `MÔ TẢ BỘ ĐỀ TRẮC NGHIỆM:`.
        * **Trích đoạn xem trước:** Khung font monospace thanh nhã.
        * **Đặt Giá và Nút Hành Động Cạnh Nhau:** Mức giá hiển thị kèm huy hiệu chữ V tròn thương hiệu, nằm kề nút **"Xem thử"** (`Eye`) và nút **"Mua X V"** (hoặc nút **"Mở"** màu xanh lá khi đã sở hữu).
        * **Modal Xem Thử Trích Đoạn Chi Tiết:** Nhấp "Xem thử" mở modal đọc trích đoạn nội dung, xem danh sách các chương mục và nút mua/mở nhanh.
    * **Hệ Thống Tìm Kiếm & Bộ Lọc Đa Năng:**
      * Thanh tìm kiếm từ khóa thời gian thực (tên, tác giả, mô tả).
      * Bộ lọc phân loại dạng tài liệu: Tất cả, Sách, Tờ tóm tắt, Đề thi trắc nghiệm.
      * Bộ lọc môn học: Tất cả môn, Toán học, Trí tuệ nhân tạo (AI/ML), Khoa học máy tính, Kỹ thuật phần mềm, Khoa học dữ liệu.
      * Giới hạn điểm AI: Tất cả, $\ge 80$ điểm, $\ge 90$ điểm.
      * Giới hạn giá ViToken: Tất cả, $\le 15$ V, $\le 30$ V, $\le 50$ V.
      * Sắp xếp theo ngày chia sẻ: Mới nhất, Cũ nhất, Điểm cao nhất, Giá rẻ nhất.
      * **Chip bộ lọc đang bật & Nút Đặt lại:** Hiển thị nút `Đặt lại` (`RotateCcw`) màu cam khi có bất kỳ bộ lọc nào đang kích hoạt để xóa nhanh về mặc định.
      * Hỗ trợ phím tắt `Esc` để đóng modal an toàn.
  * **Loại Bỏ Hoàn Toàn Thuật Ngữ Kỹ Thuật (Zero Jargon Policy):** Tuyệt đối không để lộ các thuật ngữ kỹ thuật, mã phân đoạn hay mã đặc tả hệ thống (như *SRS*, *SRS 3.3*, *KnowInherit*...) trên toàn bộ giao diện người dùng.
  * **HUD Góc Dưới Bên Phải & Bản Đồ (Minimap):**
    * **Xóa Bỏ Dấu X Khỏi Map:** Triệt tiêu hoàn toàn nút `×` trên Minimap để chống thao tác bấm nhầm xóa mất bàn học.
    * **Phím Tắt M & Nút Tròn Mở Lại Map:** Người dùng bấm phím `M` để ẩn/hiện bản đồ. Khi bản đồ ẩn, một **nút tròn màu cam (`rounded-full w-12 h-12 bg-[#E0562D] text-white`)** chứa icon `Map` nét trắng lập tức xuất hiện tại góc đó để người dùng bấm trực tiếp vào mở lại bản đồ bất cứ lúc nào.
    * Thanh điều hướng zoom tăng 30% (`px-3.5 py-2 rounded-2xl gap-2`), icon zoom `stroke-[2.4]`, số phần trăm zoom in đậm font mono (`font-black text-xs text-slate-900`).
  * **HUD Góc Trên Bên Phải — Nhóm Thanh Ngang Hợp Nhất (`TopRightWallet`):**
    * Gộp toàn bộ các nút: Chuỗi (Streak), Chợ (Marketplace), Credit (Token) và AI Bot vào **một thanh ngang duy nhất** (`rounded-2xl bg-white/95 border border-slate-300 p-1.5 shadow-sm`), các nút con tăng 30% kích thước (`h-11`) ngăn cách bởi vạch phân chia mảnh nhẹ (`w-[1px] h-6 bg-slate-200`).
    * **Chuỗi ngày học (Streak) trên HUD:**
      * Khi có chuỗi (`streakDays > 0`): Ngọn lửa được **tô đầy ruột bằng màu Cam ViT** (`fill-[#E0562D] text-[#E0562D] w-8 h-8`), số chuỗi to ngang với icon ngọn lửa ở sau và có **màu trắng (`text-white font-black font-mono text-sm`)** nổi bần bật chính giữa ngọn lửa.
      * Khi chưa có chuỗi (`streakDays === 0`): Hiển thị icon lửa đường nét xám mảnh (`text-slate-400 stroke-[2]`) và số `0` màu xám.
    * **Modal Điểm Danh Nhận ViToken (`DailyStreakModal`):**
      * Header: Icon ngọn lửa Cam ViT nổi bật trong khung tròn viền ấm.
      * Mô tả cơ chế thưởng: *"Điểm danh mỗi ngày nhận 5 ViToken, riêng Chủ Nhật x2 nhận 10 ViToken."*
      * **Phân định rõ 4 trạng thái ô ngày (Thứ 2 đến Chủ Nhật - T2 đến CN):**
        1. **Đã nhận:** Nền xanh lá (`bg-emerald-500 border-emerald-600 text-white font-bold`) kèm dấu tích `✓` rõ ràng.
        2. **Hôm nay chưa nhận:** Nền mềm Cam ViT viền đậm (`bg-[#FFF7ED] border-[#E0562D] text-[#9A3412] font-black ring-2 ring-[#E0562D] ring-offset-1 animate-pulse`).
        3. **Bỏ lỡ:** Nền xám nhạt (`bg-slate-100 border-slate-200 text-slate-400`) kèm gạch ngang `-`.
        4. **Sắp tới:** Nền xám mềm (`bg-slate-50 border-slate-200 text-slate-600`) hiển thị số token (`+5` hoặc `+10`).
      * **Riêng ô Chủ Nhật (CN):** Áp dụng điểm nhấn cam (`bg-orange-50 border-orange-300 text-[#E0562D] font-black`).
      * Nhãn thứ trong tuần (`T2`, `T3`, `T4`, `T5`, `T6`, `T7`, `CN`) đặt phía dưới ô kèm tooltip đầy đủ (Thứ Hai $\rightarrow$ Chủ Nhật).
      * **Chuỗi ngày học & Mốc thưởng kế tiếp:** Hiển thị `Chuỗi X ngày` kèm icon ngọn lửa và mốc thưởng tiếp theo (ví dụ: `Mốc 7 ngày: +20 ViToken`) với thanh tiến trình trực quan.
      * **Đồng xu ViToken:** Hiển thị icon SVG đồng xu tròn cam chữ V thương hiệu thay vì text thô.
      * **Nhắc nhở điểm danh hàng ngày:** Tích hợp hộp kiểm "Nhắc tôi điểm danh mỗi ngày" đồng bộ `localStorage`.
      * **Trạng thái nút hành động chuẩn xác (Zero Status Conflict):**
        * Khi chưa nhận: Nút nổi bật Cam ViT **"Nhận ViToken ngay"** (`bg-[#E0562D] hover:bg-[#c9451e]`).
        * Khi đã nhận hôm nay: Vô hiệu hóa nút (`disabled`) và đổi text thành **"Đã nhận hôm nay • Nhận tiếp sau {X}h {Y}m"** với bộ đếm ngược thời gian thực đến nửa đêm.
      * Nút đóng chuẩn tiếp cận WCAG với vùng bấm tối thiểu 44px, hỗ trợ phím `Esc`.
    * **Modal Cài Đặt Kết Nối AI (AI Provider Modal):**
      * Hiển thị số dư ViToken của người dùng ngay trong modal: `Số dư ví của bạn: X ViToken`.
      * **Nhãn trạng thái rõ ràng cho từng lựa chọn:**
        * *Hệ thống ViTudy:* "Trừ ViToken" (`GPT-4o-mini`).
        * *Google Gemini:* "Miễn phí theo hạn mức" (`Gemini 1.5 Flash`).
        * *OpenAI cá nhân (BYOK):* "Khóa cá nhân" (`GPT-4o`).
        * *Đăng nhập bằng tài khoản ChatGPT:* "Ủy quyền tài khoản" (`GPT-4o Plus`).
      * Logo SVG vector chính thức sắc nét cho từng nhà cung cấp, huy hiệu "Đang dùng" cho provider active.
      * Trường nhập API Key tích hợp nút ẩn/hiện mật khẩu (`Eye`/`EyeOff`), nút kiểm tra kết nối (`Test`), và lưu ý an toàn cục bộ trên trình duyệt.
      * Nút "Lưu" chỉ kích hoạt khi có thay đổi thực sự so với cấu hình hiện tại, hiển thị thông báo xác nhận thành công.
      * Nút đóng tối thiểu 44px, hỗ trợ phím tắt `Esc`.
    * **Chợ Tài Liệu (`Store` icon):** Icon chợ nét đậm `stroke-[2.4]`, hover hiển thị tooltip `"Chợ Tài Liệu"`.
    * **Ô số dư Credit:** Huy hiệu `V` tròn (`w-6 h-6`) cùng số dư to rõ `text-sm font-black font-mono text-slate-900`.
    * **Nút Mô hình AI:** Icon `Bot` nét đậm `stroke-[2.4]`, bấm mở cài đặt model.
  * **HUD Giữa Trên & Cơ Chế Multiplayer (MultiplayerBar):**
    * **Chế độ Cá Nhân (Solo Mode - Mặc định khi chưa có peer):** Ẩn hoàn toàn thanh Multiplayer để giao diện sạch sẽ, thoáng đãng.
    * **Chế độ Học Nhóm (Khi có người cùng phòng):** Hiển thị thanh với avatar thành viên, cờ người thuyết trình và nút "Đồng bộ góc nhìn".
  * **Thanh Công Cụ Ngữ Cảnh Nổi Chuẩn Miro Trắng (Clean White Contextual Overlays — Anti-Dark AI Slop):**
    * Mọi thanh công cụ ngữ cảnh nổi xuất hiện khi click chọn vật thể (Sticky Note, Tờ giấy đơn PaperSheet, Huy hiệu tên sách BookSpread, Banner thông báo vẽ, Overlay thả file):
    * **Nghiêm cấm tuyệt đối:** Không sử dụng các khối màu đen/xanh đen tối tăm kiểu AI slop (`bg-slate-900`/`bg-stone-900`).
    * **Quy chuẩn bắt buộc:** Sử dụng nền **Trắng thanh nhã (`bg-white/95`)**, viền mảnh (`border border-slate-200/90`), chữ và icon màu than chì (`text-slate-700`), đổ bóng mềm (`shadow-lg backdrop-blur-md`). Nút chức năng nổi bật (như STudy) sử dụng điểm nhấn thương hiệu ấm (`bg-[#FFF7ED] text-[#9A3412] border border-[#FFEDD5]`).
  * **Thẻ Đánh Dấu Ruy Băng Sách Trượt Ra Từ Bên Trong (`BookSpread` Tab Slide-out):**
    * Toàn bộ 5 thanh nhắc ruy băng khi hover chuột sẽ trượt từ trong mép giấy sách sang bên phải (`translate-x-0`).
    * Icon luôn nằm ở mép ngoài bên phải cạnh vết khuyết chữ V, chữ chức năng trượt ra bên trái icon theo cấu trúc `[text] [icon]`.
  * **Đinh Ghim Sợi Chỉ Đỏ Di Chuyển Được (`VisualLinkThreads` Draggable Pushpin):**
    * Đinh ghim đỏ trên sách và ghi chú cho phép người dùng đè chuột kéo thả để di chuyển vị trí neo ghim sang vị trí khác trên trang sách hoặc mặt bàn.
    * Hitbox của đinh ghim được thu nhỏ chính xác bằng kích thước hạt nút ghim (`r=14`), không gây cản trở thao tác đọc và bôi đen chữ của sách.
