import ModalOverlay from './modal-overlay.jsx';

export default function Modal({ children, onClose }) {
  return <ModalOverlay onClose={onClose}>{children}</ModalOverlay>;
}
