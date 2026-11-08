# 03_SYMBOL_INDEX.md — Chỉ Mục Toàn Bộ Ký Hiệu Codebase ViTudy

> **Commit Hash:** `63d83ee`  
> **Cập nhật lần cuối:** `2026-11-08`  
> **Quy ước:** Symbol | Kind | File:Lines (Symbol) | Vai trò chức năng

<!-- manual:start -->
Tài liệu này được đồng bộ tự động qua `npm run docs:index` và kiểm tra bởi `npm run docs:check`.
<!-- manual:end -->

### Canvas & 2.5D Desk

| Ký hiệu (Symbol) | Loại (Kind) | Vị trí (File:Lines) | Vai trò chức năng |
|---|---|---|---|
| `DeskDrawingCanvas` | `component` | [src/components/canvas/DeskDrawingCanvas.tsx:L6-L81](file:///F:/AppMaking/ViTudy/src/components/canvas/DeskDrawingCanvas.tsx) | Canvas vẽ nét bút dạ quang và bút vẽ tự do với chế độ multiply blend |
| `DeskDrawingInteractionLayer` | `component` | [src/components/canvas/DeskDrawingInteractionLayer.tsx:L6-L321](file:///F:/AppMaking/ViTudy/src/components/canvas/DeskDrawingInteractionLayer.tsx) | Lớp đón bắt sự kiện kéo vẽ mượt mà, phân định vẽ nét vs di chuyển bàn |
| `DeskGrid` | `component` | [src/components/canvas/DeskGrid.tsx:L5-L50](file:///F:/AppMaking/ViTudy/src/components/canvas/DeskGrid.tsx) | Lưới caro toạ độ bàn học trắng tinh khiết chống mỏi mắt |
| `InfiniteDesk` | `component` | [src/components/canvas/InfiniteDesk.tsx:L14-L406](file:///F:/AppMaking/ViTudy/src/components/canvas/InfiniteDesk.tsx) | Mặt bàn vô cực 2.5D: quản lý pan, zoom, phím tắt Alt+Drag, bắt sự kiện click |
| `ItemDrawingOverlay` | `component` | [src/components/canvas/ItemDrawingOverlay.tsx:L6-L72](file:///F:/AppMaking/ViTudy/src/components/canvas/ItemDrawingOverlay.tsx) | Thành phần nghiệp vụ của phân hệ Canvas & 2.5D Desk |
| `Minimap` | `component` | [src/components/canvas/Minimap.tsx:L12-L228](file:///F:/AppMaking/ViTudy/src/components/canvas/Minimap.tsx) | Bản đồ radar thu nhỏ góc nhìn toàn cảnh không gian bàn học 2.5D |
| `MultiplayerCursorsLayer` | `component` | [src/components/canvas/MultiplayerCursorsLayer.tsx:L11-L44](file:///F:/AppMaking/ViTudy/src/components/canvas/MultiplayerCursorsLayer.tsx) | Thành phần nghiệp vụ của phân hệ Canvas & 2.5D Desk |
| `StudySpaceDeskView` | `component` | [src/components/canvas/StudySpaceDeskView.tsx:L16-L184](file:///F:/AppMaking/ViTudy/src/components/canvas/StudySpaceDeskView.tsx) | Component trung tâm tích hợp toàn bộ Canvas bàn học, HUD 4 góc và modal |
| `VisualLinkThreads` | `component` | [src/components/canvas/VisualLinkThreads.tsx:L6-L211](file:///F:/AppMaking/ViTudy/src/components/canvas/VisualLinkThreads.tsx) | Vẽ các đường dây nối SVG trực quan từ đoạn trích sách sang giấy note Inteline |

### Objects (Sách, Giấy, Note)

| Ký hiệu (Symbol) | Loại (Kind) | Vị trí (File:Lines) | Vai trò chức năng |
|---|---|---|---|
| `BOOK_COVER_PRESETS` | `component` | [src/components/objects/BookSpread.tsx:L38-L79](file:///F:/AppMaking/ViTudy/src/components/objects/BookSpread.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `BookSpread` | `component` | [src/components/objects/BookSpread.tsx:L81-L1062](file:///F:/AppMaking/ViTudy/src/components/objects/BookSpread.tsx) | Mô phỏng cuốn sách mở 2.5D, phân trang động DOM, bìa cứng, gờ gáy và popover Inteline |
| `ExamQuizCard` | `component` | [src/components/objects/ExamQuizCard.tsx:L45-L737](file:///F:/AppMaking/ViTudy/src/components/objects/ExamQuizCard.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `PaperSheet` | `component` | [src/components/objects/PaperSheet.tsx:L39-L733](file:///F:/AppMaking/ViTudy/src/components/objects/PaperSheet.tsx) | Mô phỏng tờ giấy A4/ghi chép đơn lẻ 2.5D với độ xoay tự do và texture giấy |
| `StickyNoteItem` | `component` | [src/components/objects/StickyNoteItem.tsx:L18-L588](file:///F:/AppMaking/ViTudy/src/components/objects/StickyNoteItem.tsx) | Giấy ghi chú dán bàn học (Patrick Hand font, NFC normalized, xoay 360°) |

### HUD & Overlays

| Ký hiệu (Symbol) | Loại (Kind) | Vị trí (File:Lines) | Vai trò chức năng |
|---|---|---|---|
| `BottomLeftKnowledge` | `component` | [src/components/hud/BottomLeftKnowledge.tsx:L36-L776](file:///F:/AppMaking/ViTudy/src/components/hud/BottomLeftKnowledge.tsx) | HUD góc dưới-trái: nút tải tài liệu và mở chợ chia sẻ tri thức KnowInherit 85/15 |
| `BottomRightToolkit` | `component` | [src/components/hud/BottomRightToolkit.tsx:L17-L196](file:///F:/AppMaking/ViTudy/src/components/hud/BottomRightToolkit.tsx) | HUD góc dưới-phải: công cụ bút dạ quang, tạo note, khoá góc nhìn, zoom 100% |
| `LeftCreationBar` | `component` | [src/components/hud/LeftCreationBar.tsx:L28-L493](file:///F:/AppMaking/ViTudy/src/components/hud/LeftCreationBar.tsx) | Thành phần nghiệp vụ của phân hệ HUD & Overlays |
| `MultiplayerBar` | `component` | [src/components/hud/MultiplayerBar.tsx:L22-L359](file:///F:/AppMaking/ViTudy/src/components/hud/MultiplayerBar.tsx) | HUD cộng tác học nhóm thời gian thực: danh sách avatar, thả cảm xúc emoji |
| `TopLeftNav` | `component` | [src/components/hud/TopLeftNav.tsx:L18-L295](file:///F:/AppMaking/ViTudy/src/components/hud/TopLeftNav.tsx) | HUD góc trên-trái: chuyển đổi bàn học, tìm kiếm tài liệu, đồng bộ góc nhìn |
| `TopRightWallet` | `component` | [src/components/hud/TopRightWallet.tsx:L56-L725](file:///F:/AppMaking/ViTudy/src/components/hud/TopRightWallet.tsx) | HUD góc trên-phải: hiển thị số dư ViToken, chuỗi điểm danh streak, chọn model AI |
| `VrFrameOverlay` | `component` | [src/components/hud/VrFrameOverlay.tsx:L5-L15](file:///F:/AppMaking/ViTudy/src/components/hud/VrFrameOverlay.tsx) | Khung viền 4 góc và nhãn chế độ "Không gian học 2.5D" phong cách VR HUD |

### Modals & Workflows

| Ký hiệu (Symbol) | Loại (Kind) | Vị trí (File:Lines) | Vai trò chức năng |
|---|---|---|---|
| `FlashcardModal` | `component` | [src/components/modals/FlashcardModal.tsx:L15-L65](file:///F:/AppMaking/ViTudy/src/components/modals/FlashcardModal.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `FlashcardTab` | `component` | [src/components/modals/study-tools/FlashcardTab.tsx:L20-L154](file:///F:/AppMaking/ViTudy/src/components/modals/study-tools/FlashcardTab.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `FullScreenDocModal` | `component` | [src/components/modals/FullScreenDocModal.tsx:L32-L536](file:///F:/AppMaking/ViTudy/src/components/modals/FullScreenDocModal.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `IntelineModal` | `component` | [src/components/modals/IntelineModal.tsx:L25-L262](file:///F:/AppMaking/ViTudy/src/components/modals/IntelineModal.tsx) | Hộp thoại AI hỏi đáp ngữ cảnh sâu Inteline theo từng dòng/trang tài liệu |
| `KnowInheritPublishModal` | `component` | [src/components/modals/KnowInheritPublishModal.tsx:L22-L214](file:///F:/AppMaking/ViTudy/src/components/modals/KnowInheritPublishModal.tsx) | Hộp thoại chia sẻ tài liệu lên chợ tri thức: AI thẩm định điểm và tính giá |
| `MarketModal` | `component` | [src/components/modals/MarketModal.tsx:L34-L855](file:///F:/AppMaking/ViTudy/src/components/modals/MarketModal.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `MobileCompanionView` | `component` | [src/components/mobile/MobileCompanionView.tsx:L14-L121](file:///F:/AppMaking/ViTudy/src/components/mobile/MobileCompanionView.tsx) | Giao diện di động rút gọn đồng bộ tài liệu từ máy tính |
| `OcrTab` | `component` | [src/components/modals/study-tools/OcrTab.tsx:L12-L153](file:///F:/AppMaking/ViTudy/src/components/modals/study-tools/OcrTab.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `QuizTab` | `component` | [src/components/modals/study-tools/QuizTab.tsx:L26-L405](file:///F:/AppMaking/ViTudy/src/components/modals/study-tools/QuizTab.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `RoadmapTab` | `component` | [src/components/modals/study-tools/RoadmapTab.tsx:L21-L111](file:///F:/AppMaking/ViTudy/src/components/modals/study-tools/RoadmapTab.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `StudyToolsModal` | `component` | [src/components/modals/StudyToolsModal.tsx:L29-L241](file:///F:/AppMaking/ViTudy/src/components/modals/StudyToolsModal.tsx) | Bộ công cụ ôn tập toàn diện STudy: TextRank, Cloze Quiz, Flashcard, Roadmap |
| `SummaryTab` | `component` | [src/components/modals/study-tools/SummaryTab.tsx:L16-L242](file:///F:/AppMaking/ViTudy/src/components/modals/study-tools/SummaryTab.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |

### Context & State

| Ký hiệu (Symbol) | Loại (Kind) | Vị trí (File:Lines) | Vai trò chức năng |
|---|---|---|---|
| `StudySpaceProvider` | `context` | [src/context/StudySpaceContext.tsx:L104-L1208](file:///F:/AppMaking/ViTudy/src/context/StudySpaceContext.tsx) | Provider quản lý toàn bộ state bàn học, tài liệu, toạ độ, nét vẽ, zIndex |
| `useStudySpace` | `hook` | [src/context/StudySpaceContext.tsx:L1210-L1216](file:///F:/AppMaking/ViTudy/src/context/StudySpaceContext.tsx) | Hook truy cập trạng thái không gian bàn học, camera, danh sách tài liệu |
| `useViToken` | `hook` | [src/context/ViTokenContext.tsx:L225-L231](file:///F:/AppMaking/ViTudy/src/context/ViTokenContext.tsx) | Hook quản lý ví ViToken, chi tiêu token, điểm danh streak và cấu hình AI |
| `ViTokenProvider` | `context` | [src/context/ViTokenContext.tsx:L42-L223](file:///F:/AppMaking/ViTudy/src/context/ViTokenContext.tsx) | Provider lưu trữ và đồng bộ ví ViToken, lịch sử giao dịch vào localStorage |

### Non-AI Engine & Utils

| Ký hiệu (Symbol) | Loại (Kind) | Vị trí (File:Lines) | Vai trò chức năng |
|---|---|---|---|
| `clearSupabaseConfig` | `fn` | [src/lib/supabase.ts:L61-L67](file:///F:/AppMaking/ViTudy/src/lib/supabase.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `DocumentOutlineNode` | `type` | [src/lib/nonAiEngine.ts:L45-L51](file:///F:/AppMaking/ViTudy/src/lib/nonAiEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `extractOutlineAndRoadmap` | `fn` | [src/lib/nonAiEngine.ts:L272-L298](file:///F:/AppMaking/ViTudy/src/lib/nonAiEngine.ts) | Thuật toán trích xuất tiêu đề dựng lộ trình học tương tác theo thời gian |
| `Flashcard` | `type` | [src/lib/nonAiEngine.ts:L28-L33](file:///F:/AppMaking/ViTudy/src/lib/nonAiEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `generateClozeQuestions` | `fn` | [src/lib/nonAiEngine.ts:L125-L207](file:///F:/AppMaking/ViTudy/src/lib/nonAiEngine.ts) | Thuật toán Cloze Deletion tự động đục lỗ từ khoá tạo bài tập trắc nghiệm |
| `generateFlashcardsFromRules` | `fn` | [src/lib/nonAiEngine.ts:L212-L267](file:///F:/AppMaking/ViTudy/src/lib/nonAiEngine.ts) | Quy tắc bóc tách câu định nghĩa thành bộ thẻ nhớ Flashcard ôn tập |
| `getSupabase` | `fn` | [src/lib/supabase.ts:L28-L51](file:///F:/AppMaking/ViTudy/src/lib/supabase.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `getSupabaseConfig` | `fn` | [src/lib/supabase.ts:L8-L22](file:///F:/AppMaking/ViTudy/src/lib/supabase.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `normalizeNFC` | `fn` | [src/utils/textNormalization.ts:L5-L8](file:///F:/AppMaking/ViTudy/src/utils/textNormalization.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `normalizeNFCPreserveWhitespace` | `fn` | [src/utils/textNormalization.ts:L10-L13](file:///F:/AppMaking/ViTudy/src/utils/textNormalization.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `PaginatedLeaf` | `type` | [src/utils/pagination.ts:L7-L14](file:///F:/AppMaking/ViTudy/src/utils/pagination.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `paginateDocument` | `fn` | [src/utils/pagination.ts:L166-L273](file:///F:/AppMaking/ViTudy/src/utils/pagination.ts) | Động cơ phân trang chính xác theo chiều cao trang, chống cắt cụt công thức |
| `Point` | `type` | [src/utils/smartShape.ts:L7-L10](file:///F:/AppMaking/ViTudy/src/utils/smartShape.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `QuizQuestion` | `type` | [src/lib/nonAiEngine.ts:L19-L26](file:///F:/AppMaking/ViTudy/src/lib/nonAiEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `recognizeSmartShape` | `fn` | [src/utils/smartShape.ts:L12-L179](file:///F:/AppMaking/ViTudy/src/utils/smartShape.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `RoadmapStep` | `type` | [src/lib/nonAiEngine.ts:L35-L43](file:///F:/AppMaking/ViTudy/src/lib/nonAiEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `saveSupabaseConfig` | `fn` | [src/lib/supabase.ts:L53-L59](file:///F:/AppMaking/ViTudy/src/lib/supabase.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `splitSentences` | `fn` | [src/lib/nonAiEngine.ts:L56-L62](file:///F:/AppMaking/ViTudy/src/lib/nonAiEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `summarizeWithTextRank` | `fn` | [src/lib/nonAiEngine.ts:L79-L120](file:///F:/AppMaking/ViTudy/src/lib/nonAiEngine.ts) | Thuật toán TextRank & TF-IDF trích xuất tóm tắt nội dung không cần AI |

### API Routes & Backend

| Ký hiệu (Symbol) | Loại (Kind) | Vị trí (File:Lines) | Vai trò chức năng |
|---|---|---|---|
| `POST` | `route` | [src/app/api/ai/chat/route.ts:L3-L152](file:///F:/AppMaking/ViTudy/src/app/api/ai/chat/route.ts) | Cổng xử lý AI Gateway đa chế độ: ChatGPT Codex, Gemini BYOK, OpenAI System |

### Types & Data

| Ký hiệu (Symbol) | Loại (Kind) | Vị trí (File:Lines) | Vai trò chức năng |
|---|---|---|---|
| `ActiveToolType` | `type` | [src/types/studyspace.ts:L86-L93](file:///F:/AppMaking/ViTudy/src/types/studyspace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `AiConfig` | `type` | [src/types/vitoken.ts:L21-L27](file:///F:/AppMaking/ViTudy/src/types/vitoken.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `AiProvider` | `type` | [src/types/vitoken.ts:L19-L19](file:///F:/AppMaking/ViTudy/src/types/vitoken.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `CanvasTransform` | `type` | [src/types/studyspace.ts:L104-L109](file:///F:/AppMaking/ViTudy/src/types/studyspace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `DeskItem` | `type` | [src/types/studyspace.ts:L37-L61](file:///F:/AppMaking/ViTudy/src/types/studyspace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `DrawingStroke` | `type` | [src/types/studyspace.ts:L95-L102](file:///F:/AppMaking/ViTudy/src/types/studyspace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ExamQuestion` | `type` | [src/types/studyspace.ts:L17-L24](file:///F:/AppMaking/ViTudy/src/types/studyspace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ExamSheetData` | `type` | [src/types/studyspace.ts:L26-L35](file:///F:/AppMaking/ViTudy/src/types/studyspace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `INITIAL_MARKET_ITEMS` | `component` | [src/data/marketMockData.ts:L24-L851](file:///F:/AppMaking/ViTudy/src/data/marketMockData.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `INITIAL_SPACES` | `component` | [src/data/mockSpaces.ts:L3-L271](file:///F:/AppMaking/ViTudy/src/data/mockSpaces.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `IntelineThread` | `type` | [src/types/studyspace.ts:L63-L73](file:///F:/AppMaking/ViTudy/src/types/studyspace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ItemType` | `type` | [src/types/studyspace.ts:L1-L1](file:///F:/AppMaking/ViTudy/src/types/studyspace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `MarketItem` | `type` | [src/data/marketMockData.ts:L3-L22](file:///F:/AppMaking/ViTudy/src/data/marketMockData.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `MathRenderer` | `component` | [src/components/common/MathRenderer.tsx:L15-L64](file:///F:/AppMaking/ViTudy/src/components/common/MathRenderer.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `metadata` | `const` | [src/app/layout.tsx:L20-L23](file:///F:/AppMaking/ViTudy/src/app/layout.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PageContent` | `type` | [src/types/studyspace.ts:L3-L15](file:///F:/AppMaking/ViTudy/src/types/studyspace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PeerUser` | `type` | [src/hooks/useRealtimeMultiplayer.ts:L7-L17](file:///F:/AppMaking/ViTudy/src/hooks/useRealtimeMultiplayer.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `RootLayout` | `component` | [src/app/layout.tsx:L25-L45](file:///F:/AppMaking/ViTudy/src/app/layout.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `RotateTwoWay` | `component` | [src/components/icons/RotateTwoWay.tsx:L11-L29](file:///F:/AppMaking/ViTudy/src/components/icons/RotateTwoWay.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `StudySpace` | `type` | [src/types/studyspace.ts:L75-L84](file:///F:/AppMaking/ViTudy/src/types/studyspace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `StudySpacePage` | `component` | [src/app/page.tsx:L12-L35](file:///F:/AppMaking/ViTudy/src/app/page.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `TransactionType` | `type` | [src/types/vitoken.ts:L1-L8](file:///F:/AppMaking/ViTudy/src/types/vitoken.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `useDeskItemInteraction` | `hook` | [src/hooks/useDeskItemInteraction.ts:L16-L180](file:///F:/AppMaking/ViTudy/src/hooks/useDeskItemInteraction.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `useRealtimeMultiplayer` | `hook` | [src/hooks/useRealtimeMultiplayer.ts:L24-L170](file:///F:/AppMaking/ViTudy/src/hooks/useRealtimeMultiplayer.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ViTokenTransaction` | `type` | [src/types/vitoken.ts:L10-L17](file:///F:/AppMaking/ViTudy/src/types/vitoken.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ViTokenWallet` | `type` | [src/types/vitoken.ts:L29-L34](file:///F:/AppMaking/ViTudy/src/types/vitoken.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |

