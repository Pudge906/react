import { useSelector } from 'react-redux';

import IngredientDetails from './ingredient-details';
import Modal from './Modal';
import OrderDetails from './order-details';

export default function ModalRoot() {
  const { currentIngredient, isModalOpen: isIngredientModalOpen } = useSelector(
    (state) => state.ingredientDetails
  );

  const { isModalOpen: isOrderModalOpen } = useSelector((state) => state.order);

  if (isIngredientModalOpen && currentIngredient) {
    return (
      <Modal type="ingredient">
        <IngredientDetails />
      </Modal>
    );
  }

  if (isOrderModalOpen) {
    return (
      <Modal type="order">
        <OrderDetails />
      </Modal>
    );
  }

  return null;
}
