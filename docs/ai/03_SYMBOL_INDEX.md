# 03_SYMBOL_INDEX.md — Chỉ Mục Toàn Bộ Ký Hiệu Codebase ViTudy

> **Commit Hash:** `5ee70c5`  
> **Cập nhật lần cuối:** `2026-11-14`  
> **Quy ước:** Symbol | Kind | File:Lines (Symbol) | Vai trò chức năng

<!-- manual:start -->
Tài liệu này được đồng bộ tự động qua `npm run docs:index` và kiểm tra bởi `npm run docs:check`.
<!-- manual:end -->

### Canvas & 2.5D Desk

| Ký hiệu (Symbol) | Loại (Kind) | Vị trí (File:Lines) | Vai trò chức năng |
|---|---|---|---|
| `DeskDrawingCanvas` | `component` | [src/components/canvas/DeskDrawingCanvas.tsx:L69-L92](file:///F:/AppMaking/ViTudy/src/components/canvas/DeskDrawingCanvas.tsx) | Canvas vẽ nét bút dạ quang và bút vẽ tự do với chế độ multiply blend |
| `DeskDrawingInteractionLayer` | `component` | [src/components/canvas/DeskDrawingInteractionLayer.tsx:L6-L462](file:///F:/AppMaking/ViTudy/src/components/canvas/DeskDrawingInteractionLayer.tsx) | Lớp đón bắt sự kiện kéo vẽ mượt mà, phân định vẽ nét vs di chuyển bàn |
| `DeskGrid` | `component` | [src/components/canvas/DeskGrid.tsx:L5-L50](file:///F:/AppMaking/ViTudy/src/components/canvas/DeskGrid.tsx) | Lưới caro toạ độ bàn học trắng tinh khiết chống mỏi mắt |
| `InfiniteDesk` | `component` | [src/components/canvas/InfiniteDesk.tsx:L26-L540](file:///F:/AppMaking/ViTudy/src/components/canvas/InfiniteDesk.tsx) | Mặt bàn vô cực 2.5D: quản lý pan, zoom, phím tắt Alt+Drag, bắt sự kiện click |
| `ItemDrawingOverlay` | `component` | [src/components/canvas/ItemDrawingOverlay.tsx:L7-L61](file:///F:/AppMaking/ViTudy/src/components/canvas/ItemDrawingOverlay.tsx) | Thành phần nghiệp vụ của phân hệ Canvas & 2.5D Desk |
| `MindMapConnectors` | `component` | [src/components/canvas/MindMapConnectors.tsx:L6-L103](file:///F:/AppMaking/ViTudy/src/components/canvas/MindMapConnectors.tsx) | Thành phần nghiệp vụ của phân hệ Canvas & 2.5D Desk |
| `Minimap` | `component` | [src/components/canvas/Minimap.tsx:L12-L233](file:///F:/AppMaking/ViTudy/src/components/canvas/Minimap.tsx) | Bản đồ radar thu nhỏ góc nhìn toàn cảnh không gian bàn học 2.5D |
| `MultiplayerCursorsLayer` | `component` | [src/components/canvas/MultiplayerCursorsLayer.tsx:L11-L57](file:///F:/AppMaking/ViTudy/src/components/canvas/MultiplayerCursorsLayer.tsx) | Thành phần nghiệp vụ của phân hệ Canvas & 2.5D Desk |
| `StudySpaceDeskView` | `component` | [src/components/canvas/StudySpaceDeskView.tsx:L19-L248](file:///F:/AppMaking/ViTudy/src/components/canvas/StudySpaceDeskView.tsx) | Component trung tâm tích hợp toàn bộ Canvas bàn học, HUD 4 góc và modal |
| `VisualLinkThreads` | `component` | [src/components/canvas/VisualLinkThreads.tsx:L6-L215](file:///F:/AppMaking/ViTudy/src/components/canvas/VisualLinkThreads.tsx) | Vẽ các đường dây nối SVG trực quan từ đoạn trích sách sang giấy note Inteline |

### Objects (Sách, Giấy, Note)

| Ký hiệu (Symbol) | Loại (Kind) | Vị trí (File:Lines) | Vai trò chức năng |
|---|---|---|---|
| `ActionPanel` | `component` | [src/components/objects/boardgame/ActionPanel.tsx:L28-L254](file:///F:/AppMaking/ViTudy/src/components/objects/boardgame/ActionPanel.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `BoardCanvas` | `component` | [src/components/objects/boardgame/BoardCanvas.tsx:L37-L181](file:///F:/AppMaking/ViTudy/src/components/objects/boardgame/BoardCanvas.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `BoardGameArena` | `component` | [src/components/objects/BoardGameArena.tsx:L78-L1451](file:///F:/AppMaking/ViTudy/src/components/objects/BoardGameArena.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `BOOK_COVER_PRESETS` | `component` | [src/components/objects/BookSpread.tsx:L40-L81](file:///F:/AppMaking/ViTudy/src/components/objects/BookSpread.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `BookSpread` | `component` | [src/components/objects/BookSpread.tsx:L1154-L1154](file:///F:/AppMaking/ViTudy/src/components/objects/BookSpread.tsx) | Mô phỏng cuốn sách mở 2.5D, phân trang động DOM, bìa cứng, gờ gáy và popover Inteline |
| `BookSpreadComponent` | `component` | [src/components/objects/BookSpread.tsx:L83-L1152](file:///F:/AppMaking/ViTudy/src/components/objects/BookSpread.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `CodeBlockItem` | `component` | [src/components/objects/CodeBlockItem.tsx:L15-L222](file:///F:/AppMaking/ViTudy/src/components/objects/CodeBlockItem.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `CurrencyAndBankPanel` | `component` | [src/components/objects/boardgame/CurrencyAndBankPanel.tsx:L23-L365](file:///F:/AppMaking/ViTudy/src/components/objects/boardgame/CurrencyAndBankPanel.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `DeckAndDeedModal` | `component` | [src/components/objects/boardgame/DeckAndDeedModal.tsx:L20-L338](file:///F:/AppMaking/ViTudy/src/components/objects/boardgame/DeckAndDeedModal.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `DiceLayer` | `component` | [src/components/objects/boardgame/DiceLayer.tsx:L21-L119](file:///F:/AppMaking/ViTudy/src/components/objects/boardgame/DiceLayer.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `ExamQuizCard` | `component` | [src/components/objects/ExamQuizCard.tsx:L750-L750](file:///F:/AppMaking/ViTudy/src/components/objects/ExamQuizCard.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `ExamQuizCardComponent` | `component` | [src/components/objects/ExamQuizCard.tsx:L46-L748](file:///F:/AppMaking/ViTudy/src/components/objects/ExamQuizCard.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `FourCornerArtboard` | `component` | [src/components/objects/FourCornerArtboard.tsx:L42-L1104](file:///F:/AppMaking/ViTudy/src/components/objects/FourCornerArtboard.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `GameLinkLayer` | `component` | [src/components/objects/boardgame/GameLinkLayer.tsx:L14-L72](file:///F:/AppMaking/ViTudy/src/components/objects/boardgame/GameLinkLayer.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `MindMapNodeItem` | `component` | [src/components/objects/MindMapNodeItem.tsx:L24-L296](file:///F:/AppMaking/ViTudy/src/components/objects/MindMapNodeItem.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `PaperSheet` | `component` | [src/components/objects/PaperSheet.tsx:L885-L885](file:///F:/AppMaking/ViTudy/src/components/objects/PaperSheet.tsx) | Mô phỏng tờ giấy A4/ghi chép đơn lẻ 2.5D với độ xoay tự do và texture giấy |
| `PaperSheetComponent` | `component` | [src/components/objects/PaperSheet.tsx:L47-L883](file:///F:/AppMaking/ViTudy/src/components/objects/PaperSheet.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `PawnLayer` | `component` | [src/components/objects/boardgame/PawnLayer.tsx:L16-L101](file:///F:/AppMaking/ViTudy/src/components/objects/boardgame/PawnLayer.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `PresentationItem` | `component` | [src/components/objects/PresentationItem.tsx:L25-L356](file:///F:/AppMaking/ViTudy/src/components/objects/PresentationItem.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `PrivateHandTray` | `component` | [src/components/objects/boardgame/PrivateHandTray.tsx:L17-L155](file:///F:/AppMaking/ViTudy/src/components/objects/boardgame/PrivateHandTray.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `SpreadsheetItem` | `component` | [src/components/objects/SpreadsheetItem.tsx:L15-L279](file:///F:/AppMaking/ViTudy/src/components/objects/SpreadsheetItem.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `StickerItem` | `component` | [src/components/objects/StickerItem.tsx:L15-L192](file:///F:/AppMaking/ViTudy/src/components/objects/StickerItem.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `StickyNoteItem` | `component` | [src/components/objects/StickyNoteItem.tsx:L1149-L1149](file:///F:/AppMaking/ViTudy/src/components/objects/StickyNoteItem.tsx) | Giấy ghi chú dán bàn học (Patrick Hand font, NFC normalized, xoay 360°) |
| `StickyNoteItemComponent` | `component` | [src/components/objects/StickyNoteItem.tsx:L40-L1147](file:///F:/AppMaking/ViTudy/src/components/objects/StickyNoteItem.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `TableCardsLayer` | `component` | [src/components/objects/boardgame/TableCardsLayer.tsx:L15-L98](file:///F:/AppMaking/ViTudy/src/components/objects/boardgame/TableCardsLayer.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `TileFormEditorModal` | `component` | [src/components/objects/boardgame/TileFormEditorModal.tsx:L51-L657](file:///F:/AppMaking/ViTudy/src/components/objects/boardgame/TileFormEditorModal.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `TileView` | `component` | [src/components/objects/boardgame/TileView.tsx:L21-L300](file:///F:/AppMaking/ViTudy/src/components/objects/boardgame/TileView.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `TopDownDice3D` | `component` | [src/components/objects/boardgame/TopDownDice3D.tsx:L19-L173](file:///F:/AppMaking/ViTudy/src/components/objects/boardgame/TopDownDice3D.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |
| `UniversalSetupModal` | `component` | [src/components/objects/boardgame/UniversalSetupModal.tsx:L41-L399](file:///F:/AppMaking/ViTudy/src/components/objects/boardgame/UniversalSetupModal.tsx) | Thành phần nghiệp vụ của phân hệ Objects (Sách, Giấy, Note) |

### HUD & Overlays

| Ký hiệu (Symbol) | Loại (Kind) | Vị trí (File:Lines) | Vai trò chức năng |
|---|---|---|---|
| `BottomLeftKnowledge` | `component` | [src/components/hud/BottomLeftKnowledge.tsx:L50-L1133](file:///F:/AppMaking/ViTudy/src/components/hud/BottomLeftKnowledge.tsx) | HUD góc dưới-trái: nút tải tài liệu và mở chợ chia sẻ tri thức KnowInherit 85/15 |
| `BottomRightToolkit` | `component` | [src/components/hud/BottomRightToolkit.tsx:L17-L202](file:///F:/AppMaking/ViTudy/src/components/hud/BottomRightToolkit.tsx) | HUD góc dưới-phải: công cụ bút dạ quang, tạo note, khoá góc nhìn, zoom 100% |
| `GamePenToolbar` | `component` | [src/components/hud/GamePenToolbar.tsx:L23-L222](file:///F:/AppMaking/ViTudy/src/components/hud/GamePenToolbar.tsx) | Thành phần nghiệp vụ của phân hệ HUD & Overlays |
| `InviteModal` | `component` | [src/components/hud/InviteModal.tsx:L14-L132](file:///F:/AppMaking/ViTudy/src/components/hud/InviteModal.tsx) | Thành phần nghiệp vụ của phân hệ HUD & Overlays |
| `LeftCreationBar` | `component` | [src/components/hud/LeftCreationBar.tsx:L35-L623](file:///F:/AppMaking/ViTudy/src/components/hud/LeftCreationBar.tsx) | Thành phần nghiệp vụ của phân hệ HUD & Overlays |
| `ModelGroup` | `type` | [src/components/hud/TopRightWallet.tsx:L67-L70](file:///F:/AppMaking/ViTudy/src/components/hud/TopRightWallet.tsx) | Thành phần nghiệp vụ của phân hệ HUD & Overlays |
| `ModelItem` | `type` | [src/components/hud/TopRightWallet.tsx:L61-L65](file:///F:/AppMaking/ViTudy/src/components/hud/TopRightWallet.tsx) | Thành phần nghiệp vụ của phân hệ HUD & Overlays |
| `MultiplayerBar` | `component` | [src/components/hud/MultiplayerBar.tsx:L23-L404](file:///F:/AppMaking/ViTudy/src/components/hud/MultiplayerBar.tsx) | HUD cộng tác học nhóm thời gian thực: danh sách avatar, thả cảm xúc emoji |
| `StickerEmojiPickerFlyout` | `component` | [src/components/hud/StickerEmojiPickerFlyout.tsx:L35-L731](file:///F:/AppMaking/ViTudy/src/components/hud/StickerEmojiPickerFlyout.tsx) | Thành phần nghiệp vụ của phân hệ HUD & Overlays |
| `TopLeftNav` | `component` | [src/components/hud/TopLeftNav.tsx:L37-L524](file:///F:/AppMaking/ViTudy/src/components/hud/TopLeftNav.tsx) | HUD góc trên-trái: chuyển đổi bàn học, tìm kiếm tài liệu, đồng bộ góc nhìn |
| `TopRightWallet` | `component` | [src/components/hud/TopRightWallet.tsx:L145-L1264](file:///F:/AppMaking/ViTudy/src/components/hud/TopRightWallet.tsx) | HUD góc trên-phải: hiển thị số dư ViToken, chuỗi điểm danh streak, chọn model AI |
| `VrFrameOverlay` | `component` | [src/components/hud/VrFrameOverlay.tsx:L5-L15](file:///F:/AppMaking/ViTudy/src/components/hud/VrFrameOverlay.tsx) | Khung viền 4 góc và nhãn chế độ "Không gian học 2.5D" phong cách VR HUD |

### Modals & Workflows

| Ký hiệu (Symbol) | Loại (Kind) | Vị trí (File:Lines) | Vai trò chức năng |
|---|---|---|---|
| `AiConfigModal` | `component` | [src/components/modals/AiConfigModal.tsx:L101-L787](file:///F:/AppMaking/ViTudy/src/components/modals/AiConfigModal.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `BYOK_CLAUDE_MODELS` | `component` | [src/components/modals/AiConfigModal.tsx:L74-L77](file:///F:/AppMaking/ViTudy/src/components/modals/AiConfigModal.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `BYOK_GEMINI_MODELS` | `component` | [src/components/modals/AiConfigModal.tsx:L64-L67](file:///F:/AppMaking/ViTudy/src/components/modals/AiConfigModal.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `BYOK_OPENAI_MODELS` | `component` | [src/components/modals/AiConfigModal.tsx:L69-L72](file:///F:/AppMaking/ViTudy/src/components/modals/AiConfigModal.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `CHATGPT_MODEL_GROUPS` | `component` | [src/components/modals/AiConfigModal.tsx:L39-L56](file:///F:/AppMaking/ViTudy/src/components/modals/AiConfigModal.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `FlashcardModal` | `component` | [src/components/modals/FlashcardModal.tsx:L15-L65](file:///F:/AppMaking/ViTudy/src/components/modals/FlashcardModal.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `FlashcardTab` | `component` | [src/components/modals/study-tools/FlashcardTab.tsx:L28-L348](file:///F:/AppMaking/ViTudy/src/components/modals/study-tools/FlashcardTab.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `FullScreenDocModal` | `component` | [src/components/modals/FullScreenDocModal.tsx:L33-L867](file:///F:/AppMaking/ViTudy/src/components/modals/FullScreenDocModal.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `GameCabinetModal` | `component` | [src/components/modals/GameCabinetModal.tsx:L15-L242](file:///F:/AppMaking/ViTudy/src/components/modals/GameCabinetModal.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `IntelineModal` | `component` | [src/components/modals/IntelineModal.tsx:L27-L270](file:///F:/AppMaking/ViTudy/src/components/modals/IntelineModal.tsx) | Hộp thoại AI hỏi đáp ngữ cảnh sâu Inteline theo từng dòng/trang tài liệu |
| `KnowInheritPublishModal` | `component` | [src/components/modals/KnowInheritPublishModal.tsx:L39-L450](file:///F:/AppMaking/ViTudy/src/components/modals/KnowInheritPublishModal.tsx) | Hộp thoại chia sẻ tài liệu lên chợ tri thức: AI thẩm định điểm và tính giá |
| `MarketModal` | `component` | [src/components/modals/MarketModal.tsx:L44-L1039](file:///F:/AppMaking/ViTudy/src/components/modals/MarketModal.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `MobileCompanionView` | `component` | [src/components/mobile/MobileCompanionView.tsx:L30-L412](file:///F:/AppMaking/ViTudy/src/components/mobile/MobileCompanionView.tsx) | Giao diện di động rút gọn đồng bộ tài liệu từ máy tính |
| `ModelGroup` | `type` | [src/components/modals/AiConfigModal.tsx:L34-L37](file:///F:/AppMaking/ViTudy/src/components/modals/AiConfigModal.tsx) | Thành phần nghiệp vụ của phân hệ HUD & Overlays |
| `ModelItem` | `type` | [src/components/modals/AiConfigModal.tsx:L28-L32](file:///F:/AppMaking/ViTudy/src/components/modals/AiConfigModal.tsx) | Thành phần nghiệp vụ của phân hệ HUD & Overlays |
| `PROVIDER_MODELS` | `component` | [src/components/modals/AiConfigModal.tsx:L79-L86](file:///F:/AppMaking/ViTudy/src/components/modals/AiConfigModal.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `QuizTab` | `component` | [src/components/modals/study-tools/QuizTab.tsx:L32-L758](file:///F:/AppMaking/ViTudy/src/components/modals/study-tools/QuizTab.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `RoadmapTab` | `component` | [src/components/modals/study-tools/RoadmapTab.tsx:L26-L228](file:///F:/AppMaking/ViTudy/src/components/modals/study-tools/RoadmapTab.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `SelectSpaceForDocModal` | `component` | [src/components/modals/SelectSpaceForDocModal.tsx:L30-L358](file:///F:/AppMaking/ViTudy/src/components/modals/SelectSpaceForDocModal.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `StudyToolsModal` | `component` | [src/components/modals/StudyToolsModal.tsx:L30-L192](file:///F:/AppMaking/ViTudy/src/components/modals/StudyToolsModal.tsx) | Bộ công cụ ôn tập toàn diện STudy: TextRank, Cloze Quiz, Flashcard, Roadmap |
| `SummaryTab` | `component` | [src/components/modals/study-tools/SummaryTab.tsx:L19-L260](file:///F:/AppMaking/ViTudy/src/components/modals/study-tools/SummaryTab.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |
| `SYSTEM_MODEL_LIST` | `component` | [src/components/modals/AiConfigModal.tsx:L58-L62](file:///F:/AppMaking/ViTudy/src/components/modals/AiConfigModal.tsx) | Thành phần nghiệp vụ của phân hệ Modals & Workflows |

### Context & State

| Ký hiệu (Symbol) | Loại (Kind) | Vị trí (File:Lines) | Vai trò chức năng |
|---|---|---|---|
| `AuthContextType` | `type` | [src/context/AuthContext.tsx:L23-L35](file:///F:/AppMaking/ViTudy/src/context/AuthContext.tsx) | Thành phần nghiệp vụ của phân hệ Context & State |
| `AuthProvider` | `context` | [src/context/AuthContext.tsx:L39-L306](file:///F:/AppMaking/ViTudy/src/context/AuthContext.tsx) | Thành phần nghiệp vụ của phân hệ Context & State |
| `AuthResult` | `type` | [src/context/AuthContext.tsx:L18-L21](file:///F:/AppMaking/ViTudy/src/context/AuthContext.tsx) | Thành phần nghiệp vụ của phân hệ Context & State |
| `AuthStatus` | `type` | [src/context/AuthContext.tsx:L8-L8](file:///F:/AppMaking/ViTudy/src/context/AuthContext.tsx) | Thành phần nghiệp vụ của phân hệ Context & State |
| `CreationPlacementTemplate` | `type` | [src/context/StudySpaceContext.tsx:L15-L34](file:///F:/AppMaking/ViTudy/src/context/StudySpaceContext.tsx) | Thành phần nghiệp vụ của phân hệ Context & State |
| `PomodoroProvider` | `context` | [src/context/PomodoroContext.tsx:L35-L168](file:///F:/AppMaking/ViTudy/src/context/PomodoroContext.tsx) | Thành phần nghiệp vụ của phân hệ Context & State |
| `StudySpaceProvider` | `context` | [src/context/StudySpaceContext.tsx:L189-L2871](file:///F:/AppMaking/ViTudy/src/context/StudySpaceContext.tsx) | Provider quản lý toàn bộ state bàn học, tài liệu, toạ độ, nét vẽ, zIndex |
| `useAuth` | `hook` | [src/context/AuthContext.tsx:L312-L318](file:///F:/AppMaking/ViTudy/src/context/AuthContext.tsx) | Thành phần nghiệp vụ của phân hệ Context & State |
| `useOptionalAuth` | `hook` | [src/context/AuthContext.tsx:L320-L322](file:///F:/AppMaking/ViTudy/src/context/AuthContext.tsx) | Thành phần nghiệp vụ của phân hệ Context & State |
| `usePomodoroContext` | `hook` | [src/context/PomodoroContext.tsx:L170-L176](file:///F:/AppMaking/ViTudy/src/context/PomodoroContext.tsx) | Thành phần nghiệp vụ của phân hệ Context & State |
| `UserProfile` | `type` | [src/context/AuthContext.tsx:L10-L16](file:///F:/AppMaking/ViTudy/src/context/AuthContext.tsx) | Thành phần nghiệp vụ của phân hệ Context & State |
| `useStudySpace` | `hook` | [src/context/StudySpaceContext.tsx:L2873-L2879](file:///F:/AppMaking/ViTudy/src/context/StudySpaceContext.tsx) | Hook truy cập trạng thái không gian bàn học, camera, danh sách tài liệu |
| `useViToken` | `hook` | [src/context/ViTokenContext.tsx:L338-L344](file:///F:/AppMaking/ViTudy/src/context/ViTokenContext.tsx) | Hook quản lý ví ViToken, chi tiêu token, điểm danh streak và cấu hình AI |
| `ViTokenProvider` | `context` | [src/context/ViTokenContext.tsx:L47-L336](file:///F:/AppMaking/ViTudy/src/context/ViTokenContext.tsx) | Provider lưu trữ và đồng bộ ví ViToken, lịch sử giao dịch vào localStorage |

### Non-AI Engine & Utils

| Ký hiệu (Symbol) | Loại (Kind) | Vị trí (File:Lines) | Vai trò chức năng |
|---|---|---|---|
| `adjustPlayerResource` | `fn` | [src/lib/boardGameEngine.ts:L1155-L1190](file:///F:/AppMaking/ViTudy/src/lib/boardGameEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `applyDiscordUrlMappings` | `fn` | [src/lib/discord/urlMappings.ts:L5-L39](file:///F:/AppMaking/ViTudy/src/lib/discord/urlMappings.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `applyTransfer` | `fn` | [src/lib/boardGameEngine.ts:L77-L148](file:///F:/AppMaking/ViTudy/src/lib/boardGameEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `askAi` | `fn` | [src/lib/aiClient.ts:L253-L358](file:///F:/AppMaking/ViTudy/src/lib/aiClient.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `AskAiRequest` | `type` | [src/lib/aiClient.ts:L17-L26](file:///F:/AppMaking/ViTudy/src/lib/aiClient.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `AskAiResult` | `type` | [src/lib/aiClient.ts:L28-L32](file:///F:/AppMaking/ViTudy/src/lib/aiClient.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `base64UrlDecode` | `fn` | [src/lib/openaiOAuth.ts:L44-L58](file:///F:/AppMaking/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `base64UrlEncode` | `fn` | [src/lib/openaiOAuth.ts:L32-L42](file:///F:/AppMaking/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `buildOpenAiAuthorizeUrl` | `fn` | [src/lib/openaiOAuth.ts:L90-L103](file:///F:/AppMaking/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `buyProperty` | `fn` | [src/lib/boardGameEngine.ts:L629-L699](file:///F:/AppMaking/ViTudy/src/lib/boardGameEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `ByokProvider` | `type` | [src/lib/byokStore.ts:L1-L1](file:///F:/AppMaking/ViTudy/src/lib/byokStore.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `CachedStudyData` | `type` | [src/lib/studyToolsCache.ts:L4-L12](file:///F:/AppMaking/ViTudy/src/lib/studyToolsCache.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `calculateNextReview` | `fn` | [src/lib/sm2.ts:L16-L58](file:///F:/AppMaking/ViTudy/src/lib/sm2.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `classifyResult` | `fn` | [src/utils/smartShape.test.ts:L332-L335](file:///F:/AppMaking/ViTudy/src/utils/smartShape.test.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `cleanupBoardGameOrphans` | `fn` | [src/lib/boardGameEngine.ts:L157-L201](file:///F:/AppMaking/ViTudy/src/lib/boardGameEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `cleanupDeskItemsOnDelete` | `fn` | [src/lib/boardGameEngine.ts:L247-L268](file:///F:/AppMaking/ViTudy/src/lib/boardGameEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `clearOpenAiOAuthSession` | `fn` | [src/lib/openaiOAuth.ts:L322-L325](file:///F:/AppMaking/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `clearPendingPkce` | `fn` | [src/lib/openaiOAuth.ts:L130-L135](file:///F:/AppMaking/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `clearSupabaseConfig` | `fn` | [src/lib/supabase.ts:L81-L87](file:///F:/AppMaking/ViTudy/src/lib/supabase.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `computeArcLengths` | `fn` | [src/utils/smartShape.ts:L46-L54](file:///F:/AppMaking/ViTudy/src/utils/smartShape.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `computeBoundingBox` | `fn` | [src/utils/smartShape.ts:L85-L99](file:///F:/AppMaking/ViTudy/src/utils/smartShape.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `computeLedgerChecksum` | `fn` | [src/lib/boardGameEngine.ts:L34-L54](file:///F:/AppMaking/ViTudy/src/lib/boardGameEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `computePolygonArea` | `fn` | [src/utils/smartShape.ts:L142-L150](file:///F:/AppMaking/ViTudy/src/utils/smartShape.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `computeTileRent` | `fn` | [src/lib/boardGameEngine.ts:L701-L707](file:///F:/AppMaking/ViTudy/src/lib/boardGameEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `countSharpCorners` | `fn` | [src/utils/smartShape.ts:L152-L181](file:///F:/AppMaking/ViTudy/src/utils/smartShape.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `declareBankruptcy` | `fn` | [src/lib/boardGameEngine.ts:L834-L881](file:///F:/AppMaking/ViTudy/src/lib/boardGameEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `deleteBoardTileSafe` | `fn` | [src/lib/boardGameEngine.ts:L208-L240](file:///F:/AppMaking/ViTudy/src/lib/boardGameEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `DieSpec` | `type` | [src/lib/physicsDiceBox.ts:L64-L68](file:///F:/AppMaking/ViTudy/src/lib/physicsDiceBox.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `DiscordAuthResult` | `type` | [src/lib/discord/sdk.ts:L3-L14](file:///F:/AppMaking/ViTudy/src/lib/discord/sdk.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `DocumentOutlineNode` | `type` | [src/lib/nonAiEngine.ts:L45-L51](file:///F:/AppMaking/ViTudy/src/lib/nonAiEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `drawCardToHand` | `fn` | [src/lib/boardGameEngine.ts:L971-L1018](file:///F:/AppMaking/ViTudy/src/lib/boardGameEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `DropZoneRect` | `type` | [src/lib/physicsDiceBox.ts:L57-L62](file:///F:/AppMaking/ViTudy/src/lib/physicsDiceBox.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `endTurn` | `fn` | [src/lib/boardGameEngine.ts:L883-L916](file:///F:/AppMaking/ViTudy/src/lib/boardGameEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `ensureValidOpenAiSession` | `fn` | [src/lib/aiClient.ts:L237-L251](file:///F:/AppMaking/ViTudy/src/lib/aiClient.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `evaluateTriggerRules` | `fn` | [src/lib/boardGameEngine.ts:L1261-L1327](file:///F:/AppMaking/ViTudy/src/lib/boardGameEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `exchangeOpenAiCode` | `fn` | [src/lib/aiClient.ts:L120-L235](file:///F:/AppMaking/ViTudy/src/lib/aiClient.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `extractOpenAiJwtClaims` | `fn` | [src/lib/openaiOAuth.ts:L148-L186](file:///F:/AppMaking/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `extractOutlineAndRoadmap` | `fn` | [src/lib/nonAiEngine.ts:L311-L337](file:///F:/AppMaking/ViTudy/src/lib/nonAiEngine.ts) | Thuật toán trích xuất tiêu đề dựng lộ trình học tương tác theo thời gian |
| `findDeedForTile` | `fn` | [src/lib/boardGameEngine.ts:L455-L466](file:///F:/AppMaking/ViTudy/src/lib/boardGameEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `findTopItemAtPoint` | `fn` | [src/utils/strokeSegmentation.ts:L77-L86](file:///F:/AppMaking/ViTudy/src/utils/strokeSegmentation.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `fitCircle` | `fn` | [src/utils/smartShape.ts:L270-L332](file:///F:/AppMaking/ViTudy/src/utils/smartShape.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `fitEllipse` | `fn` | [src/utils/smartShape.ts:L337-L424](file:///F:/AppMaking/ViTudy/src/utils/smartShape.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `fitLine` | `fn` | [src/utils/smartShape.ts:L190-L265](file:///F:/AppMaking/ViTudy/src/utils/smartShape.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `fitRotatedRectangle` | `fn` | [src/utils/smartShape.ts:L429-L555](file:///F:/AppMaking/ViTudy/src/utils/smartShape.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `fitTriangle` | `fn` | [src/utils/smartShape.ts:L560-L622](file:///F:/AppMaking/ViTudy/src/utils/smartShape.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `Flashcard` | `type` | [src/lib/nonAiEngine.ts:L28-L33](file:///F:/AppMaking/ViTudy/src/lib/nonAiEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `formatDeskItemsSummary` | `fn` | [src/utils/deskSummary.ts:L6-L37](file:///F:/AppMaking/ViTudy/src/utils/deskSummary.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `formatRelativeTimeVN` | `fn` | [src/lib/dateVN.ts:L65-L91](file:///F:/AppMaking/ViTudy/src/lib/dateVN.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `formatUploadedDocTitle` | `fn` | [src/utils/documentNaming.ts:L6-L37](file:///F:/AppMaking/ViTudy/src/utils/documentNaming.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `generateCircleStroke` | `fn` | [src/utils/smartShape.test.ts:L61-L86](file:///F:/AppMaking/ViTudy/src/utils/smartShape.test.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `generateClozeQuestions` | `fn` | [src/lib/nonAiEngine.ts:L152-L246](file:///F:/AppMaking/ViTudy/src/lib/nonAiEngine.ts) | Thuật toán Cloze Deletion tự động đục lỗ từ khoá tạo bài tập trắc nghiệm |
| `generateEllipseStroke` | `fn` | [src/utils/smartShape.test.ts:L88-L113](file:///F:/AppMaking/ViTudy/src/utils/smartShape.test.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `generateFlashcardsFromRules` | `fn` | [src/lib/nonAiEngine.ts:L251-L306](file:///F:/AppMaking/ViTudy/src/lib/nonAiEngine.ts) | Quy tắc bóc tách câu định nghĩa thành bộ thẻ nhớ Flashcard ôn tập |
| `generateLineStroke` | `fn` | [src/utils/smartShape.test.ts:L39-L59](file:///F:/AppMaking/ViTudy/src/utils/smartShape.test.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `generateNonShapeStroke` | `fn` | [src/utils/smartShape.test.ts:L260-L327](file:///F:/AppMaking/ViTudy/src/utils/smartShape.test.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `generatePkcePair` | `fn` | [src/lib/openaiOAuth.ts:L72-L88](file:///F:/AppMaking/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `generateRectangleStroke` | `fn` | [src/utils/smartShape.test.ts:L165-L208](file:///F:/AppMaking/ViTudy/src/utils/smartShape.test.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `generateSquareStroke` | `fn` | [src/utils/smartShape.test.ts:L115-L163](file:///F:/AppMaking/ViTudy/src/utils/smartShape.test.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `generateTriangleStroke` | `fn` | [src/utils/smartShape.test.ts:L210-L258](file:///F:/AppMaking/ViTudy/src/utils/smartShape.test.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `getActivePlayerId` | `fn` | [src/lib/boardGameEngine.ts:L448-L453](file:///F:/AppMaking/ViTudy/src/lib/boardGameEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `getActiveStroke` | `fn` | [src/lib/activeStrokeStore.ts:L12-L14](file:///F:/AppMaking/ViTudy/src/lib/activeStrokeStore.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `getAssetPath` | `fn` | [src/lib/assets.ts:L4-L25](file:///F:/AppMaking/ViTudy/src/lib/assets.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `getDeskItemBounds` | `fn` | [src/utils/strokeSegmentation.ts:L40-L63](file:///F:/AppMaking/ViTudy/src/utils/strokeSegmentation.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `getDiscordSdk` | `fn` | [src/lib/discord/sdk.ts:L18-L28](file:///F:/AppMaking/ViTudy/src/lib/discord/sdk.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `getIDB` | `fn` | [src/lib/indexeddb.ts:L8-L25](file:///F:/AppMaking/ViTudy/src/lib/indexeddb.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `getLast28DaysGrid` | `fn` | [src/lib/dateVN.ts:L28-L60](file:///F:/AppMaking/ViTudy/src/lib/dateVN.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `getOpenAiOAuthSession` | `fn` | [src/lib/openaiOAuth.ts:L286-L320](file:///F:/AppMaking/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `getOrderedBoardTrack` | `fn` | [src/lib/boardGameEngine.ts:L273-L299](file:///F:/AppMaking/ViTudy/src/lib/boardGameEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `getPendingPkce` | `fn` | [src/lib/openaiOAuth.ts:L117-L128](file:///F:/AppMaking/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `getStudyCache` | `fn` | [src/lib/studyToolsCache.ts:L16-L18](file:///F:/AppMaking/ViTudy/src/lib/studyToolsCache.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `getSupabase` | `fn` | [src/lib/supabase.ts:L41-L71](file:///F:/AppMaking/ViTudy/src/lib/supabase.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `getSupabaseConfig` | `fn` | [src/lib/supabase.ts:L10-L37](file:///F:/AppMaking/ViTudy/src/lib/supabase.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `idbDelete` | `fn` | [src/lib/indexeddb.ts:L39-L43](file:///F:/AppMaking/ViTudy/src/lib/indexeddb.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `idbGet` | `fn` | [src/lib/indexeddb.ts:L27-L31](file:///F:/AppMaking/ViTudy/src/lib/indexeddb.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `idbSet` | `fn` | [src/lib/indexeddb.ts:L33-L37](file:///F:/AppMaking/ViTudy/src/lib/indexeddb.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `initDiscord` | `fn` | [src/lib/discord/sdk.ts:L30-L71](file:///F:/AppMaking/ViTudy/src/lib/discord/sdk.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `initMatch` | `fn` | [src/lib/boardGameEngine.ts:L389-L446](file:///F:/AppMaking/ViTudy/src/lib/boardGameEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `isDiscordActivity` | `fn` | [src/lib/discord/detect.ts:L5-L13](file:///F:/AppMaking/ViTudy/src/lib/discord/detect.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `isItemVisible` | `fn` | [src/lib/viewportCulling.ts:L21-L48](file:///F:/AppMaking/ViTudy/src/lib/viewportCulling.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `isOpenAiSessionExpired` | `fn` | [src/lib/openaiOAuth.ts:L327-L333](file:///F:/AppMaking/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `ItemBounds` | `type` | [src/lib/viewportCulling.ts:L1-L7](file:///F:/AppMaking/ViTudy/src/lib/viewportCulling.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `mortgageProperty` | `fn` | [src/lib/boardGameEngine.ts:L788-L832](file:///F:/AppMaking/ViTudy/src/lib/boardGameEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `normalizeNFC` | `fn` | [src/utils/textNormalization.ts:L5-L8](file:///F:/AppMaking/ViTudy/src/utils/textNormalization.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `normalizeNFCPreserveWhitespace` | `fn` | [src/utils/textNormalization.ts:L10-L13](file:///F:/AppMaking/ViTudy/src/utils/textNormalization.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `OPENAI_AUTHORIZE_URL` | `component` | [src/lib/openaiOAuth.ts:L5-L5](file:///F:/AppMaking/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `OPENAI_OAUTH_CLIENT_ID` | `component` | [src/lib/openaiOAuth.ts:L3-L3](file:///F:/AppMaking/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `OPENAI_OAUTH_REDIRECT_URI` | `component` | [src/lib/openaiOAuth.ts:L4-L4](file:///F:/AppMaking/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `OPENAI_TOKEN_URL` | `component` | [src/lib/openaiOAuth.ts:L6-L6](file:///F:/AppMaking/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `OpenAiOAuthSession` | `type` | [src/lib/openaiOAuth.ts:L10-L18](file:///F:/AppMaking/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `PaginatedLeaf` | `type` | [src/utils/pagination.ts:L7-L15](file:///F:/AppMaking/ViTudy/src/utils/pagination.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `paginateDocument` | `fn` | [src/utils/pagination.ts:L167-L288](file:///F:/AppMaking/ViTudy/src/utils/pagination.ts) | Động cơ phân trang chính xác theo chiều cao trang, chống cắt cụt công thức |
| `ParsedOpenAiInput` | `type` | [src/lib/openaiOAuth.ts:L26-L30](file:///F:/AppMaking/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `parseOpenAiCallbackInput` | `fn` | [src/lib/openaiOAuth.ts:L188-L269](file:///F:/AppMaking/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `parseQuizJsonSafely` | `fn` | [src/lib/aiClient.ts:L638-L694](file:///F:/AppMaking/ViTudy/src/lib/aiClient.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `payRent` | `fn` | [src/lib/boardGameEngine.ts:L709-L741](file:///F:/AppMaking/ViTudy/src/lib/boardGameEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `PendingPkceState` | `type` | [src/lib/openaiOAuth.ts:L20-L24](file:///F:/AppMaking/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `playCardFromHand` | `fn` | [src/lib/boardGameEngine.ts:L1023-L1088](file:///F:/AppMaking/ViTudy/src/lib/boardGameEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `Point` | `type` | [src/utils/smartShape.ts:L8-L11](file:///F:/AppMaking/ViTudy/src/utils/smartShape.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `Point` | `type` | [src/utils/strokeSegmentation.ts:L3-L3](file:///F:/AppMaking/ViTudy/src/utils/strokeSegmentation.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `pointsToSvgPath` | `fn` | [src/utils/strokeSegmentation.ts:L5-L38](file:///F:/AppMaking/ViTudy/src/utils/strokeSegmentation.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `pointToSegmentDistance` | `fn` | [src/utils/smartShape.ts:L129-L140](file:///F:/AppMaking/ViTudy/src/utils/smartShape.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `QuizQuestion` | `type` | [src/lib/nonAiEngine.ts:L19-L26](file:///F:/AppMaking/ViTudy/src/lib/nonAiEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `ramerDouglasPeucker` | `fn` | [src/utils/smartShape.ts:L105-L127](file:///F:/AppMaking/ViTudy/src/utils/smartShape.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `RecognizedLabel` | `type` | [src/utils/smartShape.test.ts:L330-L330](file:///F:/AppMaking/ViTudy/src/utils/smartShape.test.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `RecognizedShapeResult` | `type` | [src/utils/smartShape.ts:L15-L20](file:///F:/AppMaking/ViTudy/src/utils/smartShape.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `recognizeSmartShape` | `fn` | [src/utils/smartShape.ts:L733-L736](file:///F:/AppMaking/ViTudy/src/utils/smartShape.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `recognizeSmartShapeDetailed` | `fn` | [src/utils/smartShape.ts:L628-L728](file:///F:/AppMaking/ViTudy/src/utils/smartShape.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `redoMatchMove` | `fn` | [src/lib/boardGameEngine.ts:L360-L387](file:///F:/AppMaking/ViTudy/src/lib/boardGameEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `refreshOpenAiSession` | `fn` | [src/lib/aiClient.ts:L47-L118](file:///F:/AppMaking/ViTudy/src/lib/aiClient.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `refundAiRequest` | `fn` | [src/lib/aiClient.ts:L360-L396](file:///F:/AppMaking/ViTudy/src/lib/aiClient.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `resampleByArcLength` | `fn` | [src/utils/smartShape.ts:L56-L83](file:///F:/AppMaking/ViTudy/src/utils/smartShape.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `returnTableCardToDeck` | `fn` | [src/lib/boardGameEngine.ts:L1129-L1150](file:///F:/AppMaking/ViTudy/src/lib/boardGameEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `reverseTurnOrder` | `fn` | [src/lib/boardGameEngine.ts:L1195-L1209](file:///F:/AppMaking/ViTudy/src/lib/boardGameEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `ReviewQuality` | `type` | [src/lib/sm2.ts:L8-L8](file:///F:/AppMaking/ViTudy/src/lib/sm2.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `RoadmapStep` | `type` | [src/lib/nonAiEngine.ts:L35-L43](file:///F:/AppMaking/ViTudy/src/lib/nonAiEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `rollAndMove` | `fn` | [src/lib/boardGameEngine.ts:L468-L627](file:///F:/AppMaking/ViTudy/src/lib/boardGameEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `saveOpenAiOAuthSession` | `fn` | [src/lib/openaiOAuth.ts:L271-L284](file:///F:/AppMaking/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `savePendingPkce` | `fn` | [src/lib/openaiOAuth.ts:L105-L115](file:///F:/AppMaking/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `saveSupabaseConfig` | `fn` | [src/lib/supabase.ts:L73-L79](file:///F:/AppMaking/ViTudy/src/lib/supabase.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `segmentStrokeByDeskItems` | `fn` | [src/utils/strokeSegmentation.ts:L117-L187](file:///F:/AppMaking/ViTudy/src/utils/strokeSegmentation.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `setActiveStroke` | `fn` | [src/lib/activeStrokeStore.ts:L16-L23](file:///F:/AppMaking/ViTudy/src/lib/activeStrokeStore.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `setDiscordPresence` | `fn` | [src/lib/discord/sdk.ts:L75-L97](file:///F:/AppMaking/ViTudy/src/lib/discord/sdk.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `setStudyCache` | `fn` | [src/lib/studyToolsCache.ts:L20-L23](file:///F:/AppMaking/ViTudy/src/lib/studyToolsCache.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `ShapeType` | `type` | [src/utils/smartShape.ts:L13-L13](file:///F:/AppMaking/ViTudy/src/utils/smartShape.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `shuffleDeck` | `fn` | [src/lib/boardGameEngine.ts:L944-L966](file:///F:/AppMaking/ViTudy/src/lib/boardGameEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `SM2Card` | `type` | [src/lib/sm2.ts:L1-L6](file:///F:/AppMaking/ViTudy/src/lib/sm2.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `smoothPoints` | `fn` | [src/utils/smartShape.ts:L33-L44](file:///F:/AppMaking/ViTudy/src/utils/smartShape.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `spawnFromSupplyPawn` | `fn` | [src/lib/boardGameEngine.ts:L1214-L1242](file:///F:/AppMaking/ViTudy/src/lib/boardGameEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `splitSentences` | `fn` | [src/lib/nonAiEngine.ts:L64-L71](file:///F:/AppMaking/ViTudy/src/lib/nonAiEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `startOpenAiPkceLogin` | `fn` | [src/lib/openaiOAuth.ts:L137-L146](file:///F:/AppMaking/ViTudy/src/lib/openaiOAuth.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `subscribeActiveStroke` | `fn` | [src/lib/activeStrokeStore.ts:L25-L30](file:///F:/AppMaking/ViTudy/src/lib/activeStrokeStore.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `summarizeWithTextRank` | `fn` | [src/lib/nonAiEngine.ts:L106-L147](file:///F:/AppMaking/ViTudy/src/lib/nonAiEngine.ts) | Thuật toán TextRank & TF-IDF trích xuất tóm tắt nội dung không cần AI |
| `SUPPORT_EMAIL` | `component` | [src/lib/constants.ts:L5-L5](file:///F:/AppMaking/ViTudy/src/lib/constants.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `SUPPORT_TELEGRAM` | `component` | [src/lib/constants.ts:L6-L6](file:///F:/AppMaking/ViTudy/src/lib/constants.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `testAiConnection` | `fn` | [src/lib/aiClient.ts:L482-L632](file:///F:/AppMaking/ViTudy/src/lib/aiClient.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `toDateKeyVN` | `fn` | [src/lib/dateVN.ts:L19-L22](file:///F:/AppMaking/ViTudy/src/lib/dateVN.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `todayKey` | `fn` | [src/lib/dateVN.ts:L6-L14](file:///F:/AppMaking/ViTudy/src/lib/dateVN.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `togglePawnFlip` | `fn` | [src/lib/boardGameEngine.ts:L1247-L1256](file:///F:/AppMaking/ViTudy/src/lib/boardGameEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `toggleTableCardFlip` | `fn` | [src/lib/boardGameEngine.ts:L1093-L1106](file:///F:/AppMaking/ViTudy/src/lib/boardGameEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `toggleTableCardTap` | `fn` | [src/lib/boardGameEngine.ts:L1111-L1124](file:///F:/AppMaking/ViTudy/src/lib/boardGameEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `TransferParams` | `type` | [src/lib/boardGameEngine.ts:L17-L22](file:///F:/AppMaking/ViTudy/src/lib/boardGameEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `TransferResult` | `type` | [src/lib/boardGameEngine.ts:L24-L28](file:///F:/AppMaking/ViTudy/src/lib/boardGameEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `undoMatchMove` | `fn` | [src/lib/boardGameEngine.ts:L331-L358](file:///F:/AppMaking/ViTudy/src/lib/boardGameEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `upgradeHouse` | `fn` | [src/lib/boardGameEngine.ts:L743-L786](file:///F:/AppMaking/ViTudy/src/lib/boardGameEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `verifyLedgerIntegrity` | `fn` | [src/lib/boardGameEngine.ts:L56-L71](file:///F:/AppMaking/ViTudy/src/lib/boardGameEngine.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `VIETNAM_TIMEZONE` | `component` | [src/lib/dateVN.ts:L1-L1](file:///F:/AppMaking/ViTudy/src/lib/dateVN.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `ViewportTransform` | `type` | [src/lib/viewportCulling.ts:L9-L15](file:///F:/AppMaking/ViTudy/src/lib/viewportCulling.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |
| `worldToItemLocal` | `fn` | [src/utils/strokeSegmentation.ts:L65-L75](file:///F:/AppMaking/ViTudy/src/utils/strokeSegmentation.ts) | Thành phần nghiệp vụ của phân hệ Non-AI Engine & Utils |

### Types & Data

| Ký hiệu (Symbol) | Loại (Kind) | Vị trí (File:Lines) | Vai trò chức năng |
|---|---|---|---|
| `AboutPage` | `component` | [src/app/about/page.tsx:L10-L179](file:///F:/AppMaking/ViTudy/src/app/about/page.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `AccountSettings` | `component` | [src/components/profile/AccountSettings.tsx:L30-L467](file:///F:/AppMaking/ViTudy/src/components/profile/AccountSettings.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ActiveToolType` | `type` | [src/types/studyspace.ts:L148-L157](file:///F:/AppMaking/ViTudy/src/types/studyspace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `AiConfig` | `type` | [src/types/vitoken.ts:L21-L27](file:///F:/AppMaking/ViTudy/src/types/vitoken.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `AiProvider` | `type` | [src/types/vitoken.ts:L19-L19](file:///F:/AppMaking/ViTudy/src/types/vitoken.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ArtboardImageLayer` | `type` | [src/types/boardgame.ts:L41-L50](file:///F:/AppMaking/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ArtboardStroke` | `type` | [src/types/boardgame.ts:L32-L39](file:///F:/AppMaking/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `AuthCallbackPage` | `component` | [src/app/auth/callback/page.tsx:L8-L98](file:///F:/AppMaking/ViTudy/src/app/auth/callback/page.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `AuthForm` | `component` | [src/components/auth/AuthForm.tsx:L16-L258](file:///F:/AppMaking/ViTudy/src/components/auth/AuthForm.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `AuthPage` | `component` | [src/app/auth/page.tsx:L11-L135](file:///F:/AppMaking/ViTudy/src/app/auth/page.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `BankConfig` | `type` | [src/services/PaymentService.ts:L45-L49](file:///F:/AppMaking/ViTudy/src/services/PaymentService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `BankTransactionLog` | `type` | [src/types/boardgame.ts:L304-L312](file:///F:/AppMaking/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `BOARD_GAMES_KEY` | `component` | [src/services/GameCabinetStorage.ts:L5-L5](file:///F:/AppMaking/ViTudy/src/services/GameCabinetStorage.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `BOARD_SHAPE_OPTIONS` | `component` | [src/types/boardgame.ts:L150-L159](file:///F:/AppMaking/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `BoardGameEventType` | `type` | [src/hooks/useRealtimeMultiplayer.ts:L7-L18](file:///F:/AppMaking/ViTudy/src/hooks/useRealtimeMultiplayer.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `BoardGameMatchState` | `type` | [src/types/boardgame.ts:L335-L363](file:///F:/AppMaking/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `BoardGamePackage` | `type` | [src/types/boardgame.ts:L365-L395](file:///F:/AppMaking/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `BoardGameRealtimeEvent` | `type` | [src/hooks/useRealtimeMultiplayer.ts:L20-L29](file:///F:/AppMaking/ViTudy/src/hooks/useRealtimeMultiplayer.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `BoardGameTemplateId` | `type` | [src/types/boardgame.ts:L96-L102](file:///F:/AppMaking/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `BoardMapLayoutMode` | `type` | [src/types/boardgame.ts:L88-L94](file:///F:/AppMaking/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `BoardRuleMode` | `type` | [src/types/boardgame.ts:L86-L86](file:///F:/AppMaking/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `BoardShape` | `type` | [src/types/boardgame.ts:L140-L148](file:///F:/AppMaking/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `BoardTile` | `type` | [src/types/boardgame.ts:L196-L229](file:///F:/AppMaking/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `BoardTileRole` | `type` | [src/types/boardgame.ts:L73-L84](file:///F:/AppMaking/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `breakAmountIntoVndNotes` | `fn` | [src/types/boardgame.ts:L447-L459](file:///F:/AppMaking/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `buildVietQrUrl` | `fn` | [src/services/PaymentService.ts:L59-L72](file:///F:/AppMaking/ViTudy/src/services/PaymentService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `calculateBalanceTotal` | `fn` | [src/types/boardgame.ts:L437-L442](file:///F:/AppMaking/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `canEmitGameEvent` | `fn` | [src/hooks/useRealtimeMultiplayer.ts:L31-L39](file:///F:/AppMaking/ViTudy/src/hooks/useRealtimeMultiplayer.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `CanvasTransform` | `type` | [src/types/studyspace.ts:L171-L176](file:///F:/AppMaking/ViTudy/src/types/studyspace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `compressImageDataUrl` | `fn` | [src/services/GameCabinetStorage.ts:L25-L69](file:///F:/AppMaking/ViTudy/src/services/GameCabinetStorage.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `createBoardGameFromTemplate` | `fn` | [src/types/boardgame.ts:L868-L1084](file:///F:/AppMaking/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `createDefaultBoardGamePackage` | `fn` | [src/types/boardgame.ts:L792-L863](file:///F:/AppMaking/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `createDemoStudySpace` | `fn` | [src/data/demoSpace.ts:L3-L97](file:///F:/AppMaking/ViTudy/src/data/demoSpace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `createEmptyBalance` | `fn` | [src/types/boardgame.ts:L409-L421](file:///F:/AppMaking/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `createStarterVndBalance` | `fn` | [src/types/boardgame.ts:L423-L435](file:///F:/AppMaking/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `CurrencyNoteDesign` | `type` | [src/types/boardgame.ts:L12-L18](file:///F:/AppMaking/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `DashboardPage` | `component` | [src/app/dashboard/page.tsx:L14-L162](file:///F:/AppMaking/ViTudy/src/app/dashboard/page.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `Database` | `type` | [src/types/database.types.ts:L9-L458](file:///F:/AppMaking/ViTudy/src/types/database.types.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `DayStudyTime` | `type` | [src/services/StatsService.ts:L4-L8](file:///F:/AppMaking/ViTudy/src/services/StatsService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `DbListingRow` | `type` | [src/services/KnowInheritService.ts:L4-L18](file:///F:/AppMaking/ViTudy/src/services/KnowInheritService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `DEFAULT_BANK_CONFIG` | `component` | [src/services/PaymentService.ts:L39-L43](file:///F:/AppMaking/ViTudy/src/services/PaymentService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `DEFAULT_VND_CURRENCIES` | `component` | [src/types/boardgame.ts:L20-L30](file:///F:/AppMaking/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `DeleteAccount` | `component` | [src/components/profile/DeleteAccount.tsx:L24-L270](file:///F:/AppMaking/ViTudy/src/components/profile/DeleteAccount.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `DeskItem` | `type` | [src/types/studyspace.ts:L77-L120](file:///F:/AppMaking/ViTudy/src/types/studyspace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `deskItemToRow` | `fn` | [src/services/StudySpaceService.ts:L30-L77](file:///F:/AppMaking/ViTudy/src/services/StudySpaceService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `DRAWING_ASSETS_KEY` | `component` | [src/services/GameCabinetStorage.ts:L4-L4](file:///F:/AppMaking/ViTudy/src/services/GameCabinetStorage.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `DrawingStroke` | `type` | [src/types/studyspace.ts:L159-L169](file:///F:/AppMaking/ViTudy/src/types/studyspace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `EMOJI_CATEGORIES` | `component` | [src/data/stickersAndEmojis.ts:L65-L412](file:///F:/AppMaking/ViTudy/src/data/stickersAndEmojis.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `EmojiCategory` | `type` | [src/data/stickersAndEmojis.ts:L13-L18](file:///F:/AppMaking/ViTudy/src/data/stickersAndEmojis.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `EmptyState` | `component` | [src/components/common/EmptyState.tsx:L17-L48](file:///F:/AppMaking/ViTudy/src/components/common/EmptyState.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ensureUUID` | `fn` | [src/services/StudySpaceService.ts:L11-L28](file:///F:/AppMaking/ViTudy/src/services/StudySpaceService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ExamAttemptPayload` | `type` | [src/services/ActivityService.ts:L3-L8](file:///F:/AppMaking/ViTudy/src/services/ActivityService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ExamQuestion` | `type` | [src/types/studyspace.ts:L57-L64](file:///F:/AppMaking/ViTudy/src/types/studyspace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ExamSheetData` | `type` | [src/types/studyspace.ts:L66-L75](file:///F:/AppMaking/ViTudy/src/types/studyspace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ExamStats` | `type` | [src/services/StatsService.ts:L10-L13](file:///F:/AppMaking/ViTudy/src/services/StatsService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `extractJsonArray` | `fn` | [src/services/BoardGameAiService.ts:L33-L44](file:///F:/AppMaking/ViTudy/src/services/BoardGameAiService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `FALLBACK_PACKAGES` | `component` | [src/services/PaymentService.ts:L74-L79](file:///F:/AppMaking/ViTudy/src/services/PaymentService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `FaqPage` | `component` | [src/app/faq/page.tsx:L705-L717](file:///F:/AppMaking/ViTudy/src/app/faq/page.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `FeatureGrid` | `component` | [src/components/landing/FeatureGrid.tsx:L75-L160](file:///F:/AppMaking/ViTudy/src/components/landing/FeatureGrid.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `fetchModelViTokenCost` | `fn` | [src/services/BoardGameAiService.ts:L170-L184](file:///F:/AppMaking/ViTudy/src/services/BoardGameAiService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `FlashcardReview` | `type` | [src/services/FlashcardService.ts:L4-L16](file:///F:/AppMaking/ViTudy/src/services/FlashcardService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `GameCabinetStorage` | `component` | [src/services/GameCabinetStorage.ts:L158-L247](file:///F:/AppMaking/ViTudy/src/services/GameCabinetStorage.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `GameCardDeck` | `type` | [src/types/boardgame.ts:L274-L284](file:///F:/AppMaking/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `GameCardEffect` | `type` | [src/types/boardgame.ts:L245-L248](file:///F:/AppMaking/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `GameCardItem` | `type` | [src/types/boardgame.ts:L250-L260](file:///F:/AppMaking/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `GameLinkType` | `type` | [src/types/boardgame.ts:L231-L236](file:///F:/AppMaking/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `GameNodeLink` | `type` | [src/types/boardgame.ts:L238-L243](file:///F:/AppMaking/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `GamePawn` | `type` | [src/types/boardgame.ts:L286-L302](file:///F:/AppMaking/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `GamePenTool` | `type` | [src/types/boardgame.ts:L397-L407](file:///F:/AppMaking/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `GameTriggerRule` | `type` | [src/types/boardgame.ts:L112-L128](file:///F:/AppMaking/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `GENERAL_URL_GUIDE_STEPS` | `component` | [src/services/UrlDocumentService.ts:L27-L31](file:///F:/AppMaking/ViTudy/src/services/UrlDocumentService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `generateBoardDeckWithAi` | `fn` | [src/services/BoardGameAiService.ts:L186-L287](file:///F:/AppMaking/ViTudy/src/services/BoardGameAiService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `generateCardHash` | `fn` | [src/services/FlashcardService.ts:L18-L27](file:///F:/AppMaking/ViTudy/src/services/FlashcardService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `generateMapTiles` | `fn` | [src/types/boardgame.ts:L470-L790](file:///F:/AppMaking/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `generateTilesContentWithAi` | `fn` | [src/services/BoardGameAiService.ts:L289-L382](file:///F:/AppMaking/ViTudy/src/services/BoardGameAiService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `generateUniversalGamePackWithAi` | `fn` | [src/services/BoardGameAiService.ts:L422-L582](file:///F:/AppMaking/ViTudy/src/services/BoardGameAiService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `getBoardShapeClipPath` | `fn` | [src/types/boardgame.ts:L161-L176](file:///F:/AppMaking/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `getEffectiveBankConfig` | `fn` | [src/services/PaymentService.ts:L51-L53](file:///F:/AppMaking/ViTudy/src/services/PaymentService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `getPurchasedItemIds` | `fn` | [src/services/MarketPurchaseStorage.ts:L8-L21](file:///F:/AppMaking/ViTudy/src/services/MarketPurchaseStorage.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `GOOGLE_SHARE_GUIDE_STEPS` | `component` | [src/services/UrlDocumentService.ts:L19-L25](file:///F:/AppMaking/ViTudy/src/services/UrlDocumentService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `GuestBanner` | `component` | [src/components/auth/GuestBanner.tsx:L12-L54](file:///F:/AppMaking/ViTudy/src/components/auth/GuestBanner.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `HeroSection` | `component` | [src/components/landing/HeroSection.tsx:L52-L238](file:///F:/AppMaking/ViTudy/src/components/landing/HeroSection.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `HomePage` | `component` | [src/components/home/HomePage.tsx:L53-L1167](file:///F:/AppMaking/ViTudy/src/components/home/HomePage.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `importDocumentFromUrl` | `fn` | [src/services/UrlDocumentService.ts:L154-L237](file:///F:/AppMaking/ViTudy/src/services/UrlDocumentService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `INITIAL_MARKET_ITEMS` | `component` | [src/data/marketMockData.ts:L25-L1125](file:///F:/AppMaking/ViTudy/src/data/marketMockData.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `INITIAL_SPACES` | `component` | [src/data/mockSpaces.ts:L3-L332](file:///F:/AppMaking/ViTudy/src/data/mockSpaces.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `IntelineThread` | `type` | [src/types/studyspace.ts:L122-L132](file:///F:/AppMaking/ViTudy/src/types/studyspace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `isBinaryOrCorrupted` | `fn` | [src/services/OfficeParserService.ts:L35-L64](file:///F:/AppMaking/ViTudy/src/services/OfficeParserService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ItemType` | `type` | [src/types/studyspace.ts:L3-L15](file:///F:/AppMaking/ViTudy/src/types/studyspace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `Json` | `type` | [src/types/database.types.ts:L1-L7](file:///F:/AppMaking/ViTudy/src/types/database.types.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `KnowInheritService` | `component` | [src/services/KnowInheritService.ts:L78-L158](file:///F:/AppMaking/ViTudy/src/services/KnowInheritService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ListingReview` | `type` | [src/services/MarketService.ts:L4-L12](file:///F:/AppMaking/ViTudy/src/services/MarketService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `mapDbRowToMarketItem` | `fn` | [src/services/KnowInheritService.ts:L48-L76](file:///F:/AppMaking/ViTudy/src/services/KnowInheritService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `MarketItem` | `type` | [src/data/marketMockData.ts:L3-L23](file:///F:/AppMaking/ViTudy/src/data/marketMockData.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `MarketPage` | `component` | [src/app/market/page.tsx:L35-L870](file:///F:/AppMaking/ViTudy/src/app/market/page.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `MatchSnapshot` | `type` | [src/types/boardgame.ts:L314-L333](file:///F:/AppMaking/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `MathRenderer` | `component` | [src/components/common/MathRenderer.tsx:L99-L245](file:///F:/AppMaking/ViTudy/src/components/common/MathRenderer.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `metadata` | `const` | [src/app/layout.tsx:L30-L41](file:///F:/AppMaking/ViTudy/src/app/layout.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `MigrationDialog` | `component` | [src/components/auth/MigrationDialog.tsx:L10-L110](file:///F:/AppMaking/ViTudy/src/components/auth/MigrationDialog.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `MigrationResult` | `type` | [src/services/SyncService.ts:L11-L15](file:///F:/AppMaking/ViTudy/src/services/SyncService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `OAuthButtons` | `component` | [src/components/auth/OAuthButtons.tsx:L10-L64](file:///F:/AppMaking/ViTudy/src/components/auth/OAuthButtons.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `OfflineOp` | `type` | [src/services/OfflineQueue.ts:L4-L10](file:///F:/AppMaking/ViTudy/src/services/OfflineQueue.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `OnboardingTour` | `component` | [src/components/onboarding/OnboardingTour.tsx:L55-L150](file:///F:/AppMaking/ViTudy/src/components/onboarding/OnboardingTour.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PageContent` | `type` | [src/types/studyspace.ts:L43-L55](file:///F:/AppMaking/ViTudy/src/types/studyspace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `parseDocxFile` | `fn` | [src/services/OfficeParserService.ts:L266-L303](file:///F:/AppMaking/ViTudy/src/services/OfficeParserService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ParsedPage` | `type` | [src/services/PdfParserService.ts:L5-L11](file:///F:/AppMaking/ViTudy/src/services/PdfParserService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `parsePdfFile` | `fn` | [src/services/PdfParserService.ts:L17-L94](file:///F:/AppMaking/ViTudy/src/services/PdfParserService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `parsePptxFile` | `fn` | [src/services/OfficeParserService.ts:L454-L457](file:///F:/AppMaking/ViTudy/src/services/OfficeParserService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `parsePptxPresentation` | `fn` | [src/services/OfficeParserService.ts:L367-L449](file:///F:/AppMaking/ViTudy/src/services/OfficeParserService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `parseSpreadsheetFile` | `fn` | [src/services/OfficeParserService.ts:L308-L362](file:///F:/AppMaking/ViTudy/src/services/OfficeParserService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `parseUploadedDocumentFile` | `fn` | [src/services/OfficeParserService.ts:L501-L553](file:///F:/AppMaking/ViTudy/src/services/OfficeParserService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `parseUploadedDocumentResult` | `fn` | [src/services/OfficeParserService.ts:L462-L495](file:///F:/AppMaking/ViTudy/src/services/OfficeParserService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PaymentHistory` | `component` | [src/components/payment/PaymentHistory.tsx:L53-L403](file:///F:/AppMaking/ViTudy/src/components/payment/PaymentHistory.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PaymentHistoryItem` | `type` | [src/services/PaymentService.ts:L20-L28](file:///F:/AppMaking/ViTudy/src/services/PaymentService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PaymentPackage` | `type` | [src/services/PaymentService.ts:L3-L9](file:///F:/AppMaking/ViTudy/src/services/PaymentService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PaymentRequestResult` | `type` | [src/services/PaymentService.ts:L11-L18](file:///F:/AppMaking/ViTudy/src/services/PaymentService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PaymentSuccess` | `component` | [src/components/payment/PaymentSuccess.tsx:L15-L90](file:///F:/AppMaking/ViTudy/src/components/payment/PaymentSuccess.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PeerUser` | `type` | [src/hooks/useRealtimeMultiplayer.ts:L70-L80](file:///F:/AppMaking/ViTudy/src/hooks/useRealtimeMultiplayer.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PomodoroPhase` | `type` | [src/hooks/usePomodoro.ts:L5-L5](file:///F:/AppMaking/ViTudy/src/hooks/usePomodoro.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PresentationData` | `type` | [src/types/studyspace.ts:L37-L41](file:///F:/AppMaking/ViTudy/src/types/studyspace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PresentationSlide` | `type` | [src/types/studyspace.ts:L28-L35](file:///F:/AppMaking/ViTudy/src/types/studyspace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PricingSection` | `component` | [src/components/landing/PricingSection.tsx:L84-L180](file:///F:/AppMaking/ViTudy/src/components/landing/PricingSection.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PricingTiers` | `component` | [src/components/payment/PricingTiers.tsx:L21-L122](file:///F:/AppMaking/ViTudy/src/components/payment/PricingTiers.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PrivacyPage` | `component` | [src/app/privacy/page.tsx:L8-L98](file:///F:/AppMaking/ViTudy/src/app/privacy/page.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ProfileHeader` | `component` | [src/components/profile/ProfileHeader.tsx:L14-L163](file:///F:/AppMaking/ViTudy/src/components/profile/ProfileHeader.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ProfilePage` | `component` | [src/app/profile/page.tsx:L190-L196](file:///F:/AppMaking/ViTudy/src/app/profile/page.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `PropertyDetails` | `type` | [src/types/boardgame.ts:L130-L138](file:///F:/AppMaking/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `QRCodeDisplay` | `component` | [src/components/payment/QRCodeDisplay.tsx:L30-L331](file:///F:/AppMaking/ViTudy/src/components/payment/QRCodeDisplay.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `recordPurchasedItemId` | `fn` | [src/services/MarketPurchaseStorage.ts:L26-L39](file:///F:/AppMaking/ViTudy/src/services/MarketPurchaseStorage.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ResetPasswordPage` | `component` | [src/app/auth/reset/page.tsx:L10-L176](file:///F:/AppMaking/ViTudy/src/app/auth/reset/page.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ResolvedDocumentUrl` | `type` | [src/services/UrlDocumentService.ts:L33-L39](file:///F:/AppMaking/ViTudy/src/services/UrlDocumentService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `resolveImportableUrl` | `fn` | [src/services/UrlDocumentService.ts:L41-L119](file:///F:/AppMaking/ViTudy/src/services/UrlDocumentService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `resolveRoomGameAction` | `fn` | [src/hooks/useRealtimeMultiplayer.ts:L54-L68](file:///F:/AppMaking/ViTudy/src/hooks/useRealtimeMultiplayer.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ResourceDefinition` | `type` | [src/types/boardgame.ts:L104-L110](file:///F:/AppMaking/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `RoomActionResolution` | `type` | [src/hooks/useRealtimeMultiplayer.ts:L41-L45](file:///F:/AppMaking/ViTudy/src/hooks/useRealtimeMultiplayer.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `RootLayout` | `component` | [src/app/layout.tsx:L43-L78](file:///F:/AppMaking/ViTudy/src/app/layout.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `RotateTwoWay` | `component` | [src/components/icons/RotateTwoWay.tsx:L11-L29](file:///F:/AppMaking/ViTudy/src/components/icons/RotateTwoWay.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `rowToDeskItem` | `fn` | [src/services/StudySpaceService.ts:L79-L120](file:///F:/AppMaking/ViTudy/src/services/StudySpaceService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `sanitizeDocumentText` | `fn` | [src/services/OfficeParserService.ts:L20-L30](file:///F:/AppMaking/ViTudy/src/services/OfficeParserService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `SavedDrawingAsset` | `type` | [src/types/boardgame.ts:L52-L63](file:///F:/AppMaking/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `saveEffectiveBankConfig` | `fn` | [src/services/PaymentService.ts:L55-L57](file:///F:/AppMaking/ViTudy/src/services/PaymentService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `SiteFooter` | `component` | [src/components/common/SiteFooter.tsx:L19-L82](file:///F:/AppMaking/ViTudy/src/components/common/SiteFooter.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `SKIN_TONES` | `component` | [src/data/stickersAndEmojis.ts:L42-L49](file:///F:/AppMaking/ViTudy/src/data/stickersAndEmojis.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `SpreadsheetData` | `type` | [src/types/studyspace.ts:L22-L26](file:///F:/AppMaking/ViTudy/src/types/studyspace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `SpreadsheetSheet` | `type` | [src/types/studyspace.ts:L17-L20](file:///F:/AppMaking/ViTudy/src/types/studyspace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `STICKER_CATEGORIES` | `component` | [src/data/stickersAndEmojis.ts:L417-L689](file:///F:/AppMaking/ViTudy/src/data/stickersAndEmojis.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `StickerCategory` | `type` | [src/data/stickersAndEmojis.ts:L20-L25](file:///F:/AppMaking/ViTudy/src/data/stickersAndEmojis.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `StickerPickerItem` | `type` | [src/data/stickersAndEmojis.ts:L1-L11](file:///F:/AppMaking/ViTudy/src/data/stickersAndEmojis.ts) | Thành phần nghiệp vụ của phân hệ HUD & Overlays |
| `StorageSaveResult` | `type` | [src/services/GameCabinetStorage.ts:L152-L156](file:///F:/AppMaking/ViTudy/src/services/GameCabinetStorage.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `StreakCalendar` | `component` | [src/components/dashboard/StreakCalendar.tsx:L19-L114](file:///F:/AppMaking/ViTudy/src/components/dashboard/StreakCalendar.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `StudySpace` | `type` | [src/types/studyspace.ts:L134-L146](file:///F:/AppMaking/ViTudy/src/types/studyspace.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `StudySpacePage` | `component` | [src/app/page.tsx:L128-L134](file:///F:/AppMaking/ViTudy/src/app/page.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `StudyStats` | `component` | [src/components/dashboard/StudyStats.tsx:L14-L189](file:///F:/AppMaking/ViTudy/src/components/dashboard/StudyStats.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `TableCardInstance` | `type` | [src/types/boardgame.ts:L262-L272](file:///F:/AppMaking/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `TermsPage` | `component` | [src/app/terms/page.tsx:L8-L84](file:///F:/AppMaking/ViTudy/src/app/terms/page.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `TileCustomField` | `type` | [src/types/boardgame.ts:L178-L184](file:///F:/AppMaking/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `TileFormTemplate` | `type` | [src/types/boardgame.ts:L65-L71](file:///F:/AppMaking/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `TileTemplatePreset` | `type` | [src/types/boardgame.ts:L186-L194](file:///F:/AppMaking/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `TokenHistory` | `component` | [src/components/dashboard/TokenHistory.tsx:L12-L84](file:///F:/AppMaking/ViTudy/src/components/dashboard/TokenHistory.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `TopUpModal` | `component` | [src/components/payment/TopUpModal.tsx:L34-L346](file:///F:/AppMaking/ViTudy/src/components/payment/TopUpModal.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `toTwemojiUrl` | `fn` | [src/data/stickersAndEmojis.ts:L30-L40](file:///F:/AppMaking/ViTudy/src/data/stickersAndEmojis.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `TourStep` | `component` | [src/components/onboarding/TourStep.tsx:L19-L66](file:///F:/AppMaking/ViTudy/src/components/onboarding/TourStep.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `TourStepConfig` | `type` | [src/components/onboarding/TourStep.tsx:L4-L9](file:///F:/AppMaking/ViTudy/src/components/onboarding/TourStep.tsx) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `TransactionType` | `type` | [src/types/vitoken.ts:L1-L8](file:///F:/AppMaking/ViTudy/src/types/vitoken.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `UniversalAiGameSpec` | `type` | [src/services/BoardGameAiService.ts:L384-L392](file:///F:/AppMaking/ViTudy/src/services/BoardGameAiService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `UploadedParseResult` | `type` | [src/services/OfficeParserService.ts:L8-L11](file:///F:/AppMaking/ViTudy/src/services/OfficeParserService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `UrlImportResult` | `type` | [src/services/UrlDocumentService.ts:L3-L7](file:///F:/AppMaking/ViTudy/src/services/UrlDocumentService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `useDeskItemInteraction` | `hook` | [src/hooks/useDeskItemInteraction.ts:L16-L180](file:///F:/AppMaking/ViTudy/src/hooks/useDeskItemInteraction.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `useDiscordActivity` | `hook` | [src/hooks/useDiscordActivity.ts:L22-L114](file:///F:/AppMaking/ViTudy/src/hooks/useDiscordActivity.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `UseDiscordActivityResult` | `type` | [src/hooks/useDiscordActivity.ts:L8-L20](file:///F:/AppMaking/ViTudy/src/hooks/useDiscordActivity.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `usePaymentStatus` | `hook` | [src/hooks/usePaymentStatus.ts:L14-L167](file:///F:/AppMaking/ViTudy/src/hooks/usePaymentStatus.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `UsePaymentStatusResult` | `type` | [src/hooks/usePaymentStatus.ts:L7-L12](file:///F:/AppMaking/ViTudy/src/hooks/usePaymentStatus.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `usePomodoro` | `hook` | [src/hooks/usePomodoro.ts:L23-L83](file:///F:/AppMaking/ViTudy/src/hooks/usePomodoro.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `UsePomodoroOptions` | `type` | [src/hooks/usePomodoro.ts:L7-L11](file:///F:/AppMaking/ViTudy/src/hooks/usePomodoro.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `UsePomodoroResult` | `type` | [src/hooks/usePomodoro.ts:L13-L21](file:///F:/AppMaking/ViTudy/src/hooks/usePomodoro.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `useRealtimeMultiplayer` | `hook` | [src/hooks/useRealtimeMultiplayer.ts:L87-L350](file:///F:/AppMaking/ViTudy/src/hooks/useRealtimeMultiplayer.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `validateAiDeckCards` | `fn` | [src/services/BoardGameAiService.ts:L46-L107](file:///F:/AppMaking/ViTudy/src/services/BoardGameAiService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `validateAiTileItems` | `fn` | [src/services/BoardGameAiService.ts:L109-L168](file:///F:/AppMaking/ViTudy/src/services/BoardGameAiService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ValidatedAiDeckCard` | `type` | [src/services/BoardGameAiService.ts:L13-L18](file:///F:/AppMaking/ViTudy/src/services/BoardGameAiService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ValidatedAiTileItem` | `type` | [src/services/BoardGameAiService.ts:L20-L26](file:///F:/AppMaking/ViTudy/src/services/BoardGameAiService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `VietQrParams` | `type` | [src/services/PaymentService.ts:L30-L36](file:///F:/AppMaking/ViTudy/src/services/PaymentService.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ViTokenTransaction` | `type` | [src/types/vitoken.ts:L10-L17](file:///F:/AppMaking/ViTudy/src/types/vitoken.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `ViTokenWallet` | `type` | [src/types/vitoken.ts:L29-L34](file:///F:/AppMaking/ViTudy/src/types/vitoken.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |
| `VndDenomination` | `type` | [src/types/boardgame.ts:L1-L10](file:///F:/AppMaking/ViTudy/src/types/boardgame.ts) | Thành phần nghiệp vụ của phân hệ Types & Data |

