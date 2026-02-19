import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  closeIngredientModal,
  openIngredientModal,
} from '@services/ingredient_detailsSlice.ts';
import { closeOrderModal } from '@services/order_slice.ts';

import IngredientDetails from './ingredient-details';
import Modal from './modal';
import OrderDetails from './order-details';

import type { RootState } from '@services/store';

type LocationState = {
  background?: Location;
};

export default function ModalRoot(): React.ReactElement | null {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation<LocationState>();

  const { currentIngredient, isModalOpen: isIngredientModalOpen } = useSelector(
    (state: RootState) => state.ingredientDetails
  );
  const { isModalOpen: isOrderModalOpen } = useSelector(
    (state: RootState) => state.order
  );

  console.log(
    'ModalRoot rendered:',
    JSON.stringify(
      {
        isOrderModalOpen,
        isIngredientModalOpen,
        pathname: location.pathname,
        background: location.state?.background,
      },
      null,
      2
    )
  );

  useEffect(() => {
    if (!isIngredientModalOpen) {
      const storedData = sessionStorage.getItem('ingredientModalData');
      if (storedData) {
        const ingredient = JSON.parse(storedData);
        dispatch(openIngredientModal(ingredient));
      }
    }
  }, [dispatch, isIngredientModalOpen]);

  const handleIngredientClose = (): void => {
    sessionStorage.removeItem('ingredientModalData');
    if (location.state?.background) {
      navigate(location.state.background, { replace: true });
    } else {
      navigate('/', { replace: true });
    }
    dispatch(closeIngredientModal());
  };

  const handleOrderClose = (): void => {
    dispatch(closeOrderModal());
  };

  const isModalView = location.state?.background;

  if (
    isModalView &&
    isIngredientModalOpen &&
    currentIngredient &&
    location.pathname.startsWith('/ingredients/')
  ) {
    return (
      <Modal onClose={handleIngredientClose}>
        <IngredientDetails />
      </Modal>
    );
  }

  if (isOrderModalOpen) {
    console.log('Order modal should render now.');
    return (
      <Modal onClose={handleOrderClose}>
        <OrderDetails />
      </Modal>
    );
  }

  return null;
}
