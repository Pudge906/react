import { createPortal } from 'react-dom';

import styles from './modal-overlay.module.css';

type ModalOverlayProps = {
  children: React.ReactNode;
  onClose: () => void;
};

export default function ModalOverlay({
  children,
  onClose,
}: ModalOverlayProps): React.ReactElement | null {
  const modalsContainer = document.getElementById('modals');
  if (!modalsContainer) return null;

  return createPortal(
    <div className={styles.main} onClick={onClose}>
      {children}
    </div>,
    modalsContainer
  );
}
