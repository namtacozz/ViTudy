'use client';

import React, { useState } from 'react';
import { EntityId, FieldValue, isRef } from '@/engine/boardgame';
import { Plus, Trash2, Tag } from 'lucide-react';

interface EntityInspectorProps {
  entityId: EntityId;
  entityName: string;
  tags: string[];
  fields: Record<string, FieldValue>;
  availableEntityIds?: EntityId[];
  onChange: (next: { tags: string[]; fields: Record<string, FieldValue> }) => void;
}

/**
 * Inspector for editing entity tags and fields (scalar or $ref) (Cluster G).
 */
export function EntityInspector({
  entityId,
  entityName,
  tags,
  fields,
  availableEntityIds = [],
  onChange,
}: EntityInspectorProps) {
  const [newTag, setNewTag] = useState('');
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldVal, setNewFieldVal] = useState('');

  const handleAddTag = () => {
    const t = newTag.trim();
    if (!t || tags.includes(t)) return;
    onChange({ tags: [...tags, t], fields });
    setNewTag('');
  };

  const handleRemoveTag = (tag: string) => {
    onChange({ tags: tags.filter((t) => t !== tag), fields });
  };

  const handleSetField = (key: string, raw: string) => {
    let parsed: FieldValue = raw;
    if (raw === 'true') parsed = true;
    else if (raw === 'false') parsed = false;
    else if (raw !== '' && !Number.isNaN(Number(raw))) parsed = Number(raw);
    else if (raw.startsWith('$ref:')) parsed = { $ref: raw.slice(5).trim() };
    onChange({ tags, fields: { ...fields, [key]: parsed } });
  };

  const handleDeleteField = (key: string) => {
    const next = { ...fields };
    delete next[key];
    onChange({ tags, fields: next });
  };

  const handleAddField = () => {
    const k = newFieldKey.trim();
    if (!k) return;
    handleSetField(k, newFieldVal);
    setNewFieldKey('');
    setNewFieldVal('');
  };

  return (
    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-black text-slate-900 truncate">{entityName}</span>
        <span className="font-mono text-[10px] text-slate-400">{entityId}</span>
      </div>

      {/* Tags */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
          <Tag className="w-3.5 h-3.5" /> Thẻ phân loại (Tags)
        </div>
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#FFF7ED] border border-[#FFEDD5] text-[#9A3412] font-semibold"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-red-600 cursor-pointer"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-1">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Thêm tag..."
            className="flex-1 px-2 py-1 rounded-lg border border-slate-200"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100">
        <div className="text-[11px] font-bold text-slate-600">Thuộc tính (Fields / Ref)</div>
        <div className="space-y-1 max-h-44 overflow-y-auto">
          {Object.entries(fields).map(([key, val]) => {
            const displayVal = isRef(val) ? `$ref:${val.$ref}` : String(val);
            return (
              <div key={key} className="flex items-center gap-1">
                <span className="w-24 truncate font-mono text-[11px] text-slate-600">{key}</span>
                <input
                  type="text"
                  value={displayVal}
                  onChange={(e) => handleSetField(key, e.target.value)}
                  className="flex-1 px-2 py-1 rounded-lg border border-slate-200 font-mono text-[11px]"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteField(key)}
                  className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex gap-1 pt-1">
          <input
            type="text"
            value={newFieldKey}
            onChange={(e) => setNewFieldKey(e.target.value)}
            placeholder="Tên field..."
            className="w-24 px-2 py-1 rounded-lg border border-slate-200 font-mono text-[11px]"
          />
          <input
            type="text"
            value={newFieldVal}
            onChange={(e) => setNewFieldVal(e.target.value)}
            placeholder={availableEntityIds.length ? 'Giá trị hoặc $ref:id' : 'Giá trị'}
            className="flex-1 px-2 py-1 rounded-lg border border-slate-200 font-mono text-[11px]"
          />
          <button
            type="button"
            onClick={handleAddField}
            className="px-2.5 py-1 rounded-lg bg-[#E0562D] text-white font-bold cursor-pointer"
          >
            Thêm
          </button>
        </div>
      </div>
    </div>
  );
}
