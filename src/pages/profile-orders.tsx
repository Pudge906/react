// src/pages/profile/orders/ProfileOrders.tsx
import { CurrencyIcon } from '@krgaa/react-developer-burger-ui-components';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';

import { ProfileLayout } from '@/layouts/ProfileLayout';
import { getToken } from '@services/auth_utils.ts';

import type { RootState } from '@services/store';

import styles from './profile-orders.module.css';

// Формат даты: "Сегодня, 16:20 i-GMT+3"
const formatDateForDisplay = (isoString: string): string => {
  const now = new Date();
  const orderDate = new Date(isoString);

  // i-GMT+3 = UTC+3
  const utcTime = orderDate.getTime() + orderDate.getTimezoneOffset() * 60000;
  const gmtPlus3 = new Date(utcTime + 3 * 60 * 60 * 1000);

  const h = String(gmtPlus3.getHours()).padStart(2, '0');
  const m = String(gmtPlus3.getMinutes()).padStart(2, '0');
  const diffDays = Math.floor(
    (now.getTime() - gmtPlus3.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return `Сегодня, ${h}:${m} i-GMT+3`;
  if (diffDays === 1) return `Вчера, ${h}:${m} i-GMT+3`;
  return `${diffDays} дня назад, ${h}:${m} i-GMT+3`;
};

export default function ProfileOrders() {
  const dispatch = useDispatch();
  const { orders, isLoading, error } = useSelector(
    (state: RootState) => state.profileOrders
  );

  useEffect(() => {
    const { accessToken } = getToken();
    if (accessToken) {
      dispatch({
        type: 'WS_CONNECT',
        payload: `wss://norma.education-services.ru/orders?token=${accessToken}`,
      });
    }
  }, [dispatch]);

  if (isLoading && !orders.length) {
    return (
      <ProfileLayout>
        <p className="text text_type_main-default">Загрузка...</p>
      </ProfileLayout>
    );
  }

  if (error) {
    return (
      <ProfileLayout>
        <p className="text text_type_main-default">Ошибка: {error}</p>
      </ProfileLayout>
    );
  }

  // Получаем ингредиенты из store
  const { items } = useSelector((state: RootState) => state.ingredients);
  const ingredientsMap = new Map(items.map((i) => [i._id, i]));

  return (
    <ProfileLayout>
      {orders.length === 0 ? (
        <p className="text text_type_main-default">У вас пока нет заказов</p>
      ) : (
        <div className={styles.ordersContainer}>
          <div className={styles.ordersList}>
            {orders.map((order) => {
              // Рассчитываем сумму заказа
              const totalPrice = order.ingredients.reduce((sum, id) => {
                const ing = ingredientsMap.get(id);
                return sum + (ing ? ing.price : 0);
              }, 0);

              // Ингредиенты
              const displayedIngredients = order.ingredients.slice(0, 5);
              const hasMore = order.ingredients.length > 5;

              return (
                <NavLink
                  key={order._id}
                  to={`/profile/orders/${order.number}`}
                  className={styles.orderCard}
                >
                  <div className={styles.orderId}>
                    <span className={styles.orderNumber}>#{order.number}</span>
                    <div className={styles.time}>
                      <span>{formatDateForDisplay(order.createdAt)}</span>
                    </div>
                  </div>

                  <div>
                    <span className={styles.statusBadge} data-status={order.status}>
                      {order.status === 'done'
                        ? 'Выполнен'
                        : order.status === 'pending'
                          ? 'Готовится'
                          : 'Отменен'}
                    </span>
                  </div>

                  <h3 className={styles.orderName}>{order.name}</h3>

                  <div className={styles.ingredientsRow}>
                    {displayedIngredients.map((id, index) => {
                      const ing = ingredientsMap.get(id);
                      const isLast = index === displayedIngredients.length - 1;

                      if (hasMore && isLast) {
                        return (
                          <div key={`remaining-${id}`} className={styles.remainingBadge}>
                            +{order.ingredients.length - 5}
                          </div>
                        );
                      }

                      return (
                        <div key={`ing-${id}`} className={styles.ingredientImage}>
                          {ing && (
                            <img
                              src={ing.image}
                              alt={ing.name}
                              className={styles.ingredientImg}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className={styles.price}>
                    <span className={styles.priceValue}>{totalPrice}</span>
                    <CurrencyIcon type="primary" />
                  </div>
                </NavLink>
              );
            })}
          </div>
        </div>
      )}
    </ProfileLayout>
  );
}