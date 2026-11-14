'use client';

import React from 'react';
import { BoardTile, GameCardDeck, GamePawn, getBoardShapeClipPath } from '@/types/boardgame';
import { Home, Landmark, Layers, Link2, Sparkles, Trash2 } from 'lucide-react';

interface TileViewProps {
  tile: BoardTile;
  deck?: GameCardDeck;
  deedOwnerPawn?: GamePawn;
  isEditMode: boolean;
  isConnectSource: boolean;
  isTriggeredInfo: boolean;
  canConnect: boolean;
  onTileClick: (e: React.MouseEvent, tile: BoardTile) => void;
  onDeleteTile: (tileId: string) => void;
  onTriggerDrawDeck: (tile: BoardTile) => void;
  onOpenBank: () => void;
}

export const TileView = React.memo(function TileView({
  tile,
  deck,
  deedOwnerPawn,
  isEditMode,
  isConnectSource,
  isTriggeredInfo,
  canConnect,
  onTileClick,
  onDeleteTile,
  onTriggerDrawDeck,
  onOpenBank,
}: TileViewProps) {
  if (tile.role === 'dice_drop_zone') return null;

  if (tile.role === 'bank_zone') {
    return (
      <div
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onOpenBank();
        }}
        style={{
          position: 'absolute',
          left: tile.relX,
          top: tile.relY,
          width: tile.width,
          height: tile.height,
        }}
        className="interactive-control rounded-2xl bg-white border-2 border-slate-300 hover:border-[#E0562D] shadow-lg p-3 flex flex-col justify-between cursor-pointer group transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FFF7ED] text-[#E0562D] flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900">{tile.title || 'NGÂN HÀNG'}</div>
              <div className="text-[10px] text-slate-500">Quản lý tiền tệ & trả thưởng</div>
            </div>
          </div>
          {isEditMode && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteTile(tile.id);
              }}
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="text-[11px] font-bold text-[#E0562D] group-hover:underline">
          Mở quầy Ngân hàng →
        </div>
      </div>
    );
  }

  if (tile.role === 'external_info') {
    const visible = isEditMode || isTriggeredInfo;
    return (
      <div
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => onTileClick(e, tile)}
        style={{
          position: 'absolute',
          left: tile.relX,
          top: tile.relY,
          width: tile.width,
          height: tile.height,
          opacity: visible ? 1 : 0.12,
        }}
        className={`interactive-control rounded-xl bg-white border-2 p-2.5 shadow-md flex flex-col justify-between transition-all cursor-pointer group ${
          isTriggeredInfo ? 'border-[#E0562D] ring-4 ring-[#E0562D]/20 scale-[1.02]' : 'border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11px] font-black text-slate-900 truncate">
            {tile.title || 'Thông tin đất'}
          </span>
          {isEditMode && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteTile(tile.id);
              }}
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
        <div className="text-[10px] text-slate-600 space-y-0.5 leading-tight">
          {tile.propertyDetails ? (
            <>
              <div>
                Thuê gốc: <b>{tile.propertyDetails.baseRent.toLocaleString('vi-VN')}đ</b>
              </div>
              <div>
                Nâng nhà: <b>{tile.propertyDetails.houseCost.toLocaleString('vi-VN')}đ</b>
              </div>
              <div>
                Bán lại: <b>{tile.propertyDetails.resellValue.toLocaleString('vi-VN')}đ</b>
              </div>
            </>
          ) : (
            <div className="text-slate-400 italic">Ấn để chỉnh thông tin / giá thuê</div>
          )}
        </div>
        <div className="text-[9px] font-bold text-[#E0562D]">
          {isTriggeredInfo ? 'Đang kích hoạt!' : 'Ô ngoài Map'}
        </div>
      </div>
    );
  }

  const isDrawTile = tile.role === 'draw_card_tile';
  const isCardZone = tile.role === 'card_zone';
  const isTrackNode = tile.role === 'track_node';
  const headerBg = tile.form?.headerBgColor || (isDrawTile ? '#9333ea' : '#E0562D');
  const houses = tile.propertyDetails?.currentHouses || 0;
  const isMortgaged = Boolean(tile.propertyDetails?.isMortgaged);

  const clip = getBoardShapeClipPath(tile.shape);
  const shapeStyle: React.CSSProperties = clip ? { clipPath: clip } : {};
  const shapeClass =
    tile.shape === 'circle'
      ? 'rounded-full'
      : clip
      ? 'rounded-none'
      : 'rounded-lg';

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        if (isDrawTile && !isEditMode) {
          e.stopPropagation();
          onTriggerDrawDeck(tile);
          return;
        }
        onTileClick(e, tile);
      }}
      style={{
        position: 'absolute',
        left: tile.relX,
        top: tile.relY,
        width: tile.width,
        height: tile.height,
        ...shapeStyle,
      }}
      className={`interactive-control ${shapeClass} bg-white overflow-hidden flex flex-col justify-between transition-all cursor-pointer group ${
        tile.form?.borderStyle === 'dashed' ? 'border border-dashed' : 'border'
      } ${
        isConnectSource
          ? 'border-[#E0562D] ring-2 ring-[#E0562D]'
          : isMortgaged
          ? 'border-amber-400 opacity-80'
          : 'border-slate-300 hover:border-[#E0562D]'
      }`}
    >
      {tile.form?.hasHeader !== false && (
        <div
          style={{ backgroundColor: headerBg }}
          className="px-1 py-0.5 text-[9px] font-extrabold text-white truncate text-center shrink-0 flex items-center justify-between gap-0.5"
        >
          <span className="truncate flex-1">{tile.title || 'Ô cờ'}</span>
          {houses > 0 && (
            <span className="inline-flex items-center gap-0.5 px-1 rounded bg-black/25 text-[8px]">
              <Home className="w-2.5 h-2.5" />
              {houses}
            </span>
          )}
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-1 overflow-hidden relative">
        {tile.imageUrl ? (
          <img
            src={tile.imageUrl}
            alt={tile.title || ''}
            className="w-full h-full object-cover rounded-xs"
          />
        ) : isDrawTile ? (
          <div className="flex flex-col items-center text-purple-600">
            <Layers className="w-4 h-4" />
            <span className="text-[8px] font-bold mt-0.5 truncate max-w-full">
              {deck?.name || 'Rút bài'}
            </span>
          </div>
        ) : tile.role === 'start_tile' ? (
          <span className="text-[9px] font-black text-emerald-600">XUẤT PHÁT</span>
        ) : tile.role === 'jail_tile' ? (
          <span className="text-[9px] font-black text-rose-600">Ô TÙ</span>
        ) : tile.role === 'penalty_tile' ? (
          <span className="text-[9px] font-black text-amber-700">NỘP PHẠT</span>
        ) : isCardZone ? (
          <span className="text-[10px] font-semibold text-slate-500 text-center px-2">
            {tile.content || 'Khu vực thẻ'}
          </span>
        ) : isTrackNode ? (
          <span className="text-[9px] font-bold text-slate-500">Nút</span>
        ) : (
          <>
            {tile.title && tile.form?.hasHeader === false && (
              <span className="text-[9px] font-bold text-slate-700 text-center px-1 truncate max-w-full">
                {tile.title}
              </span>
            )}
            {(tile.customFields || [])
              .filter((f) => f.showOnTile !== false && (f.label || f.value))
              .slice(0, 3)
              .map((f) => (
                <div
                  key={f.id}
                  className={
                    f.type === 'badge'
                      ? 'px-1 py-0.2 rounded bg-orange-50 border border-orange-200 text-[#E0562D] text-[8px] font-bold truncate max-w-full mt-0.5'
                      : 'text-[8px] text-slate-600 font-medium truncate max-w-full leading-tight'
                  }
                >
                  {f.label ? `${f.label}: ${f.value}` : f.value}
                </div>
              ))}
          </>
        )}

        {deedOwnerPawn && (
          <div
            title={`Chủ sở hữu: ${deedOwnerPawn.name}`}
            style={{ backgroundColor: deedOwnerPawn.color }}
            className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full border border-white shadow-xs"
          />
        )}

        {isMortgaged && (
          <span className="absolute bottom-0.5 left-0.5 px-1 rounded bg-amber-100 text-amber-800 text-[7px] font-bold">
            Thế chấp
          </span>
        )}

        {isEditMode && (
          <button
            type="button"
            title="Xóa ô và dọn liên kết"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteTile(tile.id);
            }}
            className="opacity-0 group-hover:opacity-100 absolute top-0.5 left-0.5 w-4 h-4 rounded bg-white/90 text-rose-600 flex items-center justify-center shadow-xs cursor-pointer"
          >
            <Trash2 className="w-2.5 h-2.5" />
          </button>
        )}

        {canConnect && (
          <span className="absolute inset-0 bg-[#E0562D]/15 flex items-center justify-center">
            <Link2 className="w-4 h-4 text-[#E0562D]" />
          </span>
        )}
      </div>

      {tile.form?.hasFooterPrice && tile.price ? (
        <div className="px-1 py-0.5 bg-slate-50 border-t border-slate-100 text-[8px] font-bold text-slate-700 text-center truncate shrink-0">
          {tile.price >= 1000 ? `${Math.round(tile.price / 1000)}k` : tile.price}
        </div>
      ) : tile.role === 'draw_card_tile' && !isEditMode ? (
        <div className="px-1 py-0.5 bg-purple-50 text-[8px] font-bold text-purple-700 text-center truncate shrink-0">
          <Sparkles className="w-2.5 h-2.5 inline mr-0.5" />
          Rút thẻ
        </div>
      ) : null}
    </div>
  );
});
