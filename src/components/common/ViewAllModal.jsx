import { Modal } from "./Modal";
const ViewAllModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "2xl"
}) => {
  return <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    subtitle={subtitle}
    maxWidth={maxWidth}
  >
      <div className="max-h-[65vh] overflow-y-auto pr-1 space-y-4">{children}</div>
    </Modal>;
};
export {
  ViewAllModal
};
