import { useEffect } from 'react';

import IngredientDetails from '@/components/Modal/ingredient.jsx';
import OrderDetails from '@components/Modal/order.jsx';

import styles from './modal-overlay.module.css';

export default function ModalOverlay({ setIsModalOpen, ingredient }) {
  const closeModalOverlay = () => {
    setIsModalOpen(false);
  };
  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        closeModalOverlay();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);
  return (
    <div className={styles.main} onClick={closeModalOverlay}>
      <div className={styles.modalContent} onClick={handleModalContentClick}>
        {ingredient ? <IngredientDetails ingredient={ingredient} /> : <OrderDetails />}

        <button
          className={styles.closeButton}
          onClick={closeModalOverlay}
          aria-label="Close modal"
        >
          x
        </button>
      </div>
    </div>
  );
}
