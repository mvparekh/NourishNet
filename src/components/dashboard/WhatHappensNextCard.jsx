import { ArrowRight } from "lucide-react";
const WhatHappensNextCard = ({
  currentStep,
  totalSteps = 4,
  stepTitle,
  nextStepText,
  actionLabel,
  onAction
}) => {
  return (
    <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E7DCD5] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
      <div className="flex items-start gap-2.5">
        <div className="w-6 h-6 rounded-full bg-[#2C1810] text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
          {currentStep}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-[#C85A32] tracking-wider">
              Step {currentStep} of {totalSteps} · {stepTitle}
            </span>
          </div>
          <p className="text-[#2C1810] font-medium mt-0.5 leading-snug">
            <span className="text-[#2C1810] font-bold">What happens next:</span> {nextStepText}
          </p>
        </div>
      </div>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-3 py-1.5 text-xs font-bold text-[#C85A32] bg-white hover:bg-[#FAF7F2] border border-[#E7DCD5] rounded-xl transition-all flex items-center justify-center gap-1 shrink-0 shadow-xs"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
export {
  WhatHappensNextCard
};
