import { ArrowRight } from "lucide-react";
import { Modal } from "../common/Modal";
import { FOCUS_PRESETS } from "../../services/dashboardConfig";
const FocusOnboardingModal = ({
  isOpen,
  onClose,
  currentUser,
  onSelectPreset
}) => {
  const presets = FOCUS_PRESETS[currentUser.role] || [];
  return <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="What would you like to focus on?"
    subtitle="Choose your primary objective to set up a clean, focused dashboard"
    maxWidth="lg"
  >
      <div className="space-y-4">
        <p className="text-xs text-slate-600 leading-relaxed">
          NourishNet tailors your workspace to what matters most right now. You can customize, add, or remove widgets anytime later.
        </p>

        <div className="grid grid-cols-1 gap-3">
          {presets.map((preset) => <button
    key={preset.label}
    type="button"
    onClick={() => onSelectPreset(preset.recommendedWidgets, preset.label)}
    className="p-4 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all text-left group flex items-start justify-between gap-3"
  >
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-950 flex items-center gap-2">
                  <span>{preset.label}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-semibold">
                    {preset.recommendedWidgets.length} widgets
                  </span>
                </h4>
                <p className="text-xs text-slate-500 mt-1">{preset.description}</p>
              </div>

              <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center text-slate-400 shrink-0 transition-colors">
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>)}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
    type="button"
    onClick={onClose}
    className="text-slate-500 hover:text-slate-800 font-medium"
  >
            Skip (Keep standard layout)
          </button>

          <span className="text-slate-400 text-[11px]">
            Fully customizable anytime via 'Customize'
          </span>
        </div>
      </div>
    </Modal>;
};
export {
  FocusOnboardingModal
};
