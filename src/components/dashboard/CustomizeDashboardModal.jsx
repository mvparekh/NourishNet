import { useState, useEffect } from "react";
import {
  RotateCcw,
  Check,
  ArrowUp,
  ArrowDown,
  Info
} from "lucide-react";
import { Modal } from "../common/Modal";
import { getAvailableWidgetsForUser, getDefaultDashboardConfig } from "../../services/dashboardConfig";
const CustomizeDashboardModal = ({
  isOpen,
  onClose,
  currentUser,
  currentConfig,
  onSaveConfig
}) => {
  const availableWidgets = getAvailableWidgetsForUser(currentUser);
  const [visibleWidgets, setVisibleWidgets] = useState(currentConfig.visibleWidgets);
  const [widgetOrder, setWidgetOrder] = useState([]);
  useEffect(() => {
    setVisibleWidgets(currentConfig.visibleWidgets);
    const existingOrder = currentConfig.widgetOrder || [];
    const ordered = [
      ...existingOrder.filter((id) => availableWidgets.some((w) => w.id === id)),
      ...availableWidgets.filter((w) => !existingOrder.includes(w.id)).map((w) => w.id)
    ];
    setWidgetOrder(ordered);
  }, [currentConfig, availableWidgets]);
  const toggleWidget = (id) => {
    if (visibleWidgets.includes(id)) {
      if (visibleWidgets.length <= 1) return;
      setVisibleWidgets(visibleWidgets.filter((wId) => wId !== id));
    } else {
      setVisibleWidgets([...visibleWidgets, id]);
    }
  };
  const moveUp = (index) => {
    if (index === 0) return;
    const newOrder = [...widgetOrder];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index - 1];
    newOrder[index - 1] = temp;
    setWidgetOrder(newOrder);
  };
  const moveDown = (index) => {
    if (index >= widgetOrder.length - 1) return;
    const newOrder = [...widgetOrder];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index + 1];
    newOrder[index + 1] = temp;
    setWidgetOrder(newOrder);
  };
  const handleSave = () => {
    onSaveConfig({
      ...currentConfig,
      visibleWidgets,
      widgetOrder
    });
    onClose();
  };
  const handleResetToDefault = () => {
    const defaultConfig = getDefaultDashboardConfig(currentUser);
    setVisibleWidgets(defaultConfig.visibleWidgets);
    setWidgetOrder(defaultConfig.widgetOrder);
  };
  const orderedWidgetDefs = widgetOrder.map((id) => availableWidgets.find((w) => w.id === id)).filter(Boolean);
  return <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Customize Your Dashboard"
    subtitle="Select the widgets you want to see and adjust their display order"
    maxWidth="xl"
  >
      <div className="space-y-5">
        {/* Info Banner */}
        <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E7DCD5] flex items-start gap-2 text-xs text-[#2C1810]">
          <Info className="w-4 h-4 text-[#C85A32] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Simple Personalization:</span> Check the widgets you need for your daily workflow. Critical operations (like urgent pickups or safety issues) will always appear in the top banner regardless of layout.
          </div>
        </div>

        {/* Widget Selector List */}
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {orderedWidgetDefs.map((widget, index) => {
            const isVisible = visibleWidgets.includes(widget.id);
            return (
              <div
                key={widget.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${isVisible ? "bg-white border-[#C85A32] shadow-xs" : "bg-[#FAF7F2] border-[#E7DCD5] opacity-60"}`}
              >
                {/* Toggle & Title */}
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={() => toggleWidget(widget.id)}
                    className="w-4 h-4 text-[#C85A32] rounded border-[#E7DCD5] focus:ring-[#C85A32] cursor-pointer"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#2C1810] truncate">
                        {widget.title}
                      </span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-[#FAF7F2] border border-[#E7DCD5] text-[#5D4037]">
                        L{widget.level}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5D4037] truncate">{widget.subtitle}</p>
                  </div>
                </div>

                {/* Reorder Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveUp(index)}
                    className="p-1 text-[#8D6E63] hover:text-[#C85A32] hover:bg-[#FAF7F2] rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    disabled={index === orderedWidgetDefs.length - 1}
                    onClick={() => moveDown(index)}
                    className="p-1 text-[#8D6E63] hover:text-[#C85A32] hover:bg-[#FAF7F2] rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Footer */}
        <div className="pt-3 border-t border-[#E7DCD5] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="text-xs font-semibold text-[#5D4037] hover:text-[#C85A32] flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Recommended Layout</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-[#5D4037] hover:bg-[#FAF7F2] rounded-xl transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-none px-5 py-2 text-xs font-bold text-white bg-[#C85A32] hover:bg-[#B04A24] rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Dashboard ({visibleWidgets.length} active)</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>;
};
export {
  CustomizeDashboardModal
};
