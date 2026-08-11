import React from 'react';
import { Copy, Trash2, Lock, Globe } from 'lucide-react';
import type { SelectedObjectRef } from '../../types/map';

interface ContextMenuProps {
  x: number;
  y: number;
  selectedObject: SelectedObjectRef;
  onClose: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onLockToggle: () => void;
  onOpenWorldLink?: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onClose,
  onDuplicate,
  onDelete,
  onLockToggle,
  onOpenWorldLink
}) => {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{ left: x, top: y }}
      className="fixed z-50 bg-[#121620] border border-amber-500/30 rounded-xl p-1.5 shadow-2xl w-48 text-xs font-sans animate-in fade-in duration-100"
    >
      <button
        onClick={() => {
          onDuplicate();
          onClose();
        }}
        className="w-full text-left px-3 py-2 text-slate-200 hover:text-amber-300 hover:bg-slate-900 rounded-lg flex items-center justify-between"
      >
        <span className="flex items-center gap-2">
          <Copy className="w-3.5 h-3.5 text-amber-400" /> Duplicate
        </span>
        <span className="text-[10px] font-mono text-slate-500">Ctrl+D</span>
      </button>

      <button
        onClick={() => {
          onLockToggle();
          onClose();
        }}
        className="w-full text-left px-3 py-2 text-slate-200 hover:text-amber-300 hover:bg-slate-900 rounded-lg flex items-center gap-2"
      >
        <Lock className="w-3.5 h-3.5 text-sky-400" /> Lock Object
      </button>

      {onOpenWorldLink && (
        <button
          onClick={() => {
            onOpenWorldLink();
            onClose();
          }}
          className="w-full text-left px-3 py-2 text-amber-300 hover:bg-slate-900 rounded-lg flex items-center gap-2"
        >
          <Globe className="w-3.5 h-3.5" /> Link to World Entity
        </button>
      )}

      <div className="my-1 border-t border-slate-800" />

      <button
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-950/40 rounded-lg flex items-center justify-between"
      >
        <span className="flex items-center gap-2">
          <Trash2 className="w-3.5 h-3.5" /> Delete Object
        </span>
        <span className="text-[10px] font-mono text-slate-500">Del</span>
      </button>
    </div>
  );
};
