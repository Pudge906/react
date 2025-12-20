import { CloseIcon } from '@krgaa/react-developer-burger-ui-components';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import styles from './modal-overlay.module.css';

export default function ModalOverlay({ children, onClose }) {
  const modalRef = useRef(null);

  const closeModal = () => {
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      closeModal();
    }
  };

  const modalsContainer = document.getElementById('modals');

  if (!modalsContainer) {
    console.error('Контейнер #modals не найден в index.html');
    return null;
  }

  return createPortal(
    <div className={styles.main} onClick={handleOverlayClick}>
      <div className={styles.modalContent} ref={modalRef}>
        {children}
        <button className={styles.closeButton} onClick={closeModal}>
          <CloseIcon />
        </button>
      </div>
    </div>,
    modalsContainer
  );
}
