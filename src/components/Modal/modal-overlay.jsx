import { createPortal } from 'react-dom';

import styles from './modal-overlay.module.css';

export default function ModalOverlay({ children, onClose }) {
  const modalsContainer = document.getElementById('modals');
  if (!modalsContainer) return null;

  return createPortal(
    <div className={styles.main} onClick={onClose}>
      {' '}
      {children}
    </div>,
    modalsContainer
  );
}
