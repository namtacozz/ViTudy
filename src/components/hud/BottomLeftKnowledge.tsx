'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useStudySpace } from '@/context/StudySpaceContext';
import { 
  Upload, 
  Share2,
  Copy,
  Check,
  FileText, 
  X,
  AlertCircle,
  Database,
  Radio,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Users,
  Loader2,
  QrCode,
  RefreshCw,
  UserMinus,
  Clock,
  Send,
  Link2
} from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig, getSupabase } from '@/lib/supabase';
import { parseUploadedDocumentResult } from '@/services/OfficeParserService';
import { importDocumentFromUrl, UrlSharePermissionError } from '@/services/UrlDocumentService';
import type { PresentationData, SpreadsheetData } from '@/types/studyspace';
import { formatUploadedDocTitle } from '@/utils/documentNaming';
import { activateHostRoom } from '@/lib/multiplayerRoom';

interface PendingDocument {
  file: File;
  title: string;
  description: string;
  pages: { title?: string; text: string; image?: string }[];
  fileSize: string;
  fileType: string;
  spreadsheetData?: SpreadsheetData;
  presentationData?: PresentationData;
}

export function BottomLeftKnowledge() {
  const { addUploadedDocument, activeSpace, markSpaceShared, saveCurrentSpaceImmediately } = useStudySpace();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const [pendingDoc, setPendingDoc] = useState<PendingDocument | null>(null);
  const [isParsingDoc, setIsParsingDoc] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlTitleInput, setUrlTitleInput] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [urlError, setUrlError] = useState<{ message: string; guideSteps?: string[] } | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [roomPermission, setRoomPermission] = useState<'view_only' | 'edit'>('view_only');
  const [roomLinkExpiry, setRoomLinkExpiry] = useState<'24h' | '1h' | 'unlimited'>('24h');
  const [roomSalt, setRoomSalt] = useState('');
  const [showQrCode, setShowQrCode] = useState(false);
  const [peersInRoom, setPeersInRoom] = useState<{ id: string; name: string; avatarColor: string }[]>([]);

  // Khi mở modal chia sẻ hoặc tạo mã phòng mới: kích hoạt kênh phòng trên máy chủ bàn và đồng bộ công khai
  useEffect(() => {
    if (!isShareModalOpen || !activeSpace?.id) return;
    const roomId = roomSalt ? `${activeSpace.id}-${roomSalt}` : activeSpace.id;
    activateHostRoom(roomId);
    if (!activeSpace.isSharedGuest) {
      markSpaceShared(activeSpace.id);
      saveCurrentSpaceImmediately?.();
    }
  }, [isShareModalOpen, roomSalt, activeSpace?.id, activeSpace?.isSharedGuest, markSpaceShared, saveCurrentSpaceImmediately]);

  // Lắng nghe sự kiện mở modal mời và upload từ menu khác
  useEffect(() => {
    const handleOpenInvite = () => {
      setIsShareModalOpen(true);
    };
    const handleTriggerUpload = () => {
      fileInputRef.current?.click();
    };

    window.addEventListener('vitudy:open-invite-modal', handleOpenInvite);
    window.addEventListener('vitudy:open-share-modal', handleOpenInvite);
    window.addEventListener('vitudy:trigger-upload', handleTriggerUpload);
    return () => {
      window.removeEventListener('vitudy:open-invite-modal', handleOpenInvite);
      window.removeEventListener('vitudy:open-share-modal', handleOpenInvite);
      window.removeEventListener('vitudy:trigger-upload', handleTriggerUpload);
    };
  }, []);

  // Esc listener for ShareModal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isShareModalOpen) {
        setIsShareModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isShareModalOpen]);

  // ================= SUPABASE DATABASE & MULTIPLAYER STATE =================
  const [supabaseUrlInput, setSupabaseUrlInput] = useState('');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState('');
  const [isDbConfigOpen, setIsDbConfigOpen] = useState(false);
  const [dbSavedNotice, setDbSavedNotice] = useState(false);
  const [dbTestResult, setDbTestResult] = useState<{ status: 'idle' | 'testing' | 'success' | 'error'; message?: string }>({ status: 'idle' });
  const [supabaseConfigState, setSupabaseConfigState] = useState({ isConfigured: false, url: '', anonKey: '' });

  useEffect(() => {
    if (isShareModalOpen) {
      const cfg = getSupabaseConfig();
      setSupabaseConfigState(cfg);
      setSupabaseUrlInput(cfg.url);
      setSupabaseKeyInput(cfg.anonKey);
      setDbTestResult({ status: 'idle' });
    }
  }, [isShareModalOpen]);

  const handleTestDatabase = async () => {
    const url = supabaseUrlInput.trim().replace(/\/+$/, '');
    const key = supabaseKeyInput.trim();
    if (!url || !key) {
      setDbTestResult({ status: 'error', message: 'Vui lòng nhập đầy đủ Supabase URL và Anon Key.' });
      return;
    }
    setDbTestResult({ status: 'testing', message: 'Đang kiểm tra kết nối...' });
    try {
      const startTime = performance.now();
      const res = await fetch(`${url}/auth/v1/health`, {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      });
      const duration = Math.round(performance.now() - startTime);
      if (res.ok || res.status === 200) {
        setDbTestResult({ status: 'success', message: `Kết nối thành công! Phản hồi sau ${duration}ms.` });
      } else {
        setDbTestResult({ status: 'error', message: `Supabase trả về mã lỗi ${res.status}: ${res.statusText}` });
      }
    } catch (err: any) {
      setDbTestResult({ status: 'error', message: `Lỗi kết nối mạng: ${err.message}` });
    }
  };

  const handleSaveDb = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(supabaseUrlInput, supabaseKeyInput);
    setDbSavedNotice(true);
    setSupabaseConfigState(getSupabaseConfig());
    setTimeout(() => {
      setDbSavedNotice(false);
      setIsDbConfigOpen(false);
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }, 800);
  };

  const handleClearDb = () => {
    clearSupabaseConfig();
    setSupabaseUrlInput('');
    setSupabaseKeyInput('');
    setSupabaseConfigState(getSupabaseConfig());
    setDbTestResult({ status: 'idle' });
  };

  // Handle native file input selection (Real PDF & document extraction)
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const rawName = formatUploadedDocTitle(file.name, isImage);

    setIsParsingDoc(true);

    try {
      const parsed = await parseUploadedDocumentResult(file, rawName);

      setPendingDoc({
        file,
        title: rawName,
        description: '',
        pages: parsed.pages,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        fileType: file.name.split('.').pop()?.toUpperCase() || 'TỆP',
        spreadsheetData:
          parsed.kind === 'spreadsheet'
            ? { sheets: parsed.sheets, activeSheetIndex: 0 }
            : undefined,
        presentationData:
          parsed.kind === 'presentation'
            ? { slides: parsed.slides, currentSlideIndex: 0 }
            : undefined,
      });

      setIsConfirmModalOpen(true);
    } catch (err: any) {
      console.error('Lỗi nạp tệp:', err);
      alert(err?.message || 'Không thể trích xuất nội dung tệp. Vui lòng kiểm tra lại định dạng tài liệu.');
    } finally {
      setIsParsingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirmUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingDoc) return;

    const pages = pendingDoc.pages.map(p => ({
      ...p,
      title: p.title || pendingDoc.title
    }));

    addUploadedDocument(pendingDoc.title, pages, {
      spreadsheetData: pendingDoc.spreadsheetData,
      presentationData: pendingDoc.presentationData,
    });
    setIsConfirmModalOpen(false);
    setPendingDoc(null);
  };

  const handleImportFromUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || isFetchingUrl) return;
    setIsFetchingUrl(true);
    setUrlError(null);

    try {
      const result = await importDocumentFromUrl(urlInput, urlTitleInput);
      const { parsed, title, sourceUrl } = result;
      if (parsed.kind === 'spreadsheet') {
        addUploadedDocument(title, parsed.pages, {
          spreadsheetData: { sheets: parsed.sheets, activeSheetIndex: 0, sourceUrl },
        });
      } else if (parsed.kind === 'presentation') {
        addUploadedDocument(title, parsed.pages, {
          presentationData: { slides: parsed.slides, currentSlideIndex: 0, sourceUrl },
        });
      } else {
        addUploadedDocument(title, parsed.pages);
      }
      setIsUrlModalOpen(false);
      setUrlInput('');
      setUrlTitleInput('');
      setUrlError(null);
    } catch (err: any) {
      if (err instanceof UrlSharePermissionError) {
        setUrlError({ message: err.message, guideSteps: err.guideSteps });
      } else {
        setUrlError({
          message: err?.message || 'Không thể tải tài liệu từ đường liên kết này.',
        });
      }
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleCopyShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="relative flex items-center gap-1.5 sm:gap-2 pointer-events-auto select-none font-sans">
      {/* Hidden Native File Explorer Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xlsx,.xls,.csv,.ods,.pptx,.txt,.md,.epub,image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* 1. Button: Tải lên tài liệu (Hài hòa với thanh dock) */}
      <button
        data-tour="upload-btn"
        disabled={isParsingDoc}
        onClick={() => fileInputRef.current?.click()}
        title={isParsingDoc ? "Đang trích xuất tài liệu..." : "Tải lên tài liệu (PDF, Word, Excel, PowerPoint, Ảnh...)"}
        className="w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white hover:bg-orange-50/80 text-[#E0562D] shadow-sm border border-slate-300 hover:border-orange-300 flex items-center justify-center transition-all active:scale-95 cursor-pointer group disabled:opacity-75 disabled:cursor-wait"
      >
        {isParsingDoc ? (
          <Loader2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#E0562D] animate-spin" />
        ) : (
          <Upload className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#E0562D] stroke-[2.4] group-hover:scale-110 transition-transform" />
        )}
      </button>

      {/* 1b. Button: Nhập tài liệu từ URL (Google Docs, Sheets, Slides, Link trực tiếp) */}
      <button
        type="button"
        onClick={() => {
          setUrlError(null);
          setIsUrlModalOpen(true);
        }}
        title="Đưa tài liệu từ URL (Google Docs, Sheets, Slides...)"
        className="w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white hover:bg-orange-50/80 text-slate-700 hover:text-[#E0562D] shadow-sm border border-slate-300 hover:border-orange-300 flex items-center justify-center transition-all active:scale-95 cursor-pointer group"
      >
        <Link2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2] group-hover:scale-110 transition-transform" />
      </button>

      {/* Parsing PDF Indicator Toast */}
      {isParsingDoc && mounted && createPortal(
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] bg-white text-slate-800 px-4 py-2.5 rounded-full shadow-xl border border-orange-200 flex items-center gap-2.5 font-sans text-xs font-semibold animate-pulse">
          <Loader2 className="w-4 h-4 text-[#E0562D] animate-spin flex-shrink-0" />
          <span>Đang trích xuất các trang tài liệu...</span>
        </div>,
        document.body
      )}

      {/* 3. Button: Mời bạn bè & Supabase (Có đèn tín hiệu trạng thái) */}
      <button
        onClick={() => setIsShareModalOpen(true)}
        title="Phòng học nhóm trực tuyến"
        className="w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white hover:bg-slate-100 text-slate-800 shadow-sm border border-slate-300 flex items-center justify-center transition-all active:scale-95 cursor-pointer group relative"
      >
        <Share2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-800 stroke-[2.4] group-hover:scale-110 transition-transform" />
        {supabaseConfigState.isConfigured && (
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 absolute top-1 sm:top-1.5 right-1 sm:right-1.5 ring-1 ring-white" />
        )}
      </button>

      {/* MODAL 3: Đặt tên và viết mô tả ngắn cho tệp vừa chọn */}
      {isConfirmModalOpen && pendingDoc && mounted && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[9990] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-slate-900 animate-fade-in font-sans">
            <button
              onClick={() => {
                setIsConfirmModalOpen(false);
                setPendingDoc(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-slate-800" />
              <h3 className="text-sm font-bold text-slate-900">Thêm tài liệu vào bàn học</h3>
            </div>

            {/* Selected File Info Pill */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 mb-4 text-xs flex items-center justify-between text-slate-600">
              <span className="font-medium truncate mr-2">{pendingDoc.file.name}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="bg-orange-50 text-[#E0562D] border border-orange-200 px-1.5 py-0.5 rounded font-bold text-[10px]">
                  {pendingDoc.pages.length} trang
                </span>
                <span className="font-mono text-[11px] text-slate-400">{pendingDoc.fileSize}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmUpload} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Tên tài liệu</label>
                <input
                  type="text"
                  required
                  value={pendingDoc.title}
                  onChange={(e) => setPendingDoc({ ...pendingDoc, title: e.target.value })}
                  placeholder="Nhập tên tài liệu hiển thị..."
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none focus:border-slate-800 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Mô tả ngắn <span className="text-slate-400 font-normal">(tùy chọn)</span>
                </label>
                <textarea
                  rows={3}
                  value={pendingDoc.description}
                  onChange={(e) => setPendingDoc({ ...pendingDoc, description: e.target.value })}
                  placeholder="Ghi chú tóm tắt nội dung tài liệu..."
                  className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs text-slate-900 outline-none focus:border-slate-800 transition-colors resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsConfirmModalOpen(false);
                    setPendingDoc(null);
                  }}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#E0562D] hover:bg-[#c9451e] text-white transition-colors shadow-sm cursor-pointer"
                >
                  Đặt lên bàn học
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 4: Phòng học nhóm, Chia sẻ & Cấu hình Supabase Realtime */}
      {isShareModalOpen && mounted && createPortal(
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[9990] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsShareModalOpen(false);
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-300 rounded-3xl w-full max-w-md p-6 shadow-2xl relative text-slate-900 animate-fade-in font-sans"
          >
            <button
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#E0562D]">
                <Users className="w-4.5 h-4.5 stroke-[2.4]" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Mời bạn cùng học</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Mời bạn bè cùng vào bàn học để thảo luận, giải đề thi và đối chiếu tài liệu trực tiếp theo thời gian thực.
            </p>

            {/* 1. Share Room Link Box */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Liên kết phòng học
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const newSalt = Math.random().toString(36).substring(2, 8);
                    setRoomSalt(newSalt);
                    setCopiedLink(false);
                  }}
                  className="text-[11px] font-bold text-[#E0562D] hover:underline flex items-center gap-1 cursor-pointer"
                  title="Vô hiệu hóa liên kết cũ và tạo mã phòng mới"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Tạo liên kết mới</span>
                </button>
              </div>

              {/* URL Display + Copy Button */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl p-2 focus-within:border-[#E0562D] focus-within:bg-white transition-colors">
                <input
                  type="text"
                  readOnly
                  value={
                    typeof window !== 'undefined' 
                      ? `${window.location.origin}${window.location.pathname}?room=${roomSalt ? `${activeSpace.id}-${roomSalt}` : activeSpace.id}&perm=${roomPermission}`
                      : 'https://vitudy.edu.vn/'
                  }
                  className="bg-transparent text-xs text-slate-800 flex-1 outline-none font-mono select-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      const url = `${window.location.origin}${window.location.pathname}?room=${roomSalt ? `${activeSpace.id}-${roomSalt}` : activeSpace.id}&perm=${roomPermission}`;
                      navigator.clipboard.writeText(url);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2500);
                    }
                  }}
                  aria-label="Sao chép liên kết phòng học"
                  className="px-3 py-1.5 bg-[#E0562D] hover:bg-[#c9451e] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer whitespace-nowrap active:scale-95"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Đã sao chép' : 'Sao chép'}</span>
                </button>
              </div>

              {/* Quick Share Buttons & Expiry Selector */}
              <div className="flex items-center justify-between gap-2 mt-2 pt-1 text-[11px]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-slate-500 font-medium whitespace-nowrap">Chia sẻ nhanh:</span>
                  <button
                    type="button"
                    aria-label="Chia sẻ qua Zalo"
                    title="Chia sẻ qua Zalo"
                    onClick={() => {
                      const url = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?room=${roomSalt ? `${activeSpace.id}-${roomSalt}` : activeSpace.id}&perm=${roomPermission}` : '';
                      window.open(`https://zalo.me/share?url=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
                    }}
                    className="w-7 h-7 rounded-lg bg-[#0068FF] hover:bg-[#0057d9] flex items-center justify-center shadow-2xs transition-transform active:scale-95 cursor-pointer shrink-0"
                  >
                    <svg viewBox="0 0 48 48" className="w-4.5 h-4.5" aria-hidden="true">
                      <path
                        fill="#FFFFFF"
                        d="M24 6C13.5 6 5 13.6 5 23c0 5.1 2.5 9.7 6.5 12.8-.3 2.3-1.2 4.6-2.5 6.3 2.9-.3 5.9-1.3 8.2-2.7 2.1.6 4.4.9 6.8.9 10.5 0 19-7.6 19-17S34.5 6 24 6z"
                      />
                      <text
                        x="24"
                        y="26.5"
                        textAnchor="middle"
                        fill="#0068FF"
                        fontSize="11"
                        fontWeight="900"
                        fontFamily="system-ui, -apple-system, sans-serif"
                      >
                        Zalo
                      </text>
                    </svg>
                  </button>
                  <button
                    type="button"
                    aria-label="Chia sẻ qua Messenger"
                    title="Chia sẻ qua Messenger"
                    onClick={() => {
                      const url = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?room=${roomSalt ? `${activeSpace.id}-${roomSalt}` : activeSpace.id}&perm=${roomPermission}` : '';
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
                    }}
                    className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#0099FF] via-[#A033FF] to-[#FF5280] hover:opacity-90 flex items-center justify-center shadow-2xs transition-transform active:scale-95 cursor-pointer shrink-0"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" aria-hidden="true">
                      <path
                        fill="#FFFFFF"
                        d="M12 2C6.477 2 2 6.145 2 11.259c0 2.912 1.455 5.507 3.727 7.203V22l3.41-1.872c.91.252 1.873.39 2.863.39 5.523 0 10-4.145 10-9.259C22 6.145 17.523 2 12 2zm1.004 12.463l-2.548-2.718-4.97 2.718 5.468-5.803 2.61 2.718 4.908-2.718-5.468 5.803z"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQrCode(!showQrCode)}
                    className="h-7 px-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Mã QR</span>
                  </button>
                </div>

                <div className="flex items-center gap-1 text-slate-600 font-medium whitespace-nowrap shrink-0">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <select
                    value={roomLinkExpiry}
                    onChange={(e) => setRoomLinkExpiry(e.target.value as any)}
                    className="bg-transparent border-0 text-[11px] font-semibold text-slate-700 cursor-pointer outline-none"
                    aria-label="Thời hạn liên kết"
                  >
                    <option value="24h">Hạn 24 giờ</option>
                    <option value="1h">Hạn 1 giờ</option>
                    <option value="unlimited">Không giới hạn</option>
                  </select>
                </div>
              </div>

              {/* QR Code Popup preview */}
              {showQrCode && (
                <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center animate-fade-in">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                      typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?room=${roomSalt ? `${activeSpace.id}-${roomSalt}` : activeSpace.id}&perm=${roomPermission}` : ''
                    )}`}
                    alt="Mã QR phòng học"
                    className="w-32 h-32 rounded-xl bg-white p-1 border border-slate-200 shadow-2xs"
                  />
                  <span className="text-[10.5px] text-slate-600 font-medium mt-1.5">Quét mã bằng điện thoại để vào bàn học</span>
                </div>
              )}
            </div>

            {/* 2. Room Permissions (Mặc định: Chỉ xem) */}
            <div className="mb-4">
              <span className="text-xs font-semibold text-slate-700 block mb-1.5">
                Quyền của bạn học tham gia
              </span>
              <div 
                role="radiogroup"
                aria-label="Quyền của bạn học tham gia"
                className="grid grid-cols-2 gap-2 text-xs"
              >
                {/* Quyền 1: Chỉ xem (Mặc định an toàn) */}
                <button
                  type="button"
                  role="radio"
                  aria-checked={roomPermission === 'view_only'}
                  onClick={() => setRoomPermission('view_only')}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    roomPermission === 'view_only'
                      ? 'border-[#E0562D] bg-orange-50/60 text-slate-900 font-bold shadow-2xs ring-1 ring-[#E0562D]'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-900">Chỉ xem</div>
                    <div className="text-[10px] text-slate-600 font-medium mt-0.5 leading-snug">Chỉ xem bàn học và con trỏ chuột</div>
                  </div>
                  {roomPermission === 'view_only' && (
                    <div className="w-3.5 h-3.5 rounded-full bg-[#E0562D] text-white flex items-center justify-center shrink-0 ml-1">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>

                {/* Quyền 2: Cùng chỉnh sửa */}
                <button
                  type="button"
                  role="radio"
                  aria-checked={roomPermission === 'edit'}
                  onClick={() => setRoomPermission('edit')}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    roomPermission === 'edit'
                      ? 'border-[#E0562D] bg-orange-50/60 text-slate-900 font-bold shadow-2xs ring-1 ring-[#E0562D]'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-900">Cùng chỉnh sửa</div>
                    <div className="text-[10px] text-slate-600 font-medium mt-0.5 leading-snug">Bất kỳ ai có link đều có thể viết note, giải đề</div>
                  </div>
                  {roomPermission === 'edit' && (
                    <div className="w-3.5 h-3.5 rounded-full bg-[#E0562D] text-white flex items-center justify-center shrink-0 ml-1">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* 3. People in Room */}
            <div className="mb-4 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-slate-800">Người trong phòng</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                  {peersInRoom.length + 1} đang online
                </span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-slate-800">Bạn (Chủ phòng)</span>
                  </div>
                </div>

                {peersInRoom.map((peer) => (
                  <div key={peer.id} className="flex items-center justify-between text-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: peer.avatarColor }} />
                      <span className="font-medium text-slate-800">{peer.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPeersInRoom(prev => prev.filter(p => p.id !== peer.id))}
                      className="text-[10.5px] font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                      title="Mời bạn học này ra khỏi phòng"
                    >
                      <UserMinus className="w-3 h-3" />
                      <span>Mời ra</span>
                    </button>
                  </div>
                ))}

                {peersInRoom.length === 0 && (
                  <div className="text-[11px] text-slate-600 font-medium italic pt-1">
                    Đang đợi bạn học truy cập liên kết...
                  </div>
                )}
              </div>
            </div>

            {/* 4. Advanced / Developer Supabase Settings (Tucked away) */}
            <div className="pt-2 border-t border-slate-100 mb-3">
              {!isDbConfigOpen ? (
                <button
                  type="button"
                  onClick={() => setIsDbConfigOpen(true)}
                  className="text-[11px] text-slate-500 hover:text-slate-700 font-medium transition-colors cursor-pointer"
                >
                  + Cài đặt kết nối máy chủ nâng cao
                </button>
              ) : (
                <form onSubmit={handleSaveDb} className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2 text-xs animate-fade-in mt-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Cấu hình máy chủ Realtime</span>
                    <button
                      type="button"
                      onClick={() => setIsDbConfigOpen(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs"
                    >
                      Ẩn
                    </button>
                  </div>
                  <div>
                    <label className="text-[10.5px] font-semibold text-slate-600 block mb-0.5">Project URL</label>
                    <input
                      type="url"
                      required
                      value={supabaseUrlInput}
                      onChange={(e) => setSupabaseUrlInput(e.target.value)}
                      className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10.5px] font-semibold text-slate-600 block mb-0.5">Anon Key</label>
                    <input
                      type="text"
                      required
                      value={supabaseKeyInput}
                      onChange={(e) => setSupabaseKeyInput(e.target.value)}
                      className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleTestDatabase}
                      disabled={dbTestResult.status === 'testing'}
                      className="px-2.5 py-1 text-[11px] bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-medium cursor-pointer disabled:opacity-60 flex items-center gap-1.5 transition-colors"
                    >
                      {dbTestResult.status === 'testing' && <Loader2 className="w-3 h-3 animate-spin" />}
                      <span>{dbTestResult.status === 'testing' ? 'Đang kiểm tra...' : 'Thử kết nối'}</span>
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      Lưu
                    </button>
                  </div>
                  {dbTestResult.status !== 'idle' && dbTestResult.message && (
                    <div
                      role="status"
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border ${
                        dbTestResult.status === 'success'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : dbTestResult.status === 'error'
                          ? 'bg-rose-50 border-rose-200 text-rose-700'
                          : 'bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      {dbTestResult.message}
                    </div>
                  )}
                  {dbSavedNotice && (
                    <div className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-emerald-50 border border-emerald-200 text-emerald-700">
                      Đã lưu cấu hình máy chủ! Đang tải lại...
                    </div>
                  )}
                </form>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="px-5 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* MODAL 4: Nhập tài liệu từ URL (Google Docs, Sheets, Slides, Link trực tiếp) */}
      {isUrlModalOpen && mounted && createPortal(
        <div
          data-overlay="true"
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[9990] flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-slate-900 animate-fade-in font-sans">
            <button
              type="button"
              onClick={() => {
                setIsUrlModalOpen(false);
                setUrlError(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Link2 className="w-5 h-5 text-[#E0562D]" />
              <h3 className="text-sm font-bold text-slate-900">Đưa tài liệu từ liên kết (URL)</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Hỗ trợ Google Docs, Google Sheets (nhiều sheet), Google Slides và liên kết trực tiếp (.pdf, .docx, .xlsx, .csv, .pptx). Tài liệu gốc cần được bật chia sẻ công khai để mọi người có thể tải về.
            </p>

            <form onSubmit={handleImportFromUrl} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Đường liên kết tài liệu</label>
                <input
                  type="url"
                  required
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://docs.google.com/document/d/... hoặc link tệp"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#E0562D] transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Tên hiển thị trên bàn học <span className="text-slate-400 font-normal">(tùy chọn)</span>
                </label>
                <input
                  type="text"
                  value={urlTitleInput}
                  onChange={(e) => setUrlTitleInput(e.target.value)}
                  placeholder="Tự động nhận diện nếu để trống..."
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#E0562D] transition-colors"
                />
              </div>

              {urlError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-semibold leading-relaxed">{urlError.message}</p>
                  </div>
                  {urlError.guideSteps && urlError.guideSteps.length > 0 && (
                    <div className="pl-6 pt-1 border-t border-rose-200/70">
                      <p className="text-[11px] font-bold text-rose-800 mb-1">Hướng dẫn bật chia sẻ rồi đưa vào lại:</p>
                      <ol className="list-decimal list-inside space-y-1 text-[11px] text-rose-800 leading-relaxed">
                        {urlError.guideSteps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsUrlModalOpen(false);
                    setUrlError(null);
                  }}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={isFetchingUrl}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#E0562D] hover:bg-[#c9451e] text-white transition-colors shadow-sm cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                >
                  {isFetchingUrl && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{urlError ? 'Thử đưa vào lại' : 'Đưa vào bàn học'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
