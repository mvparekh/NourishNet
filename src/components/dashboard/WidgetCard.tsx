import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Sparkles,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import { WidgetDefinition } from '../../types/dashboard';

interface WidgetCardProps {
  widget: WidgetDefinition;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onViewAll?: () => void;
  viewAllLabel?: string;
  count?: number;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
}

export const WidgetCard: React.FC<WidgetCardProps> = ({
  widget,
  isCollapsed = false,
  onToggleCollapse,
  onViewAll,
  viewAllLabel = 'View all',
  count,
  children,
  headerAction,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const getLevelBadge = () => {
    switch (widget.level) {
      case 1:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 border border-purple-200">
            L1 · Action
          </span>
        );
      case 2:
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
            L2 · Operations
          </span>
        );
      case 3:
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
            L3 · Info
          </span>
        );
      case 4:
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-200">
            L4 · Analytics
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-sm transition-all overflow-hidden flex flex-col justify-between">
      {/* Widget Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between gap-3 bg-slate-50/40">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {getLevelBadge()}
            {widget.badge && (
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-purple-600 text-white">
                {widget.badge}
              </span>
            )}
            <h3 className="text-sm font-bold text-slate-900 truncate">
              {widget.title}
              {count !== undefined && <span className="text-purple-700 ml-1.5">({count})</span>}
            </h3>

            {/* Why am I seeing this tooltip button */}
            <div className="relative inline-block">
              <button
                type="button"
                onClick={() => setShowTooltip(!showTooltip)}
                className="text-slate-400 hover:text-purple-600 transition-colors p-0.5 rounded"
                title="Why am I seeing this widget?"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>

              {showTooltip && (
                <div className="absolute left-0 top-6 z-30 w-64 p-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 animate-in fade-in">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <span>Why this widget?</span>
                    <button type="button" onClick={() => setShowTooltip(false)} className="hover:text-white">
                      ✕
                    </button>
                  </div>
                  <p className="text-slate-200 text-[11px] leading-relaxed">{widget.whyAmISeeingThis}</p>
                  <p className="text-[10px] text-purple-300 border-t border-slate-800 pt-1">
                    {widget.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-snug">{widget.subtitle}</p>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {headerAction}

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title={isCollapsed ? 'Expand Widget' : 'Collapse Widget'}
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Widget Body */}
      {!isCollapsed && (
        <div className="p-4 sm:p-5 flex-1 space-y-4">{children}</div>
      )}

      {/* Widget Footer (View All Action) */}
      {!isCollapsed && onViewAll && (
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-bold text-purple-700 hover:text-purple-900 transition-colors flex items-center gap-1"
          >
            <span>{viewAllLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
