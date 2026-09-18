import React from 'react';
import { Modal } from './Modal';

interface ViewAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export const ViewAllModal: React.FC<ViewAllModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '2xl',
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      maxWidth={maxWidth}
    >
      <div className="max-h-[65vh] overflow-y-auto pr-1 space-y-4">{children}</div>
    </Modal>
  );
};
