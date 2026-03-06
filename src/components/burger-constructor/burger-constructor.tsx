import {
  Button,
  ConstructorElement,
  CurrencyIcon,
} from '@krgaa/react-developer-burger-ui-components';
import { useNavigate } from 'react-router-dom';

import { BurgerFilling } from '@components/burger-constructor/burger-filling/burger-filling';
import { useAppDispatch, useAppSelector } from '@services/hooks';
import { createOrder } from '@services/order_slice.ts';

import DropTargetConstructor from './DropTargetConstructor.tsx';

import type { RootState } from '@services/store';

import styles from './burger-constructor.module.css';

type Bun = {
  _id: string;
  name: string;
  price: number;
  image: string;
};

type Ingredient = {
  _id: string;
  name: string;
  price: number;
  image: string;
  uniqueId: string;
};

type OrderState = {
  loading: boolean;
  error: string | null;
};

type AuthState = {
  isAuth: boolean;
};

type ConstructorState = {
  bun?: Bun | null;
  ingredients: Ingredient[];
  total: number;
};

export const BurgerConstructor: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const constructorState = useAppSelector<RootState, ConstructorState>(
    (state) => state.constructor || {}
  );
  const orderState = useAppSelector<RootState, OrderState>((state) => state.order || {});
  const authState = useAppSelector<RootState, AuthState>((state) => state.auth || {});

  const bun = constructorState.bun || null;
  const ingredients = constructorState.ingredients || [];
  const total = constructorState.total || 0;

  const { loading: orderLoading, error: orderError } = orderState;
  const { isAuth } = authState;
  const canPlaceOrder = !!bun && ingredients.length > 0;

  const handleCreateOrder = () => {
    if (!bun) {
      alert('Добавьте булку!');
      return;
    }
    if (ingredients.length === 0) {
      alert('Добавьте начинки!');
      return;
    }
    if (!isAuth) {
      navigate('/login');
      return;
    }

    const ingredientIds = [bun._id, ...ingredients.map((item) => item._id), bun._id];
    dispatch(createOrder(ingredientIds));
  };

  return (
    <section className={styles.burger_constructor}>
      <DropTargetConstructor>
        <div className={styles.slice}>
          <div className={styles.bunSection}>
            <div className={styles.bunRow}>
              <div className={styles.placeholder}></div>
              {bun ? (
                <ConstructorElement
                  type="top"
                  isLocked={true}
                  text={`${bun.name} (верх)`}
                  price={bun.price}
                  thumbnail={bun.image}
                />
              ) : (
                <div className={styles.emptyBunPlaceholder}>Перетащите булку сюда</div>
              )}
            </div>
          </div>

          <div className={styles.scrollableArea}>
            <BurgerFilling />
          </div>

          <div className={styles.bunSection}>
            <div className={styles.bunRow}>
              <div className={styles.placeholder}></div>
              {bun ? (
                <ConstructorElement
                  type="bottom"
                  isLocked={true}
                  text={`${bun.name} (низ)`}
                  price={bun.price}
                  thumbnail={bun.image}
                />
              ) : (
                <div className={styles.emptyBunPlaceholder}>Перетащите булку сюда</div>
              )}
            </div>
          </div>
        </div>
      </DropTargetConstructor>

      <div className={styles.price_button}>
        <div className="text text_type_digits-medium">
          {total} <CurrencyIcon type="primary" className={styles.largeIcon} />
        </div>
        <Button
          htmlType="button"
          type="primary"
          size="large"
          onClick={handleCreateOrder}
          disabled={!canPlaceOrder || orderLoading}
        >
          {orderLoading ? 'Оформляем...' : 'Оформить заказ'}
        </Button>
      </div>

      {orderError && (
        <div className="text text_type_main-default text_color_error mt-2">
          Ошибка: {orderError}
        </div>
      )}
    </section>
  );
};
