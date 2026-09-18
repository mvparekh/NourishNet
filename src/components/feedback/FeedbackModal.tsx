import React, { useState } from 'react';
import { Star, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservationId: string;
  listingId: string;
  toUserId: string;
  toUserName: string;
  toUserRole: UserRole;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  reservationId,
  listingId,
  toUserId,
  toUserName,
  toUserRole,
}) => {
  const { submitFeedback } = useApp();

  const [rating, setRating] = useState(5);
  const [punctuality, setPunctuality] = useState(5);
  const [foodCondition, setFoodCondition] = useState(5);
  const [quantityAccuracy, setQuantityAccuracy] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [comments, setComments] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitFeedback({
      reservationId,
      listingId,
      toUserId,
      toUserName,
      toUserRole,
      rating,
      punctualityRating: punctuality,
      foodConditionRating: foodCondition,
      quantityAccuracyRating: quantityAccuracy,
      communicationRating: communication,
      comments: comments.trim() || undefined,
      isPrivate: true,
    });
    setIsSubmitted(true);
  };

  const handleClose = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isSubmitted ? 'Feedback Submitted' : `Rate Coordination with ${toUserName}`}
      subtitle={
        isSubmitted
          ? 'Thank you for strengthening trust in Surat food recovery network'
          : `Post-recovery trust and quality feedback (${toUserRole.toLowerCase()})`
      }
      maxWidth="md"
    >
      {isSubmitted ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">Rating Recorded</h4>
            <p className="text-xs text-slate-500 mt-1">
              Your feedback helps maintain high standards of punctuality and food hygiene across Surat.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition-all"
          >
            Close
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Overall Star Rating */}
          <div className="text-center pb-2 border-b border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Overall Experience Rating
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 text-amber-400 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-[11px] font-semibold text-slate-600 mt-1">
              {rating === 5
                ? 'Outstanding (5/5)'
                : rating === 4
                ? 'Very Good (4/5)'
                : rating === 3
                ? 'Satisfactory (3/5)'
                : 'Needs Improvement'}
            </p>
          </div>

          {/* Structured Attributes */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">Pickup Punctuality</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setPunctuality(val)}
                    className={`w-6 h-6 rounded-md text-[10px] font-bold transition-all ${
                      val === punctuality
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">Food Hygiene & Packaging</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setFoodCondition(val)}
                    className={`w-6 h-6 rounded-md text-[10px] font-bold transition-all ${
                      val === foodCondition
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">Quantity Accuracy</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setQuantityAccuracy(val)}
                    className={`w-6 h-6 rounded-md text-[10px] font-bold transition-all ${
                      val === quantityAccuracy
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">Coordination & Communication</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setCommunication(val)}
                    className={`w-6 h-6 rounded-md text-[10px] font-bold transition-all ${
                      val === communication
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Private Comments (Optional)
            </label>
            <textarea
              rows={2}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="e.g. Courier was very courteous and brought insulated bags."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Skip
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-sm transition-all"
            >
              Submit Feedback
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
