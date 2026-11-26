# 03_SYMBOL_INDEX.md — Chỉ Mục Toàn Bộ Ký Hiệu Codebase ViTudy

> **Commit Hash:** `713e531`  
> **Cập nhật lần cuối:** `2026-11-26`  
> **Quy ước:** Symbol | Kind | File:Lines (Symbol) | Vai trò chức năng

<!-- manual:start -->
Tài liệu này được đồng bộ tự động qua `npm run docs:index` và kiểm tra bởi `npm run docs:check`.
<!-- manual:end -->

### Canvas & 2.5D Desk

| Ký hiệu (Symbol) | Loại (Kind) | Vị trí (File:Lines) | Vai trò chức năng |
|---|---|---|---|
| `DeskDrawingCanvas` | `component` | [src/components/canvas/DeskDrawingCanvas.tsx:L104-L131](file:////home/nhat/Documents/DUT/ViTudy/src/components/canvas/DeskDrawingCanvas.tsx) | Canvas vẽ nét bút dạ quang và bút vẽ tự do với chế độ multiply blend |
| `DeskDrawingInteractionLayer` | `component` | [src/components/canvas/DeskDrawingInteractionLayer.tsx:L6-L686](file:////home/nhat/Documents/DUT/ViTudy/src/components/canvas/DeskDrawingInteractionLayer.tsx) | Lớp đón bắt sự kiện kéo vẽ mượt mà, phân định vẽ nét vs di chuyển bàn |
| `DeskGrid` | `component` | [src/components/canvas/DeskGrid.tsx:L5-L50](file:////home/nhat/Documents/DUT/ViTudy/src/components/canvas/DeskGrid.tsx) | Lưới caro toạ độ bàn học trắng tinh khiết chống mỏi mắt |
| `InfiniteDesk` | `component` | [src/components/canvas/InfiniteDesk.tsx:L27-L525](file:////home/nhat/Documents/DUT/ViTudy/src/components/canvas/InfiniteDesk.tsx) | Mặt bàn vô cực 2.5D: quản lý pan, zoom, phím tắt Alt+Drag, bắt sự kiện click |
| `ItemDrawingOverlay` | `component` | [src/components/canvas/ItemDrawingOverlay.tsx:L43-L93](file:////home/nhat/Documents/DUT/ViTudy/src/components/canvas/ItemDrawingOverlay.tsx) | Thành phần nghiệp vụ của phân hệ Canvas & 2.5D Desk |
| `MindMapConnectors` | `component` | [src/components/canvas/MindMapConnectors.tsx:L6-L103](file:////home/nhat/Documents/DUT/ViTudy/src/components/canvas/MindMapConnectors.tsx) | Thành phần nghiệp vụ của phân hệ Canvas & 2.5D Desk |
| `Minimap` | `component` | [src/components/canvas/Minimap.tsx:L12-L233](file:////home/nhat/Documents/DUT/ViTudy/src/components/canvas/Minimap.tsx) | Bản đồ radar thu nhỏ góc nhìn toàn cảnh không gian bàn học 2.5D |
| `MultiplayerCursorsLayer` | `component` | [src/components/canvas/MultiplayerCursorsLayer.tsx:L11-L57](file:////home/nhat/Documents/DUT/ViTudy/src/components/canvas/MultiplayerCursorsLayer.tsx) | Thành phần nghiệp vụ của phân hệ Canvas & 2.5D Desk |
| `StudySpaceDeskView` | `component` | [src/components/canvas/StudySpaceDeskView.tsx:L21-L270](file:////home/nhat/Documents/DUT/ViTudy/src/components/canvas/StudySpaceDeskView.tsx) | Component trung tâm tích hợp toàn bộ Canvas bàn học, HUD 4 góc và modal |
| `VisualLinkThreads` | `component` | [src/components/canvas/VisualLinkThreads.tsx:L6-L215](file:////home/nhat/Documents/DUT/ViTudy/src/components/canvas/VisualLinkThreads.tsx) | Vẽ các đường dây nối SVG trực quan từ đoạn trích sách sang giấy note Inteline |

### Objects (Sách, Giấy, Note)

| Ký hiệu (Symbol) | Loại (Kind) | Vị trí (File:Lines) | Vai trò chức năng |
|---|---|---|---|
| `BoardGameArena` | `component` | [src/components/objects/BoardGameArena.tsx:L46-L1417](file:////home/nhat/Documents/DUT/ViTudy/src/components/objects/BoardGameArena.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `BOOK_COVER_PRESETS` | `component` | [src/components/objects/BookSpread.tsx:L39-L80](file:////home/nhat/Documents/DUT/ViTudy/src/components/objects/BookSpread.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `BookSpread` | `component` | [src/components/objects/BookSpread.tsx:L1151-L1151](file:////home/nhat/Documents/DUT/ViTudy/src/components/objects/BookSpread.tsx) | Mô phỏng cuốn sách mở 2.5D, phân trang động DOM, bìa cứng, gờ gáy và popover Inteline |
| `BookSpreadComponent` | `component` | [src/components/objects/BookSpread.tsx:L82-L1149](file:////home/nhat/Documents/DUT/ViTudy/src/components/objects/BookSpread.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `CodeBlockItem` | `component` | [src/components/objects/CodeBlockItem.tsx:L15-L222](file:////home/nhat/Documents/DUT/ViTudy/src/components/objects/CodeBlockItem.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `CurrencyAndBankPanel` | `component` | [src/components/objects/boardgame/CurrencyAndBankPanel.tsx:L23-L390](file:////home/nhat/Documents/DUT/ViTudy/src/components/objects/boardgame/CurrencyAndBankPanel.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `DeckAndDeedModal` | `component` | [src/components/objects/boardgame/DeckAndDeedModal.tsx:L20-L333](file:////home/nhat/Documents/DUT/ViTudy/src/components/objects/boardgame/DeckAndDeedModal.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `ExamQuizCard` | `component` | [src/components/objects/ExamQuizCard.tsx:L750-L750](file:////home/nhat/Documents/DUT/ViTudy/src/components/objects/ExamQuizCard.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `ExamQuizCardComponent` | `component` | [src/components/objects/ExamQuizCard.tsx:L46-L748](file:////home/nhat/Documents/DUT/ViTudy/src/components/objects/ExamQuizCard.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `FourCornerArtboard` | `component` | [src/components/objects/FourCornerArtboard.tsx:L35-L651](file:////home/nhat/Documents/DUT/ViTudy/src/components/objects/FourCornerArtboard.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `GameLinkLayer` | `component` | [src/components/objects/boardgame/GameLinkLayer.tsx:L14-L72](file:////home/nhat/Documents/DUT/ViTudy/src/components/objects/boardgame/GameLinkLayer.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `MindMapNodeItem` | `component` | [src/components/objects/MindMapNodeItem.tsx:L24-L296](file:////home/nhat/Documents/DUT/ViTudy/src/components/objects/MindMapNodeItem.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `PaperSheet` | `component` | [src/components/objects/PaperSheet.tsx:L885-L885](file:////home/nhat/Documents/DUT/ViTudy/src/components/objects/PaperSheet.tsx) | Mô phỏng tờ giấy A4/ghi chép đơn lẻ 2.5D với độ xoay tự do và texture giấy |
| `PaperSheetComponent` | `component` | [src/components/objects/PaperSheet.tsx:L47-L883](file:////home/nhat/Documents/DUT/ViTudy/src/components/objects/PaperSheet.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `PresentationItem` | `component` | [src/components/objects/PresentationItem.tsx:L25-L385](file:////home/nhat/Documents/DUT/ViTudy/src/components/objects/PresentationItem.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `SpreadsheetItem` | `component` | [src/components/objects/SpreadsheetItem.tsx:L15-L308](file:////home/nhat/Documents/DUT/ViTudy/src/components/objects/SpreadsheetItem.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `StickerItem` | `component` | [src/components/objects/StickerItem.tsx:L15-L192](file:////home/nhat/Documents/DUT/ViTudy/src/components/objects/StickerItem.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `StickyNoteItem` | `component` | [src/components/objects/StickyNoteItem.tsx:L1149-L1149](file:////home/nhat/Documents/DUT/ViTudy/src/components/objects/StickyNoteItem.tsx) | Giấy ghi chú dán bàn học (Patrick Hand font, NFC normalized, xoay 360°) |
| `StickyNoteItemComponent` | `component` | [src/components/objects/StickyNoteItem.tsx:L40-L1147](file:////home/nhat/Documents/DUT/ViTudy/src/components/objects/StickyNoteItem.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `TileFormEditorModal` | `component` | [src/components/objects/boardgame/TileFormEditorModal.tsx:L22-L353](file:////home/nhat/Documents/DUT/ViTudy/src/components/objects/boardgame/TileFormEditorModal.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `TopDownDice3D` | `component` | [src/components/objects/boardgame/TopDownDice3D.tsx:L44-L129](file:////home/nhat/Documents/DUT/ViTudy/src/components/objects/boardgame/TopDownDice3D.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `VoiceNoteItem` | `component` | [src/components/objects/VoiceNoteItem.tsx:L39-L668](file:////home/nhat/Documents/DUT/ViTudy/src/components/objects/VoiceNoteItem.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |

### HUD & Overlays

| Ký hiệu (Symbol) | Loại (Kind) | Vị trí (File:Lines) | Vai trò chức năng |
|---|---|---|---|
| `BottomLeftKnowledge` | `component` | [src/components/hud/BottomLeftKnowledge.tsx:L54-L1337](file:////home/nhat/Documents/DUT/ViTudy/src/components/hud/BottomLeftKnowledge.tsx) | HUD góc dưới-trái: nút tải tài liệu và mở chợ chia sẻ tri thức KnowInherit 85/15 |
| `BottomRightToolkit` | `component` | [src/components/hud/BottomRightToolkit.tsx:L17-L200](file:////home/nhat/Documents/DUT/ViTudy/src/components/hud/BottomRightToolkit.tsx) | HUD góc dưới-phải: công cụ bút dạ quang, tạo note, khoá góc nhìn, zoom 100% |
| `FriendInviteToast` | `component` | [src/components/hud/FriendInviteToast.tsx:L14-L124](file:////home/nhat/Documents/DUT/ViTudy/src/components/hud/FriendInviteToast.tsx) | Thành phần nghiệp vụ của phân hệ HUD & Overlays |
| `FriendInviteToastProps` | `type` | [src/components/hud/FriendInviteToast.tsx:L8-L12](file:////home/nhat/Documents/DUT/ViTudy/src/components/hud/FriendInviteToast.tsx) | Thành phần nghiệp vụ của phân hệ HUD & Overlays |
| `FriendsRightDrawer` | `component` | [src/components/hud/FriendsRightDrawer.tsx:L27-L436](file:////home/nhat/Documents/DUT/ViTudy/src/components/hud/FriendsRightDrawer.tsx) | Thành phần nghiệp vụ của phân hệ HUD & Overlays |
| `GamePenToolbar` | `component` | [src/components/hud/GamePenToolbar.tsx:L23-L194](file:////home/nhat/Documents/DUT/ViTudy/src/components/hud/GamePenToolbar.tsx) | Thành phần nghiệp vụ của phân hệ HUD & Overlays |
| `InviteModal` | `component` | [src/components/hud/InviteModal.tsx:L14-L132](file:////home/nhat/Documents/DUT/ViTudy/src/components/hud/InviteModal.tsx) | Thành phần nghiệp vụ của phân hệ HUD & Overlays |
| `LeftCreationBar` | `component` | [src/components/hud/LeftCreationBar.tsx:L42-L747](file:////home/nhat/Documents/DUT/ViTudy/src/components/hud/LeftCreationBar.tsx) | Thành phần nghiệp vụ của phân hệ HUD & Overlays |
| `ModelGroup` | `type` | [src/components/hud/TopRightWallet.tsx:L67-L70](file:////home/nhat/Documents/DUT/ViTudy/src/components/hud/TopRightWallet.tsx) | Thành phần nghiệp vụ của phân hệ HUD & Overlays |
| `ModelItem` | `type` | [src/components/hud/TopRightWallet.tsx:L61-L65](file:////home/nhat/Documents/DUT/ViTudy/src/components/hud/TopRightWallet.tsx) | Thành phần nghiệp vụ của phân hệ HUD & Overlays |
| `MultiplayerBar` | `component` | [src/components/hud/MultiplayerBar.tsx:L25-L564](file:////home/nhat/Documents/DUT/ViTudy/src/components/hud/MultiplayerBar.tsx) | HUD cộng tác học nhóm thời gian thực: danh sách avatar, thả cảm xúc emoji |
| `PomodoroChip` | `component` | [src/components/hud/PomodoroChip.tsx:L7-L149](file:////home/nhat/Documents/DUT/ViTudy/src/components/hud/PomodoroChip.tsx) | Thành phần nghiệp vụ của phân hệ HUD & Overlays |
| `StickerEmojiPickerFlyout` | `component` | [src/components/hud/StickerEmojiPickerFlyout.tsx:L35-L731](file:////home/nhat/Documents/DUT/ViTudy/src/components/hud/StickerEmojiPickerFlyout.tsx) | Thành phần nghiệp vụ của phân hệ HUD & Overlays |
| `TopLeftNav` | `component` | [src/components/hud/TopLeftNav.tsx:L36-L581](file:////home/nhat/Documents/DUT/ViTudy/src/components/hud/TopLeftNav.tsx) | HUD góc trên-trái: chuyển đổi bàn học, tìm kiếm tài liệu, đồng bộ góc nhìn |
| `TopRightWallet` | `component` | [src/components/hud/TopRightWallet.tsx:L145-L1264](file:////home/nhat/Documents/DUT/ViTudy/src/components/hud/TopRightWallet.tsx) | HUD góc trên-phải: hiển thị số dư ViToken, chuỗi điểm danh streak, chọn model AI |
| `VrFrameOverlay` | `component` | [src/components/hud/VrFrameOverlay.tsx:L5-L15](file:////home/nhat/Documents/DUT/ViTudy/src/components/hud/VrFrameOverlay.tsx) | Khung viền 4 góc và nhãn chế độ "Không gian học 2.5D" phong cách VR HUD |

### Modals & Workflows

| Ký hiệu (Symbol) | Loại (Kind) | Vị trí (File:Lines) | Vai trò chức năng |
|---|---|---|---|
| `AiConfigModal` | `component` | [src/components/modals/AiConfigModal.tsx:L101-L787](file:////home/nhat/Documents/DUT/ViTudy/src/components/modals/AiConfigModal.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `BookCoverModal` | `component` | [src/components/modals/BookCoverModal.tsx:L40-L416](file:////home/nhat/Documents/DUT/ViTudy/src/components/modals/BookCoverModal.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `BookInitialPage` | `type` | [src/components/modals/BookCoverModal.tsx:L18-L22](file:////home/nhat/Documents/DUT/ViTudy/src/components/modals/BookCoverModal.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `BYOK_CLAUDE_MODELS` | `component` | [src/components/modals/AiConfigModal.tsx:L74-L77](file:////home/nhat/Documents/DUT/ViTudy/src/components/modals/AiConfigModal.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `BYOK_GEMINI_MODELS` | `component` | [src/components/modals/AiConfigModal.tsx:L64-L67](file:////home/nhat/Documents/DUT/ViTudy/src/components/modals/AiConfigModal.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `BYOK_OPENAI_MODELS` | `component` | [src/components/modals/AiConfigModal.tsx:L69-L72](file:////home/nhat/Documents/DUT/ViTudy/src/components/modals/AiConfigModal.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `CHATGPT_MODEL_GROUPS` | `component` | [src/components/modals/AiConfigModal.tsx:L39-L56](file:////home/nhat/Documents/DUT/ViTudy/src/components/modals/AiConfigModal.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `FlashcardModal` | `component` | [src/components/modals/FlashcardModal.tsx:L15-L65](file:////home/nhat/Documents/DUT/ViTudy/src/components/modals/FlashcardModal.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `FlashcardTab` | `component` | [src/components/modals/study-tools/FlashcardTab.tsx:L28-L348](file:////home/nhat/Documents/DUT/ViTudy/src/components/modals/study-tools/FlashcardTab.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `FullScreenDocModal` | `component` | [src/components/modals/FullScreenDocModal.tsx:L33-L867](file:////home/nhat/Documents/DUT/ViTudy/src/components/modals/FullScreenDocModal.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `GameCabinetModal` | `component` | [src/components/modals/GameCabinetModal.tsx:L15-L225](file:////home/nhat/Documents/DUT/ViTudy/src/components/modals/GameCabinetModal.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `IntelineModal` | `component` | [src/components/modals/IntelineModal.tsx:L27-L270](file:////home/nhat/Documents/DUT/ViTudy/src/components/modals/IntelineModal.tsx) | Hộp thoại AI hỏi đáp ngữ cảnh sâu Inteline theo từng dòng/trang tài liệu |
| `KnowInheritPublishModal` | `component` | [src/components/modals/KnowInheritPublishModal.tsx:L39-L450](file:////home/nhat/Documents/DUT/ViTudy/src/components/modals/KnowInheritPublishModal.tsx) | Hộp thoại chia sẻ tài liệu lên chợ tri thức: AI thẩm định điểm và tính giá |
| `MarketModal` | `component` | [src/components/modals/MarketModal.tsx:L44-L1024](file:////home/nhat/Documents/DUT/ViTudy/src/components/modals/MarketModal.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `MobileCompanionView` | `component` | [src/components/mobile/MobileCompanionView.tsx:L30-L412](file:////home/nhat/Documents/DUT/ViTudy/src/components/mobile/MobileCompanionView.tsx) | Giao diện di động rút gọn đồng bộ tài liệu từ máy tính |
| `ModelGroup` | `type` | [src/components/modals/AiConfigModal.tsx:L34-L37](file:////home/nhat/Documents/DUT/ViTudy/src/components/modals/AiConfigModal.tsx) | Thành phần nghiệp vụ của phân hệ HUD & Overlays |
| `ModelItem` | `type` | [src/components/modals/AiConfigModal.tsx:L28-L32](file:////home/nhat/Documents/DUT/ViTudy/src/components/modals/AiConfigModal.tsx) | Thành phần nghiệp vụ của phân hệ HUD & Overlays |
| `PROVIDER_MODELS` | `component` | [src/components/modals/AiConfigModal.tsx:L79-L86](file:////home/nhat/Documents/DUT/ViTudy/src/components/modals/AiConfigModal.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `QuizTab` | `component` | [src/components/modals/study-tools/QuizTab.tsx:L32-L758](file:////home/nhat/Documents/DUT/ViTudy/src/components/modals/study-tools/QuizTab.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `RoadmapTab` | `component` | [src/components/modals/study-tools/RoadmapTab.tsx:L26-L228](file:////home/nhat/Documents/DUT/ViTudy/src/components/modals/study-tools/RoadmapTab.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `SelectSpaceForDocModal` | `component` | [src/components/modals/SelectSpaceForDocModal.tsx:L30-L358](file:////home/nhat/Documents/DUT/ViTudy/src/components/modals/SelectSpaceForDocModal.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `StorageManagerModal` | `component` | [src/components/modals/StorageManagerModal.tsx:L26-L264](file:////home/nhat/Documents/DUT/ViTudy/src/components/modals/StorageManagerModal.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `StudyToolsModal` | `component` | [src/components/modals/StudyToolsModal.tsx:L30-L192](file:////home/nhat/Documents/DUT/ViTudy/src/components/modals/StudyToolsModal.tsx) | Bộ công cụ ôn tập toàn diện STudy: TextRank, Cloze Quiz, Flashcard, Roadmap |
| `SummaryTab` | `component` | [src/components/modals/study-tools/SummaryTab.tsx:L19-L260](file:////home/nhat/Documents/DUT/ViTudy/src/components/modals/study-tools/SummaryTab.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `SYSTEM_MODEL_LIST` | `component` | [src/components/modals/AiConfigModal.tsx:L58-L62](file:////home/nhat/Documents/DUT/ViTudy/src/components/modals/AiConfigModal.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `VoiceNoteRecordModal` | `component` | [src/components/modals/VoiceNoteRecordModal.tsx:L103-L778](file:////home/nhat/Documents/DUT/ViTudy/src/components/modals/VoiceNoteRecordModal.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |

### Context & State

| Ký hiệu (Symbol) | Loại (Kind) | Vị trí (File:Lines) | Vai trò chức năng |
|---|---|---|---|
| `AuthContextType` | `type` | [src/context/AuthContext.tsx:L23-L35](file:////home/nhat/Documents/DUT/ViTudy/src/context/AuthContext.tsx) | Thành phần nghiệp vụ của phân hệ Context & State |
| `AuthProvider` | `context` | [src/context/AuthContext.tsx:L39-L306](file:////home/nhat/Documents/DUT/ViTudy/src/context/AuthContext.tsx) | Thành phần nghiệp vụ của phân hệ Context & State |
| `AuthResult` | `type` | [src/context/AuthContext.tsx:L18-L21](file:////home/nhat/Documents/DUT/ViTudy/src/context/AuthContext.tsx) | Thành phần nghiệp vụ của phân hệ Context & State |
| `AuthStatus` | `type` | [src/context/AuthContext.tsx:L8-L8](file:////home/nhat/Documents/DUT/ViTudy/src/context/AuthContext.tsx) | Thành phần nghiệp vụ của phân hệ Context & State |
| `CreationPlacementTemplate` | `type` | [src/context/StudySpaceContext.tsx:L15-L37](file:////home/nhat/Documents/DUT/ViTudy/src/context/StudySpaceContext.tsx) | Thành phần nghiệp vụ của phân hệ Context & State |
| `MyPendingJoinRequest` | `type` | [src/context/SocialPresenceContext.tsx:L39-L46](file:////home/nhat/Documents/DUT/ViTudy/src/context/SocialPresenceContext.tsx) | Thành phần nghiệp vụ của phân hệ Context & State |
| `PomodoroProvider` | `context` | [src/context/PomodoroContext.tsx:L36-L132](file:////home/nhat/Documents/DUT/ViTudy/src/context/PomodoroContext.tsx) | Thành phần nghiệp vụ của phân hệ Context & State |
| `PomodoroSession` | `type` | [src/context/PomodoroContext.tsx:L7-L12](file:////home/nhat/Documents/DUT/ViTudy/src/context/PomodoroContext.tsx) | Thành phần nghiệp vụ của phân hệ Context & State |
| `RoomJoinRequest` | `type` | [src/context/SocialPresenceContext.tsx:L15-L25](file:////home/nhat/Documents/DUT/ViTudy/src/context/SocialPresenceContext.tsx) | Thành phần nghiệp vụ của phân hệ Context & State |
| `RoomJoinResponse` | `type` | [src/context/SocialPresenceContext.tsx:L27-L37](file:////home/nhat/Documents/DUT/ViTudy/src/context/SocialPresenceContext.tsx) | Thành phần nghiệp vụ của phân hệ Context & State |
| `SocialPresenceContextType` | `type` | [src/context/SocialPresenceContext.tsx:L48-L67](file:////home/nhat/Documents/DUT/ViTudy/src/context/SocialPresenceContext.tsx) | Thành phần nghiệp vụ của phân hệ Context & State |
| `SocialPresenceProvider` | `context` | [src/context/SocialPresenceContext.tsx:L71-L470](file:////home/nhat/Documents/DUT/ViTudy/src/context/SocialPresenceContext.tsx) | Thành phần nghiệp vụ của phân hệ Context & State |
| `StudySpaceProvider` | `context` | [src/context/StudySpaceContext.tsx:L229-L3631](file:////home/nhat/Documents/DUT/ViTudy/src/context/StudySpaceContext.tsx) | Provider quản lý toàn bộ state bàn học, tài liệu, toạ độ, nét vẽ, zIndex |
| `useAuth` | `hook` | [src/context/AuthContext.tsx:L312-L318](file:////home/nhat/Documents/DUT/ViTudy/src/context/AuthContext.tsx) | Thành phần nghiệp vụ của phân hệ Context & State |
| `useOptionalAuth` | `hook` | [src/context/AuthContext.tsx:L320-L322](file:////home/nhat/Documents/DUT/ViTudy/src/context/AuthContext.tsx) | Thành phần nghiệp vụ của phân hệ Context & State |
| `usePomodoroContext` | `hook` | [src/context/PomodoroContext.tsx:L134-L140](file:////home/nhat/Documents/DUT/ViTudy/src/context/PomodoroContext.tsx) | Thành phần nghiệp vụ của phân hệ Context & State |
| `UserProfile` | `type` | [src/context/AuthContext.tsx:L10-L16](file:////home/nhat/Documents/DUT/ViTudy/src/context/AuthContext.tsx) | Thành phần nghiệp vụ của phân hệ Context & State |
| `useSocialPresenceContext` | `hook` | [src/context/SocialPresenceContext.tsx:L472-L475](file:////home/nhat/Documents/DUT/ViTudy/src/context/SocialPresenceContext.tsx) | Thành phần nghiệp vụ của phân hệ Context & State |
| `useStudySpace` | `hook` | [src/context/StudySpaceContext.tsx:L3633-L3639](file:////home/nhat/Documents/DUT/ViTudy/src/context/StudySpaceContext.tsx) | Hook truy cập trạng thái không gian bàn học, camera, danh sách tài liệu |
| `useViToken` | `hook` | [src/context/ViTokenContext.tsx:L317-L323](file:////home/nhat/Documents/DUT/ViTudy/src/context/ViTokenContext.tsx) | Hook quản lý ví ViToken, chi tiêu token, điểm danh streak và cấu hình AI |
| `ViTokenProvider` | `context` | [src/context/ViTokenContext.tsx:L47-L315](file:////home/nhat/Documents/DUT/ViTudy/src/context/ViTokenContext.tsx) | Provider lưu trữ và đồng bộ ví ViToken, lịch sử giao dịch vào localStorage |

### Non-AI Engine & Utils

| Ký hiệu (Symbol) | Loại (Kind) | Vị trí (File:Lines) | Vai trò chức năng |
|---|---|---|---|
| `activeStrokeStore` | `const` | [src/lib/activeStrokeStore.ts:L10-L28](file:////home/nhat/Documents/DUT/ViTudy/src/lib/activeStrokeStore.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `applyDiscordUrlMappings` | `fn` | [src/lib/discord/urlMappings.ts:L5-L39](file:////home/nhat/Documents/DUT/ViTudy/src/lib/discord/urlMappings.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `askAi` | `fn` | [src/lib/aiClient.ts:L252-L356](file:////home/nhat/Documents/DUT/ViTudy/src/lib/aiClient.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `AskAiRequest` | `type` | [src/lib/aiClient.ts:L17-L25](file:////home/nhat/Documents/DUT/ViTudy/src/lib/aiClient.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `AskAiResult` | `type` | [src/lib/aiClient.ts:L27-L31](file:////home/nhat/Documents/DUT/ViTudy/src/lib/aiClient.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `base64UrlDecode` | `fn` | [src/lib/openaiOAuth.ts:L44-L58](file:////home/nhat/Documents/DUT/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `base64UrlEncode` | `fn` | [src/lib/openaiOAuth.ts:L32-L42](file:////home/nhat/Documents/DUT/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `buildOpenAiAuthorizeUrl` | `fn` | [src/lib/openaiOAuth.ts:L90-L103](file:////home/nhat/Documents/DUT/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `ByokProvider` | `type` | [src/lib/byokStore.ts:L1-L1](file:////home/nhat/Documents/DUT/ViTudy/src/lib/byokStore.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `CachedStudyData` | `type` | [src/lib/studyToolsCache.ts:L4-L12](file:////home/nhat/Documents/DUT/ViTudy/src/lib/studyToolsCache.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `calculateNextReview` | `fn` | [src/lib/sm2.ts:L16-L58](file:////home/nhat/Documents/DUT/ViTudy/src/lib/sm2.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `calculateNextStageProgress` | `fn` | [src/lib/petHelpers.ts:L45-L71](file:////home/nhat/Documents/DUT/ViTudy/src/lib/petHelpers.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `calculatePetStage` | `fn` | [src/lib/petHelpers.ts:L10-L16](file:////home/nhat/Documents/DUT/ViTudy/src/lib/petHelpers.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `classifyResult` | `fn` | [src/utils/smartShape.test.ts:L332-L335](file:////home/nhat/Documents/DUT/ViTudy/src/utils/smartShape.test.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `clearOpenAiOAuthSession` | `fn` | [src/lib/openaiOAuth.ts:L322-L325](file:////home/nhat/Documents/DUT/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `clearPendingPkce` | `fn` | [src/lib/openaiOAuth.ts:L130-L135](file:////home/nhat/Documents/DUT/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `clearStudyToolsCache` | `fn` | [src/lib/studyToolsCache.ts:L27-L33](file:////home/nhat/Documents/DUT/ViTudy/src/lib/studyToolsCache.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `clearSupabaseConfig` | `fn` | [src/lib/supabase.ts:L81-L87](file:////home/nhat/Documents/DUT/ViTudy/src/lib/supabase.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `computeArcLengths` | `fn` | [src/utils/smartShape.ts:L46-L54](file:////home/nhat/Documents/DUT/ViTudy/src/utils/smartShape.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `computeBoundingBox` | `fn` | [src/utils/smartShape.ts:L85-L99](file:////home/nhat/Documents/DUT/ViTudy/src/utils/smartShape.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `computePolygonArea` | `fn` | [src/utils/smartShape.ts:L142-L150](file:////home/nhat/Documents/DUT/ViTudy/src/utils/smartShape.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `countSharpCorners` | `fn` | [src/utils/smartShape.ts:L152-L181](file:////home/nhat/Documents/DUT/ViTudy/src/utils/smartShape.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `DEFAULT_PET_NAME` | `component` | [src/lib/petHelpers.ts:L8-L8](file:////home/nhat/Documents/DUT/ViTudy/src/lib/petHelpers.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `DiscordAuthResult` | `type` | [src/lib/discord/sdk.ts:L3-L14](file:////home/nhat/Documents/DUT/ViTudy/src/lib/discord/sdk.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `DocumentOutlineNode` | `type` | [src/lib/nonAiEngine.ts:L45-L51](file:////home/nhat/Documents/DUT/ViTudy/src/lib/nonAiEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `ensureValidOpenAiSession` | `fn` | [src/lib/aiClient.ts:L236-L250](file:////home/nhat/Documents/DUT/ViTudy/src/lib/aiClient.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `exchangeOpenAiCode` | `fn` | [src/lib/aiClient.ts:L119-L234](file:////home/nhat/Documents/DUT/ViTudy/src/lib/aiClient.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `extractOpenAiJwtClaims` | `fn` | [src/lib/openaiOAuth.ts:L148-L186](file:////home/nhat/Documents/DUT/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `extractOutlineAndRoadmap` | `fn` | [src/lib/nonAiEngine.ts:L311-L337](file:////home/nhat/Documents/DUT/ViTudy/src/lib/nonAiEngine.ts) | Thuật toán trích xuất tiêu đề dựng lộ trình học tương tác theo thời gian |
| `fitCircle` | `fn` | [src/utils/smartShape.ts:L270-L332](file:////home/nhat/Documents/DUT/ViTudy/src/utils/smartShape.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `fitEllipse` | `fn` | [src/utils/smartShape.ts:L337-L424](file:////home/nhat/Documents/DUT/ViTudy/src/utils/smartShape.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `fitLine` | `fn` | [src/utils/smartShape.ts:L190-L265](file:////home/nhat/Documents/DUT/ViTudy/src/utils/smartShape.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `fitRotatedRectangle` | `fn` | [src/utils/smartShape.ts:L429-L555](file:////home/nhat/Documents/DUT/ViTudy/src/utils/smartShape.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `fitTriangle` | `fn` | [src/utils/smartShape.ts:L560-L622](file:////home/nhat/Documents/DUT/ViTudy/src/utils/smartShape.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `Flashcard` | `type` | [src/lib/nonAiEngine.ts:L28-L33](file:////home/nhat/Documents/DUT/ViTudy/src/lib/nonAiEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `formatDateStr` | `fn` | [src/lib/petHelpers.ts:L18-L23](file:////home/nhat/Documents/DUT/ViTudy/src/lib/petHelpers.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `formatRelativeTimeVN` | `fn` | [src/lib/dateVN.ts:L65-L91](file:////home/nhat/Documents/DUT/ViTudy/src/lib/dateVN.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `formatUploadedDocTitle` | `fn` | [src/utils/documentNaming.ts:L53-L84](file:////home/nhat/Documents/DUT/ViTudy/src/utils/documentNaming.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `generateCircleStroke` | `fn` | [src/utils/smartShape.test.ts:L61-L86](file:////home/nhat/Documents/DUT/ViTudy/src/utils/smartShape.test.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `generateClozeQuestions` | `fn` | [src/lib/nonAiEngine.ts:L152-L246](file:////home/nhat/Documents/DUT/ViTudy/src/lib/nonAiEngine.ts) | Thuật toán Cloze Deletion tự động đục lỗ từ khoá tạo bài tập trắc nghiệm |
| `generateEllipseStroke` | `fn` | [src/utils/smartShape.test.ts:L88-L113](file:////home/nhat/Documents/DUT/ViTudy/src/utils/smartShape.test.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `generateFlashcardsFromRules` | `fn` | [src/lib/nonAiEngine.ts:L251-L306](file:////home/nhat/Documents/DUT/ViTudy/src/lib/nonAiEngine.ts) | Quy tắc bóc tách câu định nghĩa thành bộ thẻ nhớ Flashcard ôn tập |
| `generateLineStroke` | `fn` | [src/utils/smartShape.test.ts:L39-L59](file:////home/nhat/Documents/DUT/ViTudy/src/utils/smartShape.test.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `generateNonShapeStroke` | `fn` | [src/utils/smartShape.test.ts:L260-L327](file:////home/nhat/Documents/DUT/ViTudy/src/utils/smartShape.test.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `generatePkcePair` | `fn` | [src/lib/openaiOAuth.ts:L72-L88](file:////home/nhat/Documents/DUT/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `generateRectangleStroke` | `fn` | [src/utils/smartShape.test.ts:L165-L208](file:////home/nhat/Documents/DUT/ViTudy/src/utils/smartShape.test.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `generateSquareStroke` | `fn` | [src/utils/smartShape.test.ts:L115-L163](file:////home/nhat/Documents/DUT/ViTudy/src/utils/smartShape.test.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `generateTriangleStroke` | `fn` | [src/utils/smartShape.test.ts:L210-L258](file:////home/nhat/Documents/DUT/ViTudy/src/utils/smartShape.test.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `getAppBasePath` | `fn` | [src/lib/assets.ts:L1-L9](file:////home/nhat/Documents/DUT/ViTudy/src/lib/assets.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `getAppBaseUrl` | `fn` | [src/lib/assets.ts:L11-L18](file:////home/nhat/Documents/DUT/ViTudy/src/lib/assets.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `getAssetPath` | `fn` | [src/lib/assets.ts:L37-L42](file:////home/nhat/Documents/DUT/ViTudy/src/lib/assets.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `getDiscordSdk` | `fn` | [src/lib/discord/sdk.ts:L18-L28](file:////home/nhat/Documents/DUT/ViTudy/src/lib/discord/sdk.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `getIDB` | `fn` | [src/lib/indexeddb.ts:L8-L25](file:////home/nhat/Documents/DUT/ViTudy/src/lib/indexeddb.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `getLast28DaysGrid` | `fn` | [src/lib/dateVN.ts:L28-L60](file:////home/nhat/Documents/DUT/ViTudy/src/lib/dateVN.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `getOpenAiOAuthSession` | `fn` | [src/lib/openaiOAuth.ts:L286-L320](file:////home/nhat/Documents/DUT/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `getPendingPkce` | `fn` | [src/lib/openaiOAuth.ts:L117-L128](file:////home/nhat/Documents/DUT/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `getPetAssetUrl` | `fn` | [src/lib/petHelpers.ts:L130-L133](file:////home/nhat/Documents/DUT/ViTudy/src/lib/petHelpers.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `getShareRoomUrl` | `fn` | [src/lib/assets.ts:L20-L27](file:////home/nhat/Documents/DUT/ViTudy/src/lib/assets.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `getStudyCache` | `fn` | [src/lib/studyToolsCache.ts:L16-L18](file:////home/nhat/Documents/DUT/ViTudy/src/lib/studyToolsCache.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `getStudyToolsCache` | `const` | [src/lib/studyToolsCache.ts:L25-L25](file:////home/nhat/Documents/DUT/ViTudy/src/lib/studyToolsCache.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `getSupabase` | `fn` | [src/lib/supabase.ts:L41-L71](file:////home/nhat/Documents/DUT/ViTudy/src/lib/supabase.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `getSupabaseConfig` | `fn` | [src/lib/supabase.ts:L10-L37](file:////home/nhat/Documents/DUT/ViTudy/src/lib/supabase.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `idbDelete` | `fn` | [src/lib/indexeddb.ts:L39-L43](file:////home/nhat/Documents/DUT/ViTudy/src/lib/indexeddb.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `idbGet` | `fn` | [src/lib/indexeddb.ts:L27-L31](file:////home/nhat/Documents/DUT/ViTudy/src/lib/indexeddb.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `idbSet` | `fn` | [src/lib/indexeddb.ts:L33-L37](file:////home/nhat/Documents/DUT/ViTudy/src/lib/indexeddb.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `initDiscord` | `fn` | [src/lib/discord/sdk.ts:L30-L71](file:////home/nhat/Documents/DUT/ViTudy/src/lib/discord/sdk.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `isCameraOrMachineGeneratedName` | `fn` | [src/utils/documentNaming.ts:L6-L33](file:////home/nhat/Documents/DUT/ViTudy/src/utils/documentNaming.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `isDiscordActivity` | `fn` | [src/lib/discord/detect.ts:L5-L13](file:////home/nhat/Documents/DUT/ViTudy/src/lib/discord/detect.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `isItemVisible` | `fn` | [src/lib/viewportCulling.ts:L21-L48](file:////home/nhat/Documents/DUT/ViTudy/src/lib/viewportCulling.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `isOpenAiSessionExpired` | `fn` | [src/lib/openaiOAuth.ts:L327-L333](file:////home/nhat/Documents/DUT/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `isSameDay` | `fn` | [src/lib/petHelpers.ts:L25-L28](file:////home/nhat/Documents/DUT/ViTudy/src/lib/petHelpers.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `isYesterday` | `fn` | [src/lib/petHelpers.ts:L30-L35](file:////home/nhat/Documents/DUT/ViTudy/src/lib/petHelpers.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `ItemBounds` | `type` | [src/lib/viewportCulling.ts:L1-L7](file:////home/nhat/Documents/DUT/ViTudy/src/lib/viewportCulling.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `LEGACY_STREAK_KEY` | `component` | [src/lib/petHelpers.ts:L5-L5](file:////home/nhat/Documents/DUT/ViTudy/src/lib/petHelpers.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `migrateLegacyStorage` | `fn` | [src/lib/storageMigration.ts:L8-L57](file:////home/nhat/Documents/DUT/ViTudy/src/lib/storageMigration.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `navigateToRoom` | `fn` | [src/lib/assets.ts:L29-L32](file:////home/nhat/Documents/DUT/ViTudy/src/lib/assets.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `NextStageProgress` | `type` | [src/lib/petHelpers.ts:L37-L43](file:////home/nhat/Documents/DUT/ViTudy/src/lib/petHelpers.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `normalizeNFC` | `fn` | [src/utils/textNormalization.ts:L5-L8](file:////home/nhat/Documents/DUT/ViTudy/src/utils/textNormalization.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `normalizeNFCAndTrim` | `fn` | [src/utils/textNormalization.ts:L15-L18](file:////home/nhat/Documents/DUT/ViTudy/src/utils/textNormalization.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `normalizeNFCPreserveWhitespace` | `fn` | [src/utils/textNormalization.ts:L10-L13](file:////home/nhat/Documents/DUT/ViTudy/src/utils/textNormalization.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `OPENAI_AUTHORIZE_URL` | `component` | [src/lib/openaiOAuth.ts:L5-L5](file:////home/nhat/Documents/DUT/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `OPENAI_OAUTH_CLIENT_ID` | `component` | [src/lib/openaiOAuth.ts:L3-L3](file:////home/nhat/Documents/DUT/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `OPENAI_OAUTH_REDIRECT_URI` | `component` | [src/lib/openaiOAuth.ts:L4-L4](file:////home/nhat/Documents/DUT/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `OPENAI_TOKEN_URL` | `component` | [src/lib/openaiOAuth.ts:L6-L6](file:////home/nhat/Documents/DUT/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `OpenAiOAuthSession` | `type` | [src/lib/openaiOAuth.ts:L10-L18](file:////home/nhat/Documents/DUT/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `PaginatedLeaf` | `type` | [src/utils/pagination.ts:L7-L15](file:////home/nhat/Documents/DUT/ViTudy/src/utils/pagination.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `paginateDocument` | `fn` | [src/utils/pagination.ts:L167-L288](file:////home/nhat/Documents/DUT/ViTudy/src/utils/pagination.ts) | Động cơ phân trang chính xác theo chiều cao trang, chống cắt cụt công thức |
| `ParsedOpenAiInput` | `type` | [src/lib/openaiOAuth.ts:L26-L30](file:////home/nhat/Documents/DUT/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `parseOpenAiCallbackInput` | `fn` | [src/lib/openaiOAuth.ts:L188-L269](file:////home/nhat/Documents/DUT/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `parseQuizJsonSafely` | `fn` | [src/lib/aiClient.ts:L598-L654](file:////home/nhat/Documents/DUT/ViTudy/src/lib/aiClient.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `PendingPkceState` | `type` | [src/lib/openaiOAuth.ts:L20-L24](file:////home/nhat/Documents/DUT/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `PET_STORAGE_KEY` | `component` | [src/lib/petHelpers.ts:L4-L4](file:////home/nhat/Documents/DUT/ViTudy/src/lib/petHelpers.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `playDeafenChime` | `fn` | [src/lib/soundFx.ts:L86-L113](file:////home/nhat/Documents/DUT/ViTudy/src/lib/soundFx.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `playMuteChime` | `fn` | [src/lib/soundFx.ts:L55-L81](file:////home/nhat/Documents/DUT/ViTudy/src/lib/soundFx.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `playUndeafenChime` | `fn` | [src/lib/soundFx.ts:L118-L145](file:////home/nhat/Documents/DUT/ViTudy/src/lib/soundFx.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `playUnmuteChime` | `fn` | [src/lib/soundFx.ts:L24-L50](file:////home/nhat/Documents/DUT/ViTudy/src/lib/soundFx.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `Point` | `type` | [src/utils/smartShape.ts:L8-L11](file:////home/nhat/Documents/DUT/ViTudy/src/utils/smartShape.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `pointToSegmentDistance` | `fn` | [src/utils/smartShape.ts:L129-L140](file:////home/nhat/Documents/DUT/ViTudy/src/utils/smartShape.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `QuizQuestion` | `type` | [src/lib/nonAiEngine.ts:L19-L26](file:////home/nhat/Documents/DUT/ViTudy/src/lib/nonAiEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `ramerDouglasPeucker` | `fn` | [src/utils/smartShape.ts:L105-L127](file:////home/nhat/Documents/DUT/ViTudy/src/utils/smartShape.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `RecognizedLabel` | `type` | [src/utils/smartShape.test.ts:L330-L330](file:////home/nhat/Documents/DUT/ViTudy/src/utils/smartShape.test.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `RecognizedShapeResult` | `type` | [src/utils/smartShape.ts:L15-L20](file:////home/nhat/Documents/DUT/ViTudy/src/utils/smartShape.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `recognizeSmartShape` | `fn` | [src/utils/smartShape.ts:L733-L736](file:////home/nhat/Documents/DUT/ViTudy/src/utils/smartShape.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `recognizeSmartShapeDetailed` | `fn` | [src/utils/smartShape.ts:L628-L728](file:////home/nhat/Documents/DUT/ViTudy/src/utils/smartShape.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `refreshOpenAiSession` | `fn` | [src/lib/aiClient.ts:L46-L117](file:////home/nhat/Documents/DUT/ViTudy/src/lib/aiClient.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `resampleByArcLength` | `fn` | [src/utils/smartShape.ts:L56-L83](file:////home/nhat/Documents/DUT/ViTudy/src/utils/smartShape.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `resolvePetState` | `fn` | [src/lib/petHelpers.ts:L73-L128](file:////home/nhat/Documents/DUT/ViTudy/src/lib/petHelpers.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `ReviewQuality` | `type` | [src/lib/sm2.ts:L8-L8](file:////home/nhat/Documents/DUT/ViTudy/src/lib/sm2.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `RoadmapStep` | `type` | [src/lib/nonAiEngine.ts:L35-L43](file:////home/nhat/Documents/DUT/ViTudy/src/lib/nonAiEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `sanitizeDocumentText` | `fn` | [src/utils/textNormalization.ts:L28-L51](file:////home/nhat/Documents/DUT/ViTudy/src/utils/textNormalization.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `saveOpenAiOAuthSession` | `fn` | [src/lib/openaiOAuth.ts:L271-L284](file:////home/nhat/Documents/DUT/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `savePendingPkce` | `fn` | [src/lib/openaiOAuth.ts:L105-L115](file:////home/nhat/Documents/DUT/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `saveSupabaseConfig` | `fn` | [src/lib/supabase.ts:L73-L79](file:////home/nhat/Documents/DUT/ViTudy/src/lib/supabase.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `setDiscordPresence` | `fn` | [src/lib/discord/sdk.ts:L75-L97](file:////home/nhat/Documents/DUT/ViTudy/src/lib/discord/sdk.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `setStudyCache` | `fn` | [src/lib/studyToolsCache.ts:L20-L23](file:////home/nhat/Documents/DUT/ViTudy/src/lib/studyToolsCache.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `ShapeType` | `type` | [src/utils/smartShape.ts:L13-L13](file:////home/nhat/Documents/DUT/ViTudy/src/utils/smartShape.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `SM2Card` | `type` | [src/lib/sm2.ts:L1-L6](file:////home/nhat/Documents/DUT/ViTudy/src/lib/sm2.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `smoothPoints` | `fn` | [src/utils/smartShape.ts:L33-L44](file:////home/nhat/Documents/DUT/ViTudy/src/utils/smartShape.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `splitSentences` | `fn` | [src/lib/nonAiEngine.ts:L64-L71](file:////home/nhat/Documents/DUT/ViTudy/src/lib/nonAiEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `startOpenAiPkceLogin` | `fn` | [src/lib/openaiOAuth.ts:L137-L146](file:////home/nhat/Documents/DUT/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `summarizeWithTextRank` | `fn` | [src/lib/nonAiEngine.ts:L106-L147](file:////home/nhat/Documents/DUT/ViTudy/src/lib/nonAiEngine.ts) | Thuật toán TextRank & TF-IDF trích xuất tóm tắt nội dung không cần AI |
| `SUPPORT_EMAIL` | `component` | [src/lib/constants.ts:L5-L5](file:////home/nhat/Documents/DUT/ViTudy/src/lib/constants.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `SUPPORT_TELEGRAM` | `component` | [src/lib/constants.ts:L6-L6](file:////home/nhat/Documents/DUT/ViTudy/src/lib/constants.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `testAiConnection` | `fn` | [src/lib/aiClient.ts:L442-L592](file:////home/nhat/Documents/DUT/ViTudy/src/lib/aiClient.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `toDateKeyVN` | `fn` | [src/lib/dateVN.ts:L19-L22](file:////home/nhat/Documents/DUT/ViTudy/src/lib/dateVN.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `todayKey` | `fn` | [src/lib/dateVN.ts:L6-L14](file:////home/nhat/Documents/DUT/ViTudy/src/lib/dateVN.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `updateStudyToolsCache` | `const` | [src/lib/studyToolsCache.ts:L26-L26](file:////home/nhat/Documents/DUT/ViTudy/src/lib/studyToolsCache.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `useActiveStroke` | `hook` | [src/lib/activeStrokeStore.ts:L34-L40](file:////home/nhat/Documents/DUT/ViTudy/src/lib/activeStrokeStore.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `VIETNAM_TIMEZONE` | `component` | [src/lib/dateVN.ts:L1-L1](file:////home/nhat/Documents/DUT/ViTudy/src/lib/dateVN.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `ViewportTransform` | `type` | [src/lib/viewportCulling.ts:L9-L15](file:////home/nhat/Documents/DUT/ViTudy/src/lib/viewportCulling.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `VITUDY_STREAK_KEY` | `component` | [src/lib/petHelpers.ts:L6-L6](file:////home/nhat/Documents/DUT/ViTudy/src/lib/petHelpers.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |

### Types & Data

| Ký hiệu (Symbol) | Loại (Kind) | Vị trí (File:Lines) | Vai trò chức năng |
|---|---|---|---|
| `AboutPage` | `component` | [src/app/about/page.tsx:L10-L179](file:////home/nhat/Documents/DUT/ViTudy/src/app/about/page.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `AccountSettings` | `component` | [src/components/profile/AccountSettings.tsx:L30-L467](file:////home/nhat/Documents/DUT/ViTudy/src/components/profile/AccountSettings.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ActiveToolType` | `type` | [src/types/studyspace.ts:L163-L172](file:////home/nhat/Documents/DUT/ViTudy/src/types/studyspace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `AiConfig` | `type` | [src/types/vitoken.ts:L21-L27](file:////home/nhat/Documents/DUT/ViTudy/src/types/vitoken.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `AiProvider` | `type` | [src/types/vitoken.ts:L19-L19](file:////home/nhat/Documents/DUT/ViTudy/src/types/vitoken.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ArtboardImageLayer` | `type` | [src/types/boardgame.ts:L41-L48](file:////home/nhat/Documents/DUT/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ArtboardStroke` | `type` | [src/types/boardgame.ts:L32-L39](file:////home/nhat/Documents/DUT/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `AuthCallbackPage` | `component` | [src/app/auth/callback/page.tsx:L8-L98](file:////home/nhat/Documents/DUT/ViTudy/src/app/auth/callback/page.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `AuthForm` | `component` | [src/components/auth/AuthForm.tsx:L16-L258](file:////home/nhat/Documents/DUT/ViTudy/src/components/auth/AuthForm.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `AuthPage` | `component` | [src/app/auth/page.tsx:L11-L135](file:////home/nhat/Documents/DUT/ViTudy/src/app/auth/page.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `BankConfig` | `type` | [src/services/PaymentService.ts:L45-L49](file:////home/nhat/Documents/DUT/ViTudy/src/services/PaymentService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `BankTransactionLog` | `type` | [src/types/boardgame.ts:L164-L168](file:////home/nhat/Documents/DUT/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `BoardGameMatchState` | `type` | [src/types/boardgame.ts:L170-L182](file:////home/nhat/Documents/DUT/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `BoardGamePackage` | `type` | [src/types/boardgame.ts:L184-L207](file:////home/nhat/Documents/DUT/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `BoardTile` | `type` | [src/types/boardgame.ts:L87-L110](file:////home/nhat/Documents/DUT/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `BoardTileRole` | `type` | [src/types/boardgame.ts:L71-L76](file:////home/nhat/Documents/DUT/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `breakAmountIntoVndNotes` | `fn` | [src/types/boardgame.ts:L259-L271](file:////home/nhat/Documents/DUT/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `buildVietQrUrl` | `fn` | [src/services/PaymentService.ts:L59-L72](file:////home/nhat/Documents/DUT/ViTudy/src/services/PaymentService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `calculateBalanceTotal` | `fn` | [src/types/boardgame.ts:L249-L254](file:////home/nhat/Documents/DUT/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `calculateDaysToNextStage` | `fn` | [src/components/pet/stages.ts:L67-L72](file:////home/nhat/Documents/DUT/ViTudy/src/components/pet/stages.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `calculateStage` | `fn` | [src/components/pet/stages.ts:L56-L65](file:////home/nhat/Documents/DUT/ViTudy/src/components/pet/stages.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `CanvasTransform` | `type` | [src/types/studyspace.ts:L186-L191](file:////home/nhat/Documents/DUT/ViTudy/src/types/studyspace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `CheckinResult` | `type` | [src/components/pet/usePet.ts:L18-L21](file:////home/nhat/Documents/DUT/ViTudy/src/components/pet/usePet.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `clearKatexCache` | `fn` | [src/components/common/MathRenderer.tsx:L19-L21](file:////home/nhat/Documents/DUT/ViTudy/src/components/common/MathRenderer.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `createDefaultBoardGamePackage` | `fn` | [src/types/boardgame.ts:L359-L407](file:////home/nhat/Documents/DUT/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `createDemoStudySpace` | `fn` | [src/data/demoSpace.ts:L3-L97](file:////home/nhat/Documents/DUT/ViTudy/src/data/demoSpace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `createEmptyBalance` | `fn` | [src/types/boardgame.ts:L221-L233](file:////home/nhat/Documents/DUT/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `createStarterVndBalance` | `fn` | [src/types/boardgame.ts:L235-L247](file:////home/nhat/Documents/DUT/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `CurrencyNoteDesign` | `type` | [src/types/boardgame.ts:L12-L18](file:////home/nhat/Documents/DUT/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `DashboardPage` | `component` | [src/app/dashboard/page.tsx:L14-L162](file:////home/nhat/Documents/DUT/ViTudy/src/app/dashboard/page.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `Database` | `type` | [src/types/database.types.ts:L9-L455](file:////home/nhat/Documents/DUT/ViTudy/src/types/database.types.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `DayStudyTime` | `type` | [src/services/StatsService.ts:L4-L8](file:////home/nhat/Documents/DUT/ViTudy/src/services/StatsService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `DbListingRow` | `type` | [src/services/KnowInheritService.ts:L4-L18](file:////home/nhat/Documents/DUT/ViTudy/src/services/KnowInheritService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `DebugOverlay` | `component` | [src/components/common/DebugOverlay.tsx:L7-L139](file:////home/nhat/Documents/DUT/ViTudy/src/components/common/DebugOverlay.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `DEFAULT_BANK_CONFIG` | `component` | [src/services/PaymentService.ts:L39-L43](file:////home/nhat/Documents/DUT/ViTudy/src/services/PaymentService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `DEFAULT_VND_CURRENCIES` | `component` | [src/types/boardgame.ts:L20-L30](file:////home/nhat/Documents/DUT/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `DeleteAccount` | `component` | [src/components/profile/DeleteAccount.tsx:L24-L270](file:////home/nhat/Documents/DUT/ViTudy/src/components/profile/DeleteAccount.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `DeskAction` | `type` | [src/hooks/useRealtimeMultiplayer.ts:L27-L40](file:////home/nhat/Documents/DUT/ViTudy/src/hooks/useRealtimeMultiplayer.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `DeskInviteNotification` | `type` | [src/services/SocialFriendService.ts:L21-L29](file:////home/nhat/Documents/DUT/ViTudy/src/services/SocialFriendService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `DeskItem` | `type` | [src/types/studyspace.ts:L91-L135](file:////home/nhat/Documents/DUT/ViTudy/src/types/studyspace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `deskItemToRow` | `fn` | [src/services/StudySpaceService.ts:L30-L79](file:////home/nhat/Documents/DUT/ViTudy/src/services/StudySpaceService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `DrawingStroke` | `type` | [src/types/studyspace.ts:L174-L184](file:////home/nhat/Documents/DUT/ViTudy/src/types/studyspace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `EMOJI_CATEGORIES` | `component` | [src/data/stickersAndEmojis.ts:L65-L412](file:////home/nhat/Documents/DUT/ViTudy/src/data/stickersAndEmojis.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `EmojiCategory` | `type` | [src/data/stickersAndEmojis.ts:L13-L18](file:////home/nhat/Documents/DUT/ViTudy/src/data/stickersAndEmojis.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `EmptyState` | `component` | [src/components/common/EmptyState.tsx:L17-L48](file:////home/nhat/Documents/DUT/ViTudy/src/components/common/EmptyState.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ensureUUID` | `fn` | [src/services/StudySpaceService.ts:L11-L28](file:////home/nhat/Documents/DUT/ViTudy/src/services/StudySpaceService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ExamAttemptPayload` | `type` | [src/services/ActivityService.ts:L3-L8](file:////home/nhat/Documents/DUT/ViTudy/src/services/ActivityService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ExamQuestion` | `type` | [src/types/studyspace.ts:L71-L78](file:////home/nhat/Documents/DUT/ViTudy/src/types/studyspace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ExamSheetData` | `type` | [src/types/studyspace.ts:L80-L89](file:////home/nhat/Documents/DUT/ViTudy/src/types/studyspace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ExamStats` | `type` | [src/services/StatsService.ts:L10-L13](file:////home/nhat/Documents/DUT/ViTudy/src/services/StatsService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `FALLBACK_PACKAGES` | `component` | [src/services/PaymentService.ts:L74-L79](file:////home/nhat/Documents/DUT/ViTudy/src/services/PaymentService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `FaqPage` | `component` | [src/app/faq/page.tsx:L705-L717](file:////home/nhat/Documents/DUT/ViTudy/src/app/faq/page.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `FeatureGrid` | `component` | [src/components/landing/FeatureGrid.tsx:L75-L160](file:////home/nhat/Documents/DUT/ViTudy/src/components/landing/FeatureGrid.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `FlashcardReview` | `type` | [src/services/FlashcardService.ts:L4-L16](file:////home/nhat/Documents/DUT/ViTudy/src/services/FlashcardService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `FloatingPet` | `component` | [src/components/pet/FloatingPet.tsx:L13-L283](file:////home/nhat/Documents/DUT/ViTudy/src/components/pet/FloatingPet.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `GameCabinetStorage` | `component` | [src/services/GameCabinetStorage.ts:L27-L79](file:////home/nhat/Documents/DUT/ViTudy/src/services/GameCabinetStorage.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `GameCardDeck` | `type` | [src/types/boardgame.ts:L138-L148](file:////home/nhat/Documents/DUT/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `GameCardEffect` | `type` | [src/types/boardgame.ts:L124-L127](file:////home/nhat/Documents/DUT/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `GameCardItem` | `type` | [src/types/boardgame.ts:L129-L136](file:////home/nhat/Documents/DUT/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `GameLinkType` | `type` | [src/types/boardgame.ts:L112-L115](file:////home/nhat/Documents/DUT/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `GameNodeLink` | `type` | [src/types/boardgame.ts:L117-L122](file:////home/nhat/Documents/DUT/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `GamePawn` | `type` | [src/types/boardgame.ts:L150-L162](file:////home/nhat/Documents/DUT/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `GamePenTool` | `type` | [src/types/boardgame.ts:L209-L219](file:////home/nhat/Documents/DUT/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `GENERAL_URL_GUIDE_STEPS` | `component` | [src/services/UrlDocumentService.ts:L27-L31](file:////home/nhat/Documents/DUT/ViTudy/src/services/UrlDocumentService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `generateBoardDeckWithAi` | `fn` | [src/services/BoardGameAiService.ts:L17-L90](file:////home/nhat/Documents/DUT/ViTudy/src/services/BoardGameAiService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `generateCardHash` | `fn` | [src/services/FlashcardService.ts:L18-L27](file:////home/nhat/Documents/DUT/ViTudy/src/services/FlashcardService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `generateMapTiles` | `fn` | [src/types/boardgame.ts:L276-L357](file:////home/nhat/Documents/DUT/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `generateTilesContentWithAi` | `fn` | [src/services/BoardGameAiService.ts:L92-L159](file:////home/nhat/Documents/DUT/ViTudy/src/services/BoardGameAiService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `getDocAccessLog` | `fn` | [src/hooks/useStorageManager.ts:L46-L54](file:////home/nhat/Documents/DUT/ViTudy/src/hooks/useStorageManager.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `getEffectiveBankConfig` | `fn` | [src/services/PaymentService.ts:L51-L53](file:////home/nhat/Documents/DUT/ViTudy/src/services/PaymentService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `getKatexCacheSize` | `fn` | [src/components/common/MathRenderer.tsx:L15-L17](file:////home/nhat/Documents/DUT/ViTudy/src/components/common/MathRenderer.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `getPurchasedItemIds` | `fn` | [src/services/MarketPurchaseStorage.ts:L8-L21](file:////home/nhat/Documents/DUT/ViTudy/src/services/MarketPurchaseStorage.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `getStageConfig` | `fn` | [src/components/pet/stages.ts:L52-L54](file:////home/nhat/Documents/DUT/ViTudy/src/components/pet/stages.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `GOOGLE_SHARE_GUIDE_STEPS` | `component` | [src/services/UrlDocumentService.ts:L19-L25](file:////home/nhat/Documents/DUT/ViTudy/src/services/UrlDocumentService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `GuestBanner` | `component` | [src/components/auth/GuestBanner.tsx:L12-L54](file:////home/nhat/Documents/DUT/ViTudy/src/components/auth/GuestBanner.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `HeroSection` | `component` | [src/components/landing/HeroSection.tsx:L52-L238](file:////home/nhat/Documents/DUT/ViTudy/src/components/landing/HeroSection.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `HomePage` | `component` | [src/components/home/HomePage.tsx:L52-L1246](file:////home/nhat/Documents/DUT/ViTudy/src/components/home/HomePage.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `HostApprovalModal` | `component` | [src/components/social/HostApprovalModal.tsx:L14-L177](file:////home/nhat/Documents/DUT/ViTudy/src/components/social/HostApprovalModal.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `importDocumentFromUrl` | `fn` | [src/services/UrlDocumentService.ts:L154-L237](file:////home/nhat/Documents/DUT/ViTudy/src/services/UrlDocumentService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `INITIAL_MARKET_ITEMS` | `component` | [src/data/marketMockData.ts:L24-L1124](file:////home/nhat/Documents/DUT/ViTudy/src/data/marketMockData.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `INITIAL_SPACES` | `component` | [src/data/mockSpaces.ts:L3-L332](file:////home/nhat/Documents/DUT/ViTudy/src/data/mockSpaces.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `IntelineThread` | `type` | [src/types/studyspace.ts:L137-L147](file:////home/nhat/Documents/DUT/ViTudy/src/types/studyspace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `isBinaryOrCorrupted` | `fn` | [src/services/OfficeParserService.ts:L43-L72](file:////home/nhat/Documents/DUT/ViTudy/src/services/OfficeParserService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ItemType` | `type` | [src/types/studyspace.ts:L3-L16](file:////home/nhat/Documents/DUT/ViTudy/src/types/studyspace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `Json` | `type` | [src/types/database.types.ts:L1-L7](file:////home/nhat/Documents/DUT/ViTudy/src/types/database.types.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `katexHtmlCache` | `const` | [src/components/common/MathRenderer.tsx:L12-L12](file:////home/nhat/Documents/DUT/ViTudy/src/components/common/MathRenderer.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `KnowInheritService` | `component` | [src/services/KnowInheritService.ts:L77-L157](file:////home/nhat/Documents/DUT/ViTudy/src/services/KnowInheritService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ListingReview` | `type` | [src/services/MarketService.ts:L4-L12](file:////home/nhat/Documents/DUT/ViTudy/src/services/MarketService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `loadStoredPetState` | `fn` | [src/hooks/usePetMascot.ts:L30-L56](file:////home/nhat/Documents/DUT/ViTudy/src/hooks/usePetMascot.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `mapDbRowToMarketItem` | `fn` | [src/services/KnowInheritService.ts:L48-L75](file:////home/nhat/Documents/DUT/ViTudy/src/services/KnowInheritService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `MarketItem` | `type` | [src/data/marketMockData.ts:L3-L22](file:////home/nhat/Documents/DUT/ViTudy/src/data/marketMockData.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `MarketPage` | `component` | [src/app/market/page.tsx:L35-L870](file:////home/nhat/Documents/DUT/ViTudy/src/app/market/page.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `MathRenderer` | `component` | [src/components/common/MathRenderer.tsx:L117-L263](file:////home/nhat/Documents/DUT/ViTudy/src/components/common/MathRenderer.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `MAX_KATEX_CACHE_ENTRIES` | `component` | [src/components/common/MathRenderer.tsx:L13-L13](file:////home/nhat/Documents/DUT/ViTudy/src/components/common/MathRenderer.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `metadata` | `const` | [src/app/layout.tsx:L41-L52](file:////home/nhat/Documents/DUT/ViTudy/src/app/layout.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `MigrationDialog` | `component` | [src/components/auth/MigrationDialog.tsx:L10-L110](file:////home/nhat/Documents/DUT/ViTudy/src/components/auth/MigrationDialog.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `MigrationResult` | `type` | [src/services/SyncService.ts:L5-L9](file:////home/nhat/Documents/DUT/ViTudy/src/services/SyncService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `OAuthButtons` | `component` | [src/components/auth/OAuthButtons.tsx:L10-L64](file:////home/nhat/Documents/DUT/ViTudy/src/components/auth/OAuthButtons.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `OfflineOp` | `type` | [src/services/OfflineQueue.ts:L4-L10](file:////home/nhat/Documents/DUT/ViTudy/src/services/OfflineQueue.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `OnboardingTour` | `component` | [src/components/onboarding/OnboardingTour.tsx:L55-L150](file:////home/nhat/Documents/DUT/ViTudy/src/components/onboarding/OnboardingTour.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PageContent` | `type` | [src/types/studyspace.ts:L57-L69](file:////home/nhat/Documents/DUT/ViTudy/src/types/studyspace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `parseDocxFile` | `fn` | [src/services/OfficeParserService.ts:L274-L313](file:////home/nhat/Documents/DUT/ViTudy/src/services/OfficeParserService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ParsedPage` | `type` | [src/services/PdfParserService.ts:L5-L11](file:////home/nhat/Documents/DUT/ViTudy/src/services/PdfParserService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ParsedUploadedDocument` | `type` | [src/services/OfficeParserService.ts:L6-L14](file:////home/nhat/Documents/DUT/ViTudy/src/services/OfficeParserService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `parsePdfFile` | `fn` | [src/services/PdfParserService.ts:L17-L94](file:////home/nhat/Documents/DUT/ViTudy/src/services/PdfParserService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `parsePptxFile` | `fn` | [src/services/OfficeParserService.ts:L465-L468](file:////home/nhat/Documents/DUT/ViTudy/src/services/OfficeParserService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `parsePptxPresentation` | `fn` | [src/services/OfficeParserService.ts:L378-L460](file:////home/nhat/Documents/DUT/ViTudy/src/services/OfficeParserService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `parseSpreadsheetFile` | `fn` | [src/services/OfficeParserService.ts:L318-L373](file:////home/nhat/Documents/DUT/ViTudy/src/services/OfficeParserService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `parseUploadedDocumentFile` | `fn` | [src/services/OfficeParserService.ts:L474-L618](file:////home/nhat/Documents/DUT/ViTudy/src/services/OfficeParserService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `parseUploadedDocumentResult` | `fn` | [src/services/OfficeParserService.ts:L623-L635](file:////home/nhat/Documents/DUT/ViTudy/src/services/OfficeParserService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PaymentHistory` | `component` | [src/components/payment/PaymentHistory.tsx:L53-L403](file:////home/nhat/Documents/DUT/ViTudy/src/components/payment/PaymentHistory.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PaymentHistoryItem` | `type` | [src/services/PaymentService.ts:L20-L28](file:////home/nhat/Documents/DUT/ViTudy/src/services/PaymentService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PaymentPackage` | `type` | [src/services/PaymentService.ts:L3-L9](file:////home/nhat/Documents/DUT/ViTudy/src/services/PaymentService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PaymentRequestResult` | `type` | [src/services/PaymentService.ts:L11-L18](file:////home/nhat/Documents/DUT/ViTudy/src/services/PaymentService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PaymentSuccess` | `component` | [src/components/payment/PaymentSuccess.tsx:L15-L90](file:////home/nhat/Documents/DUT/ViTudy/src/components/payment/PaymentSuccess.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PeerUser` | `type` | [src/hooks/useRealtimeMultiplayer.ts:L8-L20](file:////home/nhat/Documents/DUT/ViTudy/src/hooks/useRealtimeMultiplayer.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PendingApprovalModal` | `component` | [src/components/social/PendingApprovalModal.tsx:L13-L139](file:////home/nhat/Documents/DUT/ViTudy/src/components/social/PendingApprovalModal.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PET_STAGES` | `component` | [src/components/pet/stages.ts:L13-L50](file:////home/nhat/Documents/DUT/ViTudy/src/components/pet/stages.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PET_STAGES` | `component` | [src/types/pet.ts:L14-L65](file:////home/nhat/Documents/DUT/ViTudy/src/types/pet.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PetGalleryModal` | `component` | [src/components/pet/PetGalleryModal.tsx:L15-L179](file:////home/nhat/Documents/DUT/ViTudy/src/components/pet/PetGalleryModal.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PetMascotModal` | `component` | [src/components/pet/PetMascotModal.tsx:L29-L490](file:////home/nhat/Documents/DUT/ViTudy/src/components/pet/PetMascotModal.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PetStage` | `type` | [src/types/pet.ts:L1-L1](file:////home/nhat/Documents/DUT/ViTudy/src/types/pet.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PetStageConfig` | `type` | [src/components/pet/stages.ts:L3-L11](file:////home/nhat/Documents/DUT/ViTudy/src/components/pet/stages.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PetStageInfo` | `type` | [src/types/pet.ts:L3-L12](file:////home/nhat/Documents/DUT/ViTudy/src/types/pet.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PetState` | `type` | [src/types/pet.ts:L67-L75](file:////home/nhat/Documents/DUT/ViTudy/src/types/pet.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PetStatus` | `type` | [src/components/pet/usePet.ts:L8-L16](file:////home/nhat/Documents/DUT/ViTudy/src/components/pet/usePet.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PomodoroPhase` | `type` | [src/hooks/usePomodoro.ts:L5-L5](file:////home/nhat/Documents/DUT/ViTudy/src/hooks/usePomodoro.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PresentationData` | `type` | [src/types/studyspace.ts:L38-L42](file:////home/nhat/Documents/DUT/ViTudy/src/types/studyspace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PresentationSlide` | `type` | [src/types/studyspace.ts:L29-L36](file:////home/nhat/Documents/DUT/ViTudy/src/types/studyspace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PricingSection` | `component` | [src/components/landing/PricingSection.tsx:L84-L180](file:////home/nhat/Documents/DUT/ViTudy/src/components/landing/PricingSection.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PricingTiers` | `component` | [src/components/payment/PricingTiers.tsx:L21-L122](file:////home/nhat/Documents/DUT/ViTudy/src/components/payment/PricingTiers.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PrivacyPage` | `component` | [src/app/privacy/page.tsx:L8-L98](file:////home/nhat/Documents/DUT/ViTudy/src/app/privacy/page.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ProfileHeader` | `component` | [src/components/profile/ProfileHeader.tsx:L14-L163](file:////home/nhat/Documents/DUT/ViTudy/src/components/profile/ProfileHeader.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ProfilePage` | `component` | [src/app/profile/page.tsx:L190-L196](file:////home/nhat/Documents/DUT/ViTudy/src/app/profile/page.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PropertyDetails` | `type` | [src/types/boardgame.ts:L78-L85](file:////home/nhat/Documents/DUT/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `QRCodeDisplay` | `component` | [src/components/payment/QRCodeDisplay.tsx:L30-L331](file:////home/nhat/Documents/DUT/ViTudy/src/components/payment/QRCodeDisplay.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `RecentBuddy` | `type` | [src/services/SocialFriendService.ts:L7-L17](file:////home/nhat/Documents/DUT/ViTudy/src/services/SocialFriendService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `recordDocAccess` | `fn` | [src/hooks/useStorageManager.ts:L56-L63](file:////home/nhat/Documents/DUT/ViTudy/src/hooks/useStorageManager.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `recordPurchasedItemId` | `fn` | [src/services/MarketPurchaseStorage.ts:L26-L39](file:////home/nhat/Documents/DUT/ViTudy/src/services/MarketPurchaseStorage.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `renderKatexWithCache` | `fn` | [src/components/common/MathRenderer.tsx:L23-L44](file:////home/nhat/Documents/DUT/ViTudy/src/components/common/MathRenderer.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ResetPasswordPage` | `component` | [src/app/auth/reset/page.tsx:L10-L176](file:////home/nhat/Documents/DUT/ViTudy/src/app/auth/reset/page.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ResolvedDocumentUrl` | `type` | [src/services/UrlDocumentService.ts:L33-L39](file:////home/nhat/Documents/DUT/ViTudy/src/services/UrlDocumentService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `resolveImportableUrl` | `fn` | [src/services/UrlDocumentService.ts:L41-L119](file:////home/nhat/Documents/DUT/ViTudy/src/services/UrlDocumentService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ResponsiveLayoutState` | `type` | [src/hooks/useResponsiveLayout.ts:L5-L20](file:////home/nhat/Documents/DUT/ViTudy/src/hooks/useResponsiveLayout.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `RootLayout` | `component` | [src/app/layout.tsx:L54-L93](file:////home/nhat/Documents/DUT/ViTudy/src/app/layout.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `RotateTwoWay` | `component` | [src/components/icons/RotateTwoWay.tsx:L11-L29](file:////home/nhat/Documents/DUT/ViTudy/src/components/icons/RotateTwoWay.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `rowToDeskItem` | `fn` | [src/services/StudySpaceService.ts:L81-L123](file:////home/nhat/Documents/DUT/ViTudy/src/services/StudySpaceService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `sanitizeDocumentText` | `fn` | [src/services/OfficeParserService.ts:L28-L38](file:////home/nhat/Documents/DUT/ViTudy/src/services/OfficeParserService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `SavedDrawingAsset` | `type` | [src/types/boardgame.ts:L50-L61](file:////home/nhat/Documents/DUT/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `saveEffectiveBankConfig` | `fn` | [src/services/PaymentService.ts:L55-L57](file:////home/nhat/Documents/DUT/ViTudy/src/services/PaymentService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `savePetState` | `fn` | [src/hooks/usePetMascot.ts:L58-L73](file:////home/nhat/Documents/DUT/ViTudy/src/hooks/usePetMascot.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `SiteFooter` | `component` | [src/components/common/SiteFooter.tsx:L19-L82](file:////home/nhat/Documents/DUT/ViTudy/src/components/common/SiteFooter.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `SKIN_TONES` | `component` | [src/data/stickersAndEmojis.ts:L42-L49](file:////home/nhat/Documents/DUT/ViTudy/src/data/stickersAndEmojis.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `SocialFriend` | `type` | [src/services/SocialFriendService.ts:L19-L19](file:////home/nhat/Documents/DUT/ViTudy/src/services/SocialFriendService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `SpreadsheetData` | `type` | [src/types/studyspace.ts:L23-L27](file:////home/nhat/Documents/DUT/ViTudy/src/types/studyspace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `SpreadsheetSheet` | `type` | [src/types/studyspace.ts:L18-L21](file:////home/nhat/Documents/DUT/ViTudy/src/types/studyspace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `STICKER_CATEGORIES` | `component` | [src/data/stickersAndEmojis.ts:L417-L689](file:////home/nhat/Documents/DUT/ViTudy/src/data/stickersAndEmojis.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `StickerCategory` | `type` | [src/data/stickersAndEmojis.ts:L20-L25](file:////home/nhat/Documents/DUT/ViTudy/src/data/stickersAndEmojis.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `StickerPickerItem` | `type` | [src/data/stickersAndEmojis.ts:L1-L11](file:////home/nhat/Documents/DUT/ViTudy/src/data/stickersAndEmojis.ts) | Thành phần nghiệp vụ của phân hệ HUD & Overlays |
| `StorageItemInfo` | `type` | [src/hooks/useStorageManager.ts:L7-L18](file:////home/nhat/Documents/DUT/ViTudy/src/hooks/useStorageManager.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `StorageUsage` | `type` | [src/hooks/useStorageManager.ts:L20-L26](file:////home/nhat/Documents/DUT/ViTudy/src/hooks/useStorageManager.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `StreakCalendar` | `component` | [src/components/dashboard/StreakCalendar.tsx:L19-L114](file:////home/nhat/Documents/DUT/ViTudy/src/components/dashboard/StreakCalendar.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `StudySpace` | `type` | [src/types/studyspace.ts:L149-L161](file:////home/nhat/Documents/DUT/ViTudy/src/types/studyspace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `StudySpacePage` | `component` | [src/app/page.tsx:L110-L116](file:////home/nhat/Documents/DUT/ViTudy/src/app/page.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `StudyStats` | `component` | [src/components/dashboard/StudyStats.tsx:L14-L189](file:////home/nhat/Documents/DUT/ViTudy/src/components/dashboard/StudyStats.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `TermsPage` | `component` | [src/app/terms/page.tsx:L8-L84](file:////home/nhat/Documents/DUT/ViTudy/src/app/terms/page.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `TileFormTemplate` | `type` | [src/types/boardgame.ts:L63-L69](file:////home/nhat/Documents/DUT/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `TokenHistory` | `component` | [src/components/dashboard/TokenHistory.tsx:L12-L84](file:////home/nhat/Documents/DUT/ViTudy/src/components/dashboard/TokenHistory.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `TopUpModal` | `component` | [src/components/payment/TopUpModal.tsx:L34-L346](file:////home/nhat/Documents/DUT/ViTudy/src/components/payment/TopUpModal.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `toTwemojiUrl` | `fn` | [src/data/stickersAndEmojis.ts:L30-L40](file:////home/nhat/Documents/DUT/ViTudy/src/data/stickersAndEmojis.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `TourStep` | `component` | [src/components/onboarding/TourStep.tsx:L19-L66](file:////home/nhat/Documents/DUT/ViTudy/src/components/onboarding/TourStep.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `TourStepConfig` | `type` | [src/components/onboarding/TourStep.tsx:L4-L9](file:////home/nhat/Documents/DUT/ViTudy/src/components/onboarding/TourStep.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `TransactionType` | `type` | [src/types/vitoken.ts:L1-L8](file:////home/nhat/Documents/DUT/ViTudy/src/types/vitoken.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `UploadedParseResult` | `type` | [src/services/OfficeParserService.ts:L16-L19](file:////home/nhat/Documents/DUT/ViTudy/src/services/OfficeParserService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `UrlImportResult` | `type` | [src/services/UrlDocumentService.ts:L3-L7](file:////home/nhat/Documents/DUT/ViTudy/src/services/UrlDocumentService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `useDeskItemInteraction` | `hook` | [src/hooks/useDeskItemInteraction.ts:L16-L281](file:////home/nhat/Documents/DUT/ViTudy/src/hooks/useDeskItemInteraction.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `useDiscordActivity` | `hook` | [src/hooks/useDiscordActivity.ts:L22-L114](file:////home/nhat/Documents/DUT/ViTudy/src/hooks/useDiscordActivity.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `UseDiscordActivityResult` | `type` | [src/hooks/useDiscordActivity.ts:L8-L20](file:////home/nhat/Documents/DUT/ViTudy/src/hooks/useDiscordActivity.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `usePaymentStatus` | `hook` | [src/hooks/usePaymentStatus.ts:L14-L167](file:////home/nhat/Documents/DUT/ViTudy/src/hooks/usePaymentStatus.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `UsePaymentStatusResult` | `type` | [src/hooks/usePaymentStatus.ts:L7-L12](file:////home/nhat/Documents/DUT/ViTudy/src/hooks/usePaymentStatus.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `usePet` | `hook` | [src/components/pet/usePet.ts:L23-L222](file:////home/nhat/Documents/DUT/ViTudy/src/components/pet/usePet.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `usePetMascot` | `hook` | [src/hooks/usePetMascot.ts:L75-L214](file:////home/nhat/Documents/DUT/ViTudy/src/hooks/usePetMascot.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `UsePetMascotResult` | `type` | [src/hooks/usePetMascot.ts:L19-L28](file:////home/nhat/Documents/DUT/ViTudy/src/hooks/usePetMascot.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `usePomodoro` | `hook` | [src/hooks/usePomodoro.ts:L23-L83](file:////home/nhat/Documents/DUT/ViTudy/src/hooks/usePomodoro.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `UsePomodoroOptions` | `type` | [src/hooks/usePomodoro.ts:L7-L11](file:////home/nhat/Documents/DUT/ViTudy/src/hooks/usePomodoro.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `UsePomodoroResult` | `type` | [src/hooks/usePomodoro.ts:L13-L21](file:////home/nhat/Documents/DUT/ViTudy/src/hooks/usePomodoro.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `useRealtimeMultiplayer` | `hook` | [src/hooks/useRealtimeMultiplayer.ts:L68-L555](file:////home/nhat/Documents/DUT/ViTudy/src/hooks/useRealtimeMultiplayer.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `UseRealtimeMultiplayerOptions` | `type` | [src/hooks/useRealtimeMultiplayer.ts:L58-L66](file:////home/nhat/Documents/DUT/ViTudy/src/hooks/useRealtimeMultiplayer.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `useResponsiveLayout` | `hook` | [src/hooks/useResponsiveLayout.ts:L158-L226](file:////home/nhat/Documents/DUT/ViTudy/src/hooks/useResponsiveLayout.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `useSocialPresence` | `hook` | [src/hooks/useSocialPresence.ts:L10-L212](file:////home/nhat/Documents/DUT/ViTudy/src/hooks/useSocialPresence.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `useStorageManager` | `hook` | [src/hooks/useStorageManager.ts:L65-L216](file:////home/nhat/Documents/DUT/ViTudy/src/hooks/useStorageManager.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `useWebRtcVoiceChat` | `hook` | [src/hooks/useWebRtcVoiceChat.ts:L23-L572](file:////home/nhat/Documents/DUT/ViTudy/src/hooks/useWebRtcVoiceChat.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `UseWebRtcVoiceChatOptions` | `type` | [src/hooks/useWebRtcVoiceChat.ts:L7-L13](file:////home/nhat/Documents/DUT/ViTudy/src/hooks/useWebRtcVoiceChat.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `VietQrParams` | `type` | [src/services/PaymentService.ts:L30-L36](file:////home/nhat/Documents/DUT/ViTudy/src/services/PaymentService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `viewport` | `const` | [src/app/layout.tsx:L12-L18](file:////home/nhat/Documents/DUT/ViTudy/src/app/layout.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ViTokenTransaction` | `type` | [src/types/vitoken.ts:L10-L17](file:////home/nhat/Documents/DUT/ViTudy/src/types/vitoken.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ViTokenWallet` | `type` | [src/types/vitoken.ts:L29-L34](file:////home/nhat/Documents/DUT/ViTudy/src/types/vitoken.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `VndDenomination` | `type` | [src/types/boardgame.ts:L1-L10](file:////home/nhat/Documents/DUT/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `VoiceNoteData` | `type` | [src/types/studyspace.ts:L44-L55](file:////home/nhat/Documents/DUT/ViTudy/src/types/studyspace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `VoiceSignal` | `type` | [src/hooks/useRealtimeMultiplayer.ts:L22-L25](file:////home/nhat/Documents/DUT/ViTudy/src/hooks/useRealtimeMultiplayer.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |

