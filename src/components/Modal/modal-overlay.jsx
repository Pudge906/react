import IngredientDetails from '@/components/Modal/ingredient.jsx';
import OrderDetails from '@components/Modal/order.jsx';

import styles from './modal-overlay.module.css';

export default function ModalOverlay({ setIsModalOpen, ingredient }) {
  const closeModalOverlay = () => {
    setIsModalOpen(false);
  };

  return (
    <div className={styles.main} onClick={closeModalOverlay}>
      <div className={styles.modalContent}>
        {ingredient ? <IngredientDetails ingredient={ingredient} /> : <OrderDetails />}

        <button className={styles.closeButton} onClick={closeModalOverlay}>
        </button>
      </div>
    </div>
  );
}