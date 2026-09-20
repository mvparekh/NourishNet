import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ArrowRight
} from "lucide-react";
const WidgetCard = ({
  widget,
  isCollapsed = false,
  onToggleCollapse,
  onViewAll,
  viewAllLabel = "View all",
  count,
  children,
  headerAction
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const getLevelBadge = () => {
    switch (widget.level) {
      case 1:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FAF7F2] text-[#C85A32] border border-[#E7DCD5]">
            L1 · Action
          </span>
        );
      case 2:
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#FAF7F2] text-[#5D4037] border border-[#E7DCD5]">
            L2 · Operations
          </span>
        );
      case 3:
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#F5EFEB] text-[#2C1810] border border-[#E7DCD5]">
            L3 · Info
          </span>
        );
      case 4:
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#FAF7F2] text-[#8D6E63] border border-[#E7DCD5]">
            L4 · Analytics
          </span>
        );
      default:
        return null;
    }
  };
  return (
    <div className="rounded-2xl bg-white border border-[#E7DCD5] shadow-xs hover:shadow-sm transition-all overflow-hidden flex flex-col justify-between">
      {/* Widget Header */}
      <div className="p-4 sm:p-5 border-b border-[#E7DCD5] flex items-start justify-between gap-3 bg-[#FAF7F2]/50">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {getLevelBadge()}
            {widget.badge && (
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-[#C85A32] text-white">
                {widget.badge}
              </span>
            )}
            <h3 className="text-sm font-bold text-[#2C1810] truncate">
              {widget.title}
              {count !== void 0 && <span className="text-[#C85A32] ml-1.5">({count})</span>}
            </h3>

            {/* Why am I seeing this tooltip button */}
            <div className="relative inline-block">
              <button
                type="button"
                onClick={() => setShowTooltip(!showTooltip)}
                className="text-[#8D6E63] hover:text-[#C85A32] transition-colors p-0.5 rounded"
                title="Why am I seeing this widget?"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>

              {showTooltip && (
                <div className="absolute left-0 top-6 z-30 w-64 p-3 bg-[#2C1810] text-white rounded-xl shadow-xl border border-[#5D4037] text-xs space-y-1.5 animate-in fade-in">
                  <div className="flex items-center justify-between text-[#E7DCD5] text-[10px] font-bold uppercase tracking-wider">
                    <span>Why this widget?</span>
                    <button type="button" onClick={() => setShowTooltip(false)} className="hover:text-white">
                      ✕
                    </button>
                  </div>
                  <p className="text-[#FAF7F2] text-[11px] leading-relaxed">{widget.whyAmISeeingThis}</p>
                  <p className="text-[10px] text-[#E7DCD5] border-t border-[#5D4037] pt-1">
                    {widget.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-[#5D4037] leading-snug">{widget.subtitle}</p>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {headerAction}

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 text-[#8D6E63] hover:text-[#2C1810] hover:bg-[#FAF7F2] rounded-lg transition-colors"
              title={isCollapsed ? "Expand Widget" : "Collapse Widget"}
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Widget Body */}
      {!isCollapsed && <div className="p-4 sm:p-5 flex-1 space-y-4">{children}</div>}

      {/* Widget Footer (View All Action) */}
      {!isCollapsed && onViewAll && (
        <div className="px-5 py-2.5 bg-[#FAF7F2] border-t border-[#E7DCD5] flex items-center justify-end">
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-bold text-[#C85A32] hover:text-[#B04A24] transition-colors flex items-center gap-1"
          >
            <span>{viewAllLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
export {
  WidgetCard
};
