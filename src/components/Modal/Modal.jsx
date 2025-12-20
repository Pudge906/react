import ModalOverlay from './modal-overlay.jsx';

export default function Modal({ children, type = 'ingredient' }) {
  return <ModalOverlay type={type}>{children}</ModalOverlay>;
}
